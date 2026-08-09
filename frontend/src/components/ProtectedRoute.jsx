import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="grid min-h-[50vh] place-items-center text-sm text-ink-soft">Checking your session…</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export function AdminRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="grid min-h-[50vh] place-items-center text-sm text-ink-soft">Checking your session…</div>;
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/" replace state={{ from: location }} />;
}
