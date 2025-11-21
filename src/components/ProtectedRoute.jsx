import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      return <Navigate to="/products" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
