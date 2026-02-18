import { useState } from 'react';
import type { User, Project } from '../App';
import { X } from 'lucide-react';

interface CreateProjectModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'createdAt'>) => void;
}

export function CreateProjectModal({ currentUser, onClose, onSubmit }: CreateProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [projectType, setProjectType] = useState('Research');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('5-10 hours/week');
  const [contactMethod, setContactMethod] = useState('Email');
  const [contactInfo, setContactInfo] = useState(currentUser.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const skillsArray = preferredSkills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    onSubmit({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      title,
      description,
      fullDescription: fullDescription || description,
      projectType,
      preferredSkills: skillsArray,
      timeCommitment,
      contactMethod,
      contactInfo,
      isActive: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AI-Powered Study Companion App"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project and what kind of collaborators you're looking for..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Full Project Description (optional)
            </label>
            <textarea
              id="fullDescription"
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Provide a more detailed description of your project..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                Project Type *
              </label>
              <select
                id="projectType"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Research</option>
                <option>Web Development</option>
                <option>Mobile App</option>
                <option>Startup</option>
                <option>Hardware/IoT</option>
                <option>Data Science</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-700 mb-2">
                Time Commitment *
              </label>
              <select
                id="timeCommitment"
                value={timeCommitment}
                onChange={(e) => setTimeCommitment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>5-8 hours/week</option>
                <option>5-10 hours/week</option>
                <option>10-15 hours/week</option>
                <option>15+ hours/week</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="preferredSkills" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Skills (comma-separated)
            </label>
            <input
              type="text"
              id="preferredSkills"
              value={preferredSkills}
              onChange={(e) => setPreferredSkills(e.target.value)}
              placeholder="e.g., React, Python, UI/UX Design"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method *
              </label>
              <select
                id="contactMethod"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Email</option>
                <option>Phone</option>
                <option>Discord</option>
                <option>LinkedIn</option>
              </select>
            </div>

            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information *
              </label>
              <input
                type="text"
                id="contactInfo"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="your.email@case.edu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}