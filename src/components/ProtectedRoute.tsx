import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';

export default function ProtectedRoute() {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
