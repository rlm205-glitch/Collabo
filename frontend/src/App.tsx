import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { CreateAccountPage } from './components/CreateAccountPage';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { HomePage } from "./components/HomePage";


export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  major?: string;
  skills?: string[];
  interests?: string[];
  availability?: string;
  contactMethod?: string;
  contactInfo?: string;
  createdAt: Date;
  notificationSettings?: {
    emailReminders: boolean;
    projectExpiry: boolean;
    newMatches: boolean;
  };
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
}

export interface Report {
  id: string;
  projectId: string;
  reportedBy: string;
  reason: string;
  createdAt: Date;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
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
            userId: '',
            projectType: p.project_type || '',
            preferredSkills: p.preferred_skills || [],
            isActive: true,
            fullDescription: '',
            timeCommitment: p.workload_per_week || '',
            contactMethod: '',
            contactInfo: '',
            createdAt: new Date(),
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

  const joinProject = async (projectId: string): Promise<boolean> => {
    try {
      const res = await fetch('/project_management/join_project/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(projectId) }),
      });
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error('Failed to join project:', e);
      return false;
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  const handleLogin = async (email: string, password: string): Promise<string | null> => {
    const res = await fetch('/authentication/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return data?.error || 'Invalid login credentials';
    }

    const name = email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
    setCurrentUser({
      id: Date.now().toString(),
      email,
      name,
      role: 'student',
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

    const name = `${firstName} ${lastName}`;
    setCurrentUser({
      id: Date.now().toString(),
      email,
      name,
      role: 'student',
      createdAt: new Date(),
    });
    navigate('/');
    return null;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const updateUserProfile = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
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

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const deleteProject = async (projectId: string) => {
    try {
      const res = await fetch('/project_management/delete_project/', {
        method: 'POST',
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

  const reportProject = (projectId: string, reason: string) => {
    if (!currentUser) return;



    const newReport: Report = {
      id: Date.now().toString(),
      projectId,
      reportedBy: currentUser.email,
      reason,
      createdAt: new Date(),
    };
    setReports([...reports, newReport]);
    alert('Report submitted. Administrators will review it shortly.');
  };

  const restrictUser = (userId: string) => {
    // In a real app, this would disable the user's account
    alert(`User ${userId} has been restricted from posting.`);
  };

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/create-account" element={<CreateAccountPage onRegister={handleRegister} />} />
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
        onRestrictUser={restrictUser}
        onUpdateProject={updateProject}
      />
    );
  }

  return (
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
      onJoinProject={joinProject}
    />
  );
}

export default App;