import { useEffect, useState } from 'react'
import type { Peer } from 'peerjs'

type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor'

interface ConnectionStats {
  packetLoss?: number
  latency?: number
  bandwidth?: number
}

export function useConnectionQuality(peer: Peer | null) {
  const [quality, setQuality] = useState<ConnectionQuality>('good')
  const [stats, setStats] = useState<ConnectionStats>({})

  useEffect(() => {
    if (!peer) return

    const interval = setInterval(async () => {
      try {
        const peerStats = await peer.getStats()

        // Analyze statistics
        const q = calculateQuality(peerStats)
        setQuality(q)

        // Extract metrics
        const connectionStats = extractStats(peerStats)
        setStats(connectionStats)
      } catch (error) {
        console.error('Error getting connection stats:', error)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [peer])

  return { quality, stats }
}

function calculateQuality(peerStats: any): ConnectionQuality {
  // Analyze packet loss and latency from RTCStats
  let packetLoss = 0
  let latency = 0

  // Try to find relevant stats
  for (const report of Object.values(peerStats)) {
    if (report.type === 'outbound-rtp' && report.packetsLost !== undefined) {
      const total = report.packetsSent || report.packetsReceived || 1
      packetLoss = Math.max(packetLoss, (report.packetsLost / total) * 100)
    }

    if (report.type === 'candidate-pair' && report.currentRoundTripTime !== undefined) {
      latency = Math.round(report.currentRoundTripTime)
    }
  }

  // Determine quality based on metrics
  if (packetLoss < 1 && latency < 50) return 'excellent'
  if (packetLoss < 3 && latency < 100) return 'good'
  if (packetLoss < 5 && latency < 200) return 'fair'
  return 'poor'
}

function extractStats(peerStats: any): ConnectionStats {
  const stats: ConnectionStats = {}

  for (const report of Object.values(peerStats)) {
    if (report.type === 'outbound-rtp') {
      const total = report.packetsSent || 1
      stats.packetLoss = ((report.packetsLost || 0) / total) * 100
    }

    if (report.type === 'candidate-pair') {
      stats.latency = Math.round(report.currentRoundTripTime || 0)
    }
  }

  return stats
}
