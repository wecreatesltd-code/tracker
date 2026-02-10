import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
import { ProjectProvider } from './context/ProjectContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Board from './pages/Board';
import Team from './pages/Team';
import Tracker from './pages/Tracker';
import MyTasks from './pages/MyTasks';
import TeamTasks from './pages/TeamTasks';
import Settings from './pages/Settings';
import AdminSettings from './pages/AdminSettings';
import Notepad from './pages/Notepad';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import { ThemeProvider } from './context/ThemeContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProjectProvider>
          <PermissionProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signupadmin" element={<Signup />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } />
              <Route path="/board/:projectId" element={
                <ProtectedRoute>
                  <Board />
                </ProtectedRoute>
              } />
              <Route path="/team" element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              } />
              <Route path="/tracker" element={
                <ProtectedRoute>
                  <Tracker />
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <MyTasks />
                </ProtectedRoute>
              } />
              <Route path="/team-tasks" element={
                <ProtectedRoute>
                  <TeamTasks />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/admin/permissions" element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="/notepad" element={
                <ProtectedRoute>
                  <Notepad />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </PermissionProvider>
        </ProjectProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
