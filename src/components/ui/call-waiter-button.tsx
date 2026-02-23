"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check } from "lucide-react";

type ButtonState = "default" | "pressed" | "calling" | "cooldown";

interface CallWaiterButtonProps {
  className?: string;
  onCall?: () => Promise<void> | void;
}

export function CallWaiterButton({ className = "", onCall }: CallWaiterButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>("default");
  const [cooldownSeconds, setCooldownSeconds] = useState(30);
  const [showToast, setShowToast] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup cooldown interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonState !== "default") return;

    // Get tap coordinates for ripple
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setRipplePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    // Pressed state
    setButtonState("pressed");
    await delay(100);

    // Calling state - must stay blue
    setButtonState("calling");
    
    // Call the callback if provided
    const callStartTime = Date.now();
    if (onCall) {
      await onCall();
    } else {
      // Simulate API call
      await delay(800);
    }
    const callDuration = Date.now() - callStartTime;

    // Ensure calling state (blue) is visible for at least 800ms
    // This prevents green from appearing too quickly
    const minCallingDuration = 800;
    if (callDuration < minCallingDuration) {
      await delay(minCallingDuration - callDuration);
    }

    // Show toast notification
    setShowToast(true);

    // Haptic feedback on mobile
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([50, 30, 50]);
    }

    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);

    // Transition directly to cooldown (skip green success state)
    setButtonState("cooldown");
    setCooldownSeconds(30);

    // Countdown timer
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }

    cooldownIntervalRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
            cooldownIntervalRef.current = null;
          }
          setButtonState("default");
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const getButtonContent = () => {
    switch (buttonState) {
      case "calling":
        return (
          <>
            <motion.div
              animate={{
                rotate: [0, 15, -15, 10, -10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: 3,
                ease: "easeInOut",
              }}
            >
              <Bell className="w-5 h-5" />
            </motion.div>
            <span>Calling...</span>
          </>
        );
      case "cooldown":
        return (
          <>
            <Check className="w-5 h-5" />
            <span>Called · {formatCooldown(cooldownSeconds)}</span>
          </>
        );
      default:
        return (
          <>
            <Bell className="w-5 h-5" />
            <span>Call Waiter</span>
          </>
        );
    }
  };

  const getButtonStyles = () => {
    switch (buttonState) {
      case "pressed":
        return "bg-gray-800 scale-95";
      case "calling":
        return "bg-blue-600";
      case "cooldown":
        return "bg-gray-400 cursor-not-allowed";
      default:
        return "bg-black hover:bg-gray-900";
    }
  };

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={handleClick}
        disabled={buttonState === "cooldown" || buttonState === "calling"}
        className={`h-12 rounded-lg text-white font-semibold flex items-center justify-center gap-2 relative overflow-hidden transition-colors ${getButtonStyles()} ${className}`}
        animate={{
          scale: buttonState === "pressed" ? 0.95 : 1,
        }}
        transition={{
          duration: 0.1,
          ease: "easeOut",
        }}
        whileTap={buttonState === "default" ? { scale: 0.95 } : {}}
      >
        {/* Ripple Effect */}
        <AnimatePresence>
          {buttonState === "pressed" && (
            <motion.div
              className="absolute rounded-full bg-white/30"
              initial={{
                width: 0,
                height: 0,
                x: ripplePosition.x,
                y: ripplePosition.y,
                opacity: 0.3,
              }}
              animate={{
                width: 400,
                height: 400,
                x: ripplePosition.x - 200,
                y: ripplePosition.y - 200,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
              }}
            />
          )}
        </AnimatePresence>

        {/* Pulsing background for calling state */}
        {buttonState === "calling" && (
          <motion.div
            className="absolute inset-0 bg-blue-500 rounded-lg"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Button Content */}
        <motion.div
          className="relative z-10 flex items-center justify-center gap-2"
          layout
        >
          {getButtonContent()}
        </motion.div>
      </motion.button>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Waiter has been notified
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    They'll be with you soon
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

