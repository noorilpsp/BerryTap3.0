import { unstable_noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import Image from 'next/image'

import { supabaseServer } from '@/lib/supabaseServer'
import LoginForm from './components/LoginForm'
import TopMenu from './components/TopMenu'

export default async function LoginPage() {
  unstable_noStore()
  // Check if user is already logged in (using getSession for faster redirect)
  // Security: Middleware/proxy already verifies auth, Server Actions use getUser()
  const supabase = await supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect everyone to dashboard (admins can access Payload admin via link)
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background">
      {/* Header with logo and top menu */}
      <header className=" bg-gray-50 border-b border-gray-100 px-6 py-0.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/BerryTapSVG.svg"
            alt="BerryTap Logo"
            width={25}
            height={12}
            className="w-25 h-10"
          />
        </div>
        <TopMenu />
      </header>

      {/* Main content */}
      <main className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <LoginForm />
      </main>
    </div>
  )
}

