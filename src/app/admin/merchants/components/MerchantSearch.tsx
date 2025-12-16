'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type MerchantSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function MerchantSearch({ value, onChange }: MerchantSearchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="flex w-full gap-2 sm:w-80">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
        <Input
          name="q"
          value={value}
          onChange={handleChange}
          placeholder="Search by name"
          className="pl-9"
        />
      </div>
      {value && (
        <Button type="button" variant="ghost" onClick={handleClear}>
          Clear
        </Button>
      )}
    </div>
  )
}
