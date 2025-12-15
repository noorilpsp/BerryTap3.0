# Supabase Email Confirmation Troubleshooting Guide

## Quick Test: Verify Supabase Connection

Visit this URL in your browser to test the connection:
```
http://localhost:3000/api/auth/test-connection
```

This will show you:
- ✅ If environment variables are set correctly
- ✅ If Supabase client can be created
- ✅ If session checks work

## Common Issues & Solutions

### 1. **Email Confirmation Disabled in Supabase**

**Check:** Go to your Supabase Dashboard → **Authentication** → **Settings** → **Email Auth**

**Fix:** 
- Make sure "Enable email confirmations" is **ON** (if you want email confirmation)
- OR turn it **OFF** if you want users to sign in immediately without confirmation

**Note:** If email confirmation is disabled, users will get a session immediately and won't receive confirmation emails.

### 2. **SMTP Not Configured**

**Check:** Go to **Authentication** → **Emails** → **SMTP Settings**

**Fix:**
- Supabase provides a default email service, but it has **rate limits**
- For production, configure your own SMTP (Gmail, SendGrid, etc.)
- For development, the default should work but may be slow

### 3. **Email Templates Missing**

**Check:** Go to **Authentication** → **Emails** → **Email Templates**

**Fix:**
- Make sure "Confirm signup" template exists
- Check that the template has a valid confirmation link
- The link should point to: `{{ .SiteURL }}/reset-password?token={{ .TokenHash }}&type=signup`

### 4. **Environment Variables Wrong**

**Check your `.env.local`:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Fix:**
- Get these from: Supabase Dashboard → **Settings** → **API**
- Make sure `SUPABASE_URL` matches `NEXT_PUBLIC_SUPABASE_URL`
- Make sure `SUPABASE_ANON_KEY` matches `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. **Redirect URL Not Configured**

**Check:** Go to **Authentication** → **URL Configuration**

**Fix:**
- Add your site URL to "Redirect URLs":
  - `http://localhost:3000/**` (for development)
  - `https://yourdomain.com/**` (for production)
- Add to "Site URL": `http://localhost:3000` (or your production URL)

### 6. **Check Supabase Logs**

**Check:** Go to **Logs** → **Auth Logs**

**Look for:**
- Failed email sends
- Error messages
- Rate limit warnings

## Testing Steps

1. **Test Connection:**
   ```
   Visit: http://localhost:3000/api/auth/test-connection
   ```

2. **Check Console Logs:**
   - When you sign up, check your terminal/console
   - Look for the "Signup response:" log
   - It will show if user was created and if email was sent

3. **Check Supabase Dashboard:**
   - Go to **Authentication** → **Users**
   - See if the user was created
   - Check if email is "confirmed" or "unconfirmed"

4. **Check Email Provider:**
   - Check spam folder
   - Some email providers (Gmail, Outlook) may delay emails
   - Try a different email provider for testing

## Quick Fix: Disable Email Confirmation (Development)

If you just want to test signup without emails:

1. Go to Supabase Dashboard
2. **Authentication** → **Settings** → **Email Auth**
3. Toggle **OFF** "Enable email confirmations"
4. Users will be able to sign in immediately after signup

## Production Setup

For production, you should:

1. **Configure Custom SMTP:**
   - Use a reliable email service (SendGrid, Mailgun, AWS SES)
   - Set it up in **Authentication** → **Emails** → **SMTP Settings**

2. **Customize Email Templates:**
   - Make emails match your brand
   - Set proper redirect URLs

3. **Set Production URLs:**
   - Update redirect URLs in Supabase dashboard
   - Update `NEXT_PUBLIC_SITE_URL` in environment variables

## Debug Signup Action

The signup action now logs detailed information. Check your terminal when signing up:

```
Signup response: {
  hasUser: true,
  hasSession: null,  // null means email confirmation required
  userEmail: "user@example.com",
  userConfirmed: "No",
  error: null
}
```

If `hasSession` is `null`, it means:
- ✅ User was created successfully
- ✅ Email confirmation is required
- ⚠️ Check if email was actually sent (check Supabase logs)

