import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../store/authStore';
import Profile from '../pages/profile/Profile';
import Catalogue from '../pages/catalogue/Catalogue';
import MesEmprunts from '../pages/emprunts/MesEmprunts';
import Dashboard from '../pages/dashboard/Dashboard';
import Historique from '../pages/historique/Historique';
import Home from '../pages/home/home';
import About from '../pages/about/About';
import Contact from '../pages/contact/Contact';

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
    return <Navigate to="/home" replace />; // Changed from /dashboard to /home
  }
  
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" replace />, // Changed to /home
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
        path: '/home',
        element: <Home />,
      },
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
        path: '/about',
        element: <About />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />, // Changed to /home
  },
]);

export default router;