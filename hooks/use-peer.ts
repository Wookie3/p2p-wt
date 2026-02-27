import { useEffect, useState, useRef } from 'react'
import { createPeer, getPeer, destroyPeer, updatePeerId } from '@/lib/peerjs'
import type { Peer } from 'peerjs'

export function usePeer(userId: string) {
  const [peer, setPeer] = useState<Peer | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const peerInstance = createPeer(userId)
    setPeer(peerInstance)

    peerInstance.on('open', () => {
      setIsReady(true)
      setError(null)
    })

    peerInstance.on('error', (err) => {
      console.error('PeerJS error:', err)
      setError(err as Error)
    })

    return () => {
      destroyPeer()
      setIsReady(false)
      setPeer(null)
      setError(null)
    }
  }, [userId])

  return { peer, isReady, error }
}
