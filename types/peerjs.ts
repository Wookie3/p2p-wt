import { DataConnection } from 'peerjs'

export interface AudioChunkMessage {
  type: 'audio' | 'audio-chunk'
  audioData: ArrayBuffer
}

export interface CallSignalPayload {
  from: string
  peerId: string
}

export interface PeerConnectionData {
  conn: DataConnection
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
}
