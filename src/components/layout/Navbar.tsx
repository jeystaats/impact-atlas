"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";

const navItems = [
  { label: "Modules", href: "#modules" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mt-4 py-3 px-4 rounded-2xl glass-strong shadow-lg">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center">
                <Icon name="globe" className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-[var(--foreground)]">
                Impact Atlas
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--background-secondary)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard">
                  Get Started
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
            >
              <Icon name={mobileMenuOpen ? "x" : "menu"} className="w-5 h-5 text-[var(--foreground)]" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 p-4 rounded-2xl glass-strong shadow-lg"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-4 py-3 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--background-secondary)]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t border-[var(--border)] flex flex-col gap-2">
                  <Button variant="ghost" className="justify-center">
                    Sign In
                  </Button>
                  <Button className="justify-center" asChild>
                    <Link href="/dashboard">
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
