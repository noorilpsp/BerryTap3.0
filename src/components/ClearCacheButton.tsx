'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function ClearCacheButton() {
  const [loading, setLoading] = useState(false)

  const handleClearCache = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/clear-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear cache')
      }

      toast.success('Cache cleared', {
        description: data.message || 'Cache has been cleared successfully',
      })

      // Optionally refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      toast.error('Error clearing cache', {
        description: error instanceof Error ? error.message : 'Failed to clear cache',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClearCache}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Clearing...' : 'Clear Cache'}
    </Button>
  )
}
