import { useState } from 'react';
import type { Project, User } from '../App';
import { Calendar, Clock, Mail, Edit2, Trash2, Flag, ExternalLink, AlertCircle } from 'lucide-react';
import { EditProjectModal } from './EditProjectModal';
import { ProjectDetailsModal } from './ProjectDetailsModal';

interface ProjectCardProps {
  project: Project;
  currentUser: User;
  isOwner: boolean;
  onEdit: (updates: Partial<Project>) => void;
  onDelete: () => void;
  onReport: (projectId: string, reason: string) => void;
}

export function ProjectCard({ project, currentUser, isOwner, onEdit, onDelete, onReport }: ProjectCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [joinMessage, setJoinMessage] = useState("");

  const handleReport = () => {
    if (reportReason.trim()) {
      onReport(project.id, reportReason);
      setShowReportModal(false);
      setReportReason('');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate days since posted
  const daysSincePosted = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const needsRefresh = daysSincePosted > 30;

  const handleRefreshPost = () => {
    onEdit({ createdAt: new Date() });
    alert('Your project post has been refreshed!');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        {isOwner && needsRefresh && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 mb-2">
                  This project has been active for over 30 days. Refresh it to keep it visible?
                </p>
                <button
                  onClick={handleRefreshPost}
                  className="text-sm px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Refresh Post
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-gray-900 text-lg">{project.title}</h3>
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="Edit project"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
            {project.projectType}
          </span>
        </div>

        <div
          onClick={() => setShowDetailsModal(true)}
          className="cursor-pointer"
        >
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 hover:text-gray-800 transition-colors">
            {project.description}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{project.timeCommitment}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Posted {formatDate(project.createdAt)}</span>
          </div>
        </div>

        {project.preferredSkills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700 mb-2">Preferred Skills:</p>
            <div className="flex flex-wrap gap-2">
              {project.preferredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Posted by:</strong> {project.userName}
          </p>
          <div className="flex items-center justify-between gap-2">
            {isOwner ? (
              <div className="flex justify-center w-full">
                <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  Your Project
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex-1 justify-center"
                >
                  <span>Request to Join</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Report project"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Edit Modal */}
      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSave={onEdit}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Report Project</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please explain why you're reporting this project. Administrators will review your report.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div
          className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowJoinModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Request to Join
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Your request will be sent to{" "}
              <span className="font-medium">{project.userName}</span>.
            </p>

            {/* Profile Preview */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-800">
                Profile Info (will be included)
              </h4>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-gray-500">Major</p>
                  <p className="font-medium">{currentUser.major || "Not set"}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-gray-500">Skills</p>
                  <p className="font-medium">
                   {currentUser?.skills && currentUser.skills.length > 0 ? currentUser.skills.join(", ") : "Not set"}                
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-gray-500">Interests</p>
                  <p className="font-medium">
                    {currentUser?.interests && currentUser.interests?.length > 0
                      ? currentUser.interests.join(", ")
                      : "Not set"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-gray-500">Availability</p>
                  <p className="font-medium">
                    {currentUser.availability || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Message Box */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Message (optional)
              </label>
              <textarea
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="Hi! I'd love to join because..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinMessage("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  // UI-only mock submit
                  alert("Join request submitted (mock).");
                  setShowJoinModal(false);
                  setJoinMessage("");
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Details Modal */}
      {showDetailsModal && (
        <ProjectDetailsModal
          project={project}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}