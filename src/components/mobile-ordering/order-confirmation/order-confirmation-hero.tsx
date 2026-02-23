"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedCheckmark } from "./animated-checkmark";

interface OrderConfirmationHeroProps {
  orderNumber: string;
  orderType: "dine_in" | "pickup";
}

export function OrderConfirmationHero({
  orderNumber,
  orderType,
}: OrderConfirmationHeroProps) {
  return (
    <div className="relative h-[40vh] min-h-[300px] max-h-[400px] overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600" />

      {/* Confetti Container - particles handled by canvas-confetti in parent */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-4">
        {/* Animated Checkmark */}
        <AnimatedCheckmark />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.3 }}
          className="text-3xl font-bold text-white mt-6 mb-2"
        >
          Order Placed!
        </motion.h1>

        {/* Order Number with Typewriter Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
          className="text-white/90 text-lg"
        >
          <TypewriterText text={`#${orderNumber}`} />
        </motion.div>
      </div>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 100); // 100ms per character

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  return <span>{displayedText}</span>;
}
