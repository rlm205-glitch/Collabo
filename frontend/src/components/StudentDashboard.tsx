import { useState } from 'react';
import type { User, Project } from '../App';
import { Search, Filter, Plus, UserCircle, LogOut, MessageSquare, X, Send, Bot } from 'lucide-react';
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
  onReportProject: (projectId: string, reason: 'spam' | 'inappropriate' | 'misleading' | 'harassment' | 'other', description?: string) => void;
  onGetProjectDetails: (projectId: string) => Promise<Project | null>;
  onSendLlmMessage: (query: string) => Promise<string>;
}

export function StudentDashboard({
  currentUser,
  projects,
  onLogout,
  onUpdateProfile,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onReportProject,
  onGetProjectDetails,
  onSendLlmMessage,
}: StudentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedCommitment, setSelectedCommitment] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<'default' | 'best'>('default');

  // LLM chat assistant state
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);

  const sendChatMessage = async () => {
    const query = chatInput.trim();
    if (!query || chatLoading) return;

    setChatMessages(prev => [...prev, { role: 'user', text: query }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await onSendLlmMessage(query);
      setChatMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

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

  const mySkills = (currentUser.skills ?? []).map(normalize);             // get skills from current user
  const myInterests = (currentUser.interests ?? []).map(normalize);       // get interests

  const scoreProject = (project: Project) => {                            // takes one project and calculates how good a match it is for the user
    let score = 0;

    const projectSkills = (project.preferredSkills ?? []).map(normalize);

    /*
      +3 for EACH matching skill (strong signal)
      - counts how many skills overlap, not just "any match"
    */
    const matchingSkills = projectSkills.filter(s => mySkills.includes(s)).length;
    score += matchingSkills * 3;

    const title = normalize(project.title ?? '');
    const description = normalize(project.description ?? '');

    /*
      +2 if interest appears in title (stronger signal)
      +1 if interest appears in description (weaker signal)
    */
    for (const i of myInterests) {
      if (!i) continue;

      if (title.includes(i)) {
        score += 2;
      } else if (description.includes(i)) {
        score += 1;
      }
    }

    return score;
  };

  const displayedProjects =                                             // if sortOption == 'best' then displayedProjects will equal filteredProjects with sorting applied, else just normal filteredProjects
    sortOption === 'best'                                               // displayedProjects takes all the filtered projects and applies the sorting so displayedProjects is a list of the sorted projects
      ? [...filteredProjects].sort((a, b) => {
        const scoreDiff = scoreProject(b) - scoreProject(a);

        // higher score comes first
        if (scoreDiff !== 0) return scoreDiff;

        // tie-breaker: newer projects first (prevents random ordering)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      : filteredProjects;

  const myProjects = projects.filter(p =>
    p.isActive && (p.userId === currentUser.id || p.memberIds?.includes(currentUser.id))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CWRU Collaboration Platform</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {currentUser.first_name} {currentUser.last_name}
            </p>
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
                  isOwner={project.userId === currentUser.id}
                  onEdit={(updates) => onUpdateProject(project.id, updates)}
                  onDelete={() => onDeleteProject(project.id)}
                  onReport={onReportProject}
                  onGetProjectDetails={onGetProjectDetails}
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
                  isOwner={project.userId === currentUser.id}
                  onEdit={(updates) => onUpdateProject(project.id, updates)}
                  onDelete={() => onDeleteProject(project.id)}
                  onReport={onReportProject}
                  onGetProjectDetails={onGetProjectDetails}
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

      {/* LLM Chat Assistant */}
      {showChat && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col" style={{ height: '420px' }}>
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 rounded-t-xl">
            <div className="flex items-center gap-2 text-white">
              <Bot className="w-4 h-4" />
              <span className="font-semibold text-sm">AI Assistant</span>
            </div>
            <button onClick={() => setShowChat(false)} className="text-white hover:text-blue-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {chatMessages.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-4">Ask anything about projects, teammates, your preferences, or get personalized recommendations.</p>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-sm rounded-bl-none">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage(); }}
                placeholder="Ask something…"
                className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={chatLoading}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating chat toggle button */}
      <button
        onClick={() => setShowChat(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle AI Assistant"
      >
        {showChat ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>
    </div>
  );
}