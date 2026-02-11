import { useState } from 'react';
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

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setProjects([newProject, ...projects]);
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setReports(reports.filter(r => r.projectId !== projectId));
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
        <Route path="*" element={<HomePage onGetStarted={() => navigate('/login')} />} />
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
    />
  );
}

export default App;