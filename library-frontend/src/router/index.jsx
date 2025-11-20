import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Container, Typography, Paper } from '@mui/material';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../store/authStore';
import Profile from '../pages/profile/Profile';
import Catalogue from '../pages/catalogue/Catalogue';
import MesEmprunts from '../pages/emprunts/MesEmprunts';
import Dashboard from '../pages/dashboard/Dashboard';
import Historique from '../pages/historique/Historique';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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

// Page components
const HistoriquePage = () => (
  <Container maxWidth="xl">
    <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 1 }}>
      Historique
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      Consultez votre historique d'emprunts
    </Typography>
    <Paper sx={{ p: 3, minHeight: 400 }}>
      <Typography variant="body2" color="text.secondary">
        Votre historique à venir...
      </Typography>
    </Paper>
  </Container>
);

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
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;