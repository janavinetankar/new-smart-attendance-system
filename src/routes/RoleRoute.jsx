// src/routes/RoleRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

export default function RoleRoute({ children, allowedRoles }) {
  const { role, loading } = useAuth();

  if (loading) return <Loader fullscreen />;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
