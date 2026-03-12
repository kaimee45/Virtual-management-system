import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProjectManagement from './pages/Admin/ProjectManagement';
import UserManagement from './pages/Admin/UserManagement';
import Finance from './pages/Admin/Finance';
import Reports from './pages/Admin/Reports';
import TaskManagement from './pages/Admin/TaskManagement';


import StaffDashboard from './pages/Staff/StaffDashboard';
import StaffProjects from './pages/Staff/StaffProjects';
import StaffTasks from './pages/Staff/StaffTasks';
import VolunteerDashboard from './pages/Volunteer/VolunteerDashboard';
import VolunteerTasks from './pages/Volunteer/VolunteerTasks';
import Settings from './pages/Settings';


function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/login" replace />
      } />

      <Route path="/admin/*" element={
        <ProtectedRoute role="admin">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="projects" element={<ProjectManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="finance" element={<Finance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="tasks" element={<TaskManagement />} />
          </Routes>
        </ProtectedRoute>
      } />

      <Route path="/staff/*" element={
        <ProtectedRoute role="staff">
          <Routes>
            <Route path="/" element={<StaffDashboard />} />
            <Route path="projects" element={<StaffProjects />} />
            <Route path="tasks" element={<StaffTasks />} />
          </Routes>
        </ProtectedRoute>
      } />

      <Route path="/volunteer/*" element={
        <ProtectedRoute role="volunteer">
          <Routes>
            <Route path="/" element={<VolunteerDashboard />} />
            <Route path="tasks" element={<VolunteerTasks />} />
          </Routes>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
