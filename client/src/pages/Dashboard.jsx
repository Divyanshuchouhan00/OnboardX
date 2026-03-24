import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import DashboardEmployee from './DashboardEmployee.jsx';
import DashboardHR from './DashboardHR.jsx';
import DashboardAdmin from './DashboardAdmin.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  if (user.role === 'admin') {
    return <DashboardAdmin />;
  }
  if (user.role === 'hr') {
    return <DashboardHR />;
  }
  if (user.role === 'manager') {
    return <Navigate to="/manager-dashboard" replace />;
  }
  return <DashboardEmployee />;
}
