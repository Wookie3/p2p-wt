'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'

export default function Home() {
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)

  useEffect(() => {
    if (currentUser) {
      router.push('/contacts')
    } else {
      router.push('/login')
    }
  }, [currentUser, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="animate-pulse text-zinc-400">Loading...</div>
    </div>
  )
}
