'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Contact } from '@/types'
import { validateUsername } from '@/lib/validation'

export default function ContactsPage() {
  const router = useRouter()
  const contacts = useStore((state) => state.contacts)
  const setContacts = useStore((state) => state.setContacts)
  const addContact = useStore((state) => state.addContact)
  const currentUser = useStore((state) => state.currentUser)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadContacts() {
      if (!currentUser) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*, contact:contact_id(*)')
          .eq('user_id', currentUser.id)

        if (error) throw error
        setContacts(data || [])
      } catch (error) {
        console.error('Error loading contacts:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadContacts()
  }, [currentUser?.id])

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    const validation = validateUsername(searchQuery)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setIsSearching(true)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, contacts!inner(user_id)')
        .ilike('username', `${validation.sanitized}%`)
        .limit(10)

      if (error) throw error

      if (!data || !data.length) {
        toast('No users found', { icon: '🔍' })
      } else {
        toast.success(`Found ${data.length} user(s)`)
      }
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async (contactId: string) => {
    if (!currentUser) return

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          from_user_id: currentUser.id,
          to_user_id: contactId,
          status: 'pending'
        })

      if (error) throw error

      toast.success('Friend request sent!')
    } catch (error) {
      console.error('Error sending request:', error)
      toast.error('Failed to send request')
    }
  }

  const handleCall = (username: string) => {
    router.push(`/call/${username}`)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-white">Contacts</h1>
        
        <form onSubmit={handleSearchUser} className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-700 p-12 text-center">
          <p className="text-zinc-400">No contacts yet</p>
          <p className="mt-2 text-sm text-zinc-500">Search for users to add them as contacts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-900"
            >
              <div className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${contact.contact.is_online ? 'bg-green-500' : 'bg-zinc-500'}`} />
                <div>
                  <p className="font-medium text-white">{contact.contact.username}</p>
                  <p className="text-sm text-zinc-400">
                    {contact.contact.is_online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleCall(contact.contact.username)}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Call
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
