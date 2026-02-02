import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from './store';
import { Send, Search, ChevronDown, Globe, ExternalLink, ChevronRight, Info, BrainCircuit, Paperclip, X, Copy, FileText, Download, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
import { Message } from './types';

const ChatArea: React.FC = () => {
  const { 
    activeChat, 
    messages, 
    sendMessage, 
    models, 
    fetchModels, 
    selectedModel, 
    setSelectedModel,
    createChat,
    setActiveChat,
    activeProject,
    webSearchEnabled,
    setWebSearchEnabled,
    isLoading,
    templates
  } = useAppStore();
  
  const [input, setInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredTemplates]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ... (handleExport, processFiles, handleDrop)

  // ...

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            const val = e.target.value;
            setInput(val);
            if (val.startsWith('/')) {
                const query = val.toLowerCase();
                const matches = templates.filter((t: any) => {
                    const key = t.key.startsWith('/') ? t.key.toLowerCase() : `/${t.key.toLowerCase()}`;
                    return key.startsWith(query);
                });
                setFilteredTemplates(matches);
                setShowPrompts(matches.length > 0);
            } else {
                setShowPrompts(false);
            }
          }}
          onKeyDown={(e) => {
            if (showPrompts) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + filteredTemplates.length) % filteredTemplates.length);
                    return;
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % filteredTemplates.length);
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredTemplates[selectedIndex]) {
                        setInput(filteredTemplates[selectedIndex].prompt);
                        setShowPrompts(false);
                    }
                    return;
                }
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Send a message"
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-[16px] placeholder-gray-400 min-h-[44px] max-h-[200px] py-3 px-4 overflow-y-auto"
          rows={1}
        />

  const handleExport = async () => {
    if (!activeChat) return;
    const markdown = messages.map(m => {
      const role = m.role === 'user' ? 'User' : 'Assistant';
      return `## ${role}\n${m.content}\n`;
    }).join('\n---\n\n');
    
    // @ts-ignore
    await window.fs.saveFile(`# ${activeChat.title}\n\n${markdown}`, `${activeChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`);
  };

  const processFiles = async (files: FileList | null) => {
    if (!files) return;
    const newAttachments = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // @ts-ignore
      const path = file.path; // Electron specific
      if (path) {
        // @ts-ignore
        const result = await window.fs.readFile(path);
        newAttachments.push(result);
      }
    }
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processFiles(e.dataTransfer.files);
  };

  useEffect(() => {
    fetchModels();
    
    const handleTemplate = (e: any) => {
      setInput(e.detail);
    };
    window.addEventListener('use-template', handleTemplate);
    return () => window.removeEventListener('use-template', handleTemplate);
  }, []);

  useEffect(() => {
    Prism.highlightAll();
    // Scroll with a slight delay to ensure content is rendered
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let currentChatId = activeChat?.id;

    if (!currentChatId) {
      if (!selectedModel) {
        alert('Please select a model first');
        return;
      }
      const title = input.slice(0, 30) + (input.length > 30 ? '...' : '');
      currentChatId = await createChat(title, selectedModel, activeProject?.id);
      const newChat = { id: currentChatId, title, model: selectedModel, project_id: activeProject?.id, created_at: '', updated_at: '' };
      setActiveChat(newChat);
    }

    const content = input;
    // Pass attachments to sendMessage
    await sendMessage(currentChatId, content, attachments);
    setInput('');
    setAttachments([]);
  };

  const renderMessageInput = (isHome: boolean = false) => (
    <div className={`w-full ${isHome ? 'max-w-2xl px-4' : 'max-w-3xl mx-auto'}`}>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200">
               {att.type === 'image' ? <div className="w-4 h-4 rounded bg-gray-300 overflow-hidden"><img src={`data:image/png;base64,${att.content}`} className="w-full h-full object-cover" /></div> : <FileText size={14} className="text-gray-500" />}
               <span className="max-w-[150px] truncate">{att.name}</span>
               <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
        
      <div 
        className={`bg-[#f4f4f4] rounded-[26px] p-2 pr-2 transition-all shadow-sm relative ${isDragging ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >

        {showPrompts && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-10">
                {filteredTemplates.map((t, index) => (
                    <div 
                        key={t.id}
                        className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 flex flex-col ${index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        onClick={() => {
                            setInput(t.prompt + '\n');
                            setShowPrompts(false);
                            textareaRef.current?.focus();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-blue-600 font-mono text-xs">{t.key}</span>
                            <span className="font-medium text-sm text-gray-800">{t.title}</span>
                        </div>
                        <span className="text-xs text-gray-500 truncate mt-0.5">{t.prompt}</span>
                    </div>
                ))}
            </div>
        )}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            const val = e.target.value;
            setInput(val);
            if (val.startsWith('/')) {
                const query = val.toLowerCase();
                const matches = templates.filter((t: any) => {
                    const key = t.key.startsWith('/') ? t.key.toLowerCase() : `/${t.key.toLowerCase()}`;
                    return key.startsWith(query);
                });
                setFilteredTemplates(matches);
                setShowPrompts(matches.length > 0);
            } else {
                setShowPrompts(false);
            }
          }}
          onKeyDown={(e) => {
            if (showPrompts) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + filteredTemplates.length) % filteredTemplates.length);
                    return;
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % filteredTemplates.length);
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredTemplates[selectedIndex]) {
                        setInput(filteredTemplates[selectedIndex].prompt);
                        setShowPrompts(false);
                    }
                    return;
                }
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Send a message"
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-[16px] placeholder-gray-400 min-h-[44px] max-h-[200px] py-3 px-4"
          rows={1}
        />
        
        <div className="flex items-center justify-end space-x-2 mt-1 px-2 pb-1">
            <div className="flex items-center space-x-2 mr-auto">
               <button 
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold border ${
                  webSearchEnabled 
                    ? 'text-blue-600 bg-blue-50 border-blue-200 shadow-sm' 
                    : 'text-gray-400 border-transparent hover:bg-gray-100 hover:text-gray-600'
                }`}
                title={webSearchEnabled ? "Disable Web Search" : "Enable Web Search"}
              >
                <Search size={14} />
                <span>{webSearchEnabled ? 'Search On' : 'Search Off'}</span>
              </button>
            </div>

            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={(e) => processFiles(e.target.files)} />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-black hover:shadow-md transition-all shadow-sm border border-transparent"
              title="Attach file"
            >
              <Paperclip size={16} />
            </button>

            <div className="relative">
              {!isHome && activeChat ? (
                 <div className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm cursor-default">
                    <span>{activeChat.model}</span>
                 </div>
              ) : (
                <div className="relative">
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm focus:outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {models.map((m: any) => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>

            <button 
              onClick={handleSend}
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                (input.trim() || attachments.length > 0) && !isLoading 
                  ? 'bg-black text-white hover:bg-gray-800 shadow-md transform active:scale-95' 
                  : 'bg-[#e5e5e5] text-gray-400'
              }`}
            >
             {isLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
            </button>
        </div>
      </div>
    </div>
  );

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-[#1a1a1a]">
        <div className="mb-8 flex items-center justify-center">
           <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center shadow-2xl">
              <BrainCircuit className="text-white" size={32} />
           </div>
        </div>
        <h1 className="text-4xl font-bold mb-10 tracking-tight text-center px-4">What's on your mind?</h1>
        {renderMessageInput(true)}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden text-[#1a1a1a]">
      {/* Header */}
      <div className="h-16 border-b border-[#e5e5e5] flex items-center justify-between px-6 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-[15px] truncate max-w-[240px]">{activeChat.title}</span>
          <div className="hidden sm:flex items-center px-2 py-0.5 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-lg border border-gray-100 uppercase tracking-wider">
            {activeChat.model}
          </div>
        </div>
        <button onClick={handleExport} className="p-2 text-gray-400 hover:text-black transition-colors" title="Export Markdown">
          <Download size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-16 scroll-smooth">
        {messages.map((msg: Message) => {
          const toolCalls = msg.tool_calls ? JSON.parse(msg.tool_calls) : [];
          const searchCalls = toolCalls.filter((tc: any) => tc.function.name === 'webSearch' || tc.function.name === 'web_search');
          
          return (
            <div key={msg.id} className="max-w-3xl mx-auto flex flex-col space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="flex items-center space-x-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? 'bg-black' : 'bg-blue-500'}`} />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                   {msg.role === 'user' ? 'You' : 'Ollama'}
                 </span>

               </div>
               
               {msg.thinking && (
                 <div className="p-6 bg-gray-50/80 border border-gray-100 rounded-[2rem] text-[14px] italic text-gray-500 font-serif leading-relaxed shadow-sm">
                   <div className="flex items-center space-x-2 mb-3 not-italic font-sans font-bold text-[9px] text-gray-400 uppercase tracking-[0.25em]">
                     <Info size={12} className="text-blue-300" />
                     <span>Analysis & Reasoning</span>
                   </div>
                   {msg.thinking}
                 </div>
               )}

               {searchCalls.length > 0 && (
                 <details className="group border border-blue-100/30 bg-blue-50/10 rounded-2xl overflow-hidden">
                   <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-blue-50/20 transition-colors">
                     <div className="flex items-center space-x-2 text-[11px] font-bold text-blue-500 uppercase tracking-widest">
                       <Globe size={16} />
                       <span>Search Intelligence ({searchCalls.length})</span>
                     </div>
                     <ChevronRight size={16} className="text-blue-300 group-open:rotate-90 transition-transform" />
                   </summary>
                   <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-blue-50/50 bg-white/50">
                     {searchCalls.map((tc: any, i: number) => (
                       <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl text-[12px] flex items-start space-x-3 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                         <ExternalLink size={14} className="mt-1 text-blue-400 flex-shrink-0" />
                         <div className="flex-1 truncate">
                           <div className="font-bold text-gray-800 truncate mb-1">{tc.function.arguments.query}</div>
                           <div className="text-gray-400 text-[10px] font-medium uppercase tracking-tight">Cloud Web Search</div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </details>
               )}

               <div className={`prose prose-slate max-w-none text-[16px] leading-[1.8] text-gray-800 ${msg.id === 'streaming' ? 'streaming' : ''}`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p({ children }) { return <p className="mb-6 last:mb-0 leading-relaxed">{children}</p>; },
                      h1({ children }) { return <h1 className="text-2xl font-bold mt-10 mb-6">{children}</h1>; },
                      h2({ children }) { return <h2 className="text-xl font-bold mt-8 mb-4">{children}</h2>; },
                      h3({ children }) { return <h3 className="text-lg font-bold mt-6 mb-3">{children}</h3>; },
                      table({ children }) {
                        return (
                          <div className="overflow-x-auto my-8 border border-gray-200 rounded-[1.5rem] shadow-sm bg-white">
                            <table className="w-full text-[14px] text-left border-collapse">
                              {children}
                            </table>
                          </div>
                        );
                      },
                      th({ children }) {
                        return <th className="bg-gray-50/50 p-4 font-bold border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-widest">{children}</th>;
                      },
                      td({ children }) {
                        return <td className="p-4 border-b border-gray-50">{children}</td>;
                      },
                      code({ node, inline, className, children, ...props }: any) {
                        return !inline ? (
                          <div className="relative group/code my-8">
                            <div className="absolute right-4 top-4 opacity-0 group-hover/code:opacity-100 transition-opacity z-10">
                              <button 
                                onClick={() => handleCopy(String(children).replace(/\n$/, ''), `code-${node?.position?.start?.line || Math.random()}`)} 
                                className="p-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-md transition-colors backdrop-blur-sm"
                                title="Copy code"
                              >
                                {copiedId === `code-${node?.position?.start?.line || Math.random()}` ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                             <pre className={`${className} !bg-[#0d1117] !p-6 rounded-2xl border border-gray-800 overflow-x-auto shadow-2xl relative`}>
                              <code {...props} className={`${className} text-[14px] leading-relaxed text-gray-300 font-mono`}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        ) : (
                          <code {...props} className="bg-gray-100 px-1.5 py-0.5 rounded-md text-blue-600 font-mono text-[14px]">
                            {children}
                          </code>
                        );
                      },
                      a({ node, children, ...props }: any) {
                        return <a {...props} className="text-blue-600 font-bold hover:text-blue-800 underline underline-offset-4 decoration-2 decoration-blue-200" target="_blank" rel="noopener noreferrer">{children}</a>;
                      },
                      li({ children }) { return <li className="mb-2 last:mb-0">{children}</li>; },
                      ul({ children }) { return <ul className="list-disc pl-6 mb-6">{children}</ul>; },
                      ol({ children }) { return <ol className="list-decimal pl-6 mb-6">{children}</ol>; }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
               </div>
               
               <div className="flex items-center space-x-2 mt-2">
                 <button 
                   onClick={() => handleCopy(msg.content, msg.id)} 
                   className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                   title="Copy message"
                 >
                   {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                 </button>
               </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-6 bg-white border-t border-gray-100">
        {renderMessageInput()}
      </div>
    </div>
  );
};

export default ChatArea;
