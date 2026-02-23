"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StatusToastProps {
  message: string;
  isVisible: boolean;
}

export function StatusToast({ message, isVisible }: StatusToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{
            enter: { duration: 0.2, ease: "easeOut" },
            exit: { duration: 0.2, ease: "easeIn" },
          }}
          className="mt-4 px-4 py-3 bg-background border border-border rounded-lg shadow-lg"
        >
          <p className="text-sm font-medium text-foreground text-center">
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
