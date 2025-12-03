"use client";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";

/**
 * Provider component that enables keyboard shortcuts throughout the app
 * Add this to your root layout to enable navigation shortcuts
 */
export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Activate keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <>
      {children}
      <KeyboardShortcutsModal />
    </>
  );
}
