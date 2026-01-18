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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Badge,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  LibraryBooks,
  People,
  Bookmark,
  Warning,
  TrendingUp,
  Schedule,
  CheckCircle,
  Error,
  Notifications,
  Refresh,
  Visibility,
  MoreVert,
  CalendarToday,
  LocalLibrary,
  BarChart,
  RecentActors,
  CloudUpload,  // Add this

} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../../store/authStore';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  // Vérifier le rôle de l'utilisateur
  useEffect(() => {
    const admin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_EMPLOYEE');
    setIsAdmin(admin);
    
    // Charger les données en fonction du rôle
    loadDashboardData(admin);
  }, [user]);

  const loadDashboardData = (adminRole) => {
    // Données simulées pour le dashboard
    if (adminRole) {
      // Statistiques administrateur
      setStats({
        totalBooks: 1254,
        totalUsers: 342,
        activeLoans: 89,
        overdueLoans: 12,
        newRegistrations: 8,
        availableBooks: 1156,
        popularGenres: ['Roman', 'Science-Fiction', 'Histoire'],
        monthlyGrowth: 12.5
      });

      // Activité récente (admin)
      setRecentActivity([
        { id: 1, type: 'loan', user: 'Marie Dubois', book: 'L\'Étranger', time: '2 min', status: 'completed' },
        { id: 2, type: 'return', user: 'Jean Martin', book: '1984', time: '15 min', status: 'completed' },
        { id: 3, type: 'reservation', user: 'Sophie Laurent', book: 'Le Petit Prince', time: '1 h', status: 'pending' },
        { id: 4, type: 'overdue', user: 'Pierre Moreau', book: 'Les Misérables', time: '2 h', status: 'warning' },
        { id: 5, type: 'registration', user: 'Nouvel utilisateur', book: null, time: '3 h', status: 'info' }
      ]);
    } else {
      // Statistiques lecteur
      setStats({
        currentLoans: 3,
        readBooks: 45,
        overdueBooks: 1,
        reservedBooks: 2,
        favoriteGenres: ['Roman', 'Science-Fiction', 'Policier'],
        readingGoal: 75
      });

      // Activité récente (lecteur)
      setRecentActivity([
        { id: 1, type: 'loan', book: 'L\'Étranger', date: '15 Jan', dueDate: '15 Fév', status: 'active' },
        { id: 2, type: 'return', book: '1984', date: '10 Jan', dueDate: null, status: 'completed' },
        { id: 3, type: 'reservation', book: 'Dune', date: '8 Jan', dueDate: null, status: 'waiting' },
        { id: 4, type: 'overdue', book: 'Les Misérables', date: '20 Déc', dueDate: '10 Jan', status: 'overdue' }
      ]);
    }
  };
