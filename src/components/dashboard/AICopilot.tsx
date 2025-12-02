"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    moduleId?: string;
    hotspotId?: string;
  };
}

const suggestions = [
  "Where should we plant trees first?",
  "Explain the port emissions trend",
  "What's the highest impact action?",
  "Show plastic accumulation forecast",
];

const sampleResponses = [
  {
    type: "insight",
    title: "Heat Island Priority Zone",
    content: "Based on satellite thermal imaging and demographic data, the downtown commercial district shows 4.2°C higher temperatures than surrounding areas. This correlates with 23% lower tree canopy coverage and higher vulnerability index scores.",
    confidence: 92,
  },
  {
    type: "recommendation",
    title: "Recommended Action",
    content: "Plant 150 shade trees along Main Street corridor. Expected impact: 2.1°C temperature reduction, 15% decrease in cooling energy demand, improved air quality for 12,000 daily pedestrians.",
    effort: "Medium",
    impact: "High",
  },
  {
    type: "data",
    title: "Data Sources",
    content: "Analysis combines Copernicus Land Surface Temperature (updated daily), municipal tree inventory, census demographic data, and building energy consumption records.",
  },
];

export function AICopilot({ isOpen, onClose, context }: AICopilotProps) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Based on my analysis of the current data, I've identified several key insights. The urban heat mapping shows significant temperature variations across the city, with the downtown core experiencing temperatures 3-5°C higher than suburban areas. I recommend prioritizing tree planting in high-traffic pedestrian zones where the cooling impact will benefit the most people.",
        },
      ]);
      setIsTyping(false);
    }, 1500);
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-[var(--background-tertiary)] border-l border-[var(--border)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center">
                  <Icon name="sparkles" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--foreground)]">AI Copilot</h2>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    Ask about your climate data
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
              >
                <Icon name="x" className="w-5 h-5 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Context badge */}
            {context?.moduleId && (
              <div className="px-4 py-2 border-b border-[var(--border)]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-bg)] text-xs text-[var(--accent-dark)]">
                  <Icon name="target" className="w-3 h-3" />
                  Context: {context.moduleId.replace(/-/g, " ")}
                </span>
              </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="space-y-6">
                  {/* Welcome message */}
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-bg)] to-[var(--accent-muted)] mx-auto mb-4 flex items-center justify-center">
                      <Icon name="sparkles" className="w-8 h-8 text-[var(--accent)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-2">
                      How can I help?
                    </h3>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Ask me about climate data, hotspots, or recommended actions for your city.
                    </p>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                      Try asking
                    </p>
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        className="w-full text-left px-4 py-3 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--accent-bg)] text-sm text-[var(--foreground)] hover:text-[var(--accent-dark)] transition-colors border border-[var(--border)] hover:border-[var(--accent-muted)]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  {/* Sample insights */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                      Recent Insights
                    </p>
                    {sampleResponses.map((response, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon
                            name={
                              response.type === "insight" ? "info" :
                              response.type === "recommendation" ? "zap" : "globe"
                            }
                            className="w-4 h-4 text-[var(--accent)]"
                          />
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            {response.title}
                          </span>
                          {response.confidence && (
                            <span className="ml-auto text-xs text-[var(--foreground-muted)]">
                              {response.confidence}% confidence
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--foreground-secondary)] line-clamp-3">
                          {response.content}
                        </p>
                        {response.impact && (
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              {response.impact} impact
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              {response.effort} effort
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] p-4 rounded-2xl",
                          message.role === "user"
                            ? "bg-[var(--accent)] text-white rounded-br-md"
                            : "bg-[var(--background-secondary)] text-[var(--foreground)] rounded-bl-md"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[var(--background-secondary)] px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-[var(--foreground-muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-[var(--foreground-muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-[var(--foreground-muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-[var(--border)]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                  placeholder="Ask about your climate data..."
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
                <Button onClick={() => handleSend(input)} disabled={!input.trim()}>
                  <Icon name="arrowUpRight" className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mt-2 text-center">
                Press Enter to send • ESC to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
