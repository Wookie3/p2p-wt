export interface Profile {
  id: string
  username: string
  is_online: boolean
  peer_id?: string
  created_at: string
}

export interface Contact {
  id: string
  user_id: string
  contact_id: string
  contact: Profile
  created_at: string
}

export interface FriendRequest {
  id: string
  from_user_id: string
  to_user_id: string
  status: 'pending' | 'accepted' | 'rejected'
  from_user: Profile
  to_user: Profile
  created_at: string
}

export interface User {
  id: string
  username: string
  is_online: boolean
  peer_id?: string
  session_expires_at?: Date
}
