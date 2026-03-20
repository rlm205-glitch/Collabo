import { useState } from 'react';
import type { Project } from '../App';
import { X, Calendar, Clock, Mail, Tag, User, RefreshCw, ArrowLeft } from 'lucide-react';

interface ProjectDetailsModalProps {
  project: Project;
  isOwner: boolean;
  onClose: () => void;
  onJoin: (projectId: string, message: string) => Promise<boolean>;
}

export function ProjectDetailsModal({ project, isOwner, onClose, onJoin }: ProjectDetailsModalProps) {
  const [view, setView] = useState<'details' | 'join-request'>('details');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSubmitRequest = async () => {
    setSubmitting(true);
    const success = await onJoin(project.id, message);
    setSubmitting(false);
    if (success) {
      onClose();
    } else {
      alert('Failed to submit join request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          {view === 'join-request' ? (
            <button
              onClick={() => setView('details')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          ) : (
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {view === 'details' && (
          <div className="p-6 space-y-6">
            <div>
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                {project.projectType}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Posted by</p>
                  <p className="font-medium text-gray-900">{project.userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Time Commitment</p>
                  <p className="font-medium text-gray-900">{project.timeCommitment}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">
                    {project.creationTime ? formatDate(new Date(project.creationTime)) : formatDate(project.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Contact Method</p>
                  <p className="font-medium text-gray-900">{project.contactMethod}</p>
                </div>
              </div>

              {project.updatedTime && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-900">{formatDate(new Date(project.updatedTime))}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">Project Description</h3>
              <p className="whitespace-pre-wrap text-gray-700">
                {project.fullDescription || project.description}
              </p>
            </div>

            {project.preferredSkills.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Preferred Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.preferredSkills.map((skill, index) => (
                    <span key={index} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              {isOwner ? (
                <div className="text-center">
                  <span className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                    Your Project
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setView('join-request')}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Request to Join
                  </button>
                  {project.contactInfo && (
                    <a
                      href={`mailto:${project.contactInfo}`}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      Contact via {project.contactMethod}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'join-request' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Request to Join</h2>
              <p className="text-gray-600 text-sm">{project.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to project owner
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the owner why you'd like to join and what you can contribute..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setView('details')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
