"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

interface ScheduleDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleDemoModal({ isOpen, onClose }: ScheduleDemoModalProps) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - replace with actual form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset after showing success
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setFormState({ name: "", email: "", organization: "", role: "", message: "" });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:max-w-lg"
          >
            <div className="relative bg-[var(--background-tertiary)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-[var(--background-secondary)] transition-colors"
              >
                <Icon name="x" className="w-5 h-5 text-[var(--foreground-muted)]" />
              </button>

              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center"
                      >
                        <Icon name="check" className="w-8 h-8 text-emerald-500" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                        Request Received!
                      </h3>
                      <p className="text-[var(--foreground-secondary)]">
                        We&apos;ll be in touch within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Header */}
                      <div className="mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center mb-4">
                          <Icon name="calendar" className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                          Schedule a Demo
                        </h2>
                        <p className="text-[var(--foreground-secondary)]">
                          See how Impact Atlas can help your city find quick climate wins.
                        </p>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                              Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              required
                              value={formState.name}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                              placeholder="Jane Doe"
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              required
                              value={formState.email}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                              placeholder="jane@city.gov"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="organization" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                            Organization
                          </label>
                          <input
                            type="text"
                            id="organization"
                            name="organization"
                            required
                            value={formState.organization}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                            placeholder="City of Amsterdam"
                          />
                        </div>

                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                            Your Role
                          </label>
                          <select
                            id="role"
                            name="role"
                            required
                            value={formState.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                          >
                            <option value="">Select your role</option>
                            <option value="sustainability">Sustainability Officer</option>
                            <option value="climate">Climate Coordinator</option>
                            <option value="urban-planning">Urban Planner</option>
                            <option value="environment">Environmental Manager</option>
                            <option value="executive">City Executive</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                            What are you hoping to achieve? (optional)
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            rows={3}
                            value={formState.message}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all resize-none"
                            placeholder="Tell us about your climate goals..."
                          />
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Icon name="loader" className="w-4 h-4" />
                              </motion.div>
                              Sending...
                            </>
                          ) : (
                            <>
                              Request Demo
                              <Icon name="arrowUpRight" className="w-4 h-4" />
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-center text-[var(--foreground-muted)]">
                          We&apos;ll contact you within 24 hours to schedule your personalized demo.
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
