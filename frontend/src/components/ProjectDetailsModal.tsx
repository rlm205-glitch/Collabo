import { useState } from 'react';
import type { Project } from '../App';
import { X, Calendar, Clock, Mail, Tag, User, UserPlus } from 'lucide-react';

interface ProjectDetailsModalProps {
  project: Project;
  isOwner: boolean;
  onClose: () => void;
  onJoin: (projectId: string) => Promise<boolean>;
}

export function ProjectDetailsModal({ project, isOwner, onClose, onJoin }: ProjectDetailsModalProps) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Type Badge */}
          <div>
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
              {project.projectType}
            </span>
          </div>

          {/* Quick Info */}
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
                <p className="text-xs text-gray-600">Posted On</p>
                <p className="font-medium text-gray-900">{formatDate(project.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Contact Method</p>
                <p className="font-medium text-gray-900">{project.contactMethod}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Project Description</h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">
                {project.fullDescription || project.description}
              </p>
            </div>
          </div>

          {/* Preferred Skills */}
          {project.preferredSkills.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Preferred Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.preferredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2"
                  >
                    <Tag className="w-4 h-4" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact & Join */}
          <div className="border-t border-gray-200 pt-6">
            {isOwner ? (
              <div className="text-center">
                <span className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                  Your Project
                </span>
              </div>
            ) : joined ? (
              <div className="text-center">
                <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                  Joined successfully!
                </span>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-900 mb-3">Interested in Collaborating?</h3>
                <p className="text-gray-600 mb-4">
                  Join this project to collaborate with {project.userName}.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={async () => {
                      setJoining(true);
                      const success = await onJoin(project.id);
                      setJoining(false);
                      if (success) {
                        setJoined(true);
                      } else {
                        alert('Failed to join project. Please try again.');
                      }
                    }}
                    disabled={joining}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>{joining ? 'Joining...' : 'Join Project'}</span>
                  </button>
                  {project.contactInfo && (
                    <a
                      href={`mailto:${project.contactInfo}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Contact via {project.contactMethod}</span>
                    </a>
                  )}
                </div>
                {project.contactInfo && (
                  <p className="text-sm text-gray-500 mt-2">
                    {project.contactInfo}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
