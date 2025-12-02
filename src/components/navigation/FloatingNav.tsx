"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { name: "About", href: "/about" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Team", href: "/team" },
  { name: "Impact", href: "/impact" },
];

export default function FloatingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      // Change style after scrolling past hero
      setIsScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:px-6 md:pt-5"
      >
        <div
          className={`
            mx-auto max-w-5xl rounded-full px-4 py-2.5 md:px-6 md:py-3
            transition-all duration-500 ease-out
            ${isScrolled
              ? "bg-[rgba(9,9,11,0.85)] backdrop-blur-xl border border-[rgba(250,250,250,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              : "bg-[rgba(9,9,11,0.4)] backdrop-blur-md border border-[rgba(250,250,250,0.05)]"
            }
          `}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
            >
              {/* Logo Icon - Radar style */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                {/* Outer ring */}
                <div
                  className="absolute inset-0 rounded-full border border-[rgba(45,212,191,0.3)] group-hover:border-[rgba(45,212,191,0.5)] transition-colors duration-300"
                />
                {/* Inner ring */}
                <div
                  className="absolute inset-1.5 rounded-full border border-[rgba(45,212,191,0.2)] group-hover:border-[rgba(45,212,191,0.4)] transition-colors duration-300"
                />
                {/* Center dot with glow */}
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#2dd4bf]"
                  animate={{
                    boxShadow: [
                      "0 0 8px rgba(45,212,191,0.4)",
                      "0 0 16px rgba(45,212,191,0.6)",
                      "0 0 8px rgba(45,212,191,0.4)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* Logo Text */}
              <span className="text-[15px] font-semibold tracking-tight text-[#fafafa] hidden sm:block">
                Impact Atlas
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-[14px] font-medium text-[rgba(250,250,250,0.6)] hover:text-[#fafafa] transition-colors duration-200 group"
                >
                  {link.name}
                  {/* Hover underline */}
                  <span
                    className="absolute bottom-1 left-4 right-4 h-px bg-gradient-to-r from-[#2dd4bf] to-[#5eead4] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  />
                </Link>
              ))}
            </div>

            {/* Right Side: CTA + Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Desktop CTA */}
              <Link
                href="/dashboard"
                className={`
                  hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full
                  text-[14px] font-medium transition-all duration-300
                  ${isScrolled
                    ? "bg-[#fafafa] text-[#09090b] hover:bg-[#e4e4e7]"
                    : "bg-[rgba(250,250,250,0.1)] text-[#fafafa] hover:bg-[rgba(250,250,250,0.15)] border border-[rgba(250,250,250,0.1)]"
                  }
                `}
              >
                View Demo
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-[rgba(250,250,250,0.7)] hover:text-[#fafafa] transition-colors"
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={isMobileMenuOpen ? "open" : "closed"}
                  className="w-5 h-5 flex flex-col justify-center items-center gap-1.5"
                >
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 5 }
                    }}
                    className="w-5 h-0.5 bg-current block origin-center transition-all"
                  />
                  <motion.span
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 }
                    }}
                    className="w-5 h-0.5 bg-current block"
                  />
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -5 }
                    }}
                    className="w-5 h-0.5 bg-current block origin-center transition-all"
                  />
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[rgba(9,9,11,0.8)] backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden"
            >
              <div
                className="rounded-2xl p-6 bg-[rgba(24,24,27,0.95)] backdrop-blur-xl border border-[rgba(250,250,250,0.1)] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              >
                <div className="flex flex-col gap-2">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-[16px] font-medium text-[rgba(250,250,250,0.8)] hover:text-[#fafafa] hover:bg-[rgba(250,250,250,0.05)] transition-all duration-200"
                      >
                        {link.name}
                        <svg
                          className="w-4 h-4 text-[rgba(250,250,250,0.3)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 pt-4 border-t border-[rgba(250,250,250,0.1)]"
                >
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[#fafafa] text-[#09090b] text-[15px] font-semibold hover:bg-[#e4e4e7] transition-colors"
                  >
                    View Demo
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
