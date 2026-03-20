import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/profile_management/get_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id) }),
    })
      .then(res => res.json())
      .then(data => { if (data.success) setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">User Profile</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-gray-500 text-center py-16">Loading...</p>
        ) : !profile ? (
          <p className="text-gray-500 text-center py-16">User not found.</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">{profile.username}</p>
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
  const cls = color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
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
