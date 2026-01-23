// router.jsx - Updated version
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../store/authStore';
import Profile from '../pages/profile/Profile';
import Catalogue from '../pages/catalogue/Catalogue';
import MesEmprunts from '../pages/emprunts/MesEmprunts';
import Dashboard from '../pages/dashboard/Dashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import Historique from '../pages/historique/Historique';
import AdminBooks from '../pages/admin/AdminBooks'; // Add this import
import AdminLoans from '../pages/admin/AdminLoans'; // Add this import
import AdminUsers from '../pages/admin/AdminUsers'; // Add this import
import AdminReports from '../pages/admin/AdminReports'; // Add this import

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is admin
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_EMPLOYEE');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/catalogue',
        element: <Catalogue />,
      },
      {
        path: '/emprunts',
        element: <MesEmprunts />,
      },
      {
        path: '/historique',
        element: <Historique />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      // Admin routes with protection
      {
        path: '/admin/dashboard',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        ),
      },
      {
  path: '/admin/books',
  element: (
    <AdminRoute>
      <AdminBooks />
    </AdminRoute>
  ),
},
     
      {
        path: '/admin/loans',
        element: (
          <AdminRoute>
      <AdminLoans />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/reports',
        element: (
          <AdminRoute>
      <AdminReports />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;