"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MenuPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/restaurant/menu/overview")
  }, [router])

  return null
}
