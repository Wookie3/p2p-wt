import { memo } from 'react'
import { Link } from 'next/link'

interface ContactItemProps {
  contact: {
    id: string
    contact: {
      id: string
      username: string
      is_online: boolean
    }
  }
  onCall: (username: string) => void
}

function ContactItem({ contact, onCall }: ContactItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-900">
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
        onClick={() => onCall(contact.contact.username)}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Call
      </button>
    </div>
  )
}

export const MemoizedContactItem = memo(ContactItem)
