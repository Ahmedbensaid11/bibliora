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
  Snackbar,
  InputAdornment
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
  CreditCard,
  Search
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import axiosInstance, { API_BASE_URL } from '../../api/axios.config';
import { designSystem } from '../../styles/designSystem'; // Import design system

const Profile = () => {
  const { user } = useAuthStore();
  
  // Helper function to get full image URL
  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${photoUrl.startsWith('/') ? photoUrl : '/' + photoUrl}`;
  };
  
  // States
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
      if (file.size > 5 * 1024 * 1024) {
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
      case 'ROLE_ETUDIANT': return designSystem.colors.status.available.text;
      case 'ROLE_PROFESSEUR': return designSystem.colors.secondary.light;
      case 'ROLE_LECTEUR': return designSystem.colors.primary.light;
      case 'ROLE_ADMIN': return designSystem.colors.status.unavailable.text;
      default: return designSystem.colors.text.muted;
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
      <Container maxWidth="xl" sx={{ py: 4, mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: designSystem.colors.primary.light }} />
      </Container>
    );
  }

  // Statistiques
  const userStats = statistics ? [
    { 
      label: 'Livres empruntés', 
      value: statistics.totalBorrowedBooks || 0, 
      icon: <LibraryBooks />, 
      color: designSystem.colors.primary.main 
    },
    { 
      label: 'En cours', 
      value: statistics.currentlyBorrowed || 0, 
      icon: <Bookmark />, 
      color: designSystem.colors.primary.light 
    },
    { 
      label: 'Historique', 
      value: statistics.historyCount || 0, 
      icon: <History />, 
      color: designSystem.colors.secondary.main 
    },
    { 
      label: 'En retard', 
      value: statistics.overdueBooks || 0, 
      icon: <Bookmark />, 
      color: designSystem.colors.status.unavailable.text 
    }
  ] : [];

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
      {/* Header - Using Catalogue Design */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${designSystem.colors.border.light}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h1" component="h1" sx={{ 
              ...designSystem.typography.h1,
              mb: 1
            }}>
              Mon Profil
            </Typography>
            <Typography variant="h6" sx={{
              ...designSystem.typography.subtitle,
              fontStyle: 'italic',
              fontWeight: 300
            }}>
              Gérez vos informations personnelles et vos préférences
            </Typography>
          </Box>
          <Typography variant="body2" sx={{
            ...designSystem.typography.caption
          }}>
            Membre depuis {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR') : '...'}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={designSystem.spacing.gridSpacing}>
        {/* Left Column - Personal Information */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            mb: 4,
            ...designSystem.card
          }}>
            <CardContent sx={{ 
              p: designSystem.spacing.cardPadding,
              bgcolor: designSystem.colors.background.card
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={designSystem.typography.h4}>
                  Informations Personnelles
                </Typography>
                <Button
  startIcon={isEditing ? <Cancel /> : <Edit />}
  onClick={handleEditToggle}
  variant={isEditing ? "outlined" : "contained"}
  color={isEditing ? "error" : "primary"}
  sx={{
    fontFamily: designSystem.typography.button.fontFamily,
    fontWeight: designSystem.typography.button.fontWeight,
    textTransform: designSystem.typography.button.textTransform,
    fontSize: designSystem.typography.button.fontSize,
    ...(isEditing ? {} : { color: 'white' }) // ✅ White text for contained button
  }}
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
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: designSystem.colors.text.muted }} />
                        </InputAdornment>
                      ),
                      sx: {
                        bgcolor: designSystem.colors.background.light,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: designSystem.colors.border.light,
                        }
                      }
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
                    InputProps={{
                      sx: {
                        bgcolor: designSystem.colors.background.light,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: designSystem.colors.border.light,
                        }
                      }
                    }}
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
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: designSystem.colors.text.muted }} />
                        </InputAdornment>
                      ),
                      sx: {
                        bgcolor: designSystem.colors.background.light,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: designSystem.colors.border.light,
                        }
                      }
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
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: designSystem.colors.text.muted }} />
                        </InputAdornment>
                      ),
                      sx: {
                        bgcolor: designSystem.colors.background.light,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: designSystem.colors.border.light,
                        }
                      }
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
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCard sx={{ color: designSystem.colors.text.muted }} />
                        </InputAdornment>
                      ),
                      sx: {
                        bgcolor: designSystem.colors.background.light,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: designSystem.colors.border.light,
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleEditToggle}
                    sx={designSystem.button.primary}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={designSystem.button.contained}
                  >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Statistics Section - Using Catalogue Card Style */}
          {statistics && (
            <Card sx={designSystem.card}>
              <CardContent sx={{ 
                p: designSystem.spacing.cardPadding,
                bgcolor: designSystem.colors.background.card
              }}>
                <Typography variant="h4" sx={{ ...designSystem.typography.h4, mb: 3 }}>
                  Mes Statistiques
                </Typography>
                <Grid container spacing={3}>
                  {userStats.map((stat, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          background: designSystem.colors.background.card,
                          border: `1px solid ${designSystem.colors.border.light}`,
                          transition: designSystem.card.transition,
                          '&:hover': {
                            boxShadow: designSystem.shadows.cardHover,
                            borderColor: designSystem.colors.background.hover
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
                        <Typography variant="h5" sx={{ 
                          ...designSystem.typography.h5,
                          color: stat.color,
                          fontWeight: 700 
                        }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          ...designSystem.typography.body,
                          color: designSystem.colors.text.muted 
                        }}>
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

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Profile Photo Card */}
          <Card sx={{ mb: 4, ...designSystem.card }}>
            <CardContent sx={{ 
              p: designSystem.spacing.cardPadding, 
              textAlign: 'center',
              bgcolor: designSystem.colors.background.card
            }}>
              <Avatar
                src={photoPreview || getImageUrl(profile?.photoUrl)}
                alt={`${profile?.firstName} ${profile?.lastName}`}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 3,
                  bgcolor: designSystem.colors.primary.main,
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  border: `4px solid ${designSystem.colors.background.main}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
              
                <Typography 
                variant="h5" 
                gutterBottom  // ✅ This should be a prop, not in sx
                sx={{ 
                  ...designSystem.typography.h5,
                  fontWeight: 700
                }}
              >
                {profile?.firstName} {profile?.lastName}
              </Typography>
              
                           <Typography 
                variant="body2" 
                gutterBottom  // ✅ Move to props
                sx={{ 
                  ...designSystem.typography.body,
                  color: designSystem.colors.text.muted
                }}
              >
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
                      fontWeight: 600,
                      fontFamily: designSystem.typography.body.fontFamily,
                      fontSize: '0.75rem'
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
                  sx={{ mt: 3, ...designSystem.button.primary }}
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
                    sx={designSystem.button.contained}
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
                    sx={designSystem.button.primary}
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

          {/* Preferences Card */}
          <Card sx={{ mb: 4, ...designSystem.card }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2, bgcolor: designSystem.colors.background.card }}>
                <Typography variant="h5" sx={designSystem.typography.h5}>
                  Préférences
                </Typography>
              </Box>
              <Divider />
              <List sx={{ bgcolor: designSystem.colors.background.card }}>
                <ListItem>
                  <ListItemIcon>
                    <Notifications sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Notifications par email" 
                    secondary="Recevoir les alertes de retour" 
                    primaryTypographyProps={{ sx: designSystem.typography.body, fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: designSystem.typography.caption }}
                  />
                  <ListItemSecondaryAction>
                    <Switch 
                      checked={profile?.emailNotifications || false}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: designSystem.colors.primary.main,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: designSystem.colors.primary.main,
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PrivacyTip sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Profil public" 
                    secondary="Rendre mon profil visible" 
                    primaryTypographyProps={{ sx: designSystem.typography.body, fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: designSystem.typography.caption }}
                  />
                  <ListItemSecondaryAction>
                    <Switch 
                      checked={profile?.publicProfile || false}
                      onChange={(e) => handlePreferenceChange('publicProfile', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: designSystem.colors.primary.main,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: designSystem.colors.primary.main,
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card sx={designSystem.card}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2, bgcolor: designSystem.colors.background.card }}>
                <Typography variant="h5" sx={designSystem.typography.h5}>
                  Actions
                </Typography>
              </Box>
              <Divider />
              <List sx={{ bgcolor: designSystem.colors.background.card }}>
                <ListItem button onClick={() => setOpenSecurityDialog(true)}>
                  <ListItemIcon>
                    <Security sx={{ color: designSystem.colors.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sécurité du compte" 
                    secondary="Changer le mot de passe" 
                    primaryTypographyProps={{ sx: designSystem.typography.body, fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: designSystem.typography.caption }}
                  />
                </ListItem>
                <ListItem button onClick={() => setOpenDeleteDialog(true)}>
                  <ListItemIcon>
                    <Delete sx={{ color: designSystem.colors.status.unavailable.text }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Supprimer le compte" 
                    secondary="Action irréversible" 
                    primaryTypographyProps={{ 
                      sx: designSystem.typography.body, 
                      fontWeight: 600,
                      color: designSystem.colors.status.unavailable.text 
                    }}
                    secondaryTypographyProps={{ sx: designSystem.typography.caption }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Security Dialog */}
      <Dialog 
        open={openSecurityDialog} 
        onClose={() => setOpenSecurityDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: designSystem.card.borderRadius,
            border: designSystem.card.border
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: designSystem.colors.background.card, borderBottom: `1px solid ${designSystem.colors.border.light}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security sx={{ color: designSystem.colors.primary.main }} />
            <Typography variant="h5" sx={designSystem.typography.h5}>
              Sécurité du compte
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.card }}>
          <Alert severity="info" sx={{ mb: 3, bgcolor: designSystem.colors.status.available.bg }}>
            Pour des raisons de sécurité, vous devrez vous reconnecter après avoir changé votre mot de passe.
          </Alert>
          <TextField
            fullWidth
            label="Mot de passe actuel"
            type="password"
            margin="normal"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            InputProps={{
              sx: {
                bgcolor: designSystem.colors.background.light,
              }
            }}
          />
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            type="password"
            margin="normal"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            helperText="Minimum 8 caractères"
            InputProps={{
              sx: {
                bgcolor: designSystem.colors.background.light,
              }
            }}
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
            InputProps={{
              sx: {
                bgcolor: designSystem.colors.background.light,
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: designSystem.colors.background.card, borderTop: `1px solid ${designSystem.colors.border.light}`, p: 2 }}>
          <Button 
            onClick={() => setOpenSecurityDialog(false)}
            sx={designSystem.button.primary}
          >
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
            sx={designSystem.button.contained}
          >
            {loading ? <CircularProgress size={24} /> : 'Changer le mot de passe'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: designSystem.card.borderRadius,
            border: designSystem.card.border
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: designSystem.colors.background.card, borderBottom: `1px solid ${designSystem.colors.border.light}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete sx={{ color: designSystem.colors.status.unavailable.text }} />
            <Typography variant="h5" sx={designSystem.typography.h5}>
              Supprimer le compte
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.card }}>
          <Alert severity="error" sx={{ mb: 3, bgcolor: designSystem.colors.status.unavailable.bg }}>
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
            InputProps={{
              sx: {
                bgcolor: designSystem.colors.background.light,
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: designSystem.colors.background.card, borderTop: `1px solid ${designSystem.colors.border.light}`, p: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            sx={designSystem.button.primary}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteAccount}
            disabled={loading || !deleteAccountData.password}
            sx={{
              ...designSystem.button.contained,
              bgcolor: designSystem.colors.status.unavailable.text,
              '&:hover': { bgcolor: '#dc2626' }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Supprimer définitivement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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