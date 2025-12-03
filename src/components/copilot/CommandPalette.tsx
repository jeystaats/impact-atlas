"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Icon, IconName, ModuleIcon } from "@/components/ui/icons";
import { modules } from "@/data/modules";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAI: (question: string) => void;
  onNavigate: (path: string) => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: IconName;
  category: "ai" | "navigation" | "action";
  action: () => void;
  shortcut?: string;
}

const recentQuestions = [
  "Where should we plant trees first?",
  "What are the top quick wins?",
  "Show plastic accumulation forecast",
];

export function CommandPalette({ isOpen, onClose, onAskAI, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // AI commands
    {
      id: "ask-ai",
      label: "Ask Climate Director",
      description: "Get AI-powered insights",
      icon: "sparkles",
      category: "ai",
      action: () => {
        if (search) onAskAI(search);
        else onAskAI("What are the top quick wins for this city?");
      },
    },
    {
      id: "summarize",
      label: "Summarize current view",
      icon: "info",
      category: "ai",
      action: () => onAskAI("Summarize what I'm looking at and highlight key insights"),
    },
    {
      id: "quick-wins",
      label: "Find top 3 quick wins",
      icon: "zap",
      category: "ai",
      action: () => onAskAI("What are the top 3 quick wins I should focus on right now?"),
    },
    // Navigation commands
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      icon: "dashboard",
      category: "navigation",
      action: () => onNavigate("/dashboard"),
      shortcut: "G D",
    },
    ...modules.map((module) => ({
      id: `nav-${module.id}`,
      label: module.title,
      description: `${module.quickWinsCount} quick wins`,
      icon: "target" as IconName,
      category: "navigation" as const,
      action: () => onNavigate(`/dashboard/modules/${module.id}`),
    })),
    // Action commands
    {
      id: "export",
      label: "Export insights",
      icon: "download",
      category: "action",
      action: () => {
        toast.info("Export feature", {
          description: "Use the export menu on the module page for detailed exports",
        });
        onClose();
      },
      shortcut: "E",
    },
    {
      id: "share",
      label: "Share view",
      icon: "share",
      category: "action",
      action: () => {
        toast.info("Share feature", {
          description: "Use the share menu on the module page to share insights",
        });
        onClose();
      },
      shortcut: "S",
    },
  ];

  // Filter commands based on search
  const filteredCommands = search
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(search.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(search.toLowerCase())
      )
    : commands;

  // Group by category
  const groupedCommands = {
    ai: filteredCommands.filter((c) => c.category === "ai"),
    navigation: filteredCommands.filter((c) => c.category === "navigation"),
    action: filteredCommands.filter((c) => c.category === "action"),
  };

  const allFiltered = [...groupedCommands.ai, ...groupedCommands.navigation, ...groupedCommands.action];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, allFiltered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (allFiltered[selectedIndex]) {
            allFiltered[selectedIndex].action();
            onClose();
          } else if (search) {
            onAskAI(search);
            onClose();
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, allFiltered, search, onAskAI, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl bg-[var(--background-tertiary)] rounded-2xl shadow-2xl border border-[var(--border)] z-50 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
              <Icon name="sparkles" className="w-5 h-5 text-[var(--accent)]" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Ask Climate Director or search commands..."
                className="flex-1 bg-transparent text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-[var(--background-secondary)] text-[var(--foreground-muted)] rounded border border-[var(--border)]">
                ESC
              </kbd>
            </div>

            {/* Commands list */}
            <div className="max-h-[400px] overflow-y-auto p-2">
              {/* Recent questions when empty */}
              {!search && (
                <div className="mb-4">
                  <p className="px-3 py-2 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Recent
                  </p>
                  {recentQuestions.map((q, i) => (
                    <button
                      key={q}
                      onClick={() => {
                        onAskAI(q);
                        onClose();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                        "hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)]"
                      )}
                    >
                      <Icon name="chat" className="w-4 h-4 opacity-50" />
                      <span className="text-sm">{q}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* AI Commands */}
              {groupedCommands.ai.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-2 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    AI Actions
                  </p>
                  {groupedCommands.ai.map((cmd, i) => {
                    const globalIndex = i;
                    return (
                      <CommandItem
                        key={cmd.id}
                        command={cmd}
                        isSelected={selectedIndex === globalIndex}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Navigation Commands */}
              {groupedCommands.navigation.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-2 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Navigate
                  </p>
                  {groupedCommands.navigation.map((cmd, i) => {
                    const globalIndex = groupedCommands.ai.length + i;
                    return (
                      <CommandItem
                        key={cmd.id}
                        command={cmd}
                        isSelected={selectedIndex === globalIndex}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        isModule={cmd.id.startsWith("nav-") && cmd.id !== "nav-dashboard"}
                        moduleId={cmd.id.replace("nav-", "")}
                      />
                    );
                  })}
                </div>
              )}

              {/* Action Commands */}
              {groupedCommands.action.length > 0 && (
                <div>
                  <p className="px-3 py-2 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    Actions
                  </p>
                  {groupedCommands.action.map((cmd, i) => {
                    const globalIndex =
                      groupedCommands.ai.length + groupedCommands.navigation.length + i;
                    return (
                      <CommandItem
                        key={cmd.id}
                        command={cmd}
                        isSelected={selectedIndex === globalIndex}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* No results */}
              {allFiltered.length === 0 && search && (
                <div className="py-8 text-center">
                  <p className="text-[var(--foreground-muted)]">No commands found</p>
                  <p className="text-sm text-[var(--accent)] mt-2">
                    Press Enter to ask the AI: "{search}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--background-secondary)]">
              <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded border border-[var(--border)]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded border border-[var(--border)]">↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded border border-[var(--border)]">↵</kbd>
                    select
                  </span>
                </div>
                <span>Type to ask AI anything</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CommandItem({
  command,
  isSelected,
  onClick,
  isModule,
  moduleId,
}: {
  command: Command;
  isSelected: boolean;
  onClick: () => void;
  isModule?: boolean;
  moduleId?: string;
}) {
  const module = isModule ? modules.find((m) => m.id === moduleId) : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
        isSelected
          ? "bg-[var(--accent-bg)] text-[var(--accent-dark)]"
          : "hover:bg-[var(--background-secondary)] text-[var(--foreground)]"
      )}
    >
      {isModule && moduleId ? (
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: module?.color + "20" }}
        >
          <ModuleIcon moduleId={moduleId} className="w-3.5 h-3.5" style={{ color: module?.color }} />
        </div>
      ) : (
        <Icon name={command.icon} className="w-5 h-5 opacity-70" />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm">{command.label}</span>
        {command.description && (
          <span className="ml-2 text-xs text-[var(--foreground-muted)]">{command.description}</span>
        )}
      </div>
      {command.shortcut && (
        <kbd className="px-1.5 py-0.5 text-xs bg-[var(--background-secondary)] text-[var(--foreground-muted)] rounded border border-[var(--border)]">
          {command.shortcut}
        </kbd>
      )}
    </button>
  );
}
