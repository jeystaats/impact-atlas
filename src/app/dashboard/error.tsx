"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, LayoutDashboard, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden">
          {/* Danger accent bar */}
          <div className="h-1 bg-[var(--danger,#ef4444)]" />

          <CardContent className="p-8">
            <div className="text-center">
              {/* Error Icon */}
              <motion.div
                variants={itemVariants}
                className="mb-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--danger-light,#fef2f2)]"
                >
                  <AlertTriangle className="w-7 h-7 text-[var(--danger,#ef4444)]" />
                </motion.div>
              </motion.div>

              {/* Error Message */}
              <motion.h2
                variants={itemVariants}
                className="text-xl font-semibold mb-2 text-[var(--foreground,#111827)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Dashboard Error
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-[var(--foreground-secondary,#4b5563)] mb-6"
              >
                We couldn&apos;t load this section of your dashboard. This might be a temporary issue.
              </motion.p>

              {/* Troubleshooting tips */}
              <motion.div
                variants={itemVariants}
                className="mb-6 p-4 rounded-lg bg-[var(--background-secondary,#f3f4f6)] text-left"
              >
                <p className="text-sm font-medium text-[var(--foreground,#111827)] mb-2">
                  Quick troubleshooting:
                </p>
                <ul className="text-sm text-[var(--foreground-secondary,#4b5563)] space-y-1">
                  <li className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5" />
                    Check your internet connection
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try refreshing the page
                  </li>
                </ul>
              </motion.div>

              {/* Error Digest (Development) */}
              {error.digest && process.env.NODE_ENV === "development" && (
                <motion.div
                  variants={itemVariants}
                  className="mb-6 p-3 rounded-lg bg-[var(--background,#fafbfc)] border border-[var(--border,#e5e7eb)] text-left"
                >
                  <p className="text-xs font-mono text-[var(--foreground-muted,#9ca3af)]">
                    Error ID: {error.digest}
                  </p>
                  <p className="text-xs font-mono text-[var(--danger,#ef4444)] mt-1 break-all">
                    {error.message}
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <Button onClick={reset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard Home
                  </Link>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Help text */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-center text-sm text-[var(--foreground-muted,#9ca3af)]"
        >
          Need help?{" "}
          <a
            href="mailto:support@impactatlas.ai"
            className="text-[var(--accent,#0d9488)] hover:underline"
          >
            Contact support
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
