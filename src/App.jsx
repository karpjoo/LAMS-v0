import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
import Workspace from './pages/Workspace';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public login route */}
          <Route path="/login" element={<Login />} />

          {/* Protected workspace route */}
          <Route
            path="/workspace"
            element={
              <AuthGuard>
                <Workspace />
              </AuthGuard>
            }
          />

          {/* Protected admin panel (restricted to Admin role) */}
          <Route
            path="/admin"
            element={
              <AuthGuard requiredRole="Admin">
                <Admin />
              </AuthGuard>
            }
          />

          {/* Protected metrics dashboard */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />

          {/* Fallback route redirects to workspace */}
          <Route path="*" element={<Navigate to="/workspace" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
