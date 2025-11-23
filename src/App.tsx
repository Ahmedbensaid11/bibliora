import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Loans from './pages/Loans';
import Login from './pages/Login';
import { MOCK_USER } from './constants';
import BookManagement from './pages/BookManagement';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  // État pour savoir si l'utilisateur est connecté
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Router>
      <Routes>
        {/* Route de connexion */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        {/* 1. DASHBOARD LECTEUR (Page d'accueil) */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout user={MOCK_USER} onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* 2. DASHBOARD ADMINISTRATIF (Nouveau ! Graphiques & Stats) */}
        <Route
          path="/admin/dashboard"
          element={
            isAuthenticated ? (
              <Layout user={MOCK_USER} onLogout={handleLogout}>
                <AdminDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 3. CATALOGUE (Vue Lecteur) */}
        <Route
          path="/catalog"
          element={
            isAuthenticated ? (
              <Layout user={MOCK_USER} onLogout={handleLogout}>
                <Catalog />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 4. GESTION LIVRES (Vue Admin - CRUD) */}
        <Route
          path="/admin/books"
          element={
            isAuthenticated ? (
              <Layout user={MOCK_USER} onLogout={handleLogout}>
                <BookManagement />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 5. EMPRUNTS */}
        <Route
          path="/loans"
          element={
            isAuthenticated ? (
              <Layout user={MOCK_USER} onLogout={handleLogout}>
                <Loans />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;