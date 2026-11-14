import { Navigate } from 'react-router-dom';
import GestionAuth from '../services/Auth';

function AdminGuard({ children }) {
  const user = GestionAuth.getUser();

  if (!GestionAuth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminGuard;