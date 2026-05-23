'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { subscribeToCalls } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { Menu, X } from 'lucide-react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = useStore((state) => state.currentUser)
  const router = useRouter()
  const setCurrentUser = useStore((state) => state.setCurrentUser)
  const isOnline = useOnlineStatus()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) return

    const channel = subscribeToCalls(currentUser.id, (payload) => {
      const { from } = payload.payload
      toast((t) => (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-zinc-900">Incoming call from {from}</p>
          </div>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              router.push(`/call/${from}`)
            }}
            className="rounded bg-blue-600 px-3 py-1 text-sm font-bold text-white hover:bg-blue-700"
          >
            Answer
          </button>
        </div>
      ), {
        duration: 10000,
        position: 'top-right',
      })
    })

    return () => {
      channel.unsubscribe()
      console.log('Cleaned up call subscription')
    }
  }, [currentUser?.id, router])

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/login')
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white p-2 text-center">
          You're offline. Some features may not work.
        </div>
      )}

      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-zinc-800 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <nav className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0
      `}>
        <aside className="h-full border-r border-zinc-800 bg-zinc-900/50 p-4">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white">P2P Walkie Talkie</h1>
          </div>

          <nav className="space-y-2">
            <Link
              href="/contacts"
              className="block rounded-lg px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-800"
              onClick={() => setSidebarOpen(false)}
            >
              Contacts
            </Link>
            <Link
              href="/requests"
              className="block rounded-lg px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-800"
              onClick={() => setSidebarOpen(false)}
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
      </nav>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
