"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Home, RefreshCw, MessageCircle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorId?: string
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `err_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}`
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error boundary caught an error:", error, errorInfo)
    // In production, send to error tracking service
    // sendErrorToService(error, errorInfo, this.state.errorId)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md border-destructive">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">Something went wrong</h2>
              <p className="mb-6 text-muted-foreground">We encountered an unexpected error.</p>

              {this.state.errorId && (
                <Card className="mb-6 w-full border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4">
                    <p className="mb-1 text-sm font-medium">Error ID: {this.state.errorId}</p>
                    <p className="text-xs text-muted-foreground">Our team has been notified.</p>
                  </CardContent>
                </Card>
              )}

              <div className="mb-6 w-full text-left">
                <p className="mb-2 text-sm font-medium">What you can do:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Refresh the page</li>
                  <li>• Clear your browser cache</li>
                  <li>• Contact support with the error ID above</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Page
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/")}>
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                <Button variant="outline">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
