"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Icon, ModuleIcon, IconName } from "@/components/ui/icons";
import { getModulesForCity } from "@/data/modules";
import { useModulesForCity, useCurrentUser } from "@/hooks/useConvex";
import { useSelectedCity } from "@/hooks/useSelectedCity";
import { useUIStore } from "@/stores/useUIStore";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface SidebarProps {
  onCopilotOpen: () => void;
}

// Normalized module type for sidebar display
interface SidebarModule {
  id: string;
  title: string;
  color: string;
  quickWinsCount: number;
}

const mainNavItems: { icon: IconName; label: string; href: string }[] = [
  { icon: "home", label: "Overview", href: "/dashboard" },
  { icon: "zap", label: "Quick Wins", href: "/dashboard/quick-wins" },
  { icon: "target", label: "Action Plans", href: "/dashboard/plans" },
  { icon: "settings", label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar({ onCopilotOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  // UI state from store
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use store value after hydration, default to false before
  const collapsed = isHydrated ? sidebarCollapsed : false;

  // Fetch data from Convex
  const { selectedCityId, selectedCitySlug } = useSelectedCity();
  const modulesData = useModulesForCity(selectedCityId);
  const convexUser = useCurrentUser();

  // Normalize modules to sidebar format (with city-specific fallback)
  const modules: SidebarModule[] = useMemo(() => {
    if (modulesData && modulesData.length > 0) {
      return modulesData.map((m: { slug: string; name: string; color: string; cityStats?: { totalQuickWins?: number } }) => ({
        id: m.slug,
        title: m.name,
        color: m.color,
        quickWinsCount: m.cityStats?.totalQuickWins ?? 0,
      }));
    }
    // Use city-specific fallback data
    return getModulesForCity(selectedCitySlug).map((m) => ({
      id: m.id,
      title: m.title,
      color: m.color,
      quickWinsCount: m.quickWinsCount,
    }));
  }, [modulesData, selectedCitySlug]);

  // User display info - prefer Convex user data, then Clerk
  // Use isHydrated to prevent SSR mismatch
  const userInitials = useMemo(() => {
    if (!isHydrated) return "U"; // Default during SSR
    if (convexUser?.name) {
      const parts = convexUser.name.split(" ");
      return parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`
        : parts[0][0] || "U";
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U";
  }, [convexUser, user, isHydrated]);

  const userName = isHydrated ? (convexUser?.name || user?.fullName || user?.firstName || "User") : "User";
  const userRole = isHydrated && convexUser?.role === "admin" ? "Administrator" : "Climate Officer";

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
            <div className="flex items-center gap-1">
              {!collapsed && <NotificationCenter />}
              <button
                onClick={toggleSidebar}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="p-1.5 rounded-lg hover:bg-[var(--background-secondary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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
            collapsed && "flex-col gap-2"
          )}>
            <Link
              href="/dashboard/settings"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 hover:opacity-90 transition-opacity"
              title={collapsed ? userName : undefined}
            >
              {userInitials}
            </Link>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{userName}</p>
                  <p className="text-xs text-[var(--foreground-muted)] truncate">{userRole}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {isHydrated && user && !collapsed && (
              <Link
                href="/sign-out"
                className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
                title="Sign out"
              >
                <Icon name="logOut" className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
