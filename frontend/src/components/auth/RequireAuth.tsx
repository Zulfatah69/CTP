import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const ROLE_HOME: Record<string, string> = {
  PEMOHON: '/portal/dashboard',
  ADMIN: '/admin',
  KEPALA_UPTD: '/admin',
  KASUBAG_TU: '/admin',
  SEKRETARIS: '/admin',
  KEPALA_DINAS: '/admin',
};

export default function RequireAuth({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }
  return <Outlet />;
}
