"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type CardType = "insight" | "recommendation" | "warning" | "success" | "general";

type ActionType = "module" | "map" | "page" | "quickwin" | "plan";

interface ExtractedAction {
  label: string;
  type: ActionType;
  href: string;
  icon: IconName;
}

// Extract action buttons from content
function extractActions(content: string): { cleanContent: string; actions: ExtractedAction[] } {
  const actions: ExtractedAction[] = [];
  let cleanContent = content;

  // Module-specific patterns
  const modulePatterns = [
    { regex: /(?:View|Check|Explore).*(?:Urban Heat|heat island|tree equity).*→?/gi, module: "urban-heat", label: "Urban Heat Module", icon: "thermometer" as IconName },
    { regex: /(?:View|Check|Explore).*(?:tree|planting|canopy).*→?/gi, module: "urban-heat", label: "Tree Planting Sites", icon: "leaf" as IconName },
    { regex: /(?:Check|View|Explore).*(?:plastic|accumulation|coast|beach).*→?/gi, module: "coastal-plastic", label: "Coastal Plastic Module", icon: "waves" as IconName },
    { regex: /(?:View|Check|Monitor).*(?:emissions?|port|vessel|ship|maritime).*→?/gi, module: "port-emissions", label: "Port Emissions Module", icon: "anchor" as IconName },
    { regex: /(?:Explore|View|Check).*(?:biodiversity|wildlife|species|habitat).*→?/gi, module: "biodiversity", label: "Biodiversity Module", icon: "bug" as IconName },
    { regex: /(?:Find|View|Explore).*(?:restoration|degraded|land).*→?/gi, module: "restoration", label: "Restoration Finder", icon: "refresh" as IconName },
    { regex: /(?:Track|View|Check).*(?:ocean plastic|marine debris|drift).*→?/gi, module: "ocean-plastic", label: "Ocean Plastic Tracker", icon: "globe" as IconName },
  ];

  modulePatterns.forEach(({ regex, module, label, icon }) => {
    if (regex.test(content)) {
      // Only add if not already added
      if (!actions.find(a => a.href === `/dashboard/modules/${module}`)) {
        actions.push({
          label,
          type: "module",
          href: `/dashboard/modules/${module}`,
          icon,
        });
      }
      cleanContent = cleanContent.replace(regex, "");
    }
  });

  // Page navigation patterns
  const pagePatterns = [
    { regex: /(?:see|view|check).*(?:all|your)?\s*quick wins?.*→?/gi, href: "/dashboard/quick-wins", label: "View All Quick Wins", icon: "zap" as IconName },
    { regex: /(?:create|make|start).*(?:action)?\s*plan.*→?/gi, href: "/dashboard/plans", label: "Create Action Plan", icon: "clipboard" as IconName },
    { regex: /(?:view|see|check).*dashboard.*→?/gi, href: "/dashboard", label: "Go to Dashboard", icon: "dashboard" as IconName },
    { regex: /(?:compare|benchmark).*cities.*→?/gi, href: "/dashboard", label: "Compare Cities", icon: "chart" as IconName },
  ];

  pagePatterns.forEach(({ regex, href, label, icon }) => {
    if (regex.test(content)) {
      if (!actions.find(a => a.href === href)) {
        actions.push({ label, type: "page", href, icon });
      }
      cleanContent = cleanContent.replace(regex, "");
    }
  });

  // Extract location names for Google Maps links
  const locationPatterns = [
    /(?:in|near|along|at)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+(?:district|neighborhood|area|street|park|waterfront|quarter|centrum|oost|west|noord|zuid))/gi,
    /([A-Z][a-zA-Z]+(?:straat|plein|gracht|weg|laan|park|kade|haven))/g, // Dutch street names
  ];

  const locations = new Set<string>();
  locationPatterns.forEach((pattern) => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 3 && match[1].length < 30) {
        locations.add(match[1].trim());
      }
    }
  });

  // Add first 2 locations as map links
  Array.from(locations).slice(0, 2).forEach((location) => {
    actions.push({
      label: `${location}`,
      type: "map",
      href: `https://www.google.com/maps/search/${encodeURIComponent(location)}`,
      icon: "mapPin",
    });
  });

  // Detect if this is a "quick win" type response - add save action
  const isQuickWin = /quick win|recommendation|suggest|should|priority|action item/i.test(content);
  if (isQuickWin && actions.length < 4) {
    actions.push({
      label: "Save as Quick Win",
      type: "quickwin",
      href: "#save-quickwin",
      icon: "plus",
    });
  }

  return { cleanContent: cleanContent.trim(), actions };
}

interface IntelligenceCardProps {
  type: CardType;
  content: string;
  confidence?: number;
  sources?: string[];
  impact?: "low" | "medium" | "high";
  effort?: "low" | "medium" | "high";
  isStreaming?: boolean;
  onClose?: () => void;
  onSaveQuickWin?: (content: string) => Promise<void>;
}

const cardConfig: Record<CardType, { icon: IconName; gradient: string; border: string }> = {
  insight: {
    icon: "info",
    gradient: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-200",
  },
  recommendation: {
    icon: "zap",
    gradient: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-200",
  },
  warning: {
    icon: "warning",
    gradient: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-200",
  },
  success: {
    icon: "success",
    gradient: "from-green-500/10 to-emerald-500/10",
    border: "border-green-200",
  },
  general: {
    icon: "sparkles",
    gradient: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-200",
  },
};

const iconColors: Record<CardType, string> = {
  insight: "text-blue-600",
  recommendation: "text-emerald-600",
  warning: "text-amber-600",
  success: "text-green-600",
  general: "text-violet-600",
};