// Fonction pour importer CSV
  const handleCsvImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/books/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setImportResult({
          type: 'success',
          message: data.message,
          details: data.data
        });
        // Refresh stats after import
        loadDashboardData(true);
      } else {
        setImportResult({
          type: 'error',
          message: data.message || 'Erreur lors de l\'import'
        });
      }
    } catch (error) {
      setImportResult({
        type: 'error',
        message: 'Erreur de connexion au serveur'
      });
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };
  // Composant de carte de statistique réutilisable
  const StatCard = ({ title, value, subtitle, icon, color, progress }) => (
    <Card sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="overline" fontWeight="600">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="700" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {progress}% complété
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Rendu du dashboard administrateur
  const renderAdminDashboard = () => (
    <>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ 
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          mb: 1
        }}>
          Tableau de Bord Administrateur
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Aperçu complet de l'activité de la bibliothèque
        </Typography>
      </Box>

      {/* Alertes importantes */}
      {stats.overdueLoans > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small">
              Voir les retards
            </Button>
          }
        >
          <strong>{stats.overdueLoans} emprunt(s) en retard</strong> nécessitent votre attention.
        </Alert>
      )}

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TOTAL LIVRES"
            value={stats.totalBooks}
            subtitle="+12 ce mois"
            icon={<LibraryBooks fontSize="large" />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="UTILISATEURS"
            value={stats.totalUsers}
            subtitle={`+${stats.newRegistrations} nouveaux`}
            icon={<People fontSize="large" />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="EMPRUNTS ACTIFS"
            value={stats.activeLoans}
            subtitle={`${stats.overdueLoans} en retard`}
            icon={<Bookmark fontSize="large" />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="CROISSANCE"
            value={`${stats.monthlyGrowth}%`}
            subtitle="Ce mois"
            icon={<TrendingUp fontSize="large" />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Colonne de gauche */}
        <Grid item xs={12} lg={8}>
          {/* Activité récente */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="600">
                  Activité Récente
                </Typography>
                <Button startIcon={<Refresh />} size="small">
                  Actualiser
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Utilisateur</TableCell>
                      <TableCell>Livre</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Délai</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {activity.user}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {activity.book}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getActivityTypeLabel(activity.type)}
                            size="small"
                            color={getActivityColor(activity.type)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            Il y a {activity.time}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Livres populaires */}
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Genres Populaires
              </Typography>
              <Grid container spacing={2}>
                {stats.popularGenres?.map((genre, index) => (
                  <Grid item xs={12} sm={6} md={4} key={genre}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          bgcolor: 'primary.main'
                        }
                      }}
                    >
                      <Typography variant="h6" fontWeight="600">
                        {genre}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {(Math.random() * 50 + 50).toFixed(0)} emprunts
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Colonne de droite */}
        <Grid item xs={12} lg={4}>
          {/* Actions rapides */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Actions Rapides
              </Typography>

              {/* Import Result Alert */}
              {importResult && (
                  <Alert
                      severity={importResult.type}
                      sx={{ mb: 2 }}
                      onClose={() => setImportResult(null)}
                  >
                    <Typography variant="body2" fontWeight="600">
                      {importResult.message}
                    </Typography>
                    {importResult.details && (
                        <Typography variant="caption" display="block">
                          {importResult.details.successCount} ajoutés, {importResult.details.skipCount} ignorés
                          {importResult.details.errors?.length > 0 && `, ${importResult.details.errors.length} erreurs`}
                        </Typography>
                    )}
                  </Alert>
              )}

              <List>
                <ListItem button sx={{ borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <LibraryBooks color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Ajouter un livre" secondary="Nouvelle acquisition" />
                </ListItem>

                {/* Importer CSV Button */}
                <ListItem
                    component="label"
                    button
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: importing ? 'action.disabledBackground' : 'transparent',
                      cursor: importing ? 'wait' : 'pointer'
                    }}
                >
                  <ListItemIcon>
                    <CloudUpload color="primary" />
                  </ListItemIcon>
                  <ListItemText
                      primary={importing ? "Import en cours..." : "Importer CSV"}
                      secondary="Import en masse de livres"
                  />
                  {importing && (
                      <LinearProgress
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            borderRadius: '0 0 8px 8px'
                          }}
                      />
                  )}
                  <input
                      type="file"
                      accept=".csv"
                      hidden
                      onChange={handleCsvImport}
                      disabled={importing}
                  />
                </ListItem>

                <ListItem button sx={{ borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <People color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Gérer les utilisateurs" secondary="Inscriptions en attente" />
                </ListItem>
                <ListItem button sx={{ borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <Bookmark color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Voir les retards" secondary={`${stats.overdueLoans} emprunts`} />
                </ListItem>
                <ListItem button sx={{ borderRadius: 2 }}>
                  <ListItemIcon>
                    <BarChart color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Générer rapport" secondary="Export mensuel" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          {/* Statistiques de disponibilité */}
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Disponibilité
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Livres disponibles
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {stats.availableBooks}/{stats.totalBooks}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'success.light',
                    color: 'success.contrastText'
                  }}
                >
                  <CheckCircle />
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.availableBooks / stats.totalBooks) * 100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  mb: 2 
                }} 
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Taux d'emprunt
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {((stats.activeLoans / stats.totalBooks) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'info.light',
                    color: 'info.contrastText'
                  }}
                >
                  <TrendingUp />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  // Rendu du dashboard lecteur
  const renderLecteurDashboard = () => (
    <>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ 
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          mb: 1
        }}>
          Mon Tableau de Bord
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Bienvenue {user?.username || 'Lecteur'}, voici votre activité récente
        </Typography>
      </Box>

      {/* Alertes personnelles */}
      {stats.overdueBooks > 0 && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small">
              Régulariser
            </Button>
          }
        >
          <strong>{stats.overdueBooks} livre(s) en retard.</strong> Veuillez les retourner rapidement.
        </Alert>
      )}

      {/* Cartes de statistiques personnelles */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="EMPRUNTS EN COURS"
            value={stats.currentLoans}
            subtitle="Dont 1 bientôt dû"
            icon={<Bookmark fontSize="large" />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="LIVRES LUS"
            value={stats.readBooks}
            subtitle="Cette année"
            icon={<LocalLibrary fontSize="large" />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="EN RETARD"
            value={stats.overdueBooks}
            subtitle="À retourner"
            icon={<Warning fontSize="large" />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="OBJECTIF LECTURE"
            value={`${stats.readingGoal}%`}
            subtitle="Annuel"
            icon={<TrendingUp fontSize="large" />}
            color={theme.palette.warning.main}
            progress={stats.readingGoal}
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Colonne de gauche */}
        <Grid item xs={12} lg={8}>
          {/* Mes emprunts récents */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="600">
                  Mes Emprunts Récents
                </Typography>
                <Button startIcon={<Refresh />} size="small">
                  Actualiser
                </Button>
              </Box>
              
              <List>
                {recentActivity.map((activity) => (
                  <ListItem 
                    key={activity.id} 
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 2, 
                      mb: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.book}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {activity.date}
                          </Typography>
                          {activity.dueDate && (
                            <>
                              <Typography variant="caption" color="text.secondary">•</Typography>
                              <Typography 
                                variant="caption" 
                                color={activity.status === 'overdue' ? 'error' : 'text.secondary'}
                                fontWeight={activity.status === 'overdue' ? 600 : 400}
                              >
                                Retour: {activity.dueDate}
                              </Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                    <Chip 
                      label={getActivityStatusLabel(activity.status)}
                      size="small"
                      color={getActivityStatusColor(activity.status)}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Mes genres préférés */}
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Mes Genres Préférés
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {stats.favoriteGenres?.map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    variant="outlined"
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontWeight: 600,
                      '&:hover': { bgcolor: 'primary.main', color: 'white' }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Colonne de droite */}
        <Grid item xs={12} lg={4}>
          {/* Actions rapides */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Actions Rapides
              </Typography>
              <List>
                <ListItem button sx={{ borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <LibraryBooks color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Explorer le catalogue" secondary="Trouver de nouveaux livres" />
                </ListItem>
                <ListItem button sx={{ borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <Bookmark color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Mes emprunts" secondary="Voir tous mes emprunts" />
                </ListItem>
                <ListItem button sx={{ borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <RecentActors color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Mon historique" secondary="Livres déjà lus" />
                </ListItem>
                <ListItem button sx={{ borderRadius: 2 }}>
                  <ListItemIcon>
                    <CalendarToday color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Mes réservations" secondary={`${stats.reservedBooks} en attente`} />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Prochain retour */}
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
                Prochain Retour
              </Typography>
              <Alert 
                severity="warning" 
                icon={<Schedule />}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2" fontWeight="600">
                  L'Étranger
                </Typography>
                <Typography variant="body2">
                  À retourner avant le 15 Février
                </Typography>
              </Alert>
              <Box sx={{ textAlign: 'center' }}>
                <Button variant="contained" fullWidth>
                  Prolonger l'emprunt
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  // Fonctions utilitaires
  const getActivityTypeLabel = (type) => {
    const labels = {
      loan: 'Emprunt',
      return: 'Retour',
      reservation: 'Réservation',
      overdue: 'Retard',
      registration: 'Inscription'
    };
    return labels[type] || type;
  };

  const getActivityColor = (type) => {
    const colors = {
      loan: 'primary',
      return: 'success',
      reservation: 'warning',
      overdue: 'error',
      registration: 'info'
    };
    return colors[type] || 'default';
  };

  const getActivityIcon = (type) => {
    const icons = {
      loan: <Bookmark color="primary" />,
      return: <CheckCircle color="success" />,
      reservation: <Schedule color="warning" />,
      overdue: <Warning color="error" />
    };
    return icons[type] || <Bookmark />;
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
      active: 'primary',
      completed: 'success',
      waiting: 'warning',
      overdue: 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
      {isAdmin ? renderAdminDashboard() : renderLecteurDashboard()}
    </Container>
  );
};

export default Dashboard;