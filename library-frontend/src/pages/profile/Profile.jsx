import React, { useState, useEffect } from 'react';
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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar
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
  Badge,
  LibraryBooks,
  Bookmark,
  History,
  Phone,
  CreditCard
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../../store/authStore';
import axiosInstance, { API_BASE_URL } from '../../api/axios.config';

const Profile = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  
  // Helper function to get full image URL
  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return null;
    // If it's already a full URL (starts with http:// or https://)
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    // If it's a relative path, prepend the base URL
    // Remove /api from base URL and add the photo path
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${photoUrl.startsWith('/') ? photoUrl : '/' + photoUrl}`;
  };
  
  // États
  const [isEditing, setIsEditing] = useState(false);
  const [openSecurityDialog, setOpenSecurityDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identityCard: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteAccountData, setDeleteAccountData] = useState({
    password: ''
  });

  // Charger les données au montage
  useEffect(() => {
    fetchProfile();
    fetchStatistics();
  }, []);

  // === API CALLS ===
  
  const fetchProfile = async () => {
    try {
      setPageLoading(true);
      const response = await axiosInstance.get('/profile');
      console.log('Profile data:', response.data);
      console.log('Photo URL from API:', response.data.photoUrl);
      console.log('Full image URL:', getImageUrl(response.data.photoUrl));
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        phone: response.data.phoneNumber || '',
        identityCard: response.data.identityCard || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      showSnackbar('Erreur lors du chargement du profil', 'error');
    } finally {
      setPageLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get('/profile/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Don't show error message, just log it
      // Statistics are optional
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updateRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        identityCard: formData.identityCard
      };
      
      const response = await axiosInstance.put('/profile', updateRequest);
      
      setProfile(response.data);
      setIsEditing(false);
      showSnackbar('Profil mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de la mise à jour du profil',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showSnackbar('La taille de l\'image ne doit pas dépasser 5MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showSnackbar('Veuillez sélectionner une image valide', 'error');
        return;
      }
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedPhoto);

      await axiosInstance.post('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Recharger le profil pour obtenir la nouvelle URL
      await fetchProfile();
      setSelectedPhoto(null);
      setPhotoPreview(null);
      showSnackbar('Photo de profil mise à jour avec succès', 'success');
    } catch (error) {
      console.error('Error uploading photo:', error);
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de l\'upload de la photo',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete('/profile/photo');
      await fetchProfile();
      showSnackbar('Photo de profil supprimée avec succès', 'success');
    } catch (error) {
      console.error('Error deleting photo:', error);
      showSnackbar('Erreur lors de la suppression de la photo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (field, value) => {
    try {
      const preferencesRequest = {
        emailNotifications: profile.emailNotifications,
        publicProfile: profile.publicProfile,
        language: profile.language,
        theme: profile.theme,
        [field]: value
      };
      
      const response = await axiosInstance.put('/profile/preferences', preferencesRequest);
      
      setProfile(response.data);
      showSnackbar('Préférences mises à jour', 'success');
    } catch (error) {
      console.error('Error updating preferences:', error);
      showSnackbar('Erreur lors de la mise à jour des préférences', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSnackbar('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showSnackbar('Le mot de passe doit contenir au moins 8 caractères', 'error');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      setOpenSecurityDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSnackbar('Mot de passe modifié avec succès. Veuillez vous reconnecter.', 'success');
      
      // Optionnel: déconnexion automatique après 2 secondes
      setTimeout(() => {
        useAuthStore.getState().logout();
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      showSnackbar(
        error.response?.data?.message || 'Erreur lors du changement de mot de passe',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete('/profile/account', {
        data: { password: deleteAccountData.password }
      });
      
      showSnackbar('Compte supprimé avec succès', 'success');
      
      // Déconnexion et redirection après 2 secondes
      setTimeout(() => {
        useAuthStore.getState().logout();
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de la suppression du compte',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // === HANDLERS ===
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Réinitialiser les données si annulation
      setFormData({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        email: profile?.email || '',
        phone: profile?.phoneNumber || '',
        identityCard: profile?.identityCard || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // === UTILITY FUNCTIONS ===
  
  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_ETUDIANT': return theme.palette.success.main;
      case 'ROLE_PROFESSEUR': return theme.palette.info.main;
      case 'ROLE_LECTEUR': return theme.palette.warning.main;
      case 'ROLE_ADMIN': return theme.palette.error.main;
      default: return theme.palette.secondary.main;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ETUDIANT': return 'Étudiant';
      case 'ROLE_PROFESSEUR': return 'Professeur';
      case 'ROLE_LECTEUR': return 'Lecteur';
      case 'ROLE_ADMIN': return 'Administrateur';
      default: return role;
    }
  };

  // === LOADING STATE ===
  
  if (pageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Statistiques
  const userStats = statistics ? [
    { 
      label: 'Livres empruntés', 
      value: statistics.totalBorrowedBooks || 0, 
      icon: <LibraryBooks />, 
      color: theme.palette.primary.main 
    },
    { 
      label: 'En cours', 
      value: statistics.currentBorrowedBooks || 0, 
      icon: <Bookmark />, 
      color: theme.palette.warning.main 
    },
    { 
      label: 'Retournés', 
      value: statistics.returnedBooks || 0, 
      icon: <History />, 
      color: theme.palette.info.main 
    },
    { 
      label: 'En retard', 
      value: statistics.overdueBooks || 0, 
      icon: <Bookmark />, 
      color: theme.palette.error.main 
    }
  ] : [];

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
                    type="email"
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
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Carte d'identité"
                    value={formData.identityCard}
                    onChange={handleInputChange('identityCard')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <CreditCard sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    }}
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
          {statistics && (
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
          )}
        </Grid>

        {/* Colonne de droite */}
        <Grid item xs={12} lg={4}>
          {/* Carte Photo de profil */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                src={photoPreview || getImageUrl(profile?.photoUrl)}
                alt={`${profile?.firstName} ${profile?.lastName}`}
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
                imgProps={{
                  onError: (e) => {
                    console.error('Image load error:', profile?.photoUrl);
                    e.target.style.display = 'none';
                  }
                }}
              >
                {!profile?.photoUrl && !photoPreview && profile?.firstName?.charAt(0)?.toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" fontWeight="600" gutterBottom>
                {profile?.firstName} {profile?.lastName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile?.username}
              </Typography>

              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                {profile?.roles?.map((role, index) => (
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

              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoSelect}
              />
              <label htmlFor="photo-upload">
                <Button
                  fullWidth
                  variant="outlined"
                  component="span"
                  sx={{ mt: 3 }}
                  startIcon={<Edit />}
                >
                  Changer la photo
                </Button>
              </label>

              {selectedPhoto && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handlePhotoUpload}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Confirmer'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setSelectedPhoto(null);
                      setPhotoPreview(null);
                    }}
                  >
                    Annuler
                  </Button>
                </Box>
              )}

              {profile?.photoUrl && !selectedPhoto && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  sx={{ mt: 2 }}
                  onClick={handleDeletePhoto}
                  disabled={loading}
                >
                  Supprimer la photo
                </Button>
              )}
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
                    <Switch 
                      checked={profile?.emailNotifications || false}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                    />
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
                    <Switch 
                      checked={profile?.publicProfile || false}
                      onChange={(e) => handlePreferenceChange('publicProfile', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Carte Actions */}
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
                <ListItem button onClick={() => setOpenDeleteDialog(true)}>
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
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
          />
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            type="password"
            margin="normal"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            helperText="Minimum 8 caractères"
          />
          <TextField
            fullWidth
            label="Confirmer le nouveau mot de passe"
            type="password"
            margin="normal"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            error={Boolean(passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword)}
            helperText={
              passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword 
                ? "Les mots de passe ne correspondent pas" 
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSecurityDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleChangePassword}
            disabled={
              loading || 
              !passwordData.currentPassword || 
              !passwordData.newPassword || 
              !passwordData.confirmPassword ||
              passwordData.newPassword !== passwordData.confirmPassword
            }
          >
            {loading ? <CircularProgress size={24} /> : 'Changer le mot de passe'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Suppression de compte */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete color="error" />
            <Typography variant="h6">Supprimer le compte</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 3 }}>
            Cette action est irréversible. Toutes vos données seront définitivement supprimées.
          </Alert>
          <TextField
            fullWidth
            label="Confirmer avec votre mot de passe"
            type="password"
            margin="normal"
            value={deleteAccountData.password}
            onChange={(e) => setDeleteAccountData({ password: e.target.value })}
            placeholder="Entrez votre mot de passe pour confirmer"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteAccount}
            disabled={loading || !deleteAccountData.password}
          >
            {loading ? <CircularProgress size={24} /> : 'Supprimer définitivement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;