import Peer from 'peerjs'
import { supabase } from './supabase'

let peerInstance: Peer | null = null

export function createPeer(userId: string): Peer {
  if (peerInstance) {
    peerInstance.destroy()
  }

  // Security: Generate secure random peer ID without user ID component
  const securePeerId = `p2p_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`

  peerInstance = new Peer(securePeerId, {
    debug: 2,
    config: {
      'iceServers': [
        { 'urls': 'stun:stun.l.google.com:19302' },
        { 'urls': 'stun:stun1.l.google.com:19302' },
        { 'urls': 'stun:stun2.l.google.com:19302' },
        { 'urls': 'stun:stun3.l.google.com:19302' },
        { 'urls': 'stun:stun4.l.google.com:19302' },
      ],
      'sdpSemantics': 'unified-plan'
    }
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
    .from('profiles')
    .update({ peer_id: peerId })
    .eq('id', userId)

  if (error) {
    console.error('Error updating peer_id:', error)
  }
}
