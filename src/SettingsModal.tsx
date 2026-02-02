import React, { useState } from 'react';
import { useAppStore } from './store';
import { X, Globe, Trash2, Sparkles } from 'lucide-react';
import { PromptTemplate } from './types';

const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'prompts', label: 'Prompts', icon: Sparkles },
];

const SettingsModal: React.FC = () => {
  const { 
    showSettings, 
    toggleSettings, 
    ollamaApiKey, 
    setOllamaApiKey, 
    contextLength, 
    setContextLength, 
    models, 
    selectedModel, 
    setSelectedModel,
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('general');
  const [newPrompt, setNewPrompt] = useState({ key: '', title: '', content: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [localApiKey, setLocalApiKey] = useState(ollamaApiKey);
  const [apiSaved, setApiSaved] = useState(false);

  React.useEffect(() => {
    setLocalApiKey(ollamaApiKey);
  }, [ollamaApiKey]);

  if (!showSettings) return null;

  const handleSavePrompt = async () => {
    if (!newPrompt.key || !newPrompt.title || !newPrompt.content) return;
    
    // Ensure key starts with /
    const key = newPrompt.key.startsWith('/') ? newPrompt.key : `/${newPrompt.key}`;

    if (editingId) {
        await updateTemplate(editingId, key, newPrompt.title, newPrompt.content);
        setEditingId(null);
    } else {
        await createTemplate(key, newPrompt.title, newPrompt.content);
    }
    setNewPrompt({ key: '', title: '', content: '' });
  };
  
  const handleSaveApiKey = () => {
    setOllamaApiKey(localApiKey);
    setApiSaved(true);
    setTimeout(() => setApiSaved(false), 2000);
  };

  const startEditing = (t: PromptTemplate) => {
    setNewPrompt({ key: t.key, title: t.title, content: t.prompt });
    setEditingId(t.id);
  };

  const cancelEditing = () => {
    setNewPrompt({ key: '', title: '', content: '' });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={toggleSettings} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-gray-50 border-r border-gray-100 p-2 space-y-1">
            {SETTINGS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'general' && (
              <div className="space-y-8 max-w-2xl">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ollama API Key</label>
                    <div className="flex gap-2">
                        <input 
                            type="password" 
                            value={localApiKey}
                            onChange={(e) => setLocalApiKey(e.target.value)}
                            placeholder="Optional"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                        />
                        <button 
                            onClick={handleSaveApiKey}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                apiSaved 
                                ? 'bg-gray-500 text-white shadow-inner' 
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                        >
                            {apiSaved ? 'Saved!' : 'Save'}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Only needed if you are using a proxy or remote instance requiring auth.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Default Model</label>
                    <div className="relative">
                        <select 
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all cursor-pointer"
                        >
                            {models.map((m: any) => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            < Globe size={16} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Context Length</label>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{contextLength / 1024}k ({contextLength})</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        Context length determines how much of your conversation local LLMs can remember and use to generate responses.
                    </p>
                    <input 
                        type="range" 
                        min="4096" 
                        max="262144" 
                        step="4096"
                        value={contextLength} 
                        onChange={(e) => setContextLength(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                        <span>4k</span>
                        <span>32k</span>
                        <span>64k</span>
                        <span>128k</span>
                        <span>256k</span>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                 <div className="flex flex-col h-full">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center justify-between">
                        <span>{editingId ? 'Edit Prompt' : 'Add New Prompt'}</span>
                        {editingId && (
                            <button onClick={cancelEditing} className="text-xs text-red-500 hover:text-red-600 font-medium">Cancel</button>
                        )}
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-y-auto">
                            <div className="shrink-0">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slash Command</label>
                                <input 
                                    value={newPrompt.key}
                                    onChange={(e) => setNewPrompt({...newPrompt, key: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                                />
                            </div>
                            <div className="shrink-0">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Title</label>
                                <input 
                                    value={newPrompt.title}
                                    onChange={(e) => setNewPrompt({...newPrompt, title: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                                />
                            </div>
                            <div className="flex-1 flex flex-col min-h-0">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prompt Content</label>
                                <textarea 
                                     value={newPrompt.content}
                                     onChange={(e) => setNewPrompt({...newPrompt, content: e.target.value})}
                                     className="w-full h-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 shrink-0">
                            <button 
                                onClick={handleSavePrompt}
                                disabled={!newPrompt.key || !newPrompt.title || !newPrompt.content}
                                className="w-full bg-black text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10"
                            >
                                {editingId ? 'Update Prompt' : 'Add Prompt'}
                            </button>
                        </div>
                    </div>
                 </div>

                 <div className="flex flex-col h-full overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Your Prompts</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {templates.map((t: PromptTemplate) => (
                            <div 
                                key={t.id} 
                                onClick={() => startEditing(t)}
                                className={`group bg-white border rounded-xl p-4 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                                    editingId === t.id ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md text-blue-600 font-bold tracking-tight">{t.key}</span>
                                        <span className="text-sm font-bold text-gray-900">{t.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); }}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{t.prompt}</p>
                            </div>
                        ))}
                        {templates.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Sparkles className="text-gray-300 mb-3" size={32} />
                                <p className="text-gray-500 text-sm font-medium">No custom prompts yet</p>
                                <p className="text-gray-400 text-xs mt-1">Create one to get started</p>
                            </div>
                        )}
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
