import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { CallSignalPayload } from '@/types/peerjs'
import { logger } from './logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Server-side: Create new instance for each request (serverless-optimized)
// Client-side: Use singleton
let clientSideInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  }

  // Server-side: Create new instance
  if (typeof window === 'undefined') {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      db: {
        schema: 'public'
      }
    })
  }

  // Client-side: Use singleton
  if (!clientSideInstance) {
    clientSideInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'p2p-wt-auth'
      }
    })
  }

  return clientSideInstance
}

export function subscribeToCalls(userId: string, onCall: (payload: CallSignalPayload) => void) {
  const channel = getSupabase().channel(`calls:${userId}`)

  channel
    .on('broadcast', { event: 'incoming-call' }, (payload) => {
      onCall(payload)
    })
    .subscribe()

  logger.debug('Subscribed to call channel', { userId })

  return channel
}

export async function signalCall(targetUserId: string, payload: CallSignalPayload): Promise<boolean> {
  try {
    // Check if user is online first
    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('is_online, peer_id')
      .eq('id', targetUserId)
      .maybeSingle()

    if (!profile?.is_online || !profile?.peer_id) {
      logger.warn('Cannot call offline user', { targetUserId })
      return false
    }

    const channel = getSupabase().channel(`calls:${targetUserId}`)
    let delivered = false

    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const timeout = setTimeout(() => {
          if (!delivered) {
            logger.warn('Call signal not delivered, timeout', { targetUserId })
            channel.unsubscribe()
          }
        }, 5000) // 5 second timeout

        await channel.send({
          type: 'broadcast',
          event: 'incoming-call',
          payload
        })

        // Listen for acknowledgment
        channel.on('broadcast', { event: 'call-ack' }, () => {
          delivered = true
          clearTimeout(timeout)
          logger.debug('Call signal delivered', { targetUserId })
        })
      }
    })

    return delivered
  } catch (error) {
    logger.error('Error signaling call', error, { targetUserId })
    return false
  }
}

export const supabase = getSupabase()
