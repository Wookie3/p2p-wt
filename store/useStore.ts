import { create } from 'zustand'
import { User, Contact, FriendRequest } from '@/types'

interface AppState {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  contacts: Contact[]
  setContacts: (contacts: Contact[]) => void
  addContact: (contact: Contact) => void
  removeContact: (contactId: string) => void
  friendRequests: FriendRequest[]
  setFriendRequests: (requests: FriendRequest[]) => void
  addFriendRequest: (request: FriendRequest) => void
  updateFriendRequestStatus: (requestId: string, status: 'accepted' | 'rejected') => void
  removeFriendRequest: (requestId: string) => void
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
  
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  addContact: (contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
  removeContact: (contactId) => set((state) => ({
    contacts: state.contacts.filter((c) => c.contact_id !== contactId)
  })),
  
  friendRequests: [],
  setFriendRequests: (friendRequests) => set({ friendRequests }),
  addFriendRequest: (request) => set((state) => ({
    friendRequests: [...state.friendRequests, request]
  })),
  updateFriendRequestStatus: (requestId, status) => set((state) => ({
    friendRequests: state.friendRequests.map((r) =>
      r.id === requestId ? { ...r, status } : r
    )
  })),
  removeFriendRequest: (requestId) => set((state) => ({
    friendRequests: state.friendRequests.filter((r) => r.id !== requestId)
  }))
}))
