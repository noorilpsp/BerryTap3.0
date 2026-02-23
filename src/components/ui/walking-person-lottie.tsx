"use client";

import React, { useEffect, useMemo, useState } from "react";
import Lottie from "lottie-react";
import type { LottieProps } from "lottie-react";

interface WalkingPersonLottieProps {
  className?: string;
  tone?: "default" | "white" | "black";
}

function paintAnimation(node: unknown, rgb: [number, number, number]) {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    node.forEach((entry) => paintAnimation(entry, rgb));
    return;
  }

  const record = node as Record<string, unknown>;
  const color = record.c as { k?: unknown } | undefined;
  if (color && Array.isArray(color.k) && color.k.length >= 3) {
    const [r, g, b] = color.k;
    if (typeof r === "number" && typeof g === "number" && typeof b === "number") {
      color.k[0] = rgb[0];
      color.k[1] = rgb[1];
      color.k[2] = rgb[2];
    }
  }

  Object.values(record).forEach((value) => paintAnimation(value, rgb));
}

export function WalkingPersonLottie({
  className,
  tone = "default",
}: WalkingPersonLottieProps) {
  const [animationData, setAnimationData] = useState<LottieProps["animationData"]>(null);

  useEffect(() => {
    fetch("/stickman-walking.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  const themedAnimationData = useMemo(() => {
    if (!animationData) return null;
    if (tone === "default") return animationData;

    const cloned =
      typeof structuredClone === "function"
        ? structuredClone(animationData)
        : JSON.parse(JSON.stringify(animationData));

    paintAnimation(cloned, tone === "white" ? [1, 1, 1] : [0, 0, 0]);
    return cloned;
  }, [animationData, tone]);

  if (!themedAnimationData) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <Lottie
        animationData={themedAnimationData}
        loop={true}
        autoplay={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
