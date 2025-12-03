"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { Sparkles, Send, Bot, User, Lightbulb, ChevronDown } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleName: string;
  context?: {
    hotspotCount?: number;
    cityName?: string;
  };
}

// Suggested prompts based on module type
const suggestedPrompts: Record<string, string[]> = {
  "urban-heat": [
    "What are the most effective cooling strategies for this area?",
    "How can we prioritize hotspot interventions?",
    "What's the expected impact of tree planting here?",
    "Compare heat mitigation approaches",
  ],
  "coastal-plastic": [
    "Where should we deploy boom barriers first?",
    "What's causing the high accumulation rates?",
    "How effective are current interception methods?",
    "Recommend community engagement strategies",
  ],
  "ocean-plastic": [
    "Analyze the debris flow patterns",
    "Which sources contribute most to ocean pollution?",
    "Predict future accumulation zones",
  ],
  "port-emissions": [
    "Which vessels should we target for reduction?",
    "What's the ROI of shore power installation?",
    "Compare emission reduction strategies",
    "Impact of speed reduction zones",
  ],
  "biodiversity": [
    "Which habitats are most at risk?",
    "Recommend species protection priorities",
    "How can we improve wildlife corridors?",
  ],
  "default": [
    "Summarize the current situation",
    "What quick wins should we prioritize?",
    "Recommend next steps",
    "Explain the data trends",
  ],
};

// Simulated AI responses (in production, this would call an AI API)
const getAIResponse = async (message: string, moduleId: string, context?: { hotspotCount?: number; cityName?: string }): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const responses: Record<string, string[]> = {
    "urban-heat": [
      `Based on the ${context?.hotspotCount || "current"} hotspots in ${context?.cityName || "the selected area"}, I recommend focusing on:\n\n1. **Strategic tree planting** in the 3 highest-severity zones - expected 2-3°C reduction\n2. **Cool roof installations** on municipal buildings - quick implementation\n3. **Shade structure pilots** at transit stops in vulnerable neighborhoods\n\nWould you like me to create an action plan for any of these?`,
      `The data shows temperature anomalies of 4-7°C in the downtown area. Key contributing factors:\n\n- High building density with limited green space\n- Dark surface materials absorbing heat\n- Limited tree canopy coverage (currently ~12%)\n\nI suggest prioritizing the northwest quadrant where elderly population density is highest.`,
    ],
    "coastal-plastic": [
      `Analysis of debris patterns shows 3 primary accumulation zones. The most effective intervention points are:\n\n1. **River mouth #2** - intercepts 40% of incoming debris\n2. **Storm drain cluster C** - high microplastic concentration\n3. **Beach sector 5** - tourist area with visibility impact\n\nBoom barrier deployment at point #1 would have the highest impact-to-cost ratio.`,
    ],
    "port-emissions": [
      `Current port emissions analysis for ${context?.cityName || "this location"}:\n\n- **Hoteling vessels** contribute 62% of shore-side emissions\n- **Cargo handling equipment** accounts for 23%\n- **Truck queuing** represents 15%\n\nShore power installation at berths 3-5 would reduce emissions by an estimated 340 tons CO₂/year.`,
    ],
    "default": [
      `Based on my analysis of the ${context?.hotspotCount || "available"} data points, here are my recommendations:\n\n1. Focus resources on the top 3 highest-severity hotspots\n2. Implement quick wins from the suggested list\n3. Monitor trends over the next 30 days\n\nWould you like me to elaborate on any of these points?`,
    ],
  };

  const moduleResponses = responses[moduleId] || responses["default"];
  return moduleResponses[Math.floor(Math.random() * moduleResponses.length)];
};

export function AICopilotDrawer({
  isOpen,
  onClose,
  moduleId,
  moduleName,
  context,
}: AICopilotDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const prompts = suggestedPrompts[moduleId] || suggestedPrompts["default"];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const response = await getAIResponse(text, moduleId, context);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-copilot-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-[var(--background-secondary)] border-l border-[var(--border)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-gradient-to-r from-[var(--teal-glow)] to-transparent">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 10px var(--teal-glow)",
                      "0 0 20px var(--teal-glow-strong)",
                      "0 0 10px var(--teal-glow)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                </motion.div>
                <div>
                  <h2 id="ai-copilot-title" className="font-semibold text-[var(--foreground)]">AI Copilot</h2>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                    <ModuleIcon moduleId={moduleId} className="w-3 h-3" />
                    {moduleName}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close AI Copilot"
                className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Icon name="x" className="w-5 h-5 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--background-tertiary)] flex items-center justify-center">
                    <Bot className="w-8 h-8 text-[var(--foreground-muted)]" />
                  </div>
                  <h3 className="font-medium text-[var(--foreground)] mb-2">
                    How can I help?
                  </h3>
                  <p className="text-sm text-[var(--foreground-muted)] max-w-xs mx-auto">
                    Ask me about hotspots, recommendations, or strategies for {moduleName.toLowerCase()}.
                  </p>
                </motion.div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-[var(--accent)]"
                        : "bg-[var(--background-tertiary)] border border-[var(--border)]"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-[var(--accent)]" />
                    )}
                  </div>
                  <div
                    className={`flex-1 px-4 py-3 rounded-xl text-sm ${
                      message.role === "user"
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--background-tertiary)] text-[var(--foreground)]"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-[var(--background-tertiary)]">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-[var(--foreground-muted)]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-2"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-[var(--foreground-muted)]" />
                    <span className="text-xs text-[var(--foreground-muted)]">Suggested questions</span>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="ml-auto p-1 rounded hover:bg-[var(--background-tertiary)]"
                    >
                      <ChevronDown className="w-3 h-3 text-[var(--foreground-muted)]" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prompts.slice(0, 3).map((prompt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleSend(prompt)}
                        className="px-3 py-1.5 rounded-lg text-xs text-[var(--foreground-secondary)] bg-[var(--background-tertiary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--background-tertiary)]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this module..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-[var(--accent)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
