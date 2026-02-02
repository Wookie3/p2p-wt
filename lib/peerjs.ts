import Peer from 'peerjs'
import { supabase } from './supabase'

let peerInstance: Peer | null = null

export function createPeer(userId: string): Peer {
  if (peerInstance) {
    peerInstance.destroy()
  }

  peerInstance = new Peer(userId, {
    debug: 2
  })

  peerInstance.on('error', (err) => {
    console.error('PeerJS error:', err)
  })

  return peerInstance
}

export function getPeer(): Peer | null {
  return peerInstance
}

export function destroyPeer(): void {
  if (peerInstance) {
    peerInstance.destroy()
    peerInstance = null
  }
}

export async function updatePeerId(userId: string, peerId: string): Promise<void> {
  const { error } = await supabase
    // @ts-ignore
    .from('profiles')
    // @ts-ignore
    .update({ peer_id: peerId })
    .eq('id', userId)

  if (error) {
    console.error('Error updating peer_id:', error)
  }
}
