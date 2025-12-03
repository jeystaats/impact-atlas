"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";
import { Icon } from "@/components/ui/icons";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export function DeleteAccountModal({ isOpen, onClose, userEmail }: DeleteAccountModalProps) {
  const { signOut } = useClerk();
  const [step, setStep] = useState<"warning" | "confirm">("warning");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const expectedConfirmText = "DELETE MY ACCOUNT";

  const handleClose = () => {
    setStep("warning");
    setConfirmText("");
    onClose();
  };

  const handleProceed = () => {
    setStep("confirm");
  };

  const handleDelete = async () => {
    if (confirmText !== expectedConfirmText) {
      toast.error("Please type the confirmation text exactly");
      return;
    }

    setIsDeleting(true);
    try {
      // In production, this would:
      // 1. Call your API to delete user data from Convex
      // 2. Delete the Clerk user account

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Account scheduled for deletion", {
        description: "You will be signed out now. Your data will be permanently deleted within 24 hours.",
        duration: 5000,
      });

      // Sign out after deletion
      await signOut();
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account", {
        description: "Please try again or contact support.",
      });
      setIsDeleting(false);
    }
  };

  const dataToBeDeleted = [
    "All action plans and progress",
    "Quick win completion history",
    "Custom alerts and notifications",
    "Saved preferences and settings",
    "Account information",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-md z-50 flex flex-col rounded-2xl bg-[var(--background-secondary)] border border-red-500/30 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Delete Account</h2>
                  <p className="text-xs text-red-400">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {step === "warning" ? (
                  <motion.div
                    key="warning"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <p className="text-[var(--foreground-secondary)]">
                      Are you sure you want to permanently delete your account? This will immediately and irreversibly delete:
                    </p>

                    <ul className="space-y-2">
                      {dataToBeDeleted.map((item, index) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-400">Export your data first</p>
                          <p className="text-xs text-[var(--foreground-muted)] mt-1">
                            Consider exporting your action plans and data before deleting your account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <p className="text-sm text-red-400 font-medium mb-2">
                        Final confirmation required
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        This will permanently delete the account associated with:
                      </p>
                      <p className="text-sm font-medium text-[var(--foreground)] mt-1">
                        {userEmail || "your email address"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                        Type <span className="font-mono text-red-400">{expectedConfirmText}</span> to confirm:
                      </label>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={expectedConfirmText}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                      />
                    </div>

                    {confirmText.length > 0 && confirmText !== expectedConfirmText && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-400"
                      >
                        Text doesn't match. Please type exactly: {expectedConfirmText}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--background-tertiary)]">
              {step === "warning" ? (
                <>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProceed}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    I understand, continue
                  </motion.button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setStep("warning")}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    Go Back
                  </button>
                  <motion.button
                    whileHover={confirmText === expectedConfirmText ? { scale: 1.02 } : {}}
                    whileTap={confirmText === expectedConfirmText ? { scale: 0.98 } : {}}
                    onClick={handleDelete}
                    disabled={confirmText !== expectedConfirmText || isDeleting}
                    className="px-5 py-2 rounded-xl text-sm font-medium bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {isDeleting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Icon name="loader" className="w-4 h-4" />
                        </motion.div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Account Forever
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
