# Vercel Blob Storage Setup

## Error: "Access denied, please provide a valid token for this resource"

This error occurs when the `BLOB_READ_WRITE_TOKEN` is missing, invalid, or expired.

## How to Fix

### 1. Get a New Token from Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project (or create one if you don't have one)
3. Go to **Settings** → **Storage** → **Blob**
4. Click **Create Database** (if you haven't created one yet)
5. Once created, go to **Settings** → **Storage** → **Blob** → **Environment Variables**
6. Copy the `BLOB_READ_WRITE_TOKEN` value

### 2. Add Token to `.env.local`

Add or update the token in your `.env.local` file:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Restart Your Dev Server

After adding/updating the token:

```bash
# Stop your dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Verify Token is Working

You can test the token by:

1. **Creating a merchant** - Try uploading an image when creating a new merchant
2. **Check the console** - Look for any error messages about blob storage

## Token Format

Vercel Blob tokens typically look like:
- `vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (read-write token)
- `vercel_blob_ro_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (read-only token)

Make sure you're using the **read-write** token (`rw`) for uploads.

## Troubleshooting

### Token exists but still getting errors?

1. **Check token validity**: The token might be expired. Generate a new one from Vercel dashboard
2. **Check token format**: Make sure there are no extra spaces or quotes in `.env.local`
3. **Restart server**: Environment variables are loaded at server start
4. **Check project association**: Make sure the token is for the correct Vercel project

### Alternative: Use Vercel CLI

You can also set the token using Vercel CLI:

```bash
vercel env add BLOB_READ_WRITE_TOKEN
```

Then pull it to your local `.env.local`:

```bash
vercel env pull .env.local
```

## Need Help?

If you continue to have issues:
1. Check Vercel Blob documentation: https://vercel.com/docs/storage/vercel-blob
2. Verify your Vercel account has access to Blob storage
3. Check that your Vercel project is properly linked
