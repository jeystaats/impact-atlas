"use client";

import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
          Settings
        </h1>
        <p className="text-[var(--foreground-secondary)] mt-1">
          Manage your account and preferences
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl"
      >
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-none w-full",
              card: "bg-[var(--background-tertiary)] border border-[var(--border)] shadow-none w-full",
              navbar: "bg-[var(--background-secondary)] border-r border-[var(--border)]",
              navbarButton: "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]",
              navbarButtonActive: "text-[var(--accent)] bg-[var(--accent-bg)]",
              pageScrollBox: "bg-[var(--background-tertiary)]",
              page: "bg-[var(--background-tertiary)]",
              profilePage: "bg-[var(--background-tertiary)]",
              profileSection: "border-b border-[var(--border)]",
              profileSectionTitle: "text-[var(--foreground)] border-b border-[var(--border)]",
              profileSectionTitleText: "text-[var(--foreground)]",
              profileSectionContent: "bg-[var(--background-tertiary)]",
              profileSectionPrimaryButton: "bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white",
              formButtonPrimary: "bg-gradient-to-r from-teal-500 to-cyan-400 hover:opacity-90",
              formFieldLabel: "text-[var(--foreground-secondary)]",
              formFieldInput: "bg-[var(--background-secondary)] border-[var(--border)] text-[var(--foreground)]",
              formFieldInputShowPasswordButton: "text-[var(--foreground-muted)]",
              headerTitle: "text-[var(--foreground)]",
              headerSubtitle: "text-[var(--foreground-secondary)]",
              accordionTriggerButton: "text-[var(--foreground)] hover:bg-[var(--background-secondary)]",
              accordionContent: "bg-[var(--background-secondary)]",
              badge: "bg-[var(--accent-bg)] text-[var(--accent)]",
              menuButton: "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]",
              menuList: "bg-[var(--background-tertiary)] border border-[var(--border)]",
              menuItem: "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]",
            },
          }}
        />
      </motion.div>
    </div>
  );
}
