"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import AuthBackground from "@/components/auth/AuthBackground";

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(true);
  const [isSignedOut, setIsSignedOut] = useState(false);

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut();
        setIsSigningOut(false);
        setIsSignedOut(true);
      } catch (error) {
        console.error("Sign out error:", error);
        setIsSigningOut(false);
      }
    };

    performSignOut();
  }, [signOut]);

  return (
    <div className="min-h-screen flex landing-dark">
      {/* Left Panel - Animated Background */}
      <div className="hidden lg:block lg:w-[60%] relative">
        <AuthBackground />

        {/* Logo */}
        <Link
          href="/"
          className="absolute top-8 left-8 z-20 inline-flex items-center gap-3 group"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-10 h-10 rounded-xl flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, var(--ld-teal) 0%, var(--ld-teal-light) 100%)",
              boxShadow: "0 4px 20px var(--ld-teal-glow)",
            }}
          >
            <Icon name="globe" className="w-5 h-5 text-white" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl font-semibold"
            style={{ color: "var(--ld-white)" }}
          >
            Impact Atlas
          </motion.span>
        </Link>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-8 left-8 right-8 z-20"
        >
          <p
            className="text-lg font-medium mb-2"
            style={{ color: "var(--ld-white-90)" }}
          >
            Climate Intelligence Platform
          </p>
          <p style={{ color: "var(--ld-white-50)" }}>
            Revealing the quickest wins cities are blind to.
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Sign Out Status */}
      <div
        className="w-full lg:w-[40%] flex flex-col min-h-screen relative"
        style={{ background: "var(--ld-navy-dark)" }}
      >
        {/* Mobile Logo */}
        <header className="lg:hidden p-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--ld-teal) 0%, var(--ld-teal-light) 100%)",
              }}
            >
              <Icon name="globe" className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-lg font-semibold"
              style={{ color: "var(--ld-white)" }}
            >
              Impact Atlas
            </span>
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
          <motion.div
            className="w-full max-w-md text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isSigningOut ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-6"
                >
                  <Icon
                    name="loader"
                    className="w-16 h-16"
                    style={{ color: "var(--ld-teal)" }}
                  />
                </motion.div>
                <h1
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--ld-white)" }}
                >
                  Signing you out...
                </h1>
                <p style={{ color: "var(--ld-white-50)" }}>
                  Please wait while we securely sign you out.
                </p>
              </>
            ) : isSignedOut ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ background: "var(--ld-teal-glow)" }}
                >
                  <Icon
                    name="check"
                    className="w-8 h-8"
                    style={{ color: "var(--ld-teal)" }}
                  />
                </motion.div>
                <h1
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--ld-white)" }}
                >
                  You&apos;ve been signed out
                </h1>
                <p className="mb-8" style={{ color: "var(--ld-white-50)" }}>
                  Thank you for using Impact Atlas. Come back soon to continue making an impact!
                </p>

                <div className="space-y-4">
                  <Link
                    href="/sign-in"
                    className="block w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, var(--ld-teal) 0%, var(--ld-teal-light) 100%)",
                    }}
                  >
                    Sign in again
                  </Link>
                  <Link
                    href="/"
                    className="block w-full py-3 px-4 rounded-lg font-medium transition-all duration-200"
                    style={{
                      color: "var(--ld-white-70)",
                      background: "var(--ld-white-5)",
                      border: "1px solid var(--ld-white-10)",
                    }}
                  >
                    Go to homepage
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(239, 68, 68, 0.2)" }}
                >
                  <Icon
                    name="warning"
                    className="w-8 h-8"
                    style={{ color: "#EF4444" }}
                  />
                </div>
                <h1
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--ld-white)" }}
                >
                  Something went wrong
                </h1>
                <p className="mb-8" style={{ color: "var(--ld-white-50)" }}>
                  We couldn&apos;t sign you out. Please try again.
                </p>
                <button
                  onClick={() => {
                    setIsSigningOut(true);
                    signOut().then(() => {
                      setIsSigningOut(false);
                      setIsSignedOut(true);
                    });
                  }}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, var(--ld-teal) 0%, var(--ld-teal-light) 100%)",
                  }}
                >
                  Try again
                </button>
              </>
            )}
          </motion.div>
        </main>

        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-[300px] h-[300px] opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--ld-teal-glow) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>
    </div>
  );
}
