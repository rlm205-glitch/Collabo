import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '../App';
import { ArrowLeft, Check, XCircle, User as UserIcon } from 'lucide-react';

interface JoinRequest {
  id: number;
  requester_id: number;
  requester_username: string;
  requester_first_name: string;
  requester_last_name: string;
  requester_email: string;
  message: string;
  created_at: string;
}

interface JoinRequestsPageProps {
  currentUser: User;
}

export function JoinRequestsPage({ currentUser: _currentUser }: JoinRequestsPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState('');
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMessages, setReplyMessages] = useState<Record<number, string>>({});

  useEffect(() => {
    // Fetch project title
    fetch('/project_management/get_project/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id) }),
    })
      .then(res => res.json())
      .then(data => { if (data.success) setProjectTitle(data.project.title); })
      .catch(console.error);

    // Fetch join requests
    fetch('/project_management/list_join_requests/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: Number(id) }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setRequests(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Join Requests</h1>
            {projectTitle && <p className="text-sm text-gray-500">{projectTitle}</p>}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-gray-500 text-center py-16">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No pending join requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-lg border border-gray-200 p-5">
                {/* Requester info */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <button
                      onClick={() => navigate(`/user/${req.requester_id}`)}
                      className="flex items-center gap-1.5 font-semibold text-blue-600 hover:underline"
                    >
                      <UserIcon className="w-4 h-4" />
                      {[req.requester_first_name, req.requester_last_name].filter(Boolean).join(' ') || req.requester_username}
                    </button>
                    <p className="text-sm text-gray-500 mt-0.5">{req.requester_email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Applicant message */}
                {req.message && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700 border border-gray-100">
                    {req.message}
                  </div>
                )}

                {/* Reply + actions */}
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
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={() => decide(req.id, 'rejected')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
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
  );
}
