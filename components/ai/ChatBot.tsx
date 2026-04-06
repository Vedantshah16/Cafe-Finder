'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Coffee, RotateCcw, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ChatMessageSkeleton } from '@/components/ui/Skeleton';
import CafeCard from '@/components/cafe/CafeCard';
import { generateId } from '@/lib/utils/helpers';
import axios from 'axios';
import type { ChatMessage, Cafe } from '@/types';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hey! ☕ I'm CafeBot, your AI cafe guide. Tell me what you're looking for and I'll find the perfect spot. Try something like:\n\n• \"I want a romantic cafe for a first date\"\n• \"Need a quiet place to work with fast WiFi\"\n• \"What's the best cheap coffee near me?\"",
  timestamp: new Date(),
};

const QUICK_PROMPTS = [
  '☕ Best espresso nearby',
  '💻 Work-friendly cafes',
  '🌹 Romantic date spots',
  '📚 Quiet study places',
];

export default function ChatBot() {
  const { isChatOpen, toggleChat, userLocation, cafes: nearbyCafes } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isChatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string = input.trim()) => {
    if (!text || isTyping) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { data } = await axios.post('/api/ai/chat', {
        messages: [...messages, userMsg].slice(-8),
        location: userLocation,
        nearbyContext: nearbyCafes.slice(0, 5),
      });

      const botMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.data.message,
        timestamp: new Date(),
        cafes: data.data.cafes,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please try again!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-accent hover:bg-accent-hover rounded-2xl flex items-center justify-center shadow-accent-lg text-black transition-colors"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <MessageCircle size={22} />
            </motion.div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl bg-accent animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-1.5rem)] bg-surface border border-border rounded-3xl shadow-glass-lg overflow-hidden flex flex-col"
            style={{ height: 'min(580px, calc(100vh - 5rem))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface-elevated flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Coffee size={18} className="text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">CafeBot AI</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-text-muted">Always available</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                  title="Reset chat"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={12} className="text-black" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] ${
                      msg.role === 'user'
                        ? 'bg-accent text-black rounded-2xl rounded-tr-sm px-4 py-3'
                        : 'bg-surface-elevated text-text-primary rounded-2xl rounded-tl-sm px-4 py-3'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>

                    {/* Attached cafe recommendations */}
                    {msg.cafes && msg.cafes.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.cafes.slice(0, 2).map((cafe) => (
                          <MiniCafeCard key={cafe.place_id} cafe={cafe} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Sparkles size={12} className="text-black" />
                  </div>
                  <div className="bg-surface-elevated rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                          className="w-1.5 h-1.5 rounded-full bg-text-muted"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="flex-shrink-0 text-xs bg-surface-elevated hover:bg-accent-light hover:text-accent border border-border hover:border-accent/30 text-text-secondary px-3 py-1.5 rounded-full transition-all duration-200"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-border flex-shrink-0">
              <div className="flex items-center gap-2 bg-surface-elevated border border-border rounded-2xl px-4 py-2.5">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about cafes…"
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="p-1.5 rounded-xl bg-accent hover:bg-accent-hover text-black disabled:opacity-40 transition-all"
                >
                  <Send size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MiniCafeCard({ cafe }: { cafe: Cafe }) {
  return (
    <a
      href={`/cafe/${cafe.place_id}`}
      className="flex items-center gap-2 bg-surface/80 rounded-xl p-2 hover:bg-accent-light transition-colors border border-border"
    >
      <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0">
        <Coffee size={14} className="text-accent" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-primary truncate">{cafe.name}</p>
        <p className="text-[10px] text-text-muted truncate">{cafe.rating}★ · {cafe.address.split(',')[0]}</p>
      </div>
    </a>
  );
}
