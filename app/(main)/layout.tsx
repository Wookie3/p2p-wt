'use client'

import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = useStore((state) => state.currentUser)
  const router = useRouter()
  const setCurrentUser = useStore((state) => state.setCurrentUser)

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/login')
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">P2P Walkie Talkie</h1>
        </div>

        <nav className="space-y-2">
          <Link
            href="/contacts"
            className="block rounded-lg px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Contacts
          </Link>
          <Link
            href="/requests"
            className="block rounded-lg px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Requests
          </Link>
        </nav>

        <div className="mt-8 border-t border-zinc-800 pt-4">
          <div className="mb-4">
            <p className="text-xs text-zinc-500">Logged in as</p>
            <p className="font-medium text-white">{currentUser.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
