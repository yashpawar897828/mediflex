
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // While checking authentication state, show nothing
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
