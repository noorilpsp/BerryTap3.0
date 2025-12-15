# NextFaster Setup Instructions

## Quick Start

1. **Install dependencies** (already done):
   ```bash
   npx pnpm@latest install
   ```

2. **Set up environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your database connection string
   - You can use a local Postgres, Neon, or any Postgres database

3. **Set up the database**:
   ```bash
   npx pnpm@latest db:push
   ```

4. **Run the dev server**:
   ```bash
   npx pnpm@latest dev
   ```

## Environment Variables Needed

- `DATABASE_URL` or `POSTGRES_URL`: Your Postgres connection string
- Optional: `BLOB_READ_WRITE_TOKEN` for Vercel Blob Storage
- Optional: `SESSION_SECRET` for session management
- Optional: `OPENAI_API_KEY` for AI features

## Testing Image Prefetching

Once running, navigate to any product page and hover over links to see image prefetching in action.

Check the Network tab in DevTools to see:
- `/api/prefetch-images/...` requests
- Image prefetch requests
