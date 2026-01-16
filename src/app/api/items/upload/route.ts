import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { supabaseServer } from "@/lib/supabaseServer"
import { db } from "@/db"
import { merchantUsers, merchantLocations } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const runtime = "nodejs"

/**
 * POST /api/items/upload
 * Uploads an image to Vercel Blob storage for menu items.
 * Requires: User must be authenticated and belong to the merchant that owns the location.
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get("locationId")

    if (!locationId) {
      return NextResponse.json(
        { error: "locationId is required" },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await supabaseServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the location to find its merchant
    const location = await db.query.merchantLocations.findFirst({
      where: eq(merchantLocations.id, locationId),
      columns: {
        id: true,
        merchantId: true,
      },
    })

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      )
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: {
        id: true,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this location" },
        { status: 403 }
      )
    }

    // Check for Blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[upload] BLOB_READ_WRITE_TOKEN is not set")
      return NextResponse.json(
        {
          error:
            "Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN in your environment variables.",
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    // Validate content type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid content type. Only JPG, PNG, or WEBP are allowed" },
        { status: 400 }
      )
    }

    // Validate file size (2MB max)
    const MAX_FILE_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be 2MB or smaller" },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`items/${locationId}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[POST /api/items/upload] Error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    )
  }
}
