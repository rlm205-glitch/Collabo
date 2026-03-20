import { useState, useEffect } from 'react';
import { X, Check, XCircle, User } from 'lucide-react';
import { UserProfileViewModal } from './UserProfileViewModal';

interface JoinRequest {
  id: number;
  requester_id: number;
  requester_username: string;
  requester_email: string;
  message: string;
  created_at: string;
  status: string;
}

interface JoinRequestsModalProps {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
}

export function JoinRequestsModal({ projectId, projectTitle, onClose }: JoinRequestsModalProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMessages, setReplyMessages] = useState<Record<number, string>>({});
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/project_management/list_join_requests/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: Number(projectId) }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setRequests(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const decide = async (requestId: number, decision: 'approved' | 'rejected') => {
    const res = await fetch('/project_management/decide_join_request/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        join_request_id: requestId,
        decision,
        reply_message: replyMessages[requestId] || '',
      }),
    });
    const data = await res.json();
    if (data.success) {
      setRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Join Requests — {projectTitle}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending join requests.</p>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <button
                        onClick={() => setViewingUserId(req.requester_id)}
                        className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <User className="w-4 h-4" />
                        {req.requester_username}
                      </button>
                      <p className="text-sm text-gray-500">{req.requester_email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {req.message && (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 mb-3">{req.message}</p>
                  )}

                  <textarea
                    value={replyMessages[req.id] || ''}
                    onChange={e => setReplyMessages(prev => ({ ...prev, [req.id]: e.target.value }))}
                    placeholder="Optional Reply"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => decide(req.id, 'approved')}
                      className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => decide(req.id, 'rejected')}
                      className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewingUserId !== null && (
        <UserProfileViewModal
          userId={viewingUserId}
          onClose={() => setViewingUserId(null)}
        />
      )}
    </div>
  );
}
