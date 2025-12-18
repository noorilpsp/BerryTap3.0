import { unstable_noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/currentUser'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut } from 'lucide-react'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function DashboardPage() {
  unstable_noStore()
  
  // Check session first (same as login page) to avoid redirect loop
  const supabase = await supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect to login if no session
  if (!session) {
    redirect('/login')
  }

  // Get user details for display
  const user = await getCurrentUser()
  
  // Fallback to session user if getCurrentUser returns null
  const displayEmail = user?.profile?.email ?? user?.email ?? session.user.email ?? 'User'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {displayEmail}!
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{displayEmail}</p>
            </div>
            {user?.profile?.createdAt && (
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium">
                  {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).format(new Date(user.profile.createdAt))}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your dashboard is ready. More features coming soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
