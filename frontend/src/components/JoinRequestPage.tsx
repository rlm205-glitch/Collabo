import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function JoinRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/project_management/get_project/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id) }),
    })
      .then(res => res.json())
      .then(data => { if (data.success) setProjectTitle(data.project.title); })
      .catch(console.error);
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/project_management/join_project/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: Number(id), message }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/');
      } else {
        alert(data.error || 'Failed to submit request.');
      }
    } catch {
      alert('Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(`/project/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Request to Join</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          {projectTitle && (
            <p className="text-gray-500 text-sm">
              Requesting to join: <span className="font-medium text-gray-900">{projectTitle}</span>
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to project owner
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the owner why you'd like to join and what you can contribute..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/project/${id}`)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
