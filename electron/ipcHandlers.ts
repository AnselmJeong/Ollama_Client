import { ipcMain, dialog } from 'electron';
import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import { ollamaMainService } from './ollamaService';
import fs from 'fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export function setupIpcHandlers() {
  const db = getDb();

  // Ollama
  ipcMain.handle('ollama-get-models', async () => {
    return await ollamaMainService.getModels();
  });

  ipcMain.handle('ollama-chat', async (event, payload) => {
    return await ollamaMainService.chat(payload, event);
  });

  // Projects
  ipcMain.handle('get-projects', () => {
    return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  });

  ipcMain.handle('create-project', (_, project: any) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO projects (id, name, description, icon, custom_instructions, context_enabled, refer_count, max_tokens)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, project.name, project.description, project.icon, project.customInstructions, 
             project.contextEnabled ? 1 : 0, project.referCount, project.maxTokens);
    return id;
  });

  // Chats
  ipcMain.handle('get-chats', (_, projectId?: string) => {
    if (projectId) {
      return db.prepare('SELECT * FROM chats WHERE project_id = ? ORDER BY updated_at DESC').all(projectId);
    }
    return db.prepare('SELECT * FROM chats WHERE project_id IS NULL ORDER BY updated_at DESC').all();
  });

  ipcMain.handle('create-chat', (_, chat: any) => {
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO chats (id, project_id, title, model) VALUES (?, ?, ?, ?)');
    stmt.run(id, chat.project_id, chat.title, chat.model);
    return id;
  });

  ipcMain.handle('delete-chat', (_, chatId: string) => {
    // Delete messages first (unless ON DELETE CASCADE is set, but explicit is safer here without checking schema)
    db.prepare('DELETE FROM messages WHERE chat_id = ?').run(chatId);
    db.prepare('DELETE FROM chats WHERE id = ?').run(chatId);
    return true;
  });

  // Messages
  ipcMain.handle('get-messages', (_, chatId: string) => {
    return db.prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC').all(chatId);
  });

  ipcMain.handle('add-message', (_, message: any) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO messages (id, chat_id, role, content, thinking, tool_calls, images)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, message.chatId, message.role, message.content, message.thinking, 
             JSON.stringify(message.toolCalls), JSON.stringify(message.images));
    
    // Update chat timestamp
    db.prepare('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(message.chatId);
    
    return id;
  });

  // Prompt Templates
  ipcMain.handle('get-templates', () => {
    return db.prepare('SELECT * FROM prompt_templates ORDER BY category, title').all();
  });

  ipcMain.handle('create-template', (_, template: any) => {
    const id = uuidv4();
    const prompt = template.prompt.endsWith('\n') ? template.prompt : template.prompt + '\n';
    const key = template.key.startsWith('/') ? template.key : '/' + template.key;
    const stmt = db.prepare('INSERT INTO prompt_templates (id, key, title, prompt) VALUES (?, ?, ?, ?)');
    stmt.run(id, key, template.title, prompt);
    return id;
  });

  ipcMain.handle('update-template', (_, template: any) => {
    const prompt = template.prompt.endsWith('\n') ? template.prompt : template.prompt + '\n';
    const key = template.key.startsWith('/') ? template.key : '/' + template.key;
    const stmt = db.prepare('UPDATE prompt_templates SET key = ?, title = ?, prompt = ? WHERE id = ?');
    stmt.run(key, template.title, prompt, template.id);
    return true;
  });

  ipcMain.handle('delete-template', (_, id: string) => {
    db.prepare('DELETE FROM prompt_templates WHERE id = ?').run(id);
    return true;
  });
  
  // Settings
  ipcMain.handle('get-setting', (_, key: string) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? (row as any).value : null;
  });

  ipcMain.handle('set-setting', (_, key: string, value: string) => {
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    
    if (key === 'ollamaApiKey') {
        ollamaMainService.updateApiKey(value);
    }
  });

  // File Handling
  ipcMain.handle('read-file', async (_, filePath: string) => {
    try {
      const buffer = fs.readFileSync(filePath);
      const ext = filePath.split('.').pop()?.toLowerCase();

      if (ext === 'pdf') {
         // @ts-ignore
         const data = await pdf(buffer);
         return { type: 'text', content: data.text, name: filePath.split(/[/\\]/).pop() };
      } else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) {
         return { type: 'image', content: buffer.toString('base64'), name: filePath.split(/[/\\]/).pop() };
      } else {
         // Assume text
         return { type: 'text', content: buffer.toString('utf-8'), name: filePath.split(/[/\\]/).pop() };
      }
    } catch (error) {
      console.error('File read error:', error);
      throw error;
    }
  });

  ipcMain.handle('save-file', async (_, { content, defaultPath }: { content: string, defaultPath: string }) => {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath,
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    });

    if (filePath) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    return false;
  });

}
