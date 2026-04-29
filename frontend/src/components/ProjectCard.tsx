/**
 * @file ProjectCard.tsx
 * @description Displays a summary card for a single project with options to view details,
 * edit (if owner), report, or delete.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project, User } from '../App';
import { Calendar, Clock, Edit2, Trash2, Flag, AlertCircle, Users } from 'lucide-react';
import { EditProjectModal } from './EditProjectModal';

/** Props for the ProjectCard component. */
interface ProjectCardProps {
  project: Project;
  currentUser: User;
  isOwner: boolean;
  onEdit: (updates: Partial<Project>) => void;
  onDelete: () => void;
  onReport: (
    projectId: string,
    reason: 'spam' | 'inappropriate' | 'misleading' | 'harassment' | 'other',
    description?: string
  ) => void;
  onGetProjectDetails: (projectId: string) => Promise<Project | null>;
}

/**
 * Card component showing project summary info. Fetches full project details
 * lazily on first expand. Owners see Edit/Delete controls; others see Report.
 */
export function ProjectCard({ project, isOwner, onEdit, onDelete, onReport, onGetProjectDetails }: ProjectCardProps) {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [detailedProject, setDetailedProject] = useState<Project | null>(null);
  const [reportCategory, setReportCategory] = useState<'spam' | 'inappropriate' | 'misleading' | 'harassment' | 'other'>('other');
  const [reportDescription, setReportDescription] = useState('');

  const handleReport = () => {
    onReport(project.id, reportCategory, reportDescription);
    setShowReportModal(false);
    setReportCategory('other');
    setReportDescription('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const daysSincePosted = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const needsRefresh = daysSincePosted > 30;

  const handleEditClick = async () => {
    const details = await onGetProjectDetails(project.id);
    if (details) {
      setDetailedProject(details);
      setShowEditModal(true);
    }
  };

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
                onClick={handleEditClick}
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

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>

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
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
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
          <div className="flex items-center gap-2">
            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex-1 justify-center"
                >
                  <span>View Project</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/project/${project.id}/requests`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex-1 justify-center"
                >
                  <Users className="w-4 h-4" />
                  <span>View Join Requests</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex-1 justify-center"
                >
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Report project"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && detailedProject && (
        <EditProjectModal
          project={detailedProject}
          onClose={() => { setShowEditModal(false); setDetailedProject(null); }}
          onSave={onEdit}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Report Project</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a reason and optionally add more details. Administrators will review your report.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value as typeof reportCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            >
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate</option>
              <option value="misleading">Misleading</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional details (optional)</label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Add more detail if needed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReportModal(false); setReportCategory('other'); setReportDescription(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
