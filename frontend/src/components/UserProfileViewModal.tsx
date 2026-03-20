import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface UserProfile {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  major: string;
  skills: string[];
  interests: string[];
  availability: string;
  preferred_contact_method: string;
}

interface UserProfileViewModalProps {
  userId: number;
  onClose: () => void;
}

export function UserProfileViewModal({ userId, onClose }: UserProfileViewModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('/profile_management/get_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId }),
    })
      .then(res => res.json())
      .then(data => { if (data.success) setProfile(data); })
      .catch(console.error);
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!profile ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h3>
                <p className="text-gray-500 text-sm">{profile.username}</p>
              </div>

              <Field label="Email" value={profile.email} />
              <Field label="Major" value={profile.major} />
              <Field label="Availability" value={profile.availability} />
              <Field label="Preferred Contact" value={profile.preferred_contact_method} />

              {profile.skills?.length > 0 && (
                <TagField label="Skills" items={profile.skills} color="blue" />
              )}
              {profile.interests?.length > 0 && (
                <TagField label="Interests" items={profile.interests} color="purple" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

function TagField({ label, items, color }: { label: string; items: string[]; color: 'blue' | 'purple' }) {
  const cls = color === 'blue'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-purple-100 text-purple-700';
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className={`px-2 py-1 text-sm rounded ${cls}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
