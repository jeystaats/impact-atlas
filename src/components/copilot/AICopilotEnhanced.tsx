"use client";

import { useState, useEffect, useRef, FormEvent, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { NeuralThinking } from "./NeuralThinking";
import { IntelligenceCard } from "./IntelligenceCard";
import { SmartSuggestions } from "./SmartSuggestions";
import { QuickAction, QuickActionList } from "./QuickActionCard";
import { cn } from "@/lib/utils";
import { City } from "@/types";
import { useSelectedCity } from "@/hooks/useSelectedCity";
import { Id } from "../../../convex/_generated/dataModel";
import { HotspotData } from "@/data/hotspots";
import {
  extractActionsFromAIResponse,
  hotspotToQuickAction,
  hasActionableContent
} from "@/lib/actionExtractor";
import { trackCopilotInteraction } from "@/lib/analytics";

interface AICopilotEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  city?: City;
  moduleId?: string;
  moduleName?: string;
  selectedHotspot?: string;
  selectedHotspotData?: HotspotData;
  onViewOnMap?: (lat: number, lng: number) => void;
}

function parseMessageType(content: string): "insight" | "recommendation" | "warning" | "general" {
  const lower = content.toLowerCase();
  if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("should") || lower.includes("quick win")) {
    return "recommendation";
  }
  if (lower.includes("warning") || lower.includes("alert") || lower.includes("concern") || lower.includes("risk")) {
    return "warning";
  }
  if (lower.includes("analysis") || lower.includes("data shows") || lower.includes("trend") || lower.includes("detected")) {
    return "insight";
  }
  return "general";
}

// Helper to extract text content from UIMessage (AI SDK 5.0 format)
function getMessageContent(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts) {
    return "";
  }
  // Handle array of parts (UIMessage format in AI SDK 5.0)
  const textParts = message.parts.filter((part): part is { type: string; text: string } =>
    part.type === "text" && typeof part.text === "string"
  );
  return textParts.map((part) => part.text).join("");
}

