import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExerciseTracker from './pages/ExerciseTracker';
import WaterTracker from './pages/WaterTracker';
import EmbryoTracker from './pages/EmbryoTracker';
import DiseasePredictor from './pages/DiseasePredictor';
import Emergency from './pages/Emergency';
import Appointments from './pages/Appointments';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// Public layout (with navbar + footer)
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </>
  );
}

// App layout (authenticated, with sidebar navbar)
function AppLayout({ children }) {
  return (
    <>
      <Navbar isApp />
      <main className="main-content">{children}</main>
    </>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/exercise" element={<ProtectedRoute><AppLayout><ExerciseTracker /></AppLayout></ProtectedRoute>} />
      <Route path="/water" element={<ProtectedRoute><AppLayout><WaterTracker /></AppLayout></ProtectedRoute>} />
      <Route path="/embryo" element={<ProtectedRoute><AppLayout><EmbryoTracker /></AppLayout></ProtectedRoute>} />
      <Route path="/predict" element={<ProtectedRoute><AppLayout><DiseasePredictor /></AppLayout></ProtectedRoute>} />
      <Route path="/emergency" element={<ProtectedRoute><AppLayout><Emergency /></AppLayout></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><AppLayout><Appointments /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="page-wrapper">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}
