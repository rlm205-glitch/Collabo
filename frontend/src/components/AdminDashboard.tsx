/**
 * @file AdminDashboard.tsx
 * @description Admin-only dashboard for moderating projects, viewing reports, and managing users.
 */

import { useState } from 'react';
import type { User, Project, Report } from '../App';
import { Shield, LogOut, AlertTriangle, Trash2, Users } from 'lucide-react';

/** Props for the AdminDashboard component. */
interface AdminDashboardProps {
  currentUser: User;
  projects: Project[];
  reports: Report[];
  users: User[];
  onLogout: () => void;
  onDeleteProject: (projectId: string) => void;
}

/**
 * Admin dashboard with tabs for Reports, Projects, and Users.
 * Allows staff to review flagged content and delete projects.
 */
export function AdminDashboard({
  projects,
  reports,
  users,
  onLogout,
  onDeleteProject,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'reports' | 'users'>('reports');

  const reportedProjects = projects.filter(p => 
    reports.some(r => r.projectId === p.id)
  );

  const getReportsForProject = (projectId: string) => {
    return reports.filter(r => r.projectId === projectId);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to permanently delete this project?')) {
      onDeleteProject(projectId);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Content Moderation & User Management</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Reports</p>
                <p className="text-3xl font-bold text-red-600">{reports.length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'reports'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Reported Projects ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'projects'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                All Projects ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Users ({users.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending reports</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportedProjects.map(project => {
                      const projectReports = getReportsForProject(project.id);
                      return (
                        <div key={project.id} className="border border-red-200 rounded-lg p-6 bg-red-50">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg mb-2">{project.title}</h3>
                              <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span><strong>Posted by:</strong> {project.userName}</span>
                                <span><strong>Email:</strong> {project.userEmail}</span>
                                <span><strong>Type:</strong> {project.projectType}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="border-t border-red-200 pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                              Reports ({projectReports.length}):
                            </p>
                            <div className="space-y-2">
                              {projectReports.map(report => (
                                <div key={report.id} className="bg-white rounded p-3 text-sm">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-gray-700">
                                      Reported by: {report.reportedBy}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {formatDate(report.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-gray-600"><strong>Reason:</strong> {report.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* All Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No projects yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => (
                      <div key={project.id} className={`border rounded-lg p-6 ${
                        project.isActive ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-100'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900 text-lg">{project.title}</h3>
                              {!project.isActive && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span><strong>By:</strong> {project.userName}</span>
                              <span><strong>Type:</strong> {project.projectType}</span>
                              <span><strong>Posted:</strong> {formatDate(project.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900">{user.first_name} {user.last_name}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${
                              user.role === 'admin'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Email:</strong> {user.email}</p>
                            {user.major && <p><strong>Major:</strong> {user.major}</p>}
                            {user.skills && user.skills.length > 0 && (
                              <p><strong>Skills:</strong> {user.skills.join(', ')}</p>
                            )}
                            <p><strong>Joined:</strong> {formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