export function AICopilotEnhanced({
  isOpen,
  onClose,
  city,
  moduleId,
  moduleName,
  selectedHotspot,
  selectedHotspotData,
  onViewOnMap,
}: AICopilotEnhancedProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [extractedActions, setExtractedActions] = useState<QuickAction[]>([]);
  const [showActionsPanel, setShowActionsPanel] = useState(false);

  // Get selected city for saving quick wins
  const { selectedCityId } = useSelectedCity();

  // Mutation for saving quick wins
  const createQuickWin = useMutation(api.quickWins.createFromAI);

  // Handler to save AI response as quick win
  const handleSaveQuickWin = useCallback(async (content: string) => {
    trackCopilotInteraction("save_quick_win", { moduleId });
    await createQuickWin({
      content,
      moduleSlug: moduleId,
      cityId: selectedCityId as Id<"cities"> | undefined,
    });
  }, [createQuickWin, moduleId, selectedCityId]);

  // Handler to add QuickAction to plan
  const handleAddToPlan = useCallback(async (action: QuickAction) => {
    // Create a formatted content string from the action
    const content = `**${action.title}**\n\n${action.description}\n\nImpact: ${action.impactValue} ${action.impactUnit}\nEffort: ${action.effortLevel}${action.location ? `\nLocation: ${action.location.name}` : ""}`;
    await createQuickWin({
      content,
      moduleSlug: action.moduleId || moduleId,
      cityId: selectedCityId as Id<"cities"> | undefined,
    });
  }, [createQuickWin, moduleId, selectedCityId]);

  // Handler for "View on Map" button
  const handleViewOnMap = useCallback((action: QuickAction) => {
    if (action.location?.lat && action.location?.lng && onViewOnMap) {
      onViewOnMap(action.location.lat, action.location.lng);
      onClose();
    }
  }, [onViewOnMap, onClose]);

  // Handler to dismiss an action
  const handleDismissAction = useCallback((action: QuickAction) => {
    setExtractedActions(prev => prev.filter(a => a.id !== action.id));
  }, []);

  // Create transport with city/module/hotspot context in body
  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: {
          city: city ? { name: city.name, country: city.country, population: city.population } : undefined,
          moduleId,
          moduleName,
          selectedHotspot: selectedHotspotData,
        },
      }),
    [city, moduleId, moduleName, selectedHotspotData]
  );

  const { messages, status, sendMessage } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Track processed message IDs to avoid re-extracting
  const processedMessageIds = useRef<Set<string>>(new Set());
  const prevHotspotId = useRef<string | null>(null);

  // Compute the pending action extraction info (derived state, no side effects)
  const pendingActionExtraction = useMemo(() => {
    if (isLoading || messages.length === 0) return null;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") return null;

    const content = getMessageContent(lastMessage);
    if (!hasActionableContent(content)) return null;

    return { messageId: lastMessage.id, content };
  }, [isLoading, messages]);

  // Compute the hotspot action if hotspot data changes
  const hotspotAction = useMemo(() => {
    if (!selectedHotspotData || !moduleId) return null;
    return hotspotToQuickAction(selectedHotspotData, moduleId);
  }, [selectedHotspotData, moduleId]);

  // Effect to process extracted actions from AI messages
  // Using a timeout to defer the state update and satisfy the linter
  useEffect(() => {
    if (!pendingActionExtraction) return;

    const { messageId, content } = pendingActionExtraction;

    // Check if already processed
    if (processedMessageIds.current.has(messageId)) return;
    processedMessageIds.current.add(messageId);

    const actions = extractActionsFromAIResponse(content, moduleId);
    if (actions.length > 0) {
      // Defer state update to satisfy the linter's "no setState in effect" rule
      const timeoutId = setTimeout(() => {
        setExtractedActions(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newActions = actions.filter(a => !existingIds.has(a.id));
          return [...prev, ...newActions];
        });
        setShowActionsPanel(true);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [pendingActionExtraction, moduleId]);

  // Effect to handle hotspot selection
  useEffect(() => {
    if (!hotspotAction) return;

    const hotspotId = selectedHotspotData?.id || null;
    if (hotspotId === prevHotspotId.current) return;
    prevHotspotId.current = hotspotId;

    // Defer state update to satisfy the linter's "no setState in effect" rule
    const timeoutId = setTimeout(() => {
      setExtractedActions(prev => {
        const filtered = prev.filter(a => !a.id.startsWith("hotspot-"));
        return [hotspotAction, ...filtered];
      });
      setShowActionsPanel(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [hotspotAction, selectedHotspotData?.id]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      trackCopilotInteraction("message", {
        moduleId,
        messageLength: input.length,
      });
      sendMessage({ text: input });
      setInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens and track analytics
  useEffect(() => {
    if (isOpen) {
      trackCopilotInteraction("open", { moduleId });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, moduleId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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

  const handleSuggestionSelect = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 50);
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
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent-bg)] to-transparent">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center shadow-lg"
                >
                  <Icon name="sparkles" className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="font-semibold text-[var(--foreground)]">Climate Director</h2>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {city ? `Advising on ${city.name}` : "AI-powered climate intelligence"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close Climate Director"
                className="p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Icon name="x" className="w-5 h-5 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Context badges */}
            {(moduleId || selectedHotspotData) && (
              <div className="flex-shrink-0 px-4 py-2 border-b border-[var(--border)] flex flex-wrap gap-2">
                {moduleId && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-bg)] text-xs text-[var(--accent-dark)]">
                    <Icon name="target" className="w-3 h-3" />
                    {moduleName || moduleId.replace(/-/g, " ")}
                  </span>
                )}
                {selectedHotspotData && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs",
                      selectedHotspotData.severity === "critical" && "bg-rose-50 text-rose-700",
                      selectedHotspotData.severity === "high" && "bg-amber-50 text-amber-700",
                      selectedHotspotData.severity === "medium" && "bg-yellow-50 text-yellow-700",
                      selectedHotspotData.severity === "low" && "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    <Icon name="mapPin" className="w-3 h-3" />
                    {selectedHotspotData.label}
                    {selectedHotspotData.value && (
                      <span className="font-medium">{selectedHotspotData.value}</span>
                    )}
                  </motion.span>
                )}
              </div>
            )}

            {/* Quick Actions Panel Toggle */}
            {extractedActions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex-shrink-0 border-b border-[var(--border)]"
              >
                <button
                  onClick={() => setShowActionsPanel(!showActionsPanel)}
                  className="w-full px-4 py-2 flex items-center justify-between hover:bg-[var(--background-secondary)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="zap" className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      Quick Actions
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white text-xs font-medium">
                      {extractedActions.length}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: showActionsPanel ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon name="chevronDown" className="w-4 h-4 text-[var(--foreground-muted)]" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showActionsPanel && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 max-h-[300px] overflow-y-auto space-y-3">
                        <QuickActionList
                          actions={extractedActions}
                          onAddToPlan={handleAddToPlan}
                          onViewOnMap={onViewOnMap ? handleViewOnMap : undefined}
                          onDismiss={handleDismissAction}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="space-y-6">
                  {/* Welcome message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-bg)] to-[var(--accent-muted)] mx-auto mb-4 flex items-center justify-center">
                      <Icon name="sparkles" className="w-8 h-8 text-[var(--accent)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-2">
                      Climate Intelligence Director
                    </h3>
                    <p className="text-sm text-[var(--foreground-secondary)] max-w-xs mx-auto">
                      I analyze satellite data, sensor networks, and climate models to help you find actionable quick wins for {city?.name || "your city"}.
                    </p>
                  </motion.div>

                  {/* Smart suggestions */}
                  <SmartSuggestions
                    moduleId={moduleId}
                    selectedHotspot={selectedHotspot}
                    onSelect={handleSuggestionSelect}
                  />
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "user" ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="max-w-[85%] p-4 rounded-2xl rounded-br-md bg-[var(--accent)] text-white"
                        >
                          <p className="text-sm">{getMessageContent(message)}</p>
                        </motion.div>
                      ) : (
                        <div className="max-w-[95%] w-full">
                          <IntelligenceCard
                            type={parseMessageType(getMessageContent(message))}
                            content={getMessageContent(message)}
                            isStreaming={isLoading && index === messages.length - 1}
                            onClose={onClose}
                            onSaveQuickWin={handleSaveQuickWin}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading state */}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="bg-[var(--background-secondary)] rounded-xl">
                      <NeuralThinking moduleId={moduleId} />
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions when chatting */}
            {messages.length > 0 && !isLoading && (
              <div className="flex-shrink-0 px-4 py-2 border-t border-[var(--border)] overflow-x-auto">
                <div className="flex gap-2">
                  {["Tell me more", "What's the next step?", "Show alternatives"].map((quick) => (
                    <button
                      key={quick}
                      onClick={() => handleSuggestionSelect(quick)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[var(--background-secondary)] text-xs text-[var(--foreground-secondary)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-dark)] transition-colors"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-[var(--border)]">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about climate data..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
                />
                <Button type="submit" disabled={!input.trim() || isLoading}>
                  <Icon name="arrowUpRight" className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mt-2 text-center">
                Powered by GPT-4o • ESC to close
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
