"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background,#fafbfc)]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full text-center"
      >
        {/* Error Icon */}
        <motion.div
          variants={itemVariants}
          className="mb-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--danger-light,#fef2f2)]"
          >
            <AlertTriangle className="w-8 h-8 text-[var(--danger,#ef4444)]" />
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.h1
          variants={itemVariants}
          className="text-2xl font-semibold mb-3 text-[var(--foreground,#111827)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Something went wrong
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-[var(--foreground-secondary,#4b5563)] mb-6"
        >
          We encountered an unexpected error. Don&apos;t worry, your data is safe.
        </motion.p>

        {/* Error Digest (Development) */}
        {error.digest && process.env.NODE_ENV === "development" && (
          <motion.div
            variants={itemVariants}
            className="mb-6 p-3 rounded-lg bg-[var(--background-secondary,#f3f4f6)] text-left"
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
          <Button
            onClick={reset}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go home
            </Link>
          </Button>
        </motion.div>

        {/* Help text */}
        <motion.p
          variants={itemVariants}
          className="mt-8 text-sm text-[var(--foreground-muted,#9ca3af)]"
        >
          If this problem persists, please{" "}
          <a
            href="mailto:support@impactatlas.ai"
            className="text-[var(--accent,#0d9488)] hover:underline"
          >
            contact support
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
