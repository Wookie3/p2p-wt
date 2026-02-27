import { memo } from 'react'

interface FriendRequestItemProps {
  request: {
    id: string
    status: string
    from_user: {
      username: string
    }
  }
  onAccept: (requestId: string, fromUserId: string) => void
  onReject: (requestId: string) => void
}

function FriendRequestItem({ request, onAccept, onReject }: FriendRequestItemProps) {
  const handleAccept = () => onAccept(request.id, request.from_user.id)
  const handleReject = () => onReject(request.id)

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div>
        <p className="font-medium text-white">{request.from_user.username}</p>
        <p className="text-sm text-zinc-400">
          wants to add you as a contact
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="rounded-lg border border-zinc-700 px-4 py-2 font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          Reject
        </button>
      </div>
    </div>
  )
}

export const MemoizedFriendRequestItem = memo(FriendRequestItem)
