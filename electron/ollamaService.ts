import { Ollama } from 'ollama';
import * as dotenv from 'dotenv';
import { getDb } from './db';

dotenv.config();

const OLLAMA_LOCAL_URL = 'http://localhost:11434';

let client = new Ollama({ host: OLLAMA_LOCAL_URL });

function createClient(apiKey?: string) {
    return new Ollama({
        host: OLLAMA_LOCAL_URL,
        headers: apiKey ? { 'Authorization': `Bearer ${apiKey.replace(/"/g, '').trim()}` } : {}
    });
}

export const webSearchTool = {
  type: 'function',
  function: {
    name: 'webSearch',
    description: 'Performs a web search using Ollama Cloud Search.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query string.' },
      },
      required: ['query'],
    },
  },
};

export const webFetchTool = {
  type: 'function',
  function: {
    name: 'webFetch',
    description: 'Fetches page content using Ollama Cloud Fetch.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'A single URL to fetch.' },
      },
      required: ['url'],
    },
  },
};

export const ollamaMainService = {
  initialize() {
      try {
        const db = getDb();
        const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('ollamaApiKey');
        const dbKey = row ? (row as any).value : null;
        const envKey = process.env.Ollama_API_KEY || process.env.OLLAMA_API_KEY;
        const key = dbKey || envKey;
        
        if (key) {
            console.log('[OllamaService] Initializing with API Key from ' + (dbKey ? 'DB' : 'ENV'));
            client = createClient(key);
        } else {
            console.log('[OllamaService] Initializing without API Key');
            client = createClient();
        }
      } catch (e) {
          console.error('[OllamaService] Init failed:', e);
      }
  },

  updateApiKey(key: string) {
      console.log('[OllamaService] Updating API Key');
      client = createClient(key);
  },

  async getModels() {
    try {
      const response = await client.list();
      return response.models || [];
    } catch (error) {
      console.error('[Ollama] Error fetching models:', error);
      return [];
    }
  },

  async chat(payload: any, event: Electron.IpcMainInvokeEvent) {
    console.log(`\n--- [Ollama IPC] Chat Request ---`);
    console.log(`Model: ${payload.model}`);

    try {
      const messages = [...payload.messages];
      const tools = payload.tools;
      let iterationCount = 0;
      const MAX_ITERATIONS = 5;

      while (iterationCount < MAX_ITERATIONS) {
        iterationCount++;
        
        const response = await client.chat({
          model: payload.model,
          messages: messages,
          tools: tools,
          stream: true,
        });

        let assistantContent = '';
        let assistantThinking = '';
        let toolCalls: any[] = [];

        for await (const chunk of response) {
          if (chunk.message.thinking) assistantThinking += chunk.message.thinking;
          if (chunk.message.content) assistantContent += chunk.message.content;
          if (chunk.message.tool_calls) toolCalls = [...toolCalls, ...chunk.message.tool_calls];

          event.sender.send('ollama-chat-chunk', {
            content: chunk.message.content || '',
            thinking: chunk.message.thinking || '',
            tool_calls: chunk.message.tool_calls,
            done: false
          });
        }

        if (toolCalls.length > 0) {
          messages.push({
            role: 'assistant',
            content: assistantContent,
            thinking: assistantThinking,
            tool_calls: toolCalls,
          });

          for (const toolCall of toolCalls) {
            try {
              console.log(`[Ollama] Executing tool: ${toolCall.function.name}`);
              let output: any;
              
              if (toolCall.function.name === 'webSearch') {
                // @ts-ignore - SDK 0.6.3 requires object params
                output = await client.webSearch({ query: toolCall.function.arguments.query });
              } else if (toolCall.function.name === 'webFetch') {
                // @ts-ignore - SDK 0.6.3 requires object params
                output = await client.webFetch({ url: toolCall.function.arguments.url });
              }
              
              messages.push({
                role: 'tool',
                content: JSON.stringify(output),
              } as any);
            } catch (toolError: any) {
              console.error(`[Ollama] Tool Execution Error (${toolCall.function.name}):`, toolError.message || toolError);
              
              // More descriptive error for 401
              const errorMsg = toolError.status_code === 401 
                ? "Unauthorized: Please verify your Ollama API Key in .env. It should be a Cloud Token, not an SSH key."
                : (toolError.message || 'Tool execution failed');

              messages.push({
                role: 'tool',
                content: JSON.stringify({ error: errorMsg }),
              } as any);
            }
          }
          continue; 
        }

        event.sender.send('ollama-chat-chunk', { done: true });
        return { content: assistantContent, thinking: assistantThinking };
      }

      throw new Error('Maximum tool iterations reached');

    } catch (error: any) {
      console.error('[Ollama] Chat Error:', error);
      event.sender.send('ollama-chat-chunk', { error: error.message, done: true });
      throw error;
    }
  }
};
