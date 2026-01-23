import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  LibraryBooks,
  People,
  Bookmark,
  Warning,
  TrendingUp,
  Schedule,
  Refresh,
  LocalLibrary,
  BarChart,
  RecentActors,
  Assignment,
  Euro,
  Category,
  ArrowForward,
  AdminPanelSettings,
  Search,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import { designSystem } from '../../styles/designSystem';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    overdueLoans: 0,
    newRegistrations: 0,
    availableBooks: 0,
    totalFines: 0,
    popularGenres: [],
    monthlyGrowth: 0,
    recentActivity: [],
    systemHealth: 'good',
    lowStockBooks: 0,
    dueSoonLoans: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminDashboardData();
  }, []);

  const loadAdminDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, activityResponse] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/recent-activity?limit=10')
      ]);

      if (statsResponse.data.success) {
        const adminStats = statsResponse.data.data;
        
        setStats(prev => ({
          ...prev,
          totalBooks: adminStats.totalBooks || 0,
          availableBooks: adminStats.availableBooks || 0,
          totalUsers: adminStats.totalUsers || 0,
          newRegistrations: adminStats.newRegistrations || 0,
          activeLoans: adminStats.activeLoans || 0,
          overdueLoans: adminStats.overdueLoans || 0,
          totalFines: adminStats.totalFines || 0,
          popularGenres: adminStats.popularGenres || [],
          monthlyGrowth: adminStats.monthlyGrowth || 0,
          systemHealth: adminStats.systemHealth || 'good',
          lowStockBooks: adminStats.lowStockBooks || 0,
          dueSoonLoans: adminStats.dueSoonLoans || 0
        }));
      }

      if (activityResponse.data.success) {
        const activities = activityResponse.data.items || [];
        setStats(prev => ({
          ...prev,
          recentActivity: activities
        }));
      }
      
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
      
      try {
        const [booksRes, loansStatsRes, activeLoansRes, overdueLoansRes] = await Promise.all([
          api.get('/books').catch(() => ({ data: { items: [] } })),
          api.get('/loans/statistics').catch(() => ({ data: {} })),
          api.get('/loans/admin/all-active').catch(() => ({ data: { items: [] } })),
          api.get('/loans/overdue').catch(() => ({ data: { items: [] } }))
        ]);

        const books = booksRes.data.items || booksRes.data.data || [];
        const activeLoans = activeLoansRes.data.items || activeLoansRes.data.data || [];
        const overdueLoans = overdueLoansRes.data.items || overdueLoansRes.data.data || [];

        setStats(prev => ({
          ...prev,
          totalBooks: books.length,
          availableBooks: books.filter(b => (b.availableCopies || 0) > 0).length,
          activeLoans: activeLoans.length,
          overdueLoans: overdueLoans.length,
          totalFines: [...activeLoans, ...overdueLoans].reduce((sum, l) => sum + (l.fineAmount || 0), 0),
          systemHealth: overdueLoans.length > 10 ? 'attention' : 'good',
          recentActivity: activeLoans.slice(0, 10).map(loan => ({
            type: 'Emprunt',
            user: loan.user?.username || 'Inconnu',
            book: loan.book?.title || 'Inconnu',
            loanDate: loan.loanDate,
            status: loan.status === 'ACTIVE' ? 'Actif' : loan.status === 'OVERDUE' ? 'En retard' : 'Retourné'
          }))
        }));
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend, onClick }) => (
    <Card 
      sx={{ 
        height: '100%', 
        ...designSystem.card,
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: designSystem.colors.background.card
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography 
              variant="overline" 
              sx={{ 
                ...designSystem.typography.caption,
                fontWeight: 600,
                color: designSystem.colors.text.muted,
                display: 'block',
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            <Typography variant="h4" sx={{ 
              ...designSystem.typography.h4,
              fontWeight: 700,
              color: color
            }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ 
                ...designSystem.typography.body,
                color: designSystem.colors.text.muted,
                mt: 0.5
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: `${color}20`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
        {trend !== undefined && trend !== null && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp fontSize="small" sx={{ 
              color: trend >= 0 ? designSystem.colors.status.available.text : designSystem.colors.status.unavailable.text 
            }} />
            <Typography variant="caption" sx={{ 
              ...designSystem.typography.caption,
              color: trend >= 0 ? designSystem.colors.status.available.text : designSystem.colors.status.unavailable.text,
              fontWeight: 600
            }}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% ce mois
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ 
        py: 4, 
        mt: 8, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress sx={{ color: designSystem.colors.primary.light }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
      {/* Header - Catalogue Style */}
      <Box sx={{ 
        mb: 4, 
        pb: 3, 
        borderBottom: `1px solid ${designSystem.colors.border.light}` 
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          flexWrap: 'wrap', 
          gap: 2 
        }}>
          <Box>
            <Typography variant="h1" component="h1" sx={{ 
              ...designSystem.typography.h1,
              mb: 1
            }}>
              Tableau de Bord Administrateur
            </Typography>
            <Typography variant="h6" sx={{
              ...designSystem.typography.subtitle,
              fontStyle: 'italic',
              fontWeight: 300
            }}>
              Aperçu complet de l'activité de la bibliothèque
            </Typography>
          </Box>
          <Typography variant="body2" sx={{
            ...designSystem.typography.caption
          }}>
            Connecté en tant que: {user?.username}
          </Typography>
        </Box>
      </Box>

      {/* Important Alerts */}
      {stats.overdueLoans > 0 && (
        <Alert 
          severity="warning"
          sx={{ 
            mb: 4,
            bgcolor: '#fef3c7',
            border: `1px solid #fbbf24`,
            color: '#92400e'
          }}
          icon={<Warning />}
          action={
            <Button 
              size="small"
              onClick={() => navigate('/admin/loans')}
              sx={designSystem.button.primary}
            >
              Gérer
            </Button>
          }
        >
          <strong>{stats.overdueLoans} prêt(s) en retard.</strong> Action requise pour les retours en retard.
        </Alert>
      )}

      {stats.lowStockBooks > 0 && (
        <Alert 
          severity="warning"
          sx={{ 
            mb: 4,
            bgcolor: '#fef3c7',
            border: `1px solid #fbbf24`,
            color: '#92400e'
          }}
          icon={<Warning />}
          action={
            <Button 
              size="small"
              onClick={() => navigate('/admin/books')}
              sx={designSystem.button.primary}
            >
              Voir
            </Button>
          }
        >
          <strong>{stats.lowStockBooks} livre(s) en stock faible.</strong> Pensez à renouveler les stocks.
        </Alert>
      )}

      {stats.dueSoonLoans > 0 && (
        <Alert 
          severity="info"
          sx={{ 
            mb: 4,
            bgcolor: '#e0f2fe',
            border: `1px solid #38bdf8`,
            color: '#0369a1'
          }}
          icon={<Schedule />}
        >
          <strong>{stats.dueSoonLoans} prêt(s) à échéance bientôt.</strong> Dans les 7 prochains jours.
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TOTAL LIVRES"
            value={stats.totalBooks}
            subtitle={`${stats.availableBooks} disponibles`}
            icon={<LibraryBooks fontSize="large" />}
            color={designSystem.colors.primary.main}
            trend={stats.monthlyGrowth}
            onClick={() => navigate('/admin/books')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="UTILISATEURS"
            value={stats.totalUsers}
            subtitle={`${stats.newRegistrations} nouveaux ce mois`}
            icon={<People fontSize="large" />}
            color={designSystem.colors.secondary.main}
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="PRÊTS ACTIFS"
            value={stats.activeLoans}
            subtitle={stats.overdueLoans > 0 ? `${stats.overdueLoans} en retard` : "Tous à jour"}
            icon={<Bookmark fontSize="large" />}
            color={designSystem.colors.status.available.text}
            onClick={() => navigate('/admin/loans')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AMENDES TOTALES"
            value={`${stats.totalFines.toFixed(2)} TND`}
            subtitle="À collecter"
            icon={<Euro fontSize="large" />}
            color={designSystem.colors.status.unavailable.text}
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column - Activity & Charts */}
        <Grid item xs={12} lg={8}>
          {/* System Health Card */}
          <Card sx={{ 
            mb: 4,
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={designSystem.typography.h5}>
                  <BarChart sx={{ verticalAlign: 'middle', mr: 1 }} />
                  État du Système
                </Typography>
                <Chip 
                  label={
                    stats.systemHealth === 'good' ? 'Bon' : 
                    stats.systemHealth === 'attention' ? 'Attention' : 'Critique'
                  }
                  sx={{
                    bgcolor: stats.systemHealth === 'good' ? designSystem.colors.status.available.bg : 
                             stats.systemHealth === 'attention' ? '#fef3c7' : designSystem.colors.status.unavailable.bg,
                    color: stats.systemHealth === 'good' ? designSystem.colors.status.available.text : 
                           stats.systemHealth === 'attention' ? '#92400e' : designSystem.colors.status.unavailable.text,
                    border: stats.systemHealth === 'good' ? `1px solid ${designSystem.colors.status.available.border}` :
                             stats.systemHealth === 'attention' ? '1px solid #fbbf24' : `1px solid ${designSystem.colors.status.unavailable.border}`,
                    fontWeight: 700,
                    fontFamily: designSystem.typography.body.fontFamily
                  }}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: designSystem.colors.status.available.bg,
                    border: `1px solid ${designSystem.colors.status.available.border}`,
                    borderRadius: designSystem.card.borderRadius
                  }}>
                    <Typography variant="body2" sx={{ 
                      ...designSystem.typography.body,
                      color: designSystem.colors.status.available.text,
                      opacity: 0.9 
                    }}>
                      Taux de disponibilité
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      ...designSystem.typography.h4,
                      fontWeight: 700,
                      color: designSystem.colors.status.available.text
                    }}>
                      {((stats.availableBooks / (stats.totalBooks || 1)) * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      ...designSystem.typography.caption,
                      color: designSystem.colors.status.available.text,
                      opacity: 0.8 
                    }}>
                      {stats.availableBooks} / {stats.totalBooks} livres
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: '#fef3c7',
                    border: `1px solid #fbbf24`,
                    borderRadius: designSystem.card.borderRadius
                  }}>
                    <Typography variant="body2" sx={{ 
                      ...designSystem.typography.body,
                      color: designSystem.colors.primary.main,
                      opacity: 0.9 
                    }}>
                      Taux d'emprunt
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      ...designSystem.typography.h4,
                      fontWeight: 700,
                      color: designSystem.colors.primary.main
                    }}>
                      {((stats.activeLoans / (stats.totalBooks || 1)) * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      ...designSystem.typography.caption,
                      color: designSystem.colors.primary.main,
                      opacity: 0.8 
                    }}>
                      {stats.activeLoans} prêts en cours
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: stats.overdueLoans > 0 ? designSystem.colors.status.unavailable.bg : '#fef3c7',
                    border: stats.overdueLoans > 0 ? `1px solid ${designSystem.colors.status.unavailable.border}` : '1px solid #fbbf24',
                    borderRadius: designSystem.card.borderRadius
                  }}>
                    <Typography variant="body2" sx={{ 
                      ...designSystem.typography.body,
                      color: stats.overdueLoans > 0 ? designSystem.colors.status.unavailable.text : '#92400e',
                      opacity: 0.9 
                    }}>
                      Retards
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      ...designSystem.typography.h4,
                      fontWeight: 700,
                      color: stats.overdueLoans > 0 ? designSystem.colors.status.unavailable.text : '#92400e'
                    }}>
                      {stats.overdueLoans}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      ...designSystem.typography.caption,
                      color: stats.overdueLoans > 0 ? designSystem.colors.status.unavailable.text : '#92400e',
                      opacity: 0.8 
                    }}>
                      {((stats.overdueLoans / (stats.activeLoans || 1)) * 100).toFixed(0)}% des prêts
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card sx={{
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={designSystem.typography.h5}>
                  <RecentActors sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Activité Récente
                </Typography>
                <Button 
                  startIcon={<Refresh />} 
                  size="small"
                  onClick={() => loadAdminDashboardData()}
                  sx={designSystem.button.primary}
                >
                  Actualiser
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: designSystem.colors.background.light }}>
                    <TableRow>
                      <TableCell sx={{ 
                        ...designSystem.typography.body,
                        fontWeight: 700,
                        color: designSystem.colors.primary.dark
                      }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ 
                        ...designSystem.typography.body,
                        fontWeight: 700,
                        color: designSystem.colors.primary.dark
                      }}>
                        Utilisateur
                      </TableCell>
                      <TableCell sx={{ 
                        ...designSystem.typography.body,
                        fontWeight: 700,
                        color: designSystem.colors.primary.dark
                      }}>
                        Livre
                      </TableCell>
                      <TableCell sx={{ 
                        ...designSystem.typography.body,
                        fontWeight: 700,
                        color: designSystem.colors.primary.dark
                      }}>
                        Date
                      </TableCell>
                      <TableCell sx={{ 
                        ...designSystem.typography.body,
                        fontWeight: 700,
                        color: designSystem.colors.primary.dark
                      }}>
                        Statut
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentActivity.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Box sx={{ py: 4 }}>
                            <Assignment sx={{ 
                              fontSize: 60, 
                              color: designSystem.colors.text.muted, 
                              mb: 2, 
                              opacity: 0.5 
                            }} />
                            <Typography variant="h6" sx={{ 
                              ...designSystem.typography.h6,
                              color: designSystem.colors.text.muted
                            }}>
                              Aucune activité récente
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.recentActivity.map((activity, index) => (
                        <TableRow 
                          key={index}
                          hover
                          sx={{ 
                            transition: designSystem.card.transition,
                            '&:hover': { 
                              bgcolor: designSystem.colors.background.light 
                            }
                          }}
                        >
                          <TableCell>
                            <Chip 
                              label={activity.type} 
                              size="small" 
                              sx={{
                                bgcolor: '#fef3c7',
                                color: designSystem.colors.primary.main,
                                border: `1px solid ${designSystem.colors.primary.main}`,
                                fontWeight: 700,
                                fontFamily: designSystem.typography.body.fontFamily
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={designSystem.typography.body}>
                              {activity.user}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={designSystem.typography.body}>
                              {activity.book}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ 
                              ...designSystem.typography.body,
                              color: designSystem.colors.text.muted
                            }}>
                              {formatDate(activity.loanDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={activity.status} 
                              size="small" 
                              sx={{
                                bgcolor: activity.status === 'Actif' ? designSystem.colors.status.available.bg : 
                                         activity.status === 'En retard' ? designSystem.colors.status.unavailable.bg : 
                                         activity.status === 'Retourné' ? '#f5f5f5' : '#fef3c7',
                                color: activity.status === 'Actif' ? designSystem.colors.status.available.text : 
                                       activity.status === 'En retard' ? designSystem.colors.status.unavailable.text : 
                                       activity.status === 'Retourné' ? designSystem.colors.text.muted : designSystem.colors.primary.main,
                                border: `1px solid ${activity.status === 'Actif' ? designSystem.colors.status.available.border : 
                                         activity.status === 'En retard' ? designSystem.colors.status.unavailable.border : 
                                         activity.status === 'Retourné' ? '#e0e0e0' : '#fbbf24'}`,
                                fontWeight: 700,
                                fontFamily: designSystem.typography.body.fontFamily
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Quick Actions & Info */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Card sx={{ 
            mb: 4,
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent>
              <Typography variant="h5" sx={{ 
                ...designSystem.typography.h5,
                mb: 3
              }}>
                <AdminPanelSettings sx={{ verticalAlign: 'middle', mr: 1 }} />
                Actions Rapides
              </Typography>
              <List>
                <ListItem 
                  button 
                  sx={{ 
                    borderRadius: designSystem.card.borderRadius, 
                    mb: 1,
                    border: `1px solid ${designSystem.colors.border.light}`,
                    transition: designSystem.card.transition,
                    '&:hover': {
                      borderColor: designSystem.colors.background.hover,
                      bgcolor: designSystem.colors.background.light,
                      boxShadow: designSystem.shadows.cardHover
                    }
                  }}
                  onClick={() => navigate('/admin/books')}
                >
                  <ListItemIcon>
                    <LibraryBooks sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={designSystem.typography.body}>
                        Gérer les Livres
                      </Typography>
                    }
                    secondary={
                      <Typography sx={designSystem.typography.caption}>
                        Ajouter, modifier, supprimer
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    borderRadius: designSystem.card.borderRadius, 
                    mb: 1,
                    border: `1px solid ${designSystem.colors.border.light}`,
                    transition: designSystem.card.transition,
                    '&:hover': {
                      borderColor: designSystem.colors.background.hover,
                      bgcolor: designSystem.colors.background.light,
                      boxShadow: designSystem.shadows.cardHover
                    }
                  }}
                  onClick={() => navigate('/admin/users')}
                >
                  <ListItemIcon>
                    <People sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={designSystem.typography.body}>
                        Gérer les Utilisateurs
                      </Typography>
                    }
                    secondary={
                      <Typography sx={designSystem.typography.caption}>
                        {stats.totalUsers} utilisateurs
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    borderRadius: designSystem.card.borderRadius, 
                    mb: 1,
                    border: `1px solid ${designSystem.colors.border.light}`,
                    transition: designSystem.card.transition,
                    '&:hover': {
                      borderColor: designSystem.colors.background.hover,
                      bgcolor: designSystem.colors.background.light,
                      boxShadow: designSystem.shadows.cardHover
                    }
                  }}
                  onClick={() => navigate('/admin/loans')}
                >
                  <ListItemIcon>
                    <Bookmark sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={designSystem.typography.body}>
                        Gérer les Prêts
                      </Typography>
                    }
                    secondary={
                      <Typography sx={designSystem.typography.caption}>
                        {stats.activeLoans} actifs
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    borderRadius: designSystem.card.borderRadius,
                    border: `1px solid ${designSystem.colors.border.light}`,
                    transition: designSystem.card.transition,
                    '&:hover': {
                      borderColor: designSystem.colors.background.hover,
                      bgcolor: designSystem.colors.background.light,
                      boxShadow: designSystem.shadows.cardHover
                    }
                  }}
                  onClick={() => navigate('/admin/reports')}
                >
                  <ListItemIcon>
                    <BarChart sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={designSystem.typography.body}>
                        Rapports
                      </Typography>
                    }
                    secondary={
                      <Typography sx={designSystem.typography.caption}>
                        Statistiques détaillées
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Popular Genres */}
          <Card sx={{
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent>
              <Typography variant="h5" sx={{ 
                ...designSystem.typography.h5,
                mb: 2
              }}>
                <Category sx={{ verticalAlign: 'middle', mr: 1 }} />
                Genres Populaires
              </Typography>
              
              {stats.popularGenres.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Category sx={{ 
                    fontSize: 60, 
                    color: designSystem.colors.text.muted, 
                    mb: 2, 
                    opacity: 0.3 
                  }} />
                  <Typography variant="body2" sx={{ 
                    ...designSystem.typography.body,
                    color: designSystem.colors.text.muted
                  }}>
                    Aucune donnée disponible
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  {stats.popularGenres.map((genre, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                          ...designSystem.typography.body,
                          fontWeight: 600,
                          color: designSystem.colors.text.primary
                        }}>
                          {genre.name}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          ...designSystem.typography.body,
                          color: designSystem.colors.text.muted
                        }}>
                          {genre.count} livre(s)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((genre.count / stats.totalBooks) * 100, 100)} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: designSystem.colors.primary.light,
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: designSystem.colors.primary.main,
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/admin/books')}
                  startIcon={<ArrowForward />}
                  sx={designSystem.button.primary}
                >
                  Voir tous les livres
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;