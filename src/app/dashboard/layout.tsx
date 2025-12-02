"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AICopilot } from "@/components/dashboard/AICopilot";
import { Icon } from "@/components/ui/icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

      {/* AI Copilot */}
      <AICopilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}
