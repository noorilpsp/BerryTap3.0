"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface Status {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
  current: boolean;
}

interface OrderStatusTrackerProps {
  statuses: Status[];
  isReady?: boolean;
}

export function OrderStatusTracker({ statuses, isReady = false }: OrderStatusTrackerProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center">
          {statuses.map((status, index) => {
            const isLast = index === statuses.length - 1;
            const isCompleted = status.completed;
            const isCurrent = status.current;
            // Line is completed if current status is completed (we've moved past it)
            // When ready, all lines are completed
            const lineCompleted = isReady || isCompleted;

            return (
              <React.Fragment key={status.id}>
                {/* Status Item */}
                <div className="flex flex-col items-center shrink-0">
                  {/* Icon */}
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      isReady || isCompleted
                        ? "bg-green-100 scale-110"
                        : isCurrent
                          ? "bg-blue-100 scale-110"
                          : "bg-gray-100"
                    }`}
                    animate={{
                      scale: isCurrent
                        ? [1, 1.15, 1]
                        : isReady || isCompleted
                          ? 1.1
                          : 1,
                    }}
                    transition={{
                      duration: isCurrent ? 0.6 : 0.4,
                      repeat: isCurrent ? Infinity : 0,
                      ease: isCurrent ? "easeInOut" : "easeOut",
                    }}
                  >
                    {status.icon}
                  </motion.div>

                  {/* Label */}
                  <p
                    className={`text-xs mt-2 text-center ${
                      isReady || isCompleted || isCurrent
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {status.label}
                  </p>

                  {/* Current Step Indicator */}
                  {isCurrent && !isReady && (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-blue-600 mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 mx-2 h-0.5 relative">
                    {/* Dashed background for incomplete */}
                    <div className="absolute inset-0 border-t border-dashed border-gray-300" />
                    {/* Animated solid line for completed */}
                    {(lineCompleted || isReady) && (
                      <motion.div
                        className="absolute inset-0 bg-green-500 h-0.5"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ transformOrigin: "left" }}
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
