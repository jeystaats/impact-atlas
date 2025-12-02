"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AICopilotEnhanced } from "@/components/copilot/AICopilotEnhanced";
import { CommandPalette } from "@/components/copilot/CommandPalette";
import { Icon } from "@/components/ui/icons";
import { cities, modules } from "@/data/modules";
import { usePreferencesStore } from "@/stores/usePreferencesStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingAIQuestion, setPendingAIQuestion] = useState<string | null>(null);

  // Get city from preferences store
  const { defaultCity } = usePreferencesStore();
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  const selectedCity = cities.find(c => c.id === (isHydrated ? defaultCity : "amsterdam")) || cities[0];

  // Extract current module from pathname
  const moduleMatch = pathname.match(/\/dashboard\/modules\/([^/]+)/);
  const currentModuleId = moduleMatch ? moduleMatch[1] : undefined;
  const currentModule = currentModuleId ? modules.find(m => m.id === currentModuleId) : undefined;

  // Global keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle AI question from command palette
  const handleAskAI = (question: string) => {
    setPendingAIQuestion(question);
    setCopilotOpen(true);
  };

  // Clear pending question when copilot opens
  useEffect(() => {
    if (copilotOpen && pendingAIQuestion) {
      // The question will be handled by the copilot component
      setPendingAIQuestion(null);
    }
  }, [copilotOpen, pendingAIQuestion]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 px-4 flex items-center justify-between glass-strong border-b border-[var(--border)]">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
        >
          <Icon name="menu" className="w-6 h-6 text-[var(--foreground)]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center">
            <Icon name="globe" className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[var(--foreground)]">Impact Atlas</span>
        </div>
        <button
          onClick={() => setCopilotOpen(true)}
          className="p-2 rounded-lg bg-[var(--accent)] text-white"
        >
          <Icon name="sparkles" className="w-5 h-5" />
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="hidden lg:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-30 items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--foreground)]/80 text-white text-xs backdrop-blur-sm">
        <kbd className="px-1.5 py-0.5 rounded bg-white/20">⌘K</kbd>
        <span>Quick actions</span>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 z-50"
            >
              <Sidebar onCopilotOpen={() => {
                setCopilotOpen(true);
                setMobileSidebarOpen(false);
              }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar onCopilotOpen={() => setCopilotOpen(true)} />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>

      {/* AI Copilot - Enhanced with OpenAI */}
      <AICopilotEnhanced
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        city={selectedCity}
        moduleId={currentModuleId}
        moduleName={currentModule?.title}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onAskAI={handleAskAI}
        onNavigate={(path) => router.push(path)}
      />
    </div>
  );
}
