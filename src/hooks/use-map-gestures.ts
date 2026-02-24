"use client"

import React from "react"

import { useRef, useCallback, useEffect, useState } from "react"
import { applyInertia, type Velocity } from "@/lib/animation-config"

interface MapGestureState {
  offset: { x: number; y: number }
  scale: number
  isDragging: boolean
}

interface UseMapGesturesOptions {
  scale: number
  offset: { x: number; y: number }
  onOffsetChange: (offset: { x: number; y: number }) => void
  onScaleChange: (scale: number, origin?: { x: number; y: number }) => void
  minScale: number
  maxScale: number
  enabled: boolean
}

export function useMapGestures({
  scale,
  offset,
  onOffsetChange,
  onScaleChange,
  minScale,
  maxScale,
  enabled,
}: UseMapGesturesOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef({
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    velocityX: 0,
    velocityY: 0,
  })
  const pinchState = useRef({
    initialDistance: 0,
    initialScale: 1,
    centerX: 0,
    centerY: 0,
  })
  const inertiaCancel = useRef<(() => void) | null>(null)

  // Cancel any active inertia
  const cancelInertia = useCallback(() => {
    if (inertiaCancel.current) {
      inertiaCancel.current()
      inertiaCancel.current = null
    }
  }, [])

  // ── Mouse Drag ──────────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return
      if ((e.target as HTMLElement).closest("button")) return
      cancelInertia()
      setIsDragging(true)
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
        lastX: e.clientX,
        lastY: e.clientY,
        lastTime: performance.now(),
        velocityX: 0,
        velocityY: 0,
      }
    },
    [enabled, offset, cancelInertia]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const now = performance.now()
      const dt = now - dragState.current.lastTime
      const dx = e.clientX - dragState.current.startX
      const dy = e.clientY - dragState.current.startY

      if (dt > 0) {
        dragState.current.velocityX =
          (e.clientX - dragState.current.lastX) / Math.max(dt, 1)
        dragState.current.velocityY =
          (e.clientY - dragState.current.lastY) / Math.max(dt, 1)
      }

      dragState.current.lastX = e.clientX
      dragState.current.lastY = e.clientY
      dragState.current.lastTime = now

      onOffsetChange({
        x: dragState.current.offsetX + dx,
        y: dragState.current.offsetY + dy,
      })
    },
    [isDragging, onOffsetChange]
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    // Apply inertia momentum
    const vx = dragState.current.velocityX * 16 // scale to per-frame
    const vy = dragState.current.velocityY * 16

    if (Math.abs(vx) > 2 || Math.abs(vy) > 2) {
      inertiaCancel.current = applyInertia(
        offset,
        { x: vx, y: vy },
        0.92,
        onOffsetChange,
        () => {
          inertiaCancel.current = null
        }
      )
    }
  }, [isDragging, offset, onOffsetChange])

  // ── Touch Drag + Pinch ─────────────────────────────────────────────────
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return
      cancelInertia()

      if (e.touches.length === 2) {
        // Pinch start
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        pinchState.current = {
          initialDistance: Math.hypot(dx, dy),
          initialScale: scale,
          centerX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          centerY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        }
        return
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0]
        setIsDragging(true)
        dragState.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          offsetX: offset.x,
          offsetY: offset.y,
          lastX: touch.clientX,
          lastY: touch.clientY,
          lastTime: performance.now(),
          velocityX: 0,
          velocityY: 0,
        }
      }
    },
    [enabled, scale, offset, cancelInertia]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        const distance = Math.hypot(dx, dy)
        const scaleRatio = distance / pinchState.current.initialDistance
        const newScale = Math.min(
          maxScale,
          Math.max(minScale, pinchState.current.initialScale * scaleRatio)
        )
        onScaleChange(newScale, {
          x: pinchState.current.centerX,
          y: pinchState.current.centerY,
        })
        return
      }

      if (!isDragging || e.touches.length !== 1) return
      const touch = e.touches[0]
      const now = performance.now()
      const dt = now - dragState.current.lastTime
      const dx = touch.clientX - dragState.current.startX
      const dy = touch.clientY - dragState.current.startY

      if (dt > 0) {
        dragState.current.velocityX =
          (touch.clientX - dragState.current.lastX) / Math.max(dt, 1)
        dragState.current.velocityY =
          (touch.clientY - dragState.current.lastY) / Math.max(dt, 1)
      }

      dragState.current.lastX = touch.clientX
      dragState.current.lastY = touch.clientY
      dragState.current.lastTime = now

      onOffsetChange({
        x: dragState.current.offsetX + dx,
        y: dragState.current.offsetY + dy,
      })
    },
    [isDragging, onOffsetChange, onScaleChange, minScale, maxScale]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const vx = dragState.current.velocityX * 16
    const vy = dragState.current.velocityY * 16

    if (Math.abs(vx) > 2 || Math.abs(vy) > 2) {
      inertiaCancel.current = applyInertia(
        offset,
        { x: vx, y: vy },
        0.92,
        onOffsetChange,
        () => {
          inertiaCancel.current = null
        }
      )
    }
  }, [isDragging, offset, onOffsetChange])

  // ── Mouse Wheel Zoom ──────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el || !enabled) return

    function handleWheel(e: WheelEvent) {
      e.preventDefault()
      const delta = -e.deltaY * 0.001
      const newScale = Math.min(
        maxScale,
        Math.max(minScale, scale + delta * scale)
      )
      onScaleChange(newScale, { x: e.clientX, y: e.clientY })
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [enabled, scale, minScale, maxScale, onScaleChange])

  // Cleanup inertia on unmount
  useEffect(() => {
    return cancelInertia
  }, [cancelInertia])

  return {
    containerRef,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}

// ── Reduced Motion Hook ──────────────────────────────────────────────────────

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)

    function onChange(e: MediaQueryListEvent) {
      setReduced(e.matches)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return reduced
}

// ── Swipe Down Gesture (for Level 3 exit) ────────────────────────────────────

interface UseSwipeDownOptions {
  enabled: boolean
  threshold: number // pixels to trigger
  onSwipeDown: () => void
}

export function useSwipeDown({ enabled, threshold, onSwipeDown }: UseSwipeDownOptions) {
  const startY = useRef(0)
  const [swiping, setSwiping] = useState(false)
  const [swipeProgress, setSwipeProgress] = useState(0)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || e.touches.length !== 1) return
      startY.current = e.touches[0].clientY
      setSwiping(true)
      setSwipeProgress(0)
    },
    [enabled]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!swiping || e.touches.length !== 1) return
      const dy = e.touches[0].clientY - startY.current
      if (dy > 0) {
        setSwipeProgress(Math.min(dy / threshold, 1))
      }
    },
    [swiping, threshold]
  )

  const handleTouchEnd = useCallback(() => {
    if (!swiping) return
    if (swipeProgress >= 1) {
      onSwipeDown()
    }
    setSwiping(false)
    setSwipeProgress(0)
  }, [swiping, swipeProgress, onSwipeDown])

  return {
    swipeProgress,
    isSwiping: swiping,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
