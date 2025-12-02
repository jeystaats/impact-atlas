"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon, ModuleIcon, IconName } from "@/components/ui/icons";
import { modules } from "@/data/modules";

interface SidebarProps {
  onCopilotOpen: () => void;
}

const mainNavItems: { icon: IconName; label: string; href: string }[] = [
  { icon: "home", label: "Overview", href: "/dashboard" },
  { icon: "zap", label: "Quick Wins", href: "/dashboard/quick-wins" },
  { icon: "target", label: "Action Plans", href: "/dashboard/plans" },
];

export function Sidebar({ onCopilotOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[var(--background-tertiary)] border-r border-[var(--border)] z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                <Icon name="globe" className="w-4 h-4 text-white" />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-lg font-semibold text-[var(--foreground)] overflow-hidden whitespace-nowrap"
                  >
                    Impact Atlas
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
            >
              <Icon
                name="chevronRight"
                className={cn(
                  "w-4 h-4 text-[var(--foreground-muted)] transition-transform",
                  collapsed ? "" : "rotate-180"
                )}
              />
            </button>
          </div>
        </div>

        {/* Main nav */}
        <nav className="p-3 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-[var(--accent-bg)] text-[var(--accent-dark)]"
                    : "text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Modules */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-2 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider"
                >
                  Modules
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {modules.map((module) => {
                const isActive = pathname === `/dashboard/modules/${module.id}`;
                return (
                  <Link
                    key={module.id}
                    href={`/dashboard/modules/${module.id}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                      isActive
                        ? "bg-[var(--accent-bg)] text-[var(--accent-dark)]"
                        : "text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors",
                        isActive ? "" : "group-hover:opacity-80"
                      )}
                      style={{ backgroundColor: module.color + "20" }}
                    >
                      <ModuleIcon
                        moduleId={module.id}
                        className="w-3.5 h-3.5"
                        style={{ color: module.color }}
                      />
                    </div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 min-w-0"
                        >
                          <span className="text-sm font-medium truncate block">
                            {module.title.split(" ").slice(0, 2).join(" ")}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!collapsed && module.quickWinsCount > 0 && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent-dark)]">
                        {module.quickWinsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Copilot button */}
        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={onCopilotOpen}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-white hover:opacity-90 transition-opacity",
              collapsed && "justify-center"
            )}
          >
            <Icon name="sparkles" className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  AI Copilot
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* User section */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2",
            collapsed && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              JD
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">Jane Doe</p>
                  <p className="text-xs text-[var(--foreground-muted)] truncate">Climate Officer</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </aside>
  );
}
