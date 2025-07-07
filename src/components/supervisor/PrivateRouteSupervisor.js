import { Navigate, Outlet } from 'react-router-dom';

function PrivateRouteSupervisor() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PrivateRouteSupervisor;
