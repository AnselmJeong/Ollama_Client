import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

let db: any;

export function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'ollama-desktop-pro.db');

  // Ensure directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Initialize Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      custom_instructions TEXT,
      context_enabled INTEGER DEFAULT 1,
      refer_count INTEGER DEFAULT 5,
      max_tokens INTEGER DEFAULT 10000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      title TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      thinking TEXT,
      tool_calls TEXT,
      images TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prompt_templates (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      prompt TEXT NOT NULL,
      description TEXT,
      category TEXT,
      variables TEXT,
      project_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    -- specific migration to Ensure all keys start with /
    UPDATE prompt_templates SET key = '/' || key WHERE key NOT LIKE '/%';

    -- Seed Templates
    INSERT OR IGNORE INTO prompt_templates (id, key, title, prompt, category) VALUES 
    ('1', '/summary', 'Summarize', 'Please summarize the following text in 3 bullet points.', 'General'),
    ('2', '/code-review', 'Code Review', 'Review the following code for performance and security issues.', 'Programming');
  `);

  console.log('Database initialized at:', dbPath);
  return db;
}

export const getDb = () => {
  if (!db) initDatabase();
  return db;
};
