import { useState } from 'react';
import type { User, Project } from '../App';
import { Search, Filter, Plus, UserCircle, LogOut } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { UserProfileModal } from './UserProfileModal';

interface StudentDashboardProps {
  currentUser: User;
  projects: Project[];
  users: User[];
  onLogout: () => void;
  onUpdateProfile: (user: User) => void;
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
  onReportProject: (projectId: string, reason: string) => void;
  onGetProjectDetails: (projectId: string) => Promise<Project | null>;
  onJoinProject: (projectId: string) => Promise<boolean>;
}

export function StudentDashboard({
  currentUser,
  projects,
  users,
  onLogout,
  onUpdateProfile,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onReportProject,
  onGetProjectDetails,
  onJoinProject,
}: StudentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedCommitment, setSelectedCommitment] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<'default' | 'best'>('default');

  // Get unique project types and skills for filters
  const projectTypes = ['All', ...Array.from(new Set(projects.map(p => p.projectType)))];
  const allSkills = ['All', ...Array.from(new Set(projects.flatMap(p => p.preferredSkills)))];
  const commitmentLevels = ['All', '5-8 hours/week', '5-10 hours/week', '10-15 hours/week', '15+ hours/week'];

  // Filter projects
  const filteredProjects = projects.filter(project => {
    if (!project.isActive) return false;

    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedProjectType === 'All' || project.projectType === selectedProjectType;
    const matchesSkill = selectedSkill === 'All' || project.preferredSkills.includes(selectedSkill);
    const matchesCommitment = selectedCommitment === 'All' || project.timeCommitment === selectedCommitment;

    return matchesSearch && matchesType && matchesSkill && matchesCommitment;
  });

  // --- Best Match scoring + sorting ---
  const normalize = (s: string) => s.toLowerCase().trim();

  const mySkills = (currentUser.skills ?? []).map(normalize);
  const myInterests = (currentUser.interests ?? []).map(normalize);

  const scoreProject = (project: Project) => {
  let score = 0;

  const projectSkills = (project.preferredSkills ?? []).map(normalize);

  // count how many skills match
  const skillMatches = projectSkills.filter(s => mySkills.includes(s)).length;
  score += skillMatches * 3;

  // count how many interests appear in the project text
  const text = normalize(project.title + ' ' + project.description);
  const interestMatches = myInterests.filter(i => i && text.includes(i)).length;
  score += interestMatches * 2;

  return score;
};

  const displayedProjects =
    sortOption === 'best'
      ? [...filteredProjects].sort((a, b) => scoreProject(b) - scoreProject(a))
      : filteredProjects;

  const myProjects = projects.filter(p => p.userName === currentUser.email && p.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CWRU Collaboration Platform</h1>
            <p className="text-sm text-gray-600">Welcome back, {currentUser.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <UserCircle className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* My Projects Section */}
        {myProjects.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Active Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentUser={currentUser}
                  isOwner={true}
                  onEdit={(updates) => onUpdateProject(project.id, updates)}
                  onDelete={() => onDeleteProject(project.id)}
                  onReport={onReportProject}
                  onGetProjectDetails={onGetProjectDetails}
                  onJoinProject={onJoinProject}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search and Create Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg">
            <label htmlFor="sortOption" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Sort by
            </label>
            <select
              id="sortOption"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'default' | 'best')}
              className="text-sm text-gray-700 bg-transparent focus:outline-none"
            >
              <option value="default">Default</option>
              <option value="best">Best Match</option>
            </select>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Project</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-medium text-gray-900 mb-4">Filter Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                <select
                  value={selectedProjectType}
                  onChange={(e) => setSelectedProjectType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {projectTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Skill</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Commitment</label>
                <select
                  value={selectedCommitment}
                  onChange={(e) => setSelectedCommitment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {commitmentLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Available Projects ({displayedProjects.length})
          </h2>
          {displayedProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">No projects found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentUser={currentUser}
                  isOwner={project.userName === currentUser.email}
                  onEdit={(updates) => onUpdateProject(project.id, updates)}
                  onDelete={() => onDeleteProject(project.id)}
                  onReport={onReportProject}
                  onGetProjectDetails={onGetProjectDetails}
                  onJoinProject={onJoinProject}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onSubmit={onAddProject}
        />
      )}

      {showProfileModal && (
        <UserProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onSave={onUpdateProfile}
        />
      )}
    </div>
  );
}