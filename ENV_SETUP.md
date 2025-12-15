# Environment Variables Setup

## Required Supabase Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration (Server-side)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Configuration (Client-side - must match server values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site URL (for email redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## How to Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for both `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for both `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Example `.env.local`

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
POSTGRES_URL=postgresql://user:password@host:5432/dbname

# Supabase
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.example
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.example

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Auth Secret (for sessions)
AUTH_SECRET=your-random-secret-here
```

## After Adding Variables

1. **Restart your dev server** (stop and start `pnpm dev`)
2. **Test the connection**: Visit `http://localhost:3000/api/auth/test-connection`
3. All environment variables should show ✅ Set

## Important Notes

- **Never commit `.env.local` to git** (it's already in `.gitignore`)
- The `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` should be **identical**
- The `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` should be **identical**
- Use the **anon/public** key, NOT the service_role key (for security)

