import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
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
  const [showLogin, setShowLogin] = useState(false);


  // Initialize mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@case.edu',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        email: 'john.smith@case.edu',
        name: 'John Smith',
        role: 'student',
        major: 'Computer Science',
        skills: ['React', 'Python', 'Machine Learning'],
        interests: ['AI', 'Web Development', 'Research'],
        availability: 'Evenings and weekends',
        contactMethod: 'Email',
        contactInfo: 'john.smith@case.edu',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '3',
        email: 'sarah.jones@case.edu',
        name: 'Sarah Jones',
        role: 'student',
        major: 'Biomedical Engineering',
        skills: ['CAD', 'Data Analysis', 'MATLAB'],
        interests: ['Medical Devices', 'Research', 'Startups'],
        availability: 'Flexible',
        contactMethod: 'Email',
        contactInfo: 'sarah.jones@case.edu',
        createdAt: new Date('2024-02-01'),
      },
    ];

    const mockProjects: Project[] = [
      {
        id: '1',
        userId: '2',
        userName: 'John Smith',
        userEmail: 'john.smith@case.edu',
        title: 'AI-Powered Study Companion App',
        description: 'Building a mobile app that uses AI to help students organize their study schedules and generate personalized quizzes. Looking for someone with mobile development experience.',
        projectType: 'Mobile App',
        preferredSkills: ['React Native', 'UI/UX Design'],
        timeCommitment: '5-10 hours/week',
        contactMethod: 'Email',
        contactInfo: 'john.smith@case.edu',
        createdAt: new Date('2024-02-01'),
        isActive: true,
      },
      {
        id: '2',
        userId: '3',
        userName: 'Sarah Jones',
        userEmail: 'sarah.jones@case.edu',
        title: 'Wearable Health Monitoring Device',
        description: 'Research project focused on developing a low-cost wearable device for continuous health monitoring. Need help with circuit design and data visualization.',
        projectType: 'Research',
        preferredSkills: ['Embedded Systems', 'Circuit Design', 'Data Visualization'],
        timeCommitment: '10-15 hours/week',
        contactMethod: 'Email',
        contactInfo: 'sarah.jones@case.edu',
        createdAt: new Date('2024-01-20'),
        isActive: true,
      },
      {
        id: '3',
        userId: '2',
        userName: 'John Smith',
        userEmail: 'john.smith@case.edu',
        title: 'Campus Event Discovery Platform',
        description: 'Creating a web platform to help students discover and share campus events. Looking for a backend developer to help with the API and database.',
        projectType: 'Web Development',
        preferredSkills: ['Node.js', 'Database Design', 'API Development'],
        timeCommitment: '5-8 hours/week',
        contactMethod: 'Email',
        contactInfo: 'john.smith@case.edu',
        createdAt: new Date('2024-02-05'),
        isActive: true,
      },
    ];

    setUsers(mockUsers);
    setProjects(mockProjects);
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Mock login - check if email ends with @case.edu
    if (!email.endsWith('@case.edu')) {
      alert('Please use your CWRU email address (@case.edu)');
      return;
    }

    // Find existing user or create new student user
    let user = users.find(u => u.email === email);
    
    if (!user) {
      user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: 'student',
        createdAt: new Date(),
      };
      setUsers([...users, user]);
    }

    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
    return showLogin ? (
    <LoginPage onLogin={handleLogin} />
  ) : (
    <HomePage onGetStarted={() => setShowLogin(true)} />
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