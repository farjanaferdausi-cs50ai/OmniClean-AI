import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { ASSETS } from '../assets';

interface FloatingAIAssistantProps {
  initialOpen?: boolean;
}

const QUICK_PROMPTS = [
  'How do I safely sort lithium batteries?',
  'What are the guidelines for textile fabric scrap?',
  'How much CO2 does recycling cardboard save?',
  'Can soiled greasy paper be recycled?',
];

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  initialOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'floating-welcome',
      sender: 'assistant',
      text: "👋 **Hi! I'm your OmniClean AI Assistant.**\n\nAsk me anything about waste sorting, factory jhoot recovery, or hazardous material handling. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (queryToSend?: string) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `ast-${Date.now() + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setInputQuery('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          query,
          message: query,
          contextMessages: messages.slice(-4),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, text: accumulated } : msg
            )
          );
        }
      } else {
        const data = await response.json();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, text: data.answer || 'Thank you for asking! How else can I assist?' }
              : msg
          )
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Chat aborted by user');
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  text:
                    '⚠️ Unable to reach the AI service right now. Please verify your connection or try again shortly.',
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setMessages([
      {
        id: 'floating-welcome',
        sender: 'assistant',
        text: "👋 **Hi! I'm your OmniClean AI Assistant.**\n\nAsk me anything about waste sorting, factory jhoot recovery, or hazardous material handling. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <aside
          role="region"
          aria-label="AI Assistant Quick Access"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 group"
        >
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-blue-100 text-xs font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none -translate-x-2 group-hover:translate-x-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Need waste sorting advice? Ask AI!</span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-xl hover:shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/80 cursor-pointer overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Open OmniClean AI Assistant"
            title="Open OmniClean AI Assistant"
          >
            {/* Ambient Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

            {/* AI Assistant Icon with glowing aura */}
            <div className="relative flex items-center justify-center">
              <img
                src={ASSETS.celestialOrbLogo}
                alt="AI Assistant"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/70 shadow-sm"
              />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
              </span>
            </div>
          </button>
        </aside>
      )}

      {/* Floating Pop-up Assistant Window */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="OmniClean AI Assistant Window"
          aria-modal="false"
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden font-sans ${
            isExpanded
              ? 'inset-3 sm:inset-6 max-w-4xl mx-auto'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="relative px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-white/15 p-0.5 border border-white/30 shrink-0 overflow-hidden shadow-xs">
                <img
                  src={ASSETS.celestialOrbLogo}
                  alt="AI Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-900 rounded-full" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    OmniClean AI
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/20 text-sky-100 px-1.5 py-0.2 rounded-full border border-white/25">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-blue-100/90 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Gemini 2.5 Flash • Online
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:inline-flex p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? 'Restore window size' : 'Expand window'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 text-xs sm:text-[13px] bg-slate-50/70">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isAssistant ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                      isAssistant
                        ? 'bg-white text-slate-800 border border-slate-200/90'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isAssistant && !msg.text ? (
                      <div className="flex items-center gap-1.5 text-slate-400 py-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        <span className="text-xs italic">Thinking & analyzing...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap space-y-1">
                        {msg.text}
                      </div>
                    )}
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        isAssistant ? 'text-slate-400' : 'text-blue-100/80'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
              <Sparkles className="w-2.5 h-2.5 text-blue-600" />
              Ask:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isStreaming}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer shrink-0 shadow-2xs disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about sorting, recycling rules, CO2..."
                disabled={isStreaming}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isStreaming}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs hover:shadow flex items-center gap-1 cursor-pointer"
                title="Send query"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline text-xs">Send</span>
              </button>
            </form>
          </div>
        </aside>
      )}
    </>
  );
};
