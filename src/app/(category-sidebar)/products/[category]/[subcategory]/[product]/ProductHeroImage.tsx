'use client'

import { useEffect } from 'react'
import Image from 'next/image'

type ProductHeroImageProps = {
  src?: string | null
  alt: string
  width: number
  height: number
  className?: string
}

export function ProductHeroImage({ src, alt, width, height, className }: ProductHeroImageProps) {
  const resolvedSrc = src?.trimEnd() ?? '/placeholder.svg?height=64&width=64'

  // Prefetch the hero image, mirroring ProductLink behavior
  useEffect(() => {
    try {
      const img = new window.Image()
      img.decoding = 'async'
      img.fetchPriority = 'low'
      img.src = resolvedSrc
    } catch (error) {
      console.error('prefetch hero image failed', resolvedSrc, error)
    }
  }, [resolvedSrc])

  return (
    <Image
      loading="eager"
      decoding="sync"
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      quality={80}
      className={className}
    />
  )
}
