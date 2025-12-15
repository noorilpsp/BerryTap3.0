import { AdminPermissionsProvider } from '@/components/AdminPermissionsProvider'

/**
 * Root layout for all /admin routes.
 * Wraps admin pages with AdminPermissionsProvider to provide lightweight admin status check.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminPermissionsProvider>
      <main
        id="main-content"
      >
        {children}
      </main>
    </AdminPermissionsProvider>
  )
}
