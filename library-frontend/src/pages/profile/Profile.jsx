import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Button,
  TextField,
  Divider,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Security,
  Notifications,
  PrivacyTip,
  Delete,
  Email,
  Person,
  CalendarToday,
  School,
  Badge,
  LibraryBooks,
  Bookmark,
  History
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../../store/authStore';

const Profile = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [openSecurityDialog, setOpenSecurityDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: user?.email || '',
    phone: '+33 1 23 45 67 89',
    institution: 'Université Paris-Saclay',
    department: 'Informatique',
    studentId: '21895674'
  });

  // Données simulées pour les statistiques
  const userStats = [
    { label: 'Livres empruntés', value: 24, icon: <LibraryBooks />, color: theme.palette.primary.main },
    { label: 'En cours', value: 3, icon: <Bookmark />, color: theme.palette.warning.main },
    { label: 'Historique', value: 21, icon: <History />, color: theme.palette.info.main },
    { label: 'Favoris', value: 12, icon: <Bookmark />, color: theme.palette.success.main }
  ];

  const handleEditToggle = () => {
    if (isEditing) {
      // Réinitialiser les données si annulation
      setFormData({
        firstName: 'John',
        lastName: 'Doe',
        email: user?.email || '',
        phone: '+33 1 23 45 67 89',
        institution: 'Université Paris-Saclay',
        department: 'Informatique',
        studentId: '21895674'
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setLoading(true);
    // Simuler une requête API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setIsEditing(false);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_ETUDIANT': return theme.palette.success.main;
      case 'ROLE_PROFESSEUR': return theme.palette.info.main;
      case 'ROLE_ADMIN': return theme.palette.error.main;
      default: return theme.palette.secondary.main;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ETUDIANT': return 'Étudiant';
      case 'ROLE_PROFESSEUR': return 'Professeur';
      case 'ROLE_ADMIN': return 'Administrateur';
      default: return role;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
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
          Mon Profil
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Gérez vos informations personnelles et vos préférences
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Colonne de gauche - Informations personnelles */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="600">
                  Informations Personnelles
                </Typography>
                <Button
                  startIcon={isEditing ? <Cancel /> : <Edit />}
                  onClick={handleEditToggle}
                  variant={isEditing ? "outlined" : "contained"}
                  color={isEditing ? "error" : "primary"}
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Numéro étudiant"
                    value={formData.studentId}
                    onChange={handleInputChange('studentId')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Badge sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Institution"
                    value={formData.institution}
                    onChange={handleInputChange('institution')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <School sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Département"
                    value={formData.department}
                    onChange={handleInputChange('department')}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleEditToggle}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Section Statistiques */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Mes Statistiques
              </Typography>
              <Grid container spacing={3}>
                {userStats.map((stat, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}08 100%)`,
                        border: `1px solid ${stat.color}20`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4]
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: `${stat.color}20`,
                          mb: 2,
                          color: stat.color
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography variant="h4" fontWeight="700" color={stat.color}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Colonne de droite - Informations complémentaires */}
        <Grid item xs={12} lg={4}>
          {/* Carte Photo de profil et Rôles */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 3,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: theme.shadows[4]
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              
              <Typography variant="h5" fontWeight="600" gutterBottom>
                {formData.firstName} {formData.lastName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formData.institution}
              </Typography>

              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {user?.roles?.map((role, index) => (
                  <Chip
                    key={index}
                    label={getRoleLabel(role)}
                    size="small"
                    sx={{
                      bgcolor: getRoleColor(role),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                ))}
              </Box>

              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 3 }}
                startIcon={<Edit />}
              >
                Changer la photo
              </Button>
            </CardContent>
          </Card>

          {/* Carte Préférences */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" fontWeight="600">
                  Préférences
                </Typography>
              </Box>
              <Divider />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Notifications color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Notifications par email" 
                    secondary="Recevoir les alertes de retour" 
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PrivacyTip color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Profil public" 
                    secondary="Rendre mon profil visible" 
                  />
                  <ListItemSecondaryAction>
                    <Switch />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Carte Actions rapides */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" fontWeight="600">
                  Actions
                </Typography>
              </Box>
              <Divider />
              <List>
                <ListItem button onClick={() => setOpenSecurityDialog(true)}>
                  <ListItemIcon>
                    <Security color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sécurité du compte" 
                    secondary="Changer le mot de passe" 
                  />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <Delete color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Supprimer le compte" 
                    secondary="Action irréversible" 
                    primaryTypographyProps={{ color: 'error' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Sécurité */}
      <Dialog 
        open={openSecurityDialog} 
        onClose={() => setOpenSecurityDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            <Typography variant="h6">Sécurité du compte</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Pour des raisons de sécurité, vous devrez vous reconnecter après avoir changé votre mot de passe.
          </Alert>
          <TextField
            fullWidth
            label="Mot de passe actuel"
            type="password"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            type="password"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirmer le nouveau mot de passe"
            type="password"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSecurityDialog(false)}>
            Annuler
          </Button>
          <Button variant="contained">
            Changer le mot de passe
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;