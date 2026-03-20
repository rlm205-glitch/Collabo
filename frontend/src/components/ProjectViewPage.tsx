import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User, Project } from '../App';
import { ArrowLeft, Calendar, Clock, Mail, Tag, User as UserIcon, RefreshCw, Users } from 'lucide-react';

interface ProjectViewPageProps {
  currentUser: User;
}

export function ProjectViewPage({ currentUser }: ProjectViewPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/project_management/get_project/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id) }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const p = data.project;
          const fullName = [p.author_first_name, p.author_last_name].filter(Boolean).join(' ') || p.author;
          setProject({
            id: String(p.id),
            title: p.title,
            description: p.short_description || '',
            fullDescription: p.extended_description || '',
            userName: fullName,
            userEmail: p.author,
            userId: String(p.author_id),
            projectType: p.project_type || '',
            preferredSkills: p.preferred_skills || [],
            timeCommitment: p.workload_per_week || '',
            contactMethod: p.preferred_contact_method || '',
            contactInfo: p.contact_information || '',
            isActive: true,
            createdAt: p.creation_time ? new Date(p.creation_time) : new Date(),
            creationTime: p.creation_time || '',
            updatedTime: p.updated_time || '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const isOwner = project?.userId === currentUser.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Project not found.</p>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900 truncate">{project.title}</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Type badge */}
        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
          {project.projectType}
        </span>

        {/* Quick info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
            <UserIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Posted by</p>
              <button
                onClick={() => navigate(`/user/${project.userId}`)}
                className="font-medium text-blue-600 hover:underline"
              >
                {project.userName}
              </button>
            </div>
          </div>
          <InfoCard icon={<Clock className="w-5 h-5 text-gray-500" />} label="Time Commitment" value={project.timeCommitment} />
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-gray-500" />}
            label="Created"
            value={project.creationTime ? formatDate(new Date(project.creationTime)) : formatDate(project.createdAt)}
          />
          <InfoCard icon={<Mail className="w-5 h-5 text-gray-500" />} label="Contact Method" value={project.contactMethod} />
          {project.updatedTime && (
            <InfoCard icon={<RefreshCw className="w-5 h-5 text-gray-500" />} label="Last Updated" value={formatDate(new Date(project.updatedTime))} />
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-3">Project Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {project.fullDescription || project.description}
          </p>
        </div>

        {/* Skills */}
        {project.preferredSkills.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-3">Preferred Skills</h2>
            <div className="flex flex-wrap gap-2">
              {project.preferredSkills.map((skill, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  <Tag className="w-3.5 h-3.5" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col sm:flex-row gap-3">
          {isOwner ? (
            <button
              onClick={() => navigate(`/project/${project.id}/requests`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              View Join Requests
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate(`/project/${project.id}/join`)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
