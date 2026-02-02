import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// Database APIs
contextBridge.exposeInMainWorld('db', {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  createProject: (project: any) => ipcRenderer.invoke('create-project', project),
  getChats: (projectId?: string) => ipcRenderer.invoke('get-chats', projectId),
  createChat: (chat: any) => ipcRenderer.invoke('create-chat', chat),
  deleteChat: (chatId: string) => ipcRenderer.invoke('delete-chat', chatId),
  getMessages: (chatId: string) => ipcRenderer.invoke('get-messages', chatId),
  addMessage: (message: any) => ipcRenderer.invoke('add-message', message),
  getTemplates: () => ipcRenderer.invoke('get-templates'),
  createTemplate: (template: any) => ipcRenderer.invoke('create-template', template),
  updateTemplate: (template: any) => ipcRenderer.invoke('update-template', template),
  deleteTemplate: (id: string) => ipcRenderer.invoke('delete-template', id),
  getSetting: (key: string) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key: string, value: string) => ipcRenderer.invoke('set-setting', key, value),
})

// Ollama APIs
contextBridge.exposeInMainWorld('ollama', {
  getModels: () => ipcRenderer.invoke('ollama-get-models'),
  chatStream: (payload: any) => ipcRenderer.invoke('ollama-chat', payload),
  onChatChunk: (callback: (chunk: any) => void) => {
    const subscription = (_event: any, chunk: any) => callback(chunk);
    ipcRenderer.on('ollama-chat-chunk', subscription);
    return () => ipcRenderer.removeListener('ollama-chat-chunk', subscription);
  },
})

// File System APIs
contextBridge.exposeInMainWorld('fs', {
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (content: string, defaultPath: string) => ipcRenderer.invoke('save-file', { content, defaultPath }),
})
