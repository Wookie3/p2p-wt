'use client'

import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function RequestsPage() {
  const friendRequests = useStore((state) => state.friendRequests)
  const updateFriendRequestStatus = useStore((state) => state.updateFriendRequestStatus)
  const removeFriendRequest = useStore((state) => state.removeFriendRequest)
  const addContact = useStore((state) => state.addContact)
  const currentUser = useStore((state) => state.currentUser)

  const handleAccept = async (requestId: string, fromUserId: string) => {
    if (!currentUser) return

    try {
      // Use atomic RPC function for friend acceptance
      const { error } = await supabase.rpc('accept_friend_request', {
        request_id: requestId,
        current_user_id: currentUser.id,
        from_user_id: fromUserId
      })

      if (error) throw error

      updateFriendRequestStatus(requestId, 'accepted')
      toast.success('Friend request accepted!')
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Failed to accept request')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) throw error

      updateFriendRequestStatus(requestId, 'rejected')
      toast.success('Friend request rejected')
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject request')
    }
  }

  const pendingRequests = friendRequests.filter(
    (r) => r.status === 'pending' && r.to_user_id === currentUser?.id
  )

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Friend Requests</h1>

      {pendingRequests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-700 p-12 text-center">
          <p className="text-zinc-400">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div>
                <p className="font-medium text-white">{request.from_user.username}</p>
                <p className="text-sm text-zinc-400">
                  wants to add you as a contact
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAccept(request.id, request.from_user_id)}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="rounded-lg border border-zinc-700 px-4 py-2 font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
