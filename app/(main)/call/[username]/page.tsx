'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AudioRecorder } from '@/lib/audio-recorder'
import { createPeer, getPeer, destroyPeer, updatePeerId } from '@/lib/peerjs'
import { useStore } from '@/store/useStore'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { sanitizeUsername } from '@/lib/validation'
import type { DataConnection } from 'peerjs'
import type { AudioChunkMessage } from '@/types/peerjs'

export default function CallPage() {
  const params = useParams()
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isTransmitting, setIsTransmitting] = useState(false)
  const [isReceiving, setIsReceiving] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const peerConnectionRef = useRef<DataConnection | null>(null)

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    initializeCall()
    return cleanup
  }, [])

  const initializeCall = async () => {
    if (!currentUser) return

    try {
      audioRecorderRef.current = new AudioRecorder()
      await audioRecorderRef.current.init()

      const peer = createPeer(currentUser.id)
      await updatePeerId(currentUser.id, peer.id)
    } catch (error) {

      peer.on('open', async (peerId) => {
        console.log('Peer opened with ID:', peerId)

        try {
          const response = await fetch(`/api/profiles/${params.username}`)
          if (response.ok) {
            const contactProfile = await response.json()

            // Signal the call via Supabase Realtime
            await supabase.signalCall(contactProfile.id, {
              from: currentUser.username,
              peerId: peerId
            })

            if (contactProfile?.peer_id) {
              connectToPeer(contactProfile.peer_id)
            }
          }
        } catch (error) {
          console.error('Error fetching contact profile:', error)
        }
      })

      peer.on('connection', async (conn) => {
        // Security: Verify incoming connection is from a known contact
        console.log('Incoming connection from:', conn.peer)

        // Verify peer is in contacts list before accepting connection
        const { data: contact } = await supabase
          .from('contacts')
          .select('contact_id')
          .eq('user_id', currentUser.id)
          .eq('contact_id', conn.peer)
          .maybeSingle()

        if (!contact) {
          console.warn('Rejecting unauthorized connection from:', conn.peer)
          conn.close()
          toast.error('Unauthorized connection attempt')
          return
        }

        peerConnectionRef.current = conn
        setupDataChannel(conn)
        setConnectionStatus('connected')
        setIsConnecting(false)
      })

      peer.on('call', (call) => {
        call.answer()
        call.on('stream', (stream) => {
          handleIncomingStream(stream)
        })
      })
    } catch (error) {
      console.error('Error initializing call:', error)
      toast.error('Failed to initialize call')
      setIsConnecting(false)
    }
  }

  const connectToPeer = (peerId: string) => {
    const peer = getPeer()
    if (!peer) return

    const conn = peer.connect(peerId)
    peerConnectionRef.current = conn

    conn.on('open', () => {
      console.log('Data connection established')
      setConnectionStatus('connected')
      setIsConnecting(false)
    })

    setupDataChannel(conn)
  }

  const setupDataChannel = (conn: DataConnection) => {
    conn.on('data', (data: AudioChunkMessage) => {
      if (data.type === 'audio' || data.type === 'audio-chunk') {
        playAudioChunk(data.audioData)
      }
    })
  }

  const handleIncomingStream = async (stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    // Resume context if suspended
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    const source = audioContextRef.current.createMediaStreamSource(stream)
    source.connect(audioContextRef.current.destination)
    setIsReceiving(true)
  }

  const playAudioChunk = async (audioData: ArrayBuffer) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    try {
      setIsReceiving(true)
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData.slice(0))
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.start()

      source.onended = () => {
        setIsReceiving(false)
      }
    } catch (error) {
      console.error('Error playing audio chunk:', error)
      setIsReceiving(false)
    }
  }

  const handlePTTStart = async () => {
    if (!audioRecorderRef.current || !peerConnectionRef.current) return

    try {
      await audioRecorderRef.current.startRecording(async (chunk) => {
        const audioArrayBuffer = await chunk.arrayBuffer()
        if (peerConnectionRef.current?.open) {
          peerConnectionRef.current.send({
            type: 'audio-chunk',
            audioData: audioArrayBuffer
          })
        }
      })
      setIsTransmitting(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording')
    }
  }

  const handlePTTEnd = async () => {
    if (!audioRecorderRef.current || !peerConnectionRef.current) return

    try {
      await audioRecorderRef.current.stopRecording()
      setIsTransmitting(false)
    } catch (error) {
      console.error('Error stopping recording:', error)
      setIsTransmitting(false)
    }
  }

  const cleanup = () => {
    // Close AudioContext properly to prevent memory leaks
    if (audioContextRef.current?.state === 'running') {
      audioContextRef.current.close()
    }
    audioContextRef.current = null

    // Destroy audio recorder
    if (audioRecorderRef.current) {
      audioRecorderRef.current.destroy()
    }

    // Destroy peer connection
    destroyPeer()
  }

  const handleEndCall = () => {
    cleanup()
    router.push('/contacts')
  }

  if (isConnecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-zinc-400">Connecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-8">
    <div className="mb-8 text-center">
      <h1 className="mb-2 text-3xl font-bold text-white">
        Talking with {sanitizeUsername(params.username)}
      </h1>
      <p className="text-zinc-400">
        {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
      </p>
    </div>

      {isReceiving && (
        <div className="mb-8 flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-sm font-medium text-green-400">Receiving...</span>
        </div>
      )}

      <button
        onMouseDown={handlePTTStart}
        onMouseUp={handlePTTEnd}
        onMouseLeave={handlePTTEnd}
        onTouchStart={handlePTTStart}
        onTouchEnd={handlePTTEnd}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            handlePTTStart()
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            handlePTTEnd()
          }
        }}
        disabled={connectionStatus !== 'connected'}
        aria-label={isTransmitting ? 'Release to stop talking' : 'Press and hold to talk'}
        aria-pressed={isTransmitting}
        role="button"
        className={`mb-8 h-32 w-32 rounded-full text-lg font-bold text-white transition-all ${
          isTransmitting
            ? 'h-40 w-40 scale-110 bg-red-600'
            : 'bg-red-500 hover:bg-red-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isTransmitting ? 'Release' : 'Hold to Talk'}
      </button>

      <button
        onClick={handleEndCall}
        className="rounded-lg border border-red-500 px-6 py-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
      >
        End Call
      </button>
    </div>
  )
}
