import { Navigate } from 'react-router-dom';
import { decodeToken } from './utils/authUtils';



export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== requiredRole) {
      return <Navigate to="/products" replace />;
    }
  }

  return children;
}

