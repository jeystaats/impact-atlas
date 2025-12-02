"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import AuthBackground from "@/components/auth/AuthBackground";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const features = [
  {
    icon: "target",
    title: "Quick Wins Detection",
    description: "AI identifies high-impact opportunities",
  },
  {
    icon: "globe",
    title: "City-Wide Coverage",
    description: "450+ cities already connected",
  },
  {
    icon: "zap",
    title: "Real-Time Insights",
    description: "Live data from multiple sources",
  },
];

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex landing-dark">
      {/* Left Panel - Animated Background */}
      <div className="hidden lg:block lg:w-[60%] relative">
        <AuthBackground />

        {/* Logo - positioned over background */}
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
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ border: "2px solid var(--ld-teal-light)" }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
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

        {/* Feature Cards */}
        <div className="absolute bottom-8 left-8 right-8 z-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg font-medium mb-6"
            style={{ color: "var(--ld-white-90)" }}
          >
            Join cities making a difference
          </motion.p>

          <div className="flex gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="flex-1 p-4 rounded-xl"
                style={{
                  background: "rgba(15, 33, 54, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid var(--ld-white-10)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: "var(--ld-white-5)",
                    border: "1px solid var(--ld-white-10)",
                  }}
                >
                  <Icon
                    name={feature.icon as "target" | "globe" | "zap"}
                    className="w-4 h-4"
                    style={{ color: "var(--ld-teal)" }}
                  />
                </div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: "var(--ld-white-90)" }}
                >
                  {feature.title}
                </p>
                <p className="text-xs" style={{ color: "var(--ld-white-50)" }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div
        className="w-full lg:w-[40%] flex flex-col min-h-screen relative overflow-y-auto"
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

        {/* Form Container */}
        <main className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
          <motion.div
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{
                  background: "var(--ld-white-5)",
                  border: "1px solid var(--ld-white-10)",
                }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--ld-teal)" }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--ld-teal)" }}
                >
                  Get Started
                </span>
              </motion.div>

              <h1
                className="text-3xl font-bold mb-3"
                style={{ color: "var(--ld-white)" }}
              >
                Create your{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, var(--ld-teal-light) 0%, var(--ld-teal) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  account
                </span>
              </h1>
              <p style={{ color: "var(--ld-white-50)" }}>
                Start discovering climate wins for your city today
              </p>
            </motion.div>

            {/* Clerk SignUp Component */}
            <motion.div variants={itemVariants} className="auth-form-container">
              <SignUp
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    cardBox: "w-full shadow-none bg-transparent",
                    card: "bg-transparent shadow-none p-0",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: `
                      bg-[var(--ld-white-5)]
                      border border-[var(--ld-white-10)]
                      text-[var(--ld-white-90)]
                      hover:bg-[var(--ld-white-10)]
                      hover:border-[var(--ld-white-30)]
                      transition-all duration-200
                    `,
                    socialButtonsBlockButtonText: "text-[var(--ld-white-70)] font-medium",
                    dividerLine: "bg-[var(--ld-white-10)]",
                    dividerText: "text-[var(--ld-white-30)]",
                    formFieldLabel: "text-[var(--ld-white-70)] text-sm font-medium",
                    formFieldInput: `
                      bg-[var(--ld-white-5)]
                      border-[var(--ld-white-10)]
                      text-[var(--ld-white)]
                      placeholder:text-[var(--ld-white-30)]
                      focus:border-[var(--ld-teal)]
                      focus:ring-1
                      focus:ring-[var(--ld-teal)]
                      transition-all duration-200
                    `,
                    formButtonPrimary: `
                      bg-gradient-to-r from-[var(--ld-teal)] to-[var(--ld-teal-light)]
                      hover:shadow-[0_4px_20px_var(--ld-teal-glow)]
                      transition-all duration-200
                      font-semibold
                    `,
                    footerActionLink: "text-[var(--ld-teal)] hover:text-[var(--ld-teal-light)]",
                    identityPreviewText: "text-[var(--ld-white-70)]",
                    identityPreviewEditButton: "text-[var(--ld-teal)]",
                    formFieldInputShowPasswordButton: "text-[var(--ld-white-50)] hover:text-[var(--ld-white-70)]",
                    otpCodeFieldInput: `
                      bg-[var(--ld-white-5)]
                      border-[var(--ld-white-10)]
                      text-[var(--ld-white)]
                      focus:border-[var(--ld-teal)]
                    `,
                    formResendCodeLink: "text-[var(--ld-teal)]",
                    alert: "bg-[var(--ld-white-5)] border-[var(--ld-white-10)]",
                    alertText: "text-[var(--ld-white-70)]",
                    footer: "hidden",
                  },
                  layout: {
                    socialButtonsPlacement: "top",
                    socialButtonsVariant: "blockButton",
                  },
                }}
                redirectUrl="/dashboard"
                signInUrl="/sign-in"
              />
            </motion.div>

            {/* Custom Footer */}
            <motion.div
              variants={itemVariants}
              className="mt-8 text-center"
            >
              <p style={{ color: "var(--ld-white-50)" }}>
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium transition-colors duration-200"
                  style={{ color: "var(--ld-teal)" }}
                >
                  Sign in
                </Link>
              </p>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="mt-12 pt-8"
              style={{ borderTop: "1px solid var(--ld-white-10)" }}
            >
              <p
                className="text-center text-xs mb-4"
                style={{ color: "var(--ld-white-30)" }}
              >
                Trusted by sustainability teams worldwide
              </p>
              <div className="flex items-center justify-center gap-6">
                {[
                  { icon: "check", text: "Free 14-day trial" },
                  { icon: "check", text: "No credit card" },
                  { icon: "check", text: "Cancel anytime" },
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Icon
                      name={item.icon as "check"}
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--ld-teal)" }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--ld-white-50)" }}
                    >
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Mobile Feature Cards */}
            <motion.div
              variants={itemVariants}
              className="lg:hidden mt-8 pt-8"
              style={{ borderTop: "1px solid var(--ld-white-10)" }}
            >
              <p
                className="text-sm font-medium mb-4"
                style={{ color: "var(--ld-white-70)" }}
              >
                What you get:
              </p>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--ld-white-5)",
                        border: "1px solid var(--ld-white-10)",
                      }}
                    >
                      <Icon
                        name={feature.icon as "target" | "globe" | "zap"}
                        className="w-4 h-4"
                        style={{ color: "var(--ld-teal)" }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--ld-white-90)" }}
                      >
                        {feature.title}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--ld-white-50)" }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </main>

        {/* Background decoration for right panel */}
        <div
          className="absolute top-0 right-0 w-[300px] h-[300px] opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--ld-teal-glow) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[200px] h-[200px] opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--ld-teal-glow) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>
    </div>
  );
}
