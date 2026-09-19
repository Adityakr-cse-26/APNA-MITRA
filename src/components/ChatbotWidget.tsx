import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  AlertTriangle,
  HeartHandshake,
  PhoneCall,
  Loader2,
  Sparkles,
  ShieldAlert,
  Info,
  ChevronDown,
  Maximize2,
  Minimize2,
  Stethoscope,
  HeartPulse,
  ArrowLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatAvatar } from './ChatAvatar';
import {
  sendChatbotMessage,
  ChatMessage,
  LOCALIZED_QUICK_PROMPTS,
  LOCALIZED_GREETINGS
} from '../services/chatbotService';
import { Language } from '../types';

interface ChatbotWidgetProps {
  currentLang?: Language;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ currentLang = 'en' }) => {
  const activeLang = currentLang || 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [showDisclaimerDetails, setShowDisclaimerDetails] = useState(false);

  const initialMessage: ChatMessage = {
    id: 'welcome-1',
    role: 'assistant',
    content: LOCALIZED_GREETINGS[activeLang] || LOCALIZED_GREETINGS.en,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('apna_mitra_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [initialMessage];
  });

  // Update initial message if language changes and chat hasn't started yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome-1') {
      setMessages([{
        id: 'welcome-1',
        role: 'assistant',
        content: LOCALIZED_GREETINGS[activeLang] || LOCALIZED_GREETINGS.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [activeLang]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // External open trigger listener (e.g. from Patient dashboard buttons)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openApnaMitraChat', handleOpen);
    return () => window.removeEventListener('openApnaMitraChat', handleOpen);
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Persist messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem('apna_mitra_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Handle Escape key to go back from full screen or close chat
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExpanded]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setError(null);
    setLastFailedMessage(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatbotMessage(text, updatedMessages, activeLang);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: response.isEmergency,
        isCrisis: response.isCrisis,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLastFailedMessage(null);
    } catch (err: any) {
      console.error("Chat error:", err);
      setLastFailedMessage(text);
      setError(err?.message || "Failed to reach health assistant. Please check your connection or retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!lastFailedMessage || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const response = await sendChatbotMessage(lastFailedMessage, messages, activeLang);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: response.isEmergency,
        isCrisis: response.isCrisis,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLastFailedMessage(null);
    } catch (err: any) {
      console.error("Retry error:", err);
      setError(err?.message || "Retry failed. Please check network connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Do you want to reset this chat conversation?")) {
      setMessages([initialMessage]);
      setError(null);
      try {
        localStorage.removeItem('apna_mitra_chat_history');
      } catch {
        // ignore
      }
    }
  };

  const modalContent = isOpen ? (
    <>
      {/* Background backdrop in full screen mode */}
      {isExpanded && (
        <div
          id="chatbot-fullscreen-backdrop"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9998] transition-opacity print:hidden"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat Window Modal / Dialog */}
      <div
        id="apna-mitra-chatbot-window"
        className={`fixed transition-all duration-300 flex flex-col bg-white border border-slate-200 shadow-2xl overflow-hidden print:hidden z-[9999]
          ${
            isExpanded
              ? 'inset-0 sm:inset-3 md:inset-5 lg:inset-6 rounded-none sm:rounded-2xl'
              : 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[620px] sm:max-h-[88vh] rounded-none sm:rounded-2xl'
          }`}
        role="dialog"
        aria-label="Apna Mitra AI Health Assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-sm flex-shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Back button: prominently displayed when in full screen, and also on mobile */}
              <button
                id="chatbot-header-back-button"
                onClick={() => {
                  if (isExpanded) {
                    setIsExpanded(false);
                  } else {
                    setIsOpen(false);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white font-semibold text-xs transition-all border border-white/25 shadow-sm active:scale-95 flex-shrink-0 ${
                  isExpanded
                    ? 'bg-white/25 hover:bg-white/35 text-white ring-1 ring-white/30'
                    : 'bg-white/15 hover:bg-white/25 sm:hidden'
                }`}
                title={isExpanded ? "Back to windowed view (Esc)" : "Back to dashboard"}
                aria-label={isExpanded ? "Back to windowed view" : "Back to dashboard"}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <ChatAvatar className="w-10 h-10 shadow-sm ring-2 ring-white/60 flex-shrink-0" alt="Apna Mitra Health AI Robot" />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base leading-tight truncate">Apna Mitra Health AI</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/40 text-emerald-100 border border-emerald-300/30 rounded flex-shrink-0">
                    Support
                  </span>
                  {isExpanded && (
                    <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-medium bg-white/20 text-white rounded flex-shrink-0">
                      Full Screen
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-100 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse flex-shrink-0"></span>
                  <span className="truncate">Non-Doctor Health & Wellness AI</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              {isExpanded ? (
                <button
                  id="chatbot-exit-fullscreen-btn"
                  onClick={() => setIsExpanded(false)}
                  title="Exit Full Screen (Back to Window)"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-white text-xs font-medium transition-colors border border-white/20"
                  aria-label="Exit full screen mode"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Exit Full Screen</span>
                </button>
              ) : (
                <button
                  id="chatbot-fullscreen-btn"
                  onClick={() => setIsExpanded(true)}
                  title="Expand to Full Screen"
                  className="hidden sm:inline-flex p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors"
                  aria-label="Expand to full screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}

              <button
                id="chatbot-clear-history-btn"
                onClick={handleClearChat}
                title="Clear Conversation"
                className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors"
                aria-label="Clear chat history"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                id="chatbot-close-modal-btn"
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                title="Close chat & Back to Dashboard"
                className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors ml-0.5"
                aria-label="Close chat window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Medical Notice & Disclaimer Bar */}
          <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-start justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="leading-snug">
                <strong>Not a doctor:</strong> Informational advice only. In emergencies, call <strong>108 / 112</strong>.
              </span>
            </div>
            <button
              onClick={() => setShowDisclaimerDetails(!showDisclaimerDetails)}
              className="text-amber-800 underline hover:text-amber-950 text-[11px] font-medium flex-shrink-0 flex items-center"
            >
              Details
              <ChevronDown className={`w-3 h-3 ml-0.5 transform transition-transform ${showDisclaimerDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showDisclaimerDetails && (
            <div className="bg-amber-100/70 border-b border-amber-300/80 px-4 py-2.5 text-[11px] text-amber-950 space-y-1 animate-fadeIn flex-shrink-0">
              <p>
                • <strong>No Medical Diagnosis:</strong> This AI cannot evaluate or diagnose specific illnesses.
              </p>
              <p>
                • <strong>No Prescriptions:</strong> It does not prescribe medicines or modify prescription drug regimens.
              </p>
              <p>
                • <strong>Always Consult:</strong> Please seek guidance from a qualified physician for clinical care.
              </p>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[82%]">
                    {!isUser && (
                      <ChatAvatar className="w-7 h-7 mb-1 shadow-sm" alt="Apna Mitra AI" />
                    )}

                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm text-sm ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      {/* Emergency Alert Banner inside message */}
                      {msg.isEmergency && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex flex-col gap-2">
                          <div className="flex items-center gap-2 font-bold text-red-700">
                            <ShieldAlert className="w-4 h-4 text-red-600" />
                            <span>EMERGENCY MEDICAL WARNING</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">
                            Your symptoms may require urgent medical care. Do not delay.
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <a
                              href="tel:108"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              Call 108 (Ambulance)
                            </a>
                            <a
                              href="tel:112"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-black text-white font-bold rounded-lg text-xs transition-colors"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              Call 112 (National Emergency)
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Crisis / Self-Harm Support Banner inside message */}
                      {msg.isCrisis && (
                        <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 text-xs flex flex-col gap-2">
                          <div className="flex items-center gap-2 font-bold text-indigo-800">
                            <HeartHandshake className="w-4 h-4 text-indigo-600" />
                            <span>Confidential Emotional & Crisis Support</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">
                            Support is available 24 hours a day, 7 days a week. You are not alone.
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <a
                              href="tel:14416"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              Tele-MANAS: 14416 (Toll-Free)
                            </a>
                            <a
                              href="tel:9999666555"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              Vandrevala: 9999 666 555
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="text-sm max-w-none break-words leading-relaxed text-slate-800">
                        {isUser ? (
                          <p className="whitespace-pre-wrap text-white m-0">{msg.content}</p>
                        ) : (
                          <ReactMarkdown
                            components={{
                              strong: ({ node, ...props }) => (
                                <strong className="font-bold text-slate-950" {...props} />
                              ),
                              em: ({ node, ...props }) => (
                                <em className="italic text-slate-700" {...props} />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-800" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc pl-5 mb-2.5 space-y-1.5 text-slate-800" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal pl-5 mb-2.5 space-y-1.5 text-slate-800" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="leading-relaxed" {...props} />
                              ),
                              h1: ({ node, ...props }) => (
                                <h1 className="font-bold text-base text-slate-950 mb-1.5 mt-2" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 className="font-bold text-[15px] text-slate-950 mb-1 mt-2" {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 className="font-semibold text-sm text-slate-950 mb-1 mt-1.5" {...props} />
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] text-slate-400 px-2 ${
                      isUser ? 'text-right' : 'text-left ml-9'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-end gap-2 max-w-[85%] animate-fadeIn">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mb-1 shadow-sm">
                  AM
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl rounded-bl-xs px-4 py-3 shadow-sm flex items-center gap-2 text-slate-600 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Apna Mitra is reviewing health guidance...</span>
                </div>
              </div>
            )}

            {/* In-Chat Error State */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Unable to complete request</p>
                    <p className="text-red-700 mt-0.5">{error}</p>
                  </div>
                </div>
                <button
                  onClick={lastFailedMessage ? handleRetry : () => handleSendMessage()}
                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded text-[11px] transition-colors flex-shrink-0"
                >
                  {activeLang === 'hi' ? 'पुनः प्रयास करें' : activeLang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex-shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {activeLang === 'hi' ? 'सुझावित:' : activeLang === 'bn' ? 'প্রস্তাবিত:' : 'Suggested:'}
              </span>
              {(LOCALIZED_QUICK_PROMPTS[activeLang] || LOCALIZED_QUICK_PROMPTS.en).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs rounded-full whitespace-nowrap transition-colors shadow-2xs disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Form Footer */}
          <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeLang === 'hi'
                      ? 'ब्लड प्रेशर, नींद, खान-पान या स्वास्थ्य के बारे में पूछें...'
                      : activeLang === 'bn'
                      ? 'রক্তচাপ, ঘুম, খাদ্যাভ্যাস বা সুস্থতা নিয়ে জিজ্ঞাসা করুন...'
                      : 'Ask a health, wellness, or mobility question...'
                  }
                  rows={2}
                  disabled={isLoading}
                  className="w-full resize-none px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-60"
                  aria-label="Your health question"
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="h-10 w-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center justify-center shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400" />
                {activeLang === 'hi'
                  ? 'भेजने के लिए Enter दबाएं (नई लाइन के लिए Shift+Enter)'
                  : activeLang === 'bn'
                  ? 'পাঠাতে Enter টিপুন (নতুন লাইনের জন্য Shift+Enter)'
                  : 'Press Enter to send (Shift+Enter for new line)'}
              </span>
              <span>Apna Mitra Health AI</span>
            </div>
          </div>
        </div>
    </>
  ) : null;

  return (
    <>
      {/* Floating Widget Trigger Button (Circular FAB) */}
      {!isOpen && (
        <button
          id="apna-mitra-chatbot-trigger"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300 print:hidden"
          aria-label="Open Apna Mitra AI Health Chatbot"
          title="Ask Apna Mitra AI"
        >
          <div className="relative flex items-center justify-center">
            <ChatAvatar className="w-9 h-9 sm:w-11 sm:h-11 shadow-md ring-2 ring-white/70" alt="Apna Mitra AI Health Robot" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
            </span>
          </div>

          {/* Hover tooltip for desktop */}
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-xs px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 hidden sm:flex items-center gap-1">
            Ask Apna Mitra
            <Sparkles className="w-3 h-3 text-amber-300" />
          </span>
        </button>
      )}

      {typeof document !== 'undefined' && modalContent
        ? createPortal(modalContent, document.body)
        : modalContent}
    </>
  );
};
