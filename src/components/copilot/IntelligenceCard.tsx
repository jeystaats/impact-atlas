"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Icon, IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type CardType = "insight" | "recommendation" | "warning" | "success" | "general";

// Extract action buttons from content
function extractActions(content: string): { cleanContent: string; actions: Array<{ label: string; type: "module" | "map" | "external"; href: string }> } {
  const actions: Array<{ label: string; type: "module" | "map" | "external"; href: string }> = [];

  // Match patterns like "View this area in the Urban Heat module →" or "Explore tree planting sites →"
  const actionPatterns = [
    { regex: /View.*(?:Urban Heat|Heat).*module\s*→/gi, module: "urban-heat", label: "View in Urban Heat Module" },
    { regex: /(?:Explore|Check).*(?:tree|planting).*→/gi, module: "urban-heat", label: "Explore Tree Planting Sites" },
    { regex: /(?:Check|View).*(?:plastic|accumulation|coast).*→/gi, module: "coastal-plastic", label: "View Plastic Forecast" },
    { regex: /(?:View|Check).*(?:emissions?|port).*→/gi, module: "port-emissions", label: "View Port Emissions" },
    { regex: /(?:Explore|View).*(?:biodiversity|wildlife).*→/gi, module: "biodiversity", label: "Explore Biodiversity Data" },
    { regex: /(?:Find|View).*(?:restoration|land).*→/gi, module: "restoration", label: "Find Restoration Sites" },
  ];

  let cleanContent = content;

  actionPatterns.forEach(({ regex, module, label }) => {
    if (regex.test(content)) {
      actions.push({
        label,
        type: "module",
        href: `/dashboard/modules/${module}`,
      });
      cleanContent = cleanContent.replace(regex, "");
    }
  });

  // Extract location names for Google Maps links
  const locationPatterns = [
    /(?:in|near|along|at)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+(?:district|neighborhood|area|street|park|waterfront|quarter))/gi,
    /([A-Z][a-zA-Z]+(?:straat|plein|gracht|weg|laan|park))/g, // Dutch street names
  ];

  const locations = new Set<string>();
  locationPatterns.forEach((pattern) => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 3) {
        locations.add(match[1].trim());
      }
    }
  });

  // Add first 2 locations as map links
  Array.from(locations).slice(0, 2).forEach((location) => {
    actions.push({
      label: `View ${location} on Map`,
      type: "map",
      href: `https://www.google.com/maps/search/${encodeURIComponent(location)}`,
    });
  });

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
}: IntelligenceCardProps) {
  const config = cardConfig[type];
  const { cleanContent, actions } = extractActions(content);

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
            {actions.map((action, i) => (
              action.type === "map" ? (
                <a
                  key={i}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-dark)] transition-colors"
                >
                  <Icon name="mapPin" className="w-3.5 h-3.5" />
                  {action.label}
                  <Icon name="arrowUpRight" className="w-3 h-3 opacity-50" />
                </a>
              ) : (
                <Link
                  key={i}
                  href={action.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] transition-colors"
                >
                  <Icon name="target" className="w-3.5 h-3.5" />
                  {action.label}
                  <Icon name="arrowRight" className="w-3 h-3" />
                </Link>
              )
            ))}
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
