import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
//project\src\components\common\ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/details" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;