'use client'

import { useStore } from '@/store/useStore'
import { generateUsername } from '@/lib/username-generator'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const currentUser = useStore((state) => state.currentUser)
  const router = useRouter()

  const handleRegenerateUsername = () => {
    if (!currentUser) return

    const newUsername = generateUsername()
    toast.success('Username updated!')
  }

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Settings</h1>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Username
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={currentUser?.username || ''}
                  disabled
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-400"
                />
                <button
                  onClick={handleRegenerateUsername}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                User ID
              </label>
              <input
                type="text"
                value={currentUser?.id || ''}
                disabled
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Account Type</h2>
          <p className="text-zinc-400">
            {currentUser?.id?.startsWith('anon_') 
              ? 'You are using an anonymous account. Your session will expire in 12 hours.'
              : 'You are logged in with a persistent account.'}
          </p>
        </div>
      </div>
    </div>
  )
}
