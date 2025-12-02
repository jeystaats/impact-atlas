"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icons";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
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
            className="fixed inset-4 md:inset-10 lg:inset-20 z-50 flex items-center justify-center"
          >
            <div className="relative w-full max-w-5xl bg-[var(--background-tertiary)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)]">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <Icon name="x" className="w-5 h-5 text-white" />
              </button>

              {/* Video container */}
              <div className="aspect-video bg-black flex items-center justify-center">
                {/* Placeholder - replace with actual video embed */}
                <div className="text-center p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center"
                  >
                    <Icon name="play" className="w-8 h-8 text-white ml-1" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Demo Video Coming Soon
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    We&apos;re preparing an interactive walkthrough of Impact Atlas.
                    In the meantime, explore the dashboard to see our features in action.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-white font-medium"
                  >
                    Explore Dashboard
                  </motion.button>
                </div>

                {/* When you have a video, uncomment this:
                <iframe
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                  title="Impact Atlas Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
                */}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
