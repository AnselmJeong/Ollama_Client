import { create } from 'zustand';
import { Project, Chat, Message, PromptTemplate } from './types';
import { webSearchTool, webFetchTool } from './ollama';

interface AppState {
  projects: Project[];
  chats: Chat[];
  messages: Message[];
  activeProject: Project | null;
  activeChat: Chat | null;
  models: any[];
  templates: PromptTemplate[];
  isLoading: boolean;
  selectedModel: string;
  webSearchEnabled: boolean;
  
  // Settings
  showSettings: boolean;
  contextLength: number;
  ollamaApiKey: string;
  
  // Actions
  toggleSettings: () => void;
  setContextLength: (length: number) => void;
  setOllamaApiKey: (key: string) => void;
  createTemplate: (key: string, title: string, prompt: string) => Promise<void>;
  updateTemplate: (id: string, key: string, title: string, prompt: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  // Actions
  fetchProjects: () => Promise<void>;
  fetchChats: (projectId?: string) => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  fetchModels: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  setSelectedModel: (model: string) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  setActiveProject: (project: Project | null) => void;
  setActiveChat: (chat: Chat | null) => void;
  createProject: (name: string) => Promise<void>;
  createChat: (title: string, model: string, projectId?: string) => Promise<string>;
  deleteChat: (chatId: string) => Promise<void>;
  addMessage: (chatId: string, role: string, content: string, thinking?: string, tool_calls?: any, images?: string[]) => Promise<void>;
  sendMessage: (chatId: string, content: string, attachments?: any[]) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  chats: [],
  messages: [],
  activeProject: null,
  activeChat: null,
  models: [],
  templates: [],
  selectedModel: '',
  webSearchEnabled: false,
  showSettings: false,
  contextLength: 4096,
  ollamaApiKey: '',
  isLoading: false,

  fetchProjects: async () => {
    try {
      const projects = await window.db.getProjects();
      set({ projects });
    } catch (e) {
      console.error('Error fetching projects:', e);
    }
  },

  fetchChats: async (projectId) => {
    try {
      const chats = await window.db.getChats(projectId);
      set({ chats });
    } catch (e) {
      console.error('Error fetching chats:', e);
    }
  },

  fetchMessages: async (chatId) => {
    try {
      const messages = await window.db.getMessages(chatId);
      set({ messages });
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
  },

  fetchTemplates: async () => {
    try {
      const templates = await window.db.getTemplates();
      set({ templates });
    } catch (e) {
      console.error('Error fetching templates:', e);
    }
  },

  setWebSearchEnabled: (enabled) => set({ webSearchEnabled: enabled }),

  setActiveProject: (project) => {
    set({ activeProject: project });
    get().fetchChats(project?.id);
  },

  setActiveChat: (chat) => {
    set({ activeChat: chat });
    if (chat) {
      get().fetchMessages(chat.id);
    } else {
      set({ messages: [] });
    }
  },

  fetchModels: async () => {
    try {
      const rawModels = await window.ollama.getModels();
      const models = rawModels.filter((m: any) => 
        !m.name.toLowerCase().includes('embedding') && 
        !m.name.toLowerCase().includes('embed')
      );
      set({ models });
      
      try {
        const lastModel = await window.db.getSetting('last_model');
        const contextLength = await window.db.getSetting('context_length');
        const apiKey = await window.db.getSetting('ollama_api_key');

        if (contextLength) set({ contextLength: parseInt(contextLength) });
        if (apiKey) set({ ollamaApiKey: apiKey });

        if (lastModel && models.some((m: any) => m.name === lastModel)) {
          set({ selectedModel: lastModel });
        } else if (models.length > 0 && !get().selectedModel) {
          set({ selectedModel: models[0].name });
        }
      } catch (err) {
        console.warn('Failed to restore last model:', err);
        if (models.length > 0 && !get().selectedModel) {
          set({ selectedModel: models[0].name });
        }
      }
    } catch (e) {
      console.error('Error fetching models:', e);
    }
  },

  setSelectedModel: (model) => {
    set({ selectedModel: model });
    window.db.setSetting('last_model', model).catch(err => console.error('Failed to save model selection:', err));
  },

  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),

  setContextLength: (length) => {
    set({ contextLength: length });
    window.db.setSetting('context_length', length.toString()).catch(console.error);
  },

  setOllamaApiKey: (key) => {
    set({ ollamaApiKey: key });
    window.db.setSetting('ollama_api_key', key).catch(console.error);
  },

  createTemplate: async (key, title, prompt) => {
    // @ts-ignore
    await window.db.createTemplate({ key, title, prompt });
    await get().fetchTemplates();
  },

  updateTemplate: async (id, key, title, prompt) => {
    // @ts-ignore
    await window.db.updateTemplate({ id, key, title, prompt });
    await get().fetchTemplates();
  },

  deleteTemplate: async (id) => {
    // @ts-ignore
    await window.db.deleteTemplate(id);
    await get().fetchTemplates();
  },

  createProject: async (name) => {
    await window.db.createProject({ name, contextEnabled: 1, referCount: 5, maxTokens: 10000 });
    await get().fetchProjects();
  },

  createChat: async (title, model, projectId) => {
    const id = await window.db.createChat({ title, model, project_id: projectId });
    await get().fetchChats(projectId);
    return id;
  },

  deleteChat: async (chatId) => {
    await window.db.deleteChat(chatId);
    
    // Refresh chats
    const projectId = get().activeProject?.id;
    await get().fetchChats(projectId);
    
    // If the deleted chat was active, clear selection or select another
    if (get().activeChat?.id === chatId) {
      const remainingChats = get().chats;
      set({ 
        activeChat: remainingChats.length > 0 ? remainingChats[0] : null,
        messages: [] 
      });
      if (remainingChats.length > 0) {
        get().fetchMessages(remainingChats[0].id);
      }
    }
  },

  addMessage: async (chatId, role, content, thinking, tool_calls, images) => {
    await window.db.addMessage({ chatId, role, content, thinking, toolCalls: tool_calls, images });
    await get().fetchMessages(chatId);
  },

  sendMessage: async (chatId, content, attachments = []) => {
    if (get().isLoading) return;

    const activeChat = get().activeChat;
    if (!activeChat) return;

    set({ isLoading: true });
    
    // Process attachments
    const images: string[] = [];
    let textContext = '';

    if (attachments && attachments.length > 0) {
      attachments.forEach((att: any) => {
        if (att.type === 'image') {
          images.push(att.content);
        } else if (att.type === 'text') {
          textContext += `\n\n--- [File: ${att.name}] ---\n${att.content}\n`;
        }
      });
    }

    const finalContent = content + textContext;

    // 1. Save user message and wait for it to be in state
    await get().addMessage(chatId, 'user', finalContent, undefined, undefined, images);
    
    // 2. Prepare clean message history for Ollama
    const currentMessages = get().messages
      .filter(m => m.id !== 'streaming')
      .map(m => {
        const msg: any = { role: m.role, content: m.content };
        if (m.thinking) msg.thinking = m.thinking;
        if (m.images && typeof m.images === 'string') {
           try { msg.images = JSON.parse(m.images); } catch {}
        }
        // Strip out any database IDs or other fields the API might reject
        return msg;
      });

    const tools = get().webSearchEnabled ? [webSearchTool, webFetchTool] : undefined;
    
    let bufContent = '';
    let bufThinking = '';
    let bufToolCalls: any[] = [];

    // 3. Set up listeners
    const removeListener = window.ollama.onChatChunk((chunk: any) => {
      if (chunk.done) return;
      if (chunk.error) {
        console.error('Renderer received Ollama error:', chunk.error);
        set({ isLoading: false });
        removeListener();
        return;
      }

      if (chunk.thinking) bufThinking += chunk.thinking;
      if (chunk.content) bufContent += chunk.content;
      if (chunk.tool_calls) bufToolCalls = [...bufToolCalls, ...chunk.tool_calls];

      // Update streaming message state
      set((state) => ({
        messages: [
          ...state.messages.filter(m => m.id !== 'streaming'),
          {
            id: 'streaming',
            chat_id: chatId,
            role: 'assistant',
            content: bufContent,
            thinking: bufThinking,
            tool_calls: bufToolCalls.length > 0 ? JSON.stringify(bufToolCalls) : undefined,
            created_at: new Date().toISOString()
          } as Message
        ]
      }));
    });

    try {
      console.log('Sending chat stream request to main process...');
      await window.ollama.chatStream({ 
        model: activeChat.model, 
        messages: currentMessages, 
        tools 
      });
      console.log('Chat stream request completed.');
      
      // Final save to DB
      await get().addMessage(chatId, 'assistant', bufContent, bufThinking, bufToolCalls);
    } catch (e) {
      console.error('SendMessage process failed:', e);
    } finally {
      set({ isLoading: false });
      removeListener();
    }
  },
}));
