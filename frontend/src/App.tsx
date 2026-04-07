import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { CreateAccountPage } from './components/CreateAccountPage';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { HomePage } from "./components/HomePage";
import { ProjectViewPage } from './components/ProjectViewPage';
import { JoinRequestPage } from './components/JoinRequestPage';
import { JoinRequestsPage } from './components/JoinRequestsPage';
import { UserProfilePage } from './components/UserProfilePage';
import VerifyEmail from './components/VerifyEmail';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';


export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: UserRole;
  major?: string;
  skills?: string[];
  interests?: string[];
  availability?: string;
  preferred_contact_method?: string;
  active_project_notifications?: boolean;
  project_expiration_notifications?: boolean;
  weekly_update_notifications?: boolean;
  createdAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  fullDescription?: string;
  projectType: string;
  preferredSkills: string[];
  timeCommitment: string;
  contactMethod: string;
  contactInfo: string;
  createdAt: Date;
  creationTime?: string;
  updatedTime?: string;
  isActive: boolean;
  reportCount?: number;
  memberIds?: string[];
}

export interface Report {
  id: string;
  projectId: string;
  projectTitle: string;
  reportedBy: string;
  reason: string;
  description: string;
  createdAt: Date;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [users] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await fetch('/project_management/list_projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const mapped: Project[] = data.condensed_projects.map((p: any) => ({
            id: String(p.id),
            title: p.title,
            description: p.short_description || '',
            userName: p.author,
            userEmail: p.author,
            userId: String(p.author_id),
            projectType: p.project_type || '',
            preferredSkills: p.preferred_skills || [],
            isActive: true,
            fullDescription: '',
            timeCommitment: p.workload_per_week || '',
            contactMethod: '',
            contactInfo: '',
            createdAt: p.creation_time ? new Date(p.creation_time) : new Date(),
            memberIds: (p.member_ids || []).map(String),
          }));
          setProjects(mapped);
        }
      }
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    }
  };

  const getProjectDetails = async (projectId: string): Promise<Project | null> => {
    try {
      const res = await fetch('/project_management/get_project/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(projectId) }),
      });
      const data = await res.json();
      if (data.success) {
        const p = data.project;
        return {
          id: String(p.id),
          title: p.title,
          description: p.short_description || '',
          fullDescription: p.extended_description || '',
          userName: p.author,
          userEmail: p.author,
          userId: '',
          projectType: p.project_type || '',
          preferredSkills: p.preferred_skills || [],
          timeCommitment: p.workload_per_week || '',
          contactMethod: p.preferred_contact_method || '',
          contactInfo: p.contact_information || '',
          isActive: true,
          createdAt: p.creation_time ? new Date(p.creation_time) : new Date(),
          creationTime: p.creation_time || '',
          updatedTime: p.updated_time || '',
        };
      }
    } catch (e) {
      console.error('Failed to get project details:', e);
    }
    return null;
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/authentication/whoami/', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCurrentUser({
              id: String(data.id),
              first_name: data.first_name,
              last_name: data.last_name,
              username: data.username,
              email: data.email,
              role: data.is_staff ? 'admin' : 'student',
              major: data.major,
              skills: data.skills ?? [],
              interests: data.interests ?? [],
              availability: data.availability,
              preferred_contact_method: data.preferred_contact_method,
              active_project_notifications: data.active_project_notifications,
              project_expiration_notifications: data.project_expiration_notifications,
              weekly_update_notifications: data.weekly_update_notifications,
              createdAt: new Date(),
            });
          }
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();

      if (currentUser.role === 'admin') {                   //if user is an admin we will always fetch projects which will be stored in reports
        fetchReports();
      }
    }
  }, [currentUser]);

  const handleLogin = async (email: string, password: string): Promise<string | null> => {
    const res = await fetch('/authentication/login/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return data?.error || 'Invalid login credentials';
    }

    setCurrentUser({
      id: String(data.id),
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      email: data.email,
      role: data.is_staff ? 'admin' : 'student',
      major: data.major,
      skills: data.skills ?? [],
      interests: data.interests ?? [],
      availability: data.availability,
      preferred_contact_method: data.preferred_contact_method,
      active_project_notifications: data.active_project_notifications,
      project_expiration_notifications: data.project_expiration_notifications,
      weekly_update_notifications: data.weekly_update_notifications,
      createdAt: new Date(),
    });
    navigate('/');
    return null;
  };

  const handleRegister = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<string | null> => {
    const res = await fetch('/authentication/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
    });

    if (!res.ok) {
      const text = await res.text();
      return text || 'Failed to create account';
    }
    return null;
  };

  const handleLogout = async () => {
    await fetch('/authentication/logout/', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    setCurrentUser(null);
    navigate('/');
  };

  const updateUserProfile = async (updatedUser: User): Promise<void> => { //this takes a User object (gets it from UserprofileModal where the user updates their profile fields)
    //sets the currentUser object to those fields 
    //and sends the data to the backend

    // 1) Update UI immediately
    setCurrentUser(updatedUser);

    // 2) Send to backend
    const payload = {
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      major: updatedUser.major,
      skills: updatedUser.skills ?? [],
      interests: updatedUser.interests ?? [],
      availability: updatedUser.availability,
      preferred_contact_method: updatedUser.preferred_contact_method,
      active_project_notifications: updatedUser.active_project_notifications,
      project_expiration_notifications: updatedUser.project_expiration_notifications,
      weekly_update_notifications: updatedUser.weekly_update_notifications,
    };

    const res = await fetch('/profile_management/update_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Failed to save profile');
    }
  };

  const addProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/project_management/create_project/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          short_description: project.description,
          extended_description: project.fullDescription || project.description,
          project_type: project.projectType,
          preferred_skills: project.preferredSkills,
          workload_per_week: project.timeCommitment,
          preferred_contact_method: project.contactMethod,
          contact_information: project.contactInfo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchProjects();
      }
    } catch (e) {
      console.error('Failed to create project:', e);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));

    try {
      await fetch('/project_management/update_project/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Number(projectId),
          title: updates.title,
          short_description: updates.description,
          extended_description: updates.fullDescription,
          project_type: updates.projectType,
          preferred_skills: updates.preferredSkills,
          workload_per_week: updates.timeCommitment,
          preferred_contact_method: updates.contactMethod,
          contact_information: updates.contactInfo,
        }),
      });
    } catch (e) {
      console.error('Failed to update project:', e);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const isAdmin = currentUser?.role === 'admin';

      const endpoint = isAdmin
        ? '/project_management/admin_delete_project/'
        : '/project_management/delete_project/';

      const res = await fetch(endpoint, {
        method: 'POST',
        ...(isAdmin && { credentials: 'include' }), 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(projectId) }),
      });

      const data = await res.json();
      if (data.success) {
        setProjects(projects.filter(p => p.id !== projectId));
        setReports(reports.filter(r => r.projectId !== projectId));
      } else {
        alert(data.error || 'Failed to delete project.');
      }
    } catch (e) {
      console.error('Failed to delete project:', e);
      alert('Failed to delete project.');
    }
  };

  const reportProject = async (
    projectId: string,
    reason: 'spam' | 'inappropriate' | 'misleading' | 'harassment' | 'other',
    description = ''
  ) => {
    if (!currentUser) return;

    try {
      const res = await fetch('/project_management/report_project/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: Number(projectId),
          reason,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        alert(data?.error || 'Failed to submit report.');
        return;
      }

      alert('Report submitted. Administrators will review it shortly.');
    } catch (e) {
      console.error('Failed to submit report:', e);
      alert('Failed to submit report.');
    }
  };

  const sendLlmMessage = async (query: string): Promise<string> => {
    const res = await fetch('/llm_api/prompt_llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ prompt: query }),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
    return data.response ?? 'No response received.';
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('/project_management/list_reports/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        console.error('Failed to fetch reports:', data);
        return;
      }

      const mapped: Report[] = (data.reports ?? []).map((r: any) => ({
        id: String(r.id),
        projectId: String(r.project_id),
        projectTitle: r.project_title ?? '',
        reportedBy: r.reporter_username ?? '',
        reason: r.reason ?? '',
        description: r.description ?? '',
        createdAt: new Date(r.created_at),
      }));

      setReports(mapped);
    } catch (e) {
      console.error('Failed to fetch reports:', e);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/create-account" element={<CreateAccountPage onRegister={handleRegister} />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="*"
          element={
            <HomePage
              onGetStarted={() => navigate('/create-account')}
              onLogin={() => navigate('/login')}
            />
          }
        />
      </Routes>
    );
  }

  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        projects={projects}
        reports={reports}
        users={users}
        onLogout={handleLogout}
        onDeleteProject={deleteProject}
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <StudentDashboard
          currentUser={currentUser}
          projects={projects}
          users={users}
          onLogout={handleLogout}
          onUpdateProfile={updateUserProfile}
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
          onReportProject={reportProject}
          onGetProjectDetails={getProjectDetails}
          onSendLlmMessage={sendLlmMessage}
        />
      } />
      <Route path="/project/:id" element={<ProjectViewPage currentUser={currentUser} />} />
      <Route path="/project/:id/join" element={<JoinRequestPage />} />
      <Route path="/project/:id/requests" element={<JoinRequestsPage currentUser={currentUser} />} />
      <Route path="/user/:id" element={<UserProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
