import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { supabaseServer } from '@/lib/supabaseServer'
import { db } from '@/db'
import { merchantUsers } from '@/lib/db/schema/merchant-users'

export const runtime = 'nodejs'

/**
 * POST /api/merchants/[id]/upload
 * Upload image to Vercel Blob for a merchant
 * Requires: User must be authenticated and belong to the merchant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 16, params is always a Promise and must be awaited
    const { id: merchantId } = await params

    // Get authenticated user
    const supabase = await supabaseServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Validate merchant ID
    if (!merchantId || merchantId.trim() === '') {
      return NextResponse.json(
        { error: 'Merchant ID is required' },
        { status: 400 }
      )
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: {
        id: true,
        role: true,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this merchant" },
        { status: 403 }
      )
    }

    // Check for Blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[upload] BLOB_READ_WRITE_TOKEN is not set')
      return NextResponse.json(
        {
          error:
            'Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN in your environment variables.',
        },
        { status: 500 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid content type. Only JPG, PNG, or WEBP are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (2MB max)
    const MAX_FILE_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File must be 2MB or smaller' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ url: blob.url }, { status: 200 })
  } catch (error) {
    console.error('[POST /api/merchants/[id]/upload] Error:', error)

    // Provide helpful error messages
    if (error instanceof Error) {
      if (
        error.message.includes('Access denied') ||
        error.message.includes('token')
      ) {
        return NextResponse.json(
          {
            error:
              'Blob storage authentication failed. Please check your BLOB_READ_WRITE_TOKEN environment variable.',
          },
          { status: 500 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'Failed to upload file. Please check your Blob storage configuration.' },
      { status: 500 }
    )
  }
}
