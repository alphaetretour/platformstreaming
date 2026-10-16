import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Platforms from './pages/Platforms';
import Subscriptions from './pages/Subscriptions';
import Profile from './pages/Profile';
import ConnectPlatform from './pages/ConnectPlatform';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Public routes
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // If user is logged in and tries to access public routes, redirect to dashboard
  if (user && isPublicRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is not logged in and tries to access protected routes, redirect to login
  if (!user && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/platforms" element={<Platforms />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/connect/:platformId" element={<ConnectPlatform />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