export function IntelligenceCard({
  type,
  content,
  confidence,
  sources,
  impact,
  effort,
  isStreaming,
  onClose,
  onSaveQuickWin,
}: IntelligenceCardProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const config = cardConfig[type];
  const { cleanContent, actions } = extractActions(content);

  // Handle navigation with close
  const handleNavigation = (href: string) => {
    if (onClose) {
      onClose();
    }
    router.push(href);
  };

  // Handle save as quick win
  const handleSaveQuickWin = async () => {
    if (!onSaveQuickWin || isSaving || saved) return;
    setIsSaving(true);
    try {
      await onSaveQuickWin(content);
      setSaved(true);
    } catch (error) {
      console.error("Failed to save quick win:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative rounded-xl border overflow-hidden",
        config.border,
        "bg-gradient-to-br",
        config.gradient
      )}
    >
      {/* Animated border glow for streaming */}
      {isStreaming && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(90deg, transparent, var(--accent-light), transparent)`,
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["200% 0", "-200% 0"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            type === "insight" && "bg-blue-100",
            type === "recommendation" && "bg-emerald-100",
            type === "warning" && "bg-amber-100",
            type === "success" && "bg-green-100",
            type === "general" && "bg-violet-100"
          )}>
            <Icon name={config.icon} className={cn("w-4 h-4", iconColors[type])} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-medium uppercase tracking-wider",
                iconColors[type]
              )}>
                {type === "general" ? "AI Response" : type}
              </span>
              {confidence && (
                <span className="text-xs text-[var(--foreground-muted)] tabular-nums">
                  {confidence}% confidence
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content with Markdown rendering - ChatGPT-like styling */}
        <div className="ai-markdown text-sm text-[var(--foreground)] leading-relaxed">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h2 className="text-base font-semibold mt-4 mb-2 first:mt-0">{children}</h2>,
              h2: ({ children }) => <h3 className="text-sm font-semibold mt-4 mb-2 first:mt-0">{children}</h3>,
              h3: ({ children }) => <h4 className="text-sm font-medium mt-3 mb-1.5 first:mt-0">{children}</h4>,
              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="mb-4 last:mb-0 space-y-2 ml-1">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 last:mb-0 space-y-2 ml-1 list-decimal list-inside">{children}</ol>,
              li: ({ children }) => (
                <li className="flex gap-2 leading-relaxed">
                  <span className="text-[var(--accent)] mt-1.5 flex-shrink-0">•</span>
                  <span>{children}</span>
                </li>
              ),
              strong: ({ children }) => <strong className="font-semibold text-[var(--foreground)]">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              a: ({ href, children }) => (
                <a href={href} className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 bg-[var(--background-secondary)] text-[var(--accent-dark)] text-xs rounded font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="my-3 p-3 bg-[var(--background-secondary)] rounded-lg overflow-x-auto text-xs">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-[var(--accent)] pl-3 my-3 italic text-[var(--foreground-secondary)]">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-4 border-[var(--border)]" />,
            }}
          >
            {cleanContent}
          </ReactMarkdown>
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-[var(--accent)] ml-0.5 align-middle"
            />
          )}
        </div>

        {/* Action Buttons */}
        {actions.length > 0 && !isStreaming && (
          <div className="mt-4 pt-3 border-t border-[var(--border)]/50 flex flex-wrap gap-2">
            {actions.map((action, i) => {
              // External map links
              if (action.type === "map") {
                return (
                  <a
                    key={i}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-dark)] transition-colors"
                  >
                    <Icon name={action.icon} className="w-3.5 h-3.5" />
                    {action.label}
                    <Icon name="arrowUpRight" className="w-3 h-3 opacity-50" />
                  </a>
                );
              }

              // Quick win save action (internal action, not navigation)
              if (action.type === "quickwin") {
                return (
                  <button
                    key={i}
                    onClick={handleSaveQuickWin}
                    disabled={isSaving || saved || !onSaveQuickWin}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                      saved
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                        : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200",
                      (isSaving || !onSaveQuickWin) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isSaving ? (
                      <Icon name="loader" className="w-3.5 h-3.5 animate-spin" />
                    ) : saved ? (
                      <Icon name="check" className="w-3.5 h-3.5" />
                    ) : (
                      <Icon name={action.icon} className="w-3.5 h-3.5" />
                    )}
                    {saved ? "Saved!" : isSaving ? "Saving..." : action.label}
                  </button>
                );
              }

              // Module and page navigation links - use button with router for close behavior
              return (
                <button
                  key={i}
                  onClick={() => handleNavigation(action.href)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    action.type === "module"
                      ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]"
                      : "bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-dark)]"
                  )}
                >
                  <Icon name={action.icon} className="w-3.5 h-3.5" />
                  {action.label}
                  <Icon name="arrowRight" className="w-3 h-3 opacity-50" />
                </button>
              );
            })}
          </div>
        )}

        {/* Metadata */}
        {(impact || effort || sources) && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-2">
            {impact && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                impact === "high" && "bg-emerald-100 text-emerald-700",
                impact === "medium" && "bg-amber-100 text-amber-700",
                impact === "low" && "bg-gray-100 text-gray-700"
              )}>
                {impact} impact
              </span>
            )}
            {effort && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {effort} effort
              </span>
            )}
            {sources && sources.length > 0 && (
              <div className="flex gap-1 items-center">
                <Icon name="globe" className="w-3 h-3 text-[var(--foreground-muted)]" />
                <span className="text-xs text-[var(--foreground-muted)]">
                  {sources.join(", ")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
