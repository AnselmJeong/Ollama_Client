import React, { useEffect } from 'react';
import { useAppStore } from './store';
import { Plus, Folder, Settings, MessageSquare, Edit3, Sparkles, Trash2 } from 'lucide-react';
import { Project, Chat, PromptTemplate } from './types';

const Sidebar: React.FC = () => {
  const { 
    projects, 
    chats, 
    templates,
    fetchProjects, 
    fetchChats, 
    fetchTemplates,
    setActiveProject, 
    activeProject,
    setActiveChat,
    activeChat,
    createProject,
    deleteChat,
    toggleSettings
  } = useAppStore();

  useEffect(() => {
    fetchProjects();
    fetchChats();
    fetchTemplates();
  }, []);

  const handleNewChat = () => {
    setActiveChat(null);
  };

  const handleCreateProject = () => {
    const name = prompt('Enter project name:');
    if (name) createProject(name);
  };

  return (
    <div className="w-72 h-screen bg-[#f9f9f9] text-[#1a1a1a] flex flex-col border-r border-[#e5e5e5] select-none font-sans">
      {/* New Chat Area */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={handleNewChat}
          className="flex items-center space-x-2 text-sm font-medium hover:bg-gray-200/50 p-2 rounded-lg transition-all"
        >
          <Edit3 size={18} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 mt-2">
        {/* All Chats / Home */}
        <div>
          <div 
            onClick={() => setActiveProject(null)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm ${
              !activeProject ? 'bg-[#efefef] font-medium' : 'hover:bg-[#efefef]/50'
            }`}
          >
            <MessageSquare size={16} className="text-gray-400" />
            <span className="font-medium">All Chats</span>
          </div>
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Projects</span>
            <button onClick={handleCreateProject} className="text-gray-400 hover:text-black transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {projects.map((project: Project) => (
              <div 
                key={project.id}
                onClick={() => setActiveProject(project)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm ${
                  activeProject?.id === project.id ? 'bg-[#efefef] font-medium' : 'hover:bg-[#efefef]/50'
                }`}
              >
                <Folder size={16} className={activeProject?.id === project.id ? 'text-black' : 'text-gray-400'} />
                <span className="truncate">{project.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Templates</span>
          </div>
          <div className="space-y-0.5">
            {templates.map((template: PromptTemplate) => (
              <div 
                key={template.id}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#efefef]/50 transition-all text-sm text-gray-500"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('use-template', { detail: template.prompt }));
                }}
              >
                <Sparkles size={14} className="text-blue-400" />
                <span className="truncate">{template.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chats (Filtered) */}
        <div>
          <span className="px-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            {activeProject ? `In ${activeProject.name}` : 'Recent'}
          </span>
          <div className="space-y-0.5">
            {chats.map((chat: Chat) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer truncate text-sm transition-all ${
                  activeChat?.id === chat.id ? 'bg-[#efefef] font-medium' : 'hover:bg-[#efefef]/50'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                   <MessageSquare size={14} className={activeChat?.id === chat.id ? 'text-gray-600' : 'text-gray-300'} />
                   <span className="truncate">{chat.title}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this chat?')) {
                      deleteChat(chat.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-200 focus:outline-none transition-all"
                  title="Delete chat"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#e5e5e5]">
        <button 
          onClick={toggleSettings}
          className="flex items-center space-x-3 hover:bg-gray-100 transition-all w-full px-3 py-2 rounded-xl"
        >
          <Settings size={18} className="text-gray-500" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
