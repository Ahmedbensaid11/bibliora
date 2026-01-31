import { useState, useEffect, useRef } from 'react';
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
  IconButton
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
  School,
  Badge,
  LibraryBooks,
  Bookmark,
  History,
  CameraAlt,
  Warning,
  Close,
  CheckCircle
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import profileService from '../../api/profileService';
import { designSystem } from '../../styles/designSystem';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openSecurityDialog, setOpenSecurityDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  const [deletePassword, setDeletePassword] = useState('');

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    publicProfile: false
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        profileService.getProfile(),
        profileService.getStatistics()
      ]);

      const profileData = profileRes.data || profileRes;
      const statsData = statsRes.data || statsRes;

      setProfile(profileData);
      setStatistics(statsData);

      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phoneNumber || '',
        identityCard: profileData.identityCard || ''
      });

      setPreferences({
        emailNotifications: profileData.emailNotifications ?? true,
        publicProfile: profileData.publicProfile ?? false
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      showSnackbar('Erreur lors du chargement du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEditToggle = () => {
    if (isEditing && profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phoneNumber || '',
        identityCard: profile.identityCard || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await profileService.updateProfile(formData);
      const updatedProfile = response.data || response;
      setProfile(updatedProfile);
      setIsEditing(false);
      showSnackbar('Profil mis a jour avec succes', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showSnackbar(err.response?.data?.message || 'Erreur lors de la mise a jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePreferenceChange = async (preference) => {
    const newValue = !preferences[preference];
    try {
      await profileService.updatePreferences({ [preference]: newValue });
      setPreferences(prev => ({
        ...prev,
        [preference]: newValue
      }));
      showSnackbar('Preferences mises a jour', 'success');
    } catch (err) {
      showSnackbar('Erreur lors de la mise a jour', 'error');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const response = await profileService.uploadPhoto(file);
      const photoUrl = response.data || response;
      setProfile(prev => ({ ...prev, photoUrl }));
      showSnackbar('Photo uploadee avec succes', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Erreur lors de l\'upload', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSnackbar('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    try {
      await profileService.changePassword(passwordData);
      setOpenSecurityDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSnackbar('Mot de passe change avec succes', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Erreur lors du changement', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await profileService.deleteAccount(deletePassword);
      logout();
      showSnackbar('Compte supprime', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_USER': return 'Utilisateur';
      case 'ROLE_ADMIN': return 'Administrateur';
      default: return role?.replace('ROLE_', '');
    }
  };

  const userStats = statistics ? [
    {
      label: 'Total empruntes',
      value: statistics.totalBorrowedBooks || 0,
      icon: <LibraryBooks />,
      color: designSystem.colors.primary.main
    },
    {
      label: 'En cours',
      value: statistics.currentlyBorrowed || 0,
      icon: <Bookmark />,
      color: designSystem.colors.secondary.main
    },
    {
      label: 'Historique',
      value: statistics.historyCount || 0,
      icon: <History />,
      color: designSystem.colors.primary.light
    },
    {
      label: 'En retard',
      value: statistics.overdueBooks || 0,
      icon: <Warning />,
      color: '#dc2626'
    }
  ] : [];

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
      {/* Header */}
      <Box sx={{
        mb: 4,
        pb: 3,
        borderBottom: `1px solid ${designSystem.colors.border.light}`
      }}>
        <Typography variant="h1" component="h1" sx={{
          ...designSystem.typography.h1,
          mb: 1
        }}>
          Mon Profil
        </Typography>
        <Typography variant="h6" sx={{
          ...designSystem.typography.subtitle,
          fontStyle: 'italic'
        }}>
          Gerez vos informations personnelles et vos preferences
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Personal Info */}
        <Grid item xs={12} lg={8}>
          <Card sx={{
            mb: 4,
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{
                  ...designSystem.typography.h5,
                  fontWeight: 700
                }}>
                  Informations Personnelles
                </Typography>
                <Button
                  startIcon={isEditing ? <Cancel /> : <Edit />}
                  onClick={handleEditToggle}
                  variant={isEditing ? "outlined" : "contained"}
                  sx={isEditing ? designSystem.button.primary : designSystem.button.contained}
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Prenom"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: designSystem.colors.text.muted }} />
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
                      startAdornment: <Email sx={{ mr: 1, color: designSystem.colors.text.muted }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telephone"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Carte d'identite"
                    value={formData.identityCard}
                    onChange={handleInputChange('identityCard')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Badge sx={{ mr: 1, color: designSystem.colors.text.muted }} />
                    }}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={handleEditToggle} sx={designSystem.button.primary}>
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={designSystem.button.contained}
                  >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Statistics Section */}
          <Card sx={{
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{
                ...designSystem.typography.h5,
                fontWeight: 700,
                mb: 3
              }}>
                Mes Statistiques
              </Typography>
              <Grid container spacing={3}>
                {userStats.map((stat, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: '#fef3c7',
                        border: `1px solid ${designSystem.colors.border.light}`,
                        borderRadius: designSystem.card.borderRadius,
                        transition: designSystem.card.transition,
                        '&:hover': {
                          borderColor: designSystem.colors.background.hover,
                          boxShadow: designSystem.shadows.cardHover
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
                      <Typography variant="h4" sx={{
                        ...designSystem.typography.h4,
                        color: stat.color
                      }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{
                        ...designSystem.typography.caption,
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
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Profile Photo Card */}
          <Card sx={{
            mb: 4,
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={profile?.photoUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 3,
                    bgcolor: designSystem.colors.primary.light,
                    fontSize: '2.5rem',
                    fontWeight: 600,
                    border: `4px solid ${designSystem.colors.background.main}`,
                    boxShadow: designSystem.shadows.cardHover
                  }}
                >
                  {profile?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 0,
                    bgcolor: designSystem.colors.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: designSystem.colors.primary.light
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CameraAlt fontSize="small" />
                </IconButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </Box>

              <Typography variant="h5" sx={{
                ...designSystem.typography.h5,
                fontWeight: 700
              }}>
                {profile?.firstName} {profile?.lastName}
              </Typography>

              <Typography variant="body2" sx={{
                ...designSystem.typography.body,
                color: designSystem.colors.text.muted,
                mb: 2
              }}>
                @{profile?.username || user?.username}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                {profile?.roles?.map((role, index) => (
                  <Chip
                    key={index}
                    label={getRoleLabel(role)}
                    size="small"
                    sx={{
                      bgcolor: role === 'ROLE_ADMIN' ? '#dc2626' : designSystem.colors.primary.light,
                      color: 'white',
                      fontWeight: 600,
                      fontFamily: designSystem.typography.body.fontFamily
                    }}
                  />
                ))}
              </Box>

              <Typography variant="caption" sx={{
                ...designSystem.typography.caption,
                display: 'block',
                mt: 2
              }}>
                Membre depuis {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric'
                }) : '-'}
              </Typography>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card sx={{
            mb: 4,
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{
                  ...designSystem.typography.h6,
                  fontWeight: 700
                }}>
                  Preferences
                </Typography>
              </Box>
              <Divider />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Notifications sx={{ color: designSystem.colors.primary.light }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notifications par email"
                    secondary="Recevoir les alertes de retour"
                    primaryTypographyProps={{ sx: designSystem.typography.body }}
                    secondaryTypographyProps={{ sx: designSystem.typography.caption }}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.emailNotifications}
                      onChange={() => handlePreferenceChange('emailNotifications')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: designSystem.colors.primary.light,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: designSystem.colors.primary.light,
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PrivacyTip sx={{ color: designSystem.colors.primary.light }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Profil public"
                    secondary="Rendre mon profil visible"
                    primaryTypographyProps={{ sx: designSystem.typography.body }}
                    secondaryTypographyProps={{ sx: designSystem.typography.caption }}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.publicProfile}
                      onChange={() => handlePreferenceChange('publicProfile')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: designSystem.colors.primary.light,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: designSystem.colors.primary.light,
                        },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card sx={{
            ...designSystem.card,
            bgcolor: designSystem.colors.background.card
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{
                  ...designSystem.typography.h6,
                  fontWeight: 700
                }}>
                  Actions
                </Typography>
              </Box>
              <Divider />
              <List>
                <ListItem button onClick={() => setOpenSecurityDialog(true)}>
                  <ListItemIcon>
                    <Security sx={{ color: designSystem.colors.primary.light }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Securite du compte"
                    secondary="Changer le mot de passe"
                    primaryTypographyProps={{ sx: designSystem.typography.body }}
                    secondaryTypographyProps={{ sx: designSystem.typography.caption }}
                  />
                </ListItem>
                <ListItem button onClick={() => setOpenDeleteDialog(true)}>
                  <ListItemIcon>
                    <Delete color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Supprimer le compte"
                    secondary="Action irreversible"
                    primaryTypographyProps={{ color: 'error', sx: designSystem.typography.body }}
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
        <DialogTitle sx={{
          bgcolor: designSystem.colors.background.main,
          borderBottom: `1px solid ${designSystem.colors.border.light}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security sx={{ color: designSystem.colors.primary.light }} />
            <Typography variant="h6" sx={designSystem.typography.h6}>
              Securite du compte
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: designSystem.colors.background.main, pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Pour des raisons de securite, vous devrez vous reconnecter apres avoir change votre mot de passe.
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
          />
          <TextField
            fullWidth
            label="Confirmer le nouveau mot de passe"
            type="password"
            margin="normal"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{
          bgcolor: designSystem.colors.background.main,
          borderTop: `1px solid ${designSystem.colors.border.light}`,
          p: 2
        }}>
          <Button onClick={() => setOpenSecurityDialog(false)} sx={designSystem.button.primary}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleChangePassword} sx={designSystem.button.contained}>
            Changer le mot de passe
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
        <DialogTitle sx={{
          bgcolor: designSystem.colors.background.main,
          borderBottom: `1px solid ${designSystem.colors.border.light}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete color="error" />
            <Typography variant="h6" sx={designSystem.typography.h6}>
              Supprimer le compte
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: designSystem.colors.background.main, pt: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Cette action est irreversible. Toutes vos donnees seront definitivement supprimees.
          </Alert>
          <TextField
            fullWidth
            label="Confirmez avec votre mot de passe"
            type="password"
            margin="normal"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{
          bgcolor: designSystem.colors.background.main,
          borderTop: `1px solid ${designSystem.colors.border.light}`,
          p: 2
        }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={designSystem.button.primary}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            disabled={!deletePassword}
          >
            Supprimer definitivement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
