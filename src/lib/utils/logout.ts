/**
 * Client-side logout utility
 * Clears all user-specific data from localStorage and sessionStorage
 * Must be called before server-side logout to ensure clean state
 */
export function clearUserData() {
  if (typeof window === 'undefined') return

  // Clear all merchant selection data
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('current_merchant_')) {
      localStorage.removeItem(key)
    }
  })

  // Clear any other user-specific data
  // Add more keys here as needed
  const keysToRemove = [
    'current_merchant', // Cookie-based fallback
    'current_location',
    // Add other user-specific localStorage keys here
  ]

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })

  // Clear cookies (client-side)
  document.cookie.split(';').forEach((cookie) => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
    if (name.startsWith('current_merchant') || name === 'current_location' || name === 'bt_admin_status') {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    }
  })
}