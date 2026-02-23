"use client";

import { motion } from "framer-motion";

export function AnimatedCheckmark() {
  return (
    <div className="relative w-24 h-24">
      {/* Circle */}
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="white"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Checkmark */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M25 50 L42 67 L75 33"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.4, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}
