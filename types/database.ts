export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string | null
          username: string
          is_online: boolean
          peer_id: string | null
          in_call_with: string | null
          last_seen: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          username: string
          is_online?: boolean
          peer_id?: string | null
          in_call_with?: string | null
          last_seen?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          username?: string
          is_online?: boolean
          peer_id?: string | null
          in_call_with?: string | null
          last_seen?: string
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          contact_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string
          created_at?: string
        }
      }
      friend_requests: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
      }
    }
    Views: {
      profiles_public: {
        Row: {
          id: string
          username: string
          is_online: boolean
          last_seen: string
          created_at: string
        }
      }
    }
    Functions: {
      accept_friend_request: {
        Args: {
          request_id: string
          current_user_id: string
          from_user_id: string
        }
        Returns: void
      }
    }
  }
}
