"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Trophy, PartyPopper, X } from "lucide-react"
import confetti from "canvas-confetti"

interface SuccessDialogProps {
  open: boolean
  onClose: () => void
  type: "refund" | "dispute-won" | "milestone" | "first-transaction"
  data?: {
    amount?: number
    message?: string
    details?: string
    stats?: { label: string; value: string }[]
  }
}

export function SuccessCelebration({ open, onClose, type, data }: SuccessDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (open && (type === "refund" || type === "dispute-won" || type === "milestone")) {
      setShowConfetti(true)
      // Trigger confetti animation
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          setShowConfetti(false)
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          }),
        )
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          }),
        )
      }, 250)

      return () => clearInterval(interval)
    }
  }, [open, type])

  if (type === "refund") {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 text-4xl">🎉 ✨ 🎊 ✨ 🎉</div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Refund Successful!</h2>
            <p className="mb-1 text-3xl font-bold text-success">€{data?.amount?.toFixed(2)}</p>
            <p className="mb-6 text-muted-foreground">refunded successfully</p>
            <p className="mb-8 max-w-sm text-sm text-muted-foreground">
              The customer will receive their refund in 5-10 business days.
            </p>
            <Button onClick={onClose}>View Transaction</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (type === "dispute-won") {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10">
              <Trophy className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Dispute Won!</h2>
            <p className="mb-4 text-lg font-semibold">Congratulations!</p>
            <p className="mb-6 text-muted-foreground">You won the dispute</p>
            <p className="mb-1 text-2xl font-bold text-success">€{data?.amount?.toFixed(2)}</p>
            <p className="mb-8 max-w-sm text-sm text-muted-foreground">
              has been released to your account. Your evidence was compelling and the card network ruled in your favor.
            </p>
            <Button onClick={onClose}>View Details</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (type === "milestone") {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <PartyPopper className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Milestone Achieved!</h2>
            <p className="mb-6 text-lg font-semibold">{data?.message || "1,000 Transactions Processed!"}</p>
            <p className="mb-6 text-sm text-muted-foreground">
              You've reached a major milestone. Keep up the great work!
            </p>
            {data?.stats && (
              <div className="mb-8 w-full space-y-2">
                {data.stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{stat.label}:</span>
                    <span className="font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Share
              </Button>
              <Button onClick={onClose}>View Stats</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (type === "first-transaction") {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 text-6xl">🥳</div>
            <h2 className="mb-2 text-2xl font-semibold">First Transaction!</h2>
            <p className="mb-6 text-muted-foreground">You processed your first transaction!</p>
            <p className="mb-8 text-sm text-muted-foreground">This is the beginning of something great.</p>
            <div className="mb-8 w-full text-left">
              <p className="mb-2 text-sm font-medium">Next steps:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Set up refund policies</li>
                <li>• Configure notifications</li>
                <li>• Explore analytics</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Take Tour
              </Button>
              <Button onClick={onClose}>Dismiss</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return null
}
