import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const health = {
    status: 'healthy' as 'healthy' | 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown' as 'healthy' | 'unhealthy' | 'unknown',
      realtime: 'unknown' as 'healthy' | 'unhealthy' | 'unknown'
    }
  }

  try {
    // Check database
    const { error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    health.services.database = dbError ? 'unhealthy' : 'healthy'

    // Check realtime
    const testChannel = supabase.channel('health-check')
    await new Promise((resolve) => {
      testChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          health.services.realtime = 'healthy'
          resolve(true)
        } else if (status === 'CHANNEL_ERROR') {
          health.services.realtime = 'unhealthy'
          resolve(true)
        }
      })
    })
    testChannel.unsubscribe()
  } catch (error) {
    health.status = 'unhealthy'
    console.error('Health check error:', error)
  }

  const isHealthy = Object.values(health.services).every(
    service => service === 'healthy'
  )

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503
  })
}
