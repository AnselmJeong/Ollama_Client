import { OllamaModel } from './ollama';

export interface Project {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  custom_instructions?: string;
  context_enabled: boolean;
  refer_count: number;
  max_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  project_id?: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  thinking?: string;
  tool_calls?: string; // JSON string
  images?: string; // JSON string (Base64 array)
  created_at: string;
}

declare global {
  interface Window {
    db: {
      getProjects: () => Promise<Project[]>;
      createProject: (project: any) => Promise<string>;
      getChats: (projectId?: string) => Promise<Chat[]>;
      createChat: (chat: Omit<Chat, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
      deleteChat: (chatId: string) => Promise<boolean>;
      getMessages: (chatId: string) => Promise<Message[]>;
      addMessage: (message: any) => Promise<string>;
      getTemplates: () => Promise<PromptTemplate[]>;
      getSetting: (key: string) => Promise<any>;
      setSetting: (key: string, value: string) => Promise<void>;
    };
    ollama: {
      getModels: () => Promise<OllamaModel[]>;
      chatStream: (payload: any) => Promise<any>;
      onChatChunk: (callback: (chunk: {
        content: string;
        thinking?: string;
        tool_calls?: any[];
        done: boolean;
        error?: string;
      }) => void) => () => void;
    };
    fs: {
      readFile: (filePath: string) => Promise<{ type: 'text' | 'image', content: string, name: string }>;
      saveFile: (content: string, defaultPath: string) => Promise<boolean>;
    };
  }
}

export interface PromptTemplate {
  id: string;
  key: string;
  title: string;
  prompt: string;
  description?: string;
  category?: string;
  variables?: string; // JSON string
  project_id?: string;
  created_at: string;
  updated_at: string;
}
