import { useState } from 'react';
import type { User } from '../App';
import { X, Bell } from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
}

export function UserProfileModal({ user, onClose, onSave }: UserProfileModalProps) {
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [major, setMajor] = useState(user.major || '');
  const [skills, setSkills] = useState(user.skills?.join(', ') || '');
  const [interests, setInterests] = useState(user.interests?.join(', ') || '');
  const [availability, setAvailability] = useState(user.availability || '');
  const [preferredContactMethod, setPreferredContactMethod] = useState(user.preferred_contact_method || 'Email');
  const [activeProjectNotifications, setActiveProjectNotifications] = useState(user.active_project_notifications ?? true);
  const [projectExpirationNotifications, setProjectExpirationNotifications] = useState(user.project_expiration_notifications ?? true);
  const [weeklyUpdateNotifications, setWeeklyUpdateNotifications] = useState(user.weekly_update_notifications ?? false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const skillsArray = skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    const interestsArray = interests
      .split(',')
      .map(interest => interest.trim())
      .filter(interest => interest.length > 0);

    onSave({                                          //this onSave function is the same function updateUserProfile from App.tsx and we are giving it arguments
      ...user,
      name,
      major,
      skills: skillsArray,
      interests: interestsArray,
      availability,
      contactMethod,
      contactInfo,
      notificationSettings: {
        emailReminders,
        projectExpiry,
        newMatches,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              CWRU Email
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-2">
              Major
            </label>
            <input
              type="text"
              id="major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g., Computer Science"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., React, Python, Data Analysis"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
              Interests (comma-separated)
            </label>
            <input
              type="text"
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g., AI, Web Development, Research"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <input
              type="text"
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g., Evenings and weekends, Flexible"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method
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
                Contact Information
              </label>
              <input
                type="text"
                id="contactInfo"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-gray-700" />
              <h3 className="font-medium text-gray-900">Email Notification Preferences</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="emailReminders"
                  checked={emailReminders}
                  onChange={(e) => setEmailReminders(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="emailReminders" className="text-sm text-gray-700">
                  Receive email reminders for active projects
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="projectExpiry"
                  checked={projectExpiry}
                  onChange={(e) => setProjectExpiry(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="projectExpiry" className="text-sm text-gray-700">
                  Notify me when my project posts are about to expire
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="newMatches"
                  checked={newMatches}
                  onChange={(e) => setNewMatches(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="newMatches" className="text-sm text-gray-700">
                  Send me weekly updates on new projects matching my interests
                </label>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Email notifications will be sent to {user.email}
            </p>
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
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}