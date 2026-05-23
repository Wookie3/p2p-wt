'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateUsername } from '@/lib/username-generator'
import { useStore } from '@/store/useStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const setCurrentUser = useStore((state) => state.setCurrentUser)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [generatedUsername, setGeneratedUsername] = useState('')

  useEffect(() => {
    setGeneratedUsername(generateUsername())
  }, [])

  const handleAnonymousLogin = async () => {
    try {
      // Create anonymous user in Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.signInAnonymously()

      if (authError) {
        console.error('Anonymous auth error:', authError)
        toast.error('Failed to create session')
        return
      }

      // Create profile record in database
      const { error: profileError } = await supabase
        // @ts-ignore
        .from('profiles')
        // @ts-ignore
        .insert({
          user_id: user.id,
          username: generatedUsername,
          is_online: true
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        toast.error('Failed to create profile')
        return
      }

      // Set user in Zustand store
      setCurrentUser({
        id: user.id,
        username: generatedUsername,
        is_online: true,
        session_expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000)
      })

      toast.success(`Welcome, ${generatedUsername}!`)
      router.push('/contacts')
    } catch (error) {
      console.error('Anonymous login error:', error)
      toast.error('Failed to log in anonymously')
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Login functionality coming soon!')
  }

  const handleRegenerateUsername = () => {
    setGeneratedUsername(generateUsername())
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">
          P2P Walkie Talkie
        </h1>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setIsAnonymous(true)}
            className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
              isAnonymous
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Anonymous
          </button>
          <button
            onClick={() => setIsAnonymous(false)}
            className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
              !isAnonymous
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Login
          </button>
        </div>

        {isAnonymous ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-6 text-center">
              <p className="mb-2 text-sm text-zinc-400">Your username</p>
              <div className="mb-4 text-2xl font-bold text-white">
                {generatedUsername}
              </div>
              <button
                onClick={handleRegenerateUsername}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Regenerate
              </button>
            </div>
            <button
              onClick={handleAnonymousLogin}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start Talking
            </button>
            <p className="text-center text-xs text-zinc-500">
              Your session will expire in 12 hours
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-zinc-300">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Your username"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
