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
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  LinearProgress,
  Alert,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';

import {
  LibraryBooks,
  Bookmark,
  Warning,
  TrendingUp,
  Schedule,
  CheckCircle,
  RecentActors,
  Autorenew,
  AssignmentReturn,
  Search,
  ArrowForward,
  Star,
  MenuBook,
  Book,
  LocalLibrary,
  People,
  Refresh,
  CalendarToday,
  Close
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    currentLoans: 0,
    overdueLoans: 0,
    returnedLoans: 0,
    totalFines: 0,
    readingGoal: 0,
    readBooks: 0,
    reservedBooks: 0,
    favoriteGenres: ['Roman', 'Science-Fiction', 'Policier'],
    nextDueBook: '',
    nextDueDate: '',
    dueSoonCount: 0,
    booksReadThisYear: 0,
    booksReadThisMonth: 0,
    mostBorrowedGenre: ''
  });
  
  const [readingProgress, setReadingProgress] = useState({
    goal: 12,
    booksReadThisYear: 0,
    booksReadThisMonth: 0,
    progressPercentage: 0,
    booksRemaining: 12,
    averageBooksPerMonth: 0,
    currentStreak: 0,
    longestStreak: 0,
    monthlyStats: {},
    genreStats: {},
    paceToGoal: 1,
    recommendation: ''
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [dueSoonLoans, setDueSoonLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadReadingProgress = async () => {
    try {
      const response = await api.get('/reading/progress');
      if (response.data.success) {
        const progress = response.data.data.progress;
        setReadingProgress(prev => ({
          ...prev,
          ...progress,
          paceToGoal: progress.booksRemaining > 0 ? 
            (12 - new Date().getMonth()) / progress.booksRemaining : 0
        }));
        
        setStats(prev => ({
          ...prev,
          readingGoal: progress.progressPercentage,
          readBooks: progress.booksReadThisYear,
          booksReadThisYear: progress.booksReadThisYear,
          booksReadThisMonth: progress.booksReadThisMonth
        }));
      }
    } catch (err) {
      console.error('Error loading reading progress:', err);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load reading progress first
      await loadReadingProgress();
      
      // Fetch dashboard stats
      const statsResponse = await api.get('/dashboard/stats');
      
      if (statsResponse.data.success) {
        const dashboardStats = statsResponse.data.stats;
        
        setStats(prev => ({
          ...prev,
          currentLoans: dashboardStats.activeLoans || 0,
          overdueLoans: dashboardStats.overdueLoans || 0,
          returnedLoans: dashboardStats.returnedLoans || 0,
          totalFines: dashboardStats.totalFines || 0,
          reservedBooks: dashboardStats.reservedBooks || 0,
          favoriteGenres: dashboardStats.favoriteGenres || ['Roman', 'Science-Fiction', 'Policier'],
          nextDueBook: dashboardStats.nextDueBookTitle || '',
          nextDueDate: dashboardStats.nextDueDate || '',
          dueSoonCount: dashboardStats.dueSoonLoans || 0,
          mostBorrowedGenre: dashboardStats.mostBorrowedGenre || ''
        }));
      }
      
      // Fetch recent activity
      const recentResponse = await api.get('/dashboard/recent-activity?limit=5');
      if (recentResponse.data.success) {
        const recentLoans = recentResponse.data.items || [];
        const formattedRecent = recentLoans.map(loan => ({
          id: loan.id,
          type: loan.status === 'ACTIVE' ? 'loan' : 
                loan.status === 'RETURNED' ? 'return' : 'overdue',
          book: loan.book?.title || 'Titre inconnu',
          date: new Date(loan.loanDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          dueDate: loan.dueDate ? new Date(loan.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : null,
          status: loan.status === 'ACTIVE' ? 'active' : 
                 loan.status === 'RETURNED' ? 'completed' : 'overdue',
          loanData: loan
        }));
        setRecentActivity(formattedRecent);
      }
      
      // Fetch due soon loans
      const dueSoonResponse = await api.get('/dashboard/due-soon?days=3');
      if (dueSoonResponse.data.success) {
        const dueLoans = dueSoonResponse.data.items || [];
        setDueSoonLoans(dueLoans);
      }
      
      // Fetch favorite genres
      const genresResponse = await api.get('/dashboard/favorite-genres');
      if (genresResponse.data.success) {
        const genresData = genresResponse.data.data?.favoriteGenres || [];
        if (genresData.length > 0) {
          const genresList = genresData.map(g => g.genre);
          setStats(prev => ({ ...prev, favoriteGenres: genresList }));
        }
      }
      
    } catch (apiError) {
      console.error('API Error:', apiError);
      // Fallback to basic loan data
      const loansResponse = await api.get('/loans/my-loans');
      if (loansResponse.data.success) {
        const loans = loansResponse.data.items || loansResponse.data.data || [];
        
        const currentLoans = loans.filter(loan => loan.status === 'ACTIVE').length;
        const overdueLoans = loans.filter(loan => loan.status === 'OVERDUE').length;
        const returnedLoans = loans.filter(loan => loan.status === 'RETURNED').length;
        const totalFines = loans.reduce((sum, loan) => sum + (loan.fineAmount || 0), 0);
        
        setStats(prev => ({
          ...prev,
          currentLoans,
          overdueLoans,
          returnedLoans,
          totalFines
        }));
        
        // Format recent activity
        const recent = loans.slice(0, 5).map(loan => ({
          id: loan.id,
          type: loan.status === 'ACTIVE' ? 'loan' : 
                loan.status === 'RETURNED' ? 'return' : 'overdue',
          book: loan.book?.title || 'Titre inconnu',
          date: new Date(loan.loanDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          dueDate: loan.dueDate ? new Date(loan.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : null,
          status: loan.status === 'ACTIVE' ? 'active' : 
                 loan.status === 'RETURNED' ? 'completed' : 'overdue',
          loanData: loan
        }));
        setRecentActivity(recent);
        
        // Get due soon loans
        const today = new Date();
        const dueSoon = loans.filter(loan => {
          if (loan.status !== 'ACTIVE') return false;
          const dueDate = new Date(loan.dueDate);
          const diffTime = dueDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 3 && diffDays >= 0;
        });
        setDueSoonLoans(dueSoon);
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, progress, onClick }) => (
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
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: `${color}20`,
                '& .MuiLinearProgress-bar': { bgcolor: color }
              }} 
            />
            <Typography variant="body2" sx={{ 
              ...designSystem.typography.caption,
              color: designSystem.colors.text.muted,
              mt: 1
            }}>
              {progress}% complété
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderReadingProgressSection = () => (
    <Card sx={{ 
      mb: 4,
      ...designSystem.card,
      bgcolor: designSystem.colors.background.card
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={designSystem.typography.h5}>
            <TrendingUp sx={{ verticalAlign: 'middle', mr: 1 }} />
            Mon Progrès de Lecture {new Date().getFullYear()}
          </Typography>
          <Button 
            size="small" 
            startIcon={<LocalLibrary />}
            onClick={() => navigate('/reading-challenge')}
            sx={designSystem.button.primary}
          >
            Voir le défi
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Progress Bar with Details */}
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ 
                  ...designSystem.typography.body,
                  color: designSystem.colors.text.muted
                }}>
                  {readingProgress.booksReadThisYear} sur {readingProgress.goal} livres
                </Typography>
                <Typography variant="body2" sx={{ 
                  ...designSystem.typography.body,
                  color: designSystem.colors.primary.main,
                  fontWeight: 600
                }}>
                  {readingProgress.progressPercentage}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={readingProgress.progressPercentage} 
                sx={{ 
                  height: 12, 
                  borderRadius: 6,
                  bgcolor: designSystem.colors.primary.light,
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: readingProgress.progressPercentage >= 100 ? designSystem.colors.status.available.text : designSystem.colors.primary.main,
                    borderRadius: 6
                  }
                }} 
              />
              <Typography variant="caption" sx={{ 
                ...designSystem.typography.caption,
                color: designSystem.colors.text.muted,
                mt: 1, 
                display: 'block' 
              }}>
                {readingProgress.booksRemaining} livre(s) restant(s) pour atteindre votre objectif
              </Typography>
            </Box>
          </Grid>

          {/* Stats Grid */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 2, 
              bgcolor: '#fef3c7',
              border: `1px solid ${designSystem.colors.border.light}`,
              borderRadius: designSystem.card.borderRadius
            }}>
              <Typography variant="body2" sx={{ 
                ...designSystem.typography.body,
                color: designSystem.colors.primary.main,
                opacity: 0.9 
              }}>
                Objectif Annuel
              </Typography>
              <Typography variant="h4" sx={{ 
                ...designSystem.typography.h4,
                fontWeight: 700,
                color: designSystem.colors.primary.main
              }}>
                {readingProgress.goal} livres
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
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
                Lu ce mois
              </Typography>
              <Typography variant="h4" sx={{ 
                ...designSystem.typography.h4,
                fontWeight: 700,
                color: designSystem.colors.status.available.text
              }}>
                {readingProgress.booksReadThisMonth} livres
              </Typography>
            </Paper>
          </Grid>

          {/* Streak and Pace */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Chip
                icon={<Schedule />}
                label={`Série actuelle: ${readingProgress.currentStreak} jours`}
                sx={{
                  bgcolor: designSystem.colors.status.available.bg,
                  color: designSystem.colors.status.available.text,
                  border: `1px solid ${designSystem.colors.status.available.border}`,
                  fontWeight: 700,
                  fontFamily: designSystem.typography.body.fontFamily
                }}
              />
              <Chip
                icon={<TrendingUp />}
                label={`Moyenne: ${readingProgress.averageBooksPerMonth.toFixed(1)} livres/mois`}
                sx={{
                  bgcolor: '#fef3c7',
                  color: designSystem.colors.primary.light,
                  border: `1px solid #fbbf24`,
                  fontWeight: 700,
                  fontFamily: designSystem.typography.body.fontFamily
                }}
              />
              <Chip
                icon={<CalendarToday />}
                label={`Pace requis: ${readingProgress.paceToGoal.toFixed(1)} livres/mois`}
                sx={{
                  bgcolor: '#fef3c7',
                  color: '#f97316',
                  border: `1px solid #fbbf24`,
                  fontWeight: 700,
                  fontFamily: designSystem.typography.body.fontFamily
                }}
              />
            </Box>
          </Grid>

          {/* Monthly Progress Visualization */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ 
              ...designSystem.typography.body,
              fontWeight: 600,
              color: designSystem.colors.text.muted,
              mb: 2
            }}>
              Progression mensuelle:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 100 }}>
              {Object.entries(readingProgress.monthlyStats || {}).map(([month, count]) => {
                const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
                const currentMonth = new Date().getMonth() + 1;
                const isCurrent = parseInt(month) === currentMonth;
                const height = Math.min((count / 5) * 80, 80);
                
                return (
                  <Box key={month} sx={{ textAlign: 'center', flex: 1 }}>
                    <Box
                      sx={{
                        height: `${height}px`,
                        bgcolor: isCurrent ? designSystem.colors.primary.main : designSystem.colors.primary.light,
                        borderRadius: '4px 4px 0 0',
                        mb: 1
                      }}
                    />
                    <Typography variant="caption" sx={{ 
                      ...designSystem.typography.caption,
                      color: designSystem.colors.text.muted
                    }}>
                      {monthNames[parseInt(month) - 1]}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      ...designSystem.typography.caption,
                      display: 'block',
                      fontWeight: 600,
                      color: designSystem.colors.text.primary
                    }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Genre Distribution */}
          {readingProgress.genreStats && Object.keys(readingProgress.genreStats).length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ 
                ...designSystem.typography.body,
                fontWeight: 600,
                color: designSystem.colors.text.muted,
                mb: 2
              }}>
                Vos genres cette année:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(readingProgress.genreStats).map(([genre, count]) => (
                  <Chip
                    key={genre}
                    label={`${genre}: ${count}`}
                    size="small"
                    sx={{
                      borderColor: designSystem.colors.primary.main,
                      color: designSystem.colors.primary.main,
                      fontWeight: 600,
                      fontFamily: designSystem.typography.body.fontFamily,
                      '&:hover': { bgcolor: designSystem.colors.primary.main, color: 'white' }
                    }}
                  />
                ))}
              </Box>
            </Grid>
          )}

          {/* Recommendation */}
          {readingProgress.recommendation && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ 
                bgcolor: '#e0f2fe',
                border: `1px solid #38bdf8`,
                color: '#0369a1'
              }}>
                <Typography variant="body2" sx={designSystem.typography.body}>
                  <strong>Conseil:</strong> {readingProgress.recommendation}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<TrendingUp />}
            onClick={() => {
              const newGoal = parseInt(prompt('Nouvel objectif annuel (nombre de livres):', readingProgress.goal));
              if (newGoal && newGoal > 0 && newGoal <= 100) {
                api.put('/reading/goal', { goal: newGoal })
                  .then(() => loadReadingProgress());
              } else if (newGoal) {
                alert('Veuillez entrer un nombre valide entre 1 et 100');
              }
            }}
            sx={designSystem.button.primary}
          >
            Modifier l'objectif
          </Button>
          <Button
            variant="contained"
            startIcon={<Book />}
            onClick={() => navigate('/catalogue')}
            sx={designSystem.button.contained}
          >
            Trouver mon prochain livre
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getActivityStatusLabel = (status) => {
    const labels = {
      active: 'En cours',
      completed: 'Terminé',
      waiting: 'En attente',
      overdue: 'En retard'
    };
    return labels[status] || status;
  };

  const getActivityStatusColor = (status) => {
    const colors = {
      active: designSystem.colors.primary.main,
      completed: designSystem.colors.status.available.text,
      waiting: '#f97316',
      overdue: designSystem.colors.status.unavailable.text
    };
    return colors[status] || designSystem.colors.text.muted;
  };

  const getActivityStatusBgColor = (status) => {
    const colors = {
      active: '#fef3c7',
      completed: designSystem.colors.status.available.bg,
      waiting: '#fef3c7',
      overdue: designSystem.colors.status.unavailable.bg
    };
    return colors[status] || '#f5f5f5';
  };

  const handleRenewLoan = async (loanId) => {
    try {
      const response = await api.put(`/loans/${loanId}/renew`);
      if (response.data.success) {
        loadDashboardData();
      }
    } catch (err) {
      console.error('Error renewing loan:', err);
    }
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
              Bonjour, {user?.username || 'Lecteur'} !
            </Typography>
            <Typography variant="h6" sx={{
              ...designSystem.typography.subtitle,
              fontStyle: 'italic',
              fontWeight: 300
            }}>
              Voici votre activité de lecture et vos emprunts en cours
            </Typography>
          </Box>
          <Typography variant="body2" sx={{
            ...designSystem.typography.caption
          }}>
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
      </Box>

      {/* Alertes importantes */}
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
              onClick={() => navigate('/emprunts')}
              sx={designSystem.button.primary}
            >
              Voir mes retards
            </Button>
          }
        >
          <strong>{stats.overdueLoans} livre(s) en retard.</strong> Veuillez les retourner rapidement pour éviter des amendes supplémentaires.
        </Alert>
      )}

      {stats.dueSoonCount > 0 && (
        <Alert 
          severity="warning"
          sx={{ 
            mb: 4,
            bgcolor: '#fef3c7',
            border: `1px solid #fbbf24`,
            color: '#92400e'
          }}
          icon={<Schedule />}
          action={
            <Button 
              size="small"
              onClick={() => navigate('/emprunts')}
              sx={designSystem.button.primary}
            >
              Gérer
            </Button>
          }
        >
          <strong>{stats.dueSoonCount} livre(s) à retourner bientôt.</strong> Pensez à les renouveler si nécessaire.
        </Alert>
      )}

      {/* Reading Progress Section */}
      {renderReadingProgressSection()}

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="EMPRUNTS ACTIFS"
            value={stats.currentLoans}
            subtitle={stats.overdueLoans > 0 ? `Dont ${stats.overdueLoans} en retard` : "Tous à jour"}
            icon={<Bookmark fontSize="large" />}
            color={designSystem.colors.primary.main}
            onClick={() => navigate('/emprunts')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="LIVRES LUS"
            value={stats.readBooks}
            subtitle="Dans votre historique"
            icon={<CheckCircle fontSize="large" />}
            color={designSystem.colors.status.available.text}
            onClick={() => navigate('/historique')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="AMENDES"
            value={`${stats.totalFines.toFixed(2)} TND`}
            subtitle={stats.totalFines > 0 ? "À régulariser" : "Aucune amende"}
            icon={<Warning fontSize="large" />}
            color={designSystem.colors.status.unavailable.text}
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Colonne de gauche - Activité récente et livres à retourner */}
        <Grid item xs={12} lg={8}>
          {/* Section: Livres à retourner bientôt */}
          {dueSoonLoans.length > 0 && (
            <Card sx={{ 
              mb: 4,
              ...designSystem.card,
              bgcolor: designSystem.colors.background.card
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={designSystem.typography.h5}>
                    <Schedule sx={{ verticalAlign: 'middle', mr: 1 }} />
                    À retourner bientôt
                  </Typography>
                  <Button 
                    startIcon={<ArrowForward />} 
                    size="small"
                    onClick={() => navigate('/emprunts')}
                    sx={designSystem.button.primary}
                  >
                    Voir tous
                  </Button>
                </Box>
                
                <List>
                  {dueSoonLoans.map((loan) => {
                    const daysRemaining = getDaysRemaining(loan.dueDate);
                    
                    return (
                      <ListItem 
                        key={loan.id}
                        sx={{ 
                          border: `1px solid ${designSystem.colors.border.light}`, 
                          borderRadius: designSystem.card.borderRadius, 
                          mb: 1,
                          transition: designSystem.card.transition,
                          '&:hover': { 
                            borderColor: designSystem.colors.background.hover,
                            boxShadow: designSystem.shadows.cardHover
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Book sx={{ color: designSystem.colors.primary.main }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ 
                              ...designSystem.typography.body,
                              fontWeight: 600,
                              color: designSystem.colors.text.primary
                            }}>
                              {loan.book?.title || 'Titre inconnu'}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Typography variant="caption" sx={{ 
                                ...designSystem.typography.caption,
                                color: designSystem.colors.text.muted
                              }}>
                                Retour le {formatDate(loan.dueDate)}
                              </Typography>
                              <Chip 
                                label={`${daysRemaining} jour(s)`}
                                size="small"
                                sx={{
                                  bgcolor: daysRemaining <= 1 ? designSystem.colors.status.unavailable.bg : '#fef3c7',
                                  color: daysRemaining <= 1 ? designSystem.colors.status.unavailable.text : '#f97316',
                                  border: `1px solid ${daysRemaining <= 1 ? designSystem.colors.status.unavailable.border : '#fbbf24'}`,
                                  fontWeight: 700,
                                  fontFamily: designSystem.typography.body.fontFamily
                                }}
                              />
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<Autorenew />}
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenewLoan(loan.id);
                            }}
                            sx={designSystem.button.primary}
                          >
                            Renouveler
                          </Button>
                          <Button
                            size="small"
                            startIcon={<AssignmentReturn />}
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/emprunts');
                            }}
                            sx={designSystem.button.contained}
                          >
                            Retourner
                          </Button>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Section: Derniers emprunts */}
          <Card sx={{
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={designSystem.typography.h5}>
                  <RecentActors sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Dernière activité
                </Typography>
                <Button 
                  startIcon={<Refresh />} 
                  size="small"
                  onClick={() => loadDashboardData()}
                  sx={designSystem.button.primary}
                >
                  Actualiser
                </Button>
              </Box>
              
              {recentActivity.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LibraryBooks sx={{ 
                    fontSize: 60, 
                    color: designSystem.colors.text.muted, 
                    mb: 2, 
                    opacity: 0.5 
                  }} />
                  <Typography variant="h6" sx={{ 
                    ...designSystem.typography.h6,
                    color: designSystem.colors.text.muted
                  }}>
                    Aucun emprunt récent
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    ...designSystem.typography.body,
                    color: designSystem.colors.text.muted,
                    mb: 3
                  }}>
                    Commencez par explorer notre catalogue
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Search />}
                    onClick={() => navigate('/catalogue')}
                    sx={designSystem.button.contained}
                  >
                    Explorer le catalogue
                  </Button>
                </Box>
              ) : (
                <List>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem 
                        sx={{ 
                          py: 2,
                          px: 0,
                          cursor: 'pointer',
                          transition: designSystem.card.transition,
                          '&:hover': { 
                            bgcolor: designSystem.colors.background.light,
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            borderRadius: designSystem.card.borderRadius
                          }
                        }}
                        onClick={() => {
                          if (activity.loanData?.book?.id) {
                            navigate(`/livres/${activity.loanData.book.id}`);
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          <Avatar
                            sx={{ 
                              bgcolor: getActivityStatusBgColor(activity.status),
                              color: getActivityStatusColor(activity.status),
                              width: 40,
                              height: 40
                            }}
                          >
                            {activity.status === 'active' ? <Bookmark /> :
                             activity.status === 'completed' ? <CheckCircle /> :
                             activity.status === 'overdue' ? <Warning /> : <Book />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ 
                                ...designSystem.typography.body,
                                fontWeight: 600,
                                color: designSystem.colors.text.primary
                              }}>
                                {activity.book}
                              </Typography>
                              <Chip 
                                label={getActivityStatusLabel(activity.status)}
                                size="small"
                                sx={{
                                  bgcolor: getActivityStatusBgColor(activity.status),
                                  color: getActivityStatusColor(activity.status),
                                  border: `1px solid ${getActivityStatusColor(activity.status)}`,
                                  fontWeight: 700,
                                  fontFamily: designSystem.typography.body.fontFamily
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Typography variant="caption" sx={{ 
                                ...designSystem.typography.caption,
                                color: designSystem.colors.text.muted
                              }}>
                                Emprunté le {activity.date}
                              </Typography>
                              {activity.dueDate && (
                                <>
                                  <Typography variant="caption" sx={{ 
                                    ...designSystem.typography.caption,
                                    color: designSystem.colors.text.muted
                                  }}>•</Typography>
                                  <Typography variant="caption" sx={{ 
                                    ...designSystem.typography.caption,
                                    color: designSystem.colors.primary.main,
                                    fontWeight: 600
                                  }}>
                                    Retour: {activity.dueDate}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Colonne de droite - Actions rapides et suggestions */}
        <Grid item xs={12} lg={4}>
          {/* Actions rapides */}
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
                <MenuBook sx={{ verticalAlign: 'middle', mr: 1 }} />
                Actions Rapides
              </Typography>
              <List>
                <ListItem 
                  button 
                  sx={{ 
                    borderRadius: designSystem.card.borderRadius, 
                    mb: 1,
                    transition: designSystem.card.transition,
                    '&:hover': { 
                      bgcolor: designSystem.colors.background.light,
                      border: `1px solid ${designSystem.colors.border.light}`
                    }
                  }}
                  onClick={() => navigate('/catalogue')}
                >
                  <ListItemIcon>
                    <Search sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={designSystem.typography.body}>
                        Explorer le catalogue
                      </Typography>
                    }
                    secondary={
                      <Typography sx={designSystem.typography.caption}>
                        Trouver de nouveaux livres
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    borderRadius: designSystem.card.borderRadius, 
                    mb: 1,
                    transition: designSystem.card.transition,
                    '&:hover': { 
                      bgcolor: designSystem.colors.background.light,
                      border: `1px solid ${designSystem.colors.border.light}`
                    }
                  }}
                  onClick={() => navigate('/emprunts')}
                >
                  <ListItemIcon>
                    <Bookmark sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={designSystem.typography.body}>
                        Mes emprunts
                      </Typography>
                    }
                    secondary={
                      <Typography sx={designSystem.typography.caption}>
                        {stats.currentLoans} livre(s) actif(s)
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    borderRadius: designSystem.card.borderRadius, 
                    mb: 1,
                    transition: designSystem.card.transition,
                    '&:hover': { 
                      bgcolor: designSystem.colors.background.light,
                      border: `1px solid ${designSystem.colors.border.light}`
                    }
                  }}
                  onClick={() => navigate('/historique')}
                >
                  <ListItemIcon>
                    <RecentActors sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={designSystem.typography.body}>
                        Mon historique
                      </Typography>
                    }
                    secondary={
                      <Typography sx={designSystem.typography.caption}>
                        {stats.readBooks} livre(s) lu(s)
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    borderRadius: designSystem.card.borderRadius,
                    transition: designSystem.card.transition,
                    '&:hover': { 
                      bgcolor: designSystem.colors.background.light,
                      border: `1px solid ${designSystem.colors.border.light}`
                    }
                  }}
                  onClick={() => navigate('/profile')}
                >
                  <ListItemIcon>
                    <People sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={designSystem.typography.body}>
                        Mon profil
                      </Typography>
                    }
                    secondary={
                      <Typography sx={designSystem.typography.caption}>
                        Modifier mes informations
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Prochain retour & Suggestions */}
          <Card sx={{
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent>
              {stats.nextDueBook && (
                <>
                  <Typography variant="h5" sx={designSystem.typography.h5}>
                    Prochain Retour
                  </Typography>
                  <Alert 
                    severity="warning"
                    sx={{ 
                      mb: 3,
                      bgcolor: '#fef3c7',
                      border: `1px solid #fbbf24`,
                      color: '#92400e'
                    }}
                    icon={<Schedule />}
                  >
                    <Typography variant="subtitle2" sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 600
                    }}>
                      {stats.nextDueBook}
                    </Typography>
                    <Typography variant="body2" sx={designSystem.typography.body}>
                      {stats.nextDueDate ? `À retourner avant le ${formatDate(stats.nextDueDate)}` : 'À retourner bientôt'}
                    </Typography>
                  </Alert>
                </>
              )}
              
              <Typography variant="h5" sx={{ 
                ...designSystem.typography.h5,
                mb: 2, 
                mt: stats.nextDueBook ? 3 : 0
              }}>
                <Star sx={{ verticalAlign: 'middle', mr: 1 }} />
                Mes Genres Préférés
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {stats.favoriteGenres?.map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    sx={{
                      borderColor: designSystem.colors.primary.main,
                      color: designSystem.colors.primary.main,
                      fontWeight: 600,
                      fontFamily: designSystem.typography.body.fontFamily,
                      '&:hover': { bgcolor: designSystem.colors.primary.main, color: 'white' }
                    }}
                  />
                ))}
              </Box>
              
              {stats.mostBorrowedGenre && (
                <Alert severity="info" sx={{ 
                  mb: 2,
                  bgcolor: '#e0f2fe',
                  border: `1px solid #38bdf8`,
                  color: '#0369a1'
                }}>
                  <Typography variant="body2" sx={designSystem.typography.body}>
                    Votre genre préféré: <strong>{stats.mostBorrowedGenre}</strong>
                  </Typography>
                </Alert>
              )}
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/catalogue')}
                  startIcon={<Search />}
                  sx={designSystem.button.primary}
                >
                  Trouver des livres similaires
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;