// src/pages/admin/AdminUsers.jsx - DESIGN SYSTEM VERSION
import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Avatar,
  Switch,
  FormControlLabel,
  Grid,
  Badge,
  TablePagination,
  InputAdornment,
  Fab,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  LockReset,
  AdminPanelSettings,
  Person,
  Add,
  Refresh,
  CheckCircle,
  PersonAdd,
  Email,
  Phone,
  CalendarToday,
  Shield,
  Download,
  Warning,
  Badge as BadgeIcon,
  Password
} from '@mui/icons-material';
import axios from 'axios';

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

// Design System Constants
const designSystem = {
  typography: {
    h1: {
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      color: '#451a03',
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      color: '#451a03',
      fontSize: '2rem',
    },
    h3: {
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      color: '#451a03',
      fontSize: '1.75rem',
    },
    h4: {
      fontFamily: 'Georgia, serif',
      fontWeight: 600,
      color: '#451a03',
      fontSize: '1.5rem',
    },
    h5: {
      fontFamily: 'Georgia, serif',
      fontWeight: 600,
      color: '#1c1917',
      fontSize: '1.25rem',
    },
    h6: {
      fontFamily: 'Georgia, serif',
      fontWeight: 600,
      color: '#1c1917',
      fontSize: '1.125rem',
    },
    subtitle: {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontWeight: 300,
      color: '#78716c',
      fontSize: '1rem',
    },
    body: {
      fontFamily: 'Georgia, serif',
      color: '#57534e',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    caption: {
      fontFamily: 'monospace',
      color: '#a8a29e',
      fontSize: '0.875rem',
    },
    button: {
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      textTransform: 'none',
      fontSize: '0.95rem',
    }
  },
  colors: {
    primary: {
      main: '#451a03',
      light: '#78350f',
      dark: '#1c1917',
    },
    secondary: {
      main: '#92400e',
      light: '#b45309',
    },
    background: {
      main: '#ffffff',
      light: '#fdfbf7',
      card: '#fffcf5',
      hover: '#fde68a',
    },
    text: {
      primary: '#1c1917',
      secondary: '#57534e',
      muted: '#78716c',
      caption: '#a8a29e',
    },
    status: {
      available: {
        bg: '#f0fdf4',
        text: '#166534',
        border: '#bbf7d0',
      },
      unavailable: {
        bg: '#fef2f2',
        text: '#991b1b',
        border: '#fecaca',
      }
    },
    border: {
      light: '#e7e5e4',
      medium: '#d6d3d1',
    }
  },
  spacing: {
    cardPadding: 2.5,
    sectionSpacing: 4,
    gridSpacing: 4,
  },
  shadows: {
    card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    cardHover: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    header: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },
  card: {
    borderRadius: '2px',
    border: '1px solid #e7e5e4',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      borderColor: '#fde68a',
    }
  },
  button: {
    primary: {
      color: '#92400e',
      fontWeight: 700,
      fontFamily: 'Georgia, serif',
      textTransform: 'none',
      fontSize: '0.95rem',
    },
    contained: {
      bgcolor: '#78350f',
      color: '#ffffff',
      '&:hover': { 
        bgcolor: '#92400e',
      }
    }
  }
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form states
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    identityCard: '',
    phoneNumber: '',
    enabled: true,
    password: '',
    confirmPassword: ''
  });
  
  const [roleForm, setRoleForm] = useState('ROLE_LECTEUR');
  const [passwordForm, setPasswordForm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const usersResponse = await api.get('/admin/users');
      if (usersResponse.data.success) {
        const usersData = usersResponse.data.data || usersResponse.data.items || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
        setTotalUsers(usersData.length);
      }
      
      const statsResponse = await api.get('/admin/users/statistics');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error loading users:', error);
      showSnackbar('Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term) ||
        user.identityCard?.toLowerCase().includes(term)
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => {
        const roles = user.roles || [];
        return roles.some(role => role === roleFilter);
      });
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.enabled : !user.enabled
      );
    }
    
    setFilteredUsers(filtered);
    setPage(0);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const openDialog = (type, user = null) => {
    setSelectedUser(user);
    setDialogType(type);
    
    if (type === 'edit' && user) {
      setEditForm({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        identityCard: user.identityCard || '',
        phoneNumber: user.phoneNumber || '',
        enabled: user.enabled || true,
        password: '',
        confirmPassword: ''
      });
      setTabValue(0);
    } else if (type === 'edit' && !user) {
      setEditForm({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        identityCard: '',
        phoneNumber: '',
        enabled: true,
        password: '',
        confirmPassword: ''
      });
      setTabValue(0);
    } else if (type === 'role' && user) {
      const userRole = user.roles?.[0] || 'ROLE_LECTEUR';
      setRoleForm(userRole);
    } else if (type === 'reset' && user) {
      setPasswordForm('');
    }
    
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setEditForm({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      identityCard: '',
      phoneNumber: '',
      enabled: true,
      password: '',
      confirmPassword: ''
    });
    setRoleForm('ROLE_LECTEUR');
    setPasswordForm('');
    setTabValue(0);
  };

  const handleSaveUser = async () => {
    try {
      if (!editForm.username || !editForm.email) {
        showSnackbar('Le nom d\'utilisateur et l\'email sont obligatoires', 'warning');
        return;
      }

      if (!selectedUser) {
        if (!editForm.password) {
          showSnackbar('Le mot de passe est obligatoire pour un nouveau compte', 'warning');
          return;
        }
        if (editForm.password.length < 6) {
          showSnackbar('Le mot de passe doit contenir au moins 6 caractères', 'warning');
          return;
        }
        if (editForm.password !== editForm.confirmPassword) {
          showSnackbar('Les mots de passe ne correspondent pas', 'warning');
          return;
        }
      }

      if (selectedUser) {
        const userData = {
          username: editForm.username,
          email: editForm.email,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          identityCard: editForm.identityCard,
          phoneNumber: editForm.phoneNumber,
          enabled: editForm.enabled
        };

        const response = await api.put(`/admin/users/${selectedUser.id}`, userData);
        
        if (response.data.success) {
          showSnackbar('Utilisateur modifié avec succès', 'success');
          loadUsers();
          closeDialog();
        }
      } else {
        const userData = {
          username: editForm.username,
          email: editForm.email,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          identityCard: editForm.identityCard,
          phoneNumber: editForm.phoneNumber,
          password: editForm.password,
          enabled: editForm.enabled,
          roles: ['ROLE_LECTEUR']
        };

        try {
          const response = await api.post('/admin/users', userData);
          if (response.data.success) {
            showSnackbar('Utilisateur créé avec succès', 'success');
            loadUsers();
            closeDialog();
          }
        } catch (createError) {
          if (createError.response?.status === 404) {
            const registerResponse = await api.post('/auth/register', {
              username: editForm.username,
              email: editForm.email,
              password: editForm.password,
              firstName: editForm.firstName,
              lastName: editForm.lastName,
              identityCard: editForm.identityCard,
              phoneNumber: editForm.phoneNumber
            });
            
            if (registerResponse.data.success) {
              showSnackbar('Utilisateur créé avec succès', 'success');
              loadUsers();
              closeDialog();
            }
          } else {
            throw createError;
          }
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await api.delete(`/admin/users/${selectedUser.id}`);
      
      if (response.data.success) {
        showSnackbar('Utilisateur supprimé avec succès', 'success');
        loadUsers();
        closeDialog();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const handleToggleActivation = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/toggle-activation`);
      
      if (response.data.success) {
        showSnackbar('Statut de l\'utilisateur modifié', 'success');
        loadUsers();
      }
    } catch (error) {
      console.error('Error toggling activation:', error);
      showSnackbar(error.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleUpdateRole = async () => {
    try {
      const response = await api.put(`/admin/users/${selectedUser.id}/role`, {
        role: roleForm.replace('ROLE_', '')
      });
      
      if (response.data.success) {
        showSnackbar('Rôle mis à jour avec succès', 'success');
        loadUsers();
        closeDialog();
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de la mise à jour du rôle', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (passwordForm.length < 6) {
      showSnackbar('Le mot de passe doit contenir au moins 6 caractères', 'warning');
      return;
    }
    
    try {
      const response = await api.put(`/admin/users/${selectedUser.id}/reset-password`, {
        newPassword: passwordForm
      });
      
      if (response.data.success) {
        showSnackbar('Mot de passe réinitialisé avec succès', 'success');
        closeDialog();
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de la réinitialisation', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'error';
      case 'ROLE_LECTEUR': return 'primary';
      default: return 'default';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Administrateur';
      case 'ROLE_LECTEUR': return 'Lecteur';
      default: return role || 'N/A';
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && !stats) {
    return (
      <Container maxWidth="xl" sx={{ 
        py: designSystem.spacing.sectionSpacing, 
        mt: 8, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress sx={{ color: designSystem.colors.primary.main }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ 
      py: designSystem.spacing.sectionSpacing, 
      mt: 8 
    }}>
      {/* Header */}
      <Box sx={{ mb: designSystem.spacing.sectionSpacing }}>
        <Typography variant="h3" component="h1" sx={designSystem.typography.h3}>
          Gestion des Utilisateurs
        </Typography>
        <Typography variant="subtitle" sx={designSystem.typography.subtitle}>
          Gérer les comptes utilisateurs et leurs permissions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: designSystem.spacing.sectionSpacing }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              ...designSystem.card,
              bgcolor: designSystem.colors.background.card,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: designSystem.colors.text.caption,
                      fontFamily: 'monospace',
                      display: 'block',
                      mb: 1
                    }}>
                      TOTAL UTILISATEURS
                    </Typography>
                    <Typography variant="h4" sx={designSystem.typography.h4}>
                      {stats.totalUsers || 0}
                    </Typography>
                  </Box>
                  <Person sx={{ 
                    fontSize: 40, 
                    color: designSystem.colors.primary.main,
                    opacity: 0.8 
                  }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              ...designSystem.card,
              bgcolor: designSystem.colors.background.card,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: designSystem.colors.text.caption,
                      fontFamily: 'monospace',
                      display: 'block',
                      mb: 1
                    }}>
                      UTILISATEURS ACTIFS
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      ...designSystem.typography.h4,
                      color: designSystem.colors.status.available.text
                    }}>
                      {stats.activeUsers || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: designSystem.colors.text.muted,
                      fontFamily: 'Georgia, serif',
                    }}>
                      {stats.inactiveUsers || 0} inactifs
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ 
                    fontSize: 40, 
                    color: designSystem.colors.status.available.text,
                    opacity: 0.8 
                  }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              ...designSystem.card,
              bgcolor: designSystem.colors.background.card,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: designSystem.colors.text.caption,
                      fontFamily: 'monospace',
                      display: 'block',
                      mb: 1
                    }}>
                      ADMINISTRATEURS
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      ...designSystem.typography.h4,
                      color: designSystem.colors.status.unavailable.text
                    }}>
                      {stats.adminUsers || 0}
                    </Typography>
                  </Box>
                  <AdminPanelSettings sx={{ 
                    fontSize: 40, 
                    color: designSystem.colors.status.unavailable.text,
                    opacity: 0.8 
                  }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              ...designSystem.card,
              bgcolor: designSystem.colors.background.card,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: designSystem.colors.text.caption,
                      fontFamily: 'monospace',
                      display: 'block',
                      mb: 1
                    }}>
                      NOUVEAUX (30J)
                    </Typography>
                    <Typography variant="h4" sx={designSystem.typography.h4}>
                      {stats.newUsers || 0}
                    </Typography>
                  </Box>
                  <PersonAdd sx={{ 
                    fontSize: 40, 
                    color: designSystem.colors.primary.main,
                    opacity: 0.8 
                  }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Card sx={{ 
        mb: 3,
        p: 3,
        ...designSystem.card,
        bgcolor: designSystem.colors.background.main,
        boxShadow: designSystem.shadows.card,
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom, email, CIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: designSystem.colors.text.caption }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: designSystem.colors.background.light,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: designSystem.colors.border.medium,
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Georgia, serif' }}>Rôle</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Rôle"
                sx={{ 
                  bgcolor: designSystem.colors.background.light,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: designSystem.colors.border.medium,
                  }
                }}
              >
                <MenuItem value="all">Tous les rôles</MenuItem>
                <MenuItem value="ROLE_ADMIN">Administrateur</MenuItem>
                <MenuItem value="ROLE_LECTEUR">Lecteur</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Georgia, serif' }}>Statut</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Statut"
                sx={{ 
                  bgcolor: designSystem.colors.background.light,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: designSystem.colors.border.medium,
                  }
                }}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="active">Actifs</MenuItem>
                <MenuItem value="inactive">Inactifs</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                startIcon={<Refresh />}
                onClick={loadUsers}
                variant="outlined"
                sx={{
                  fontFamily: designSystem.typography.button.fontFamily,
                  fontWeight: designSystem.typography.button.fontWeight,
                  textTransform: designSystem.typography.button.textTransform,
                  borderColor: designSystem.colors.border.medium,
                  color: designSystem.colors.text.secondary,
                  '&:hover': {
                    borderColor: designSystem.colors.primary.main,
                    bgcolor: designSystem.colors.background.hover,
                  }
                }}
              >
                Actualiser
              </Button>
            
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Users Table */}
      <Card sx={{ 
        ...designSystem.card,
        bgcolor: designSystem.colors.background.main,
        boxShadow: designSystem.shadows.card,
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  bgcolor: designSystem.colors.background.light,
                  borderBottom: `1px solid ${designSystem.colors.border.light}`
                }}>
                  <TableCell sx={{ 
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    color: designSystem.colors.primary.dark,
                    py: 2
                  }}>
                    Utilisateur
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    color: designSystem.colors.primary.dark,
                    py: 2
                  }}>
                    CIN
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    color: designSystem.colors.primary.dark,
                    py: 2
                  }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    color: designSystem.colors.primary.dark,
                    py: 2
                  }}>
                    Rôle
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    color: designSystem.colors.primary.dark,
                    py: 2
                  }}>
                    Statut
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    color: designSystem.colors.primary.dark,
                    py: 2
                  }}>
                    Inscrit le
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    color: designSystem.colors.primary.dark,
                    py: 2
                  }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress sx={{ 
                        my: 4, 
                        color: designSystem.colors.primary.main 
                      }} />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Person sx={{ 
                          fontSize: 60, 
                          color: designSystem.colors.text.muted, 
                          mb: 2, 
                          opacity: 0.3 
                        }} />
                        <Typography variant="h6" sx={{ 
                          color: designSystem.colors.text.secondary,
                          fontFamily: 'Georgia, serif',
                          mb: 1
                        }}>
                          Aucun utilisateur trouvé
                        </Typography>
                        {searchTerm && (
                          <Typography variant="body2" sx={{ 
                            color: designSystem.colors.text.muted,
                            fontFamily: 'Georgia, serif',
                            mb: 3
                          }}>
                            Essayez de modifier vos critères de recherche
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow 
                      key={user.id}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: designSystem.colors.background.hover,
                          '& .action-buttons': { opacity: 1 }
                        } 
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{ 
                              bgcolor: user.enabled 
                                ? designSystem.colors.primary.main 
                                : designSystem.colors.status.unavailable.text,
                              width: 40, 
                              height: 40,
                              fontFamily: 'Georgia, serif',
                              fontWeight: 600
                            }}
                          >
                            {user.firstName?.[0] || user.username?.[0] || 'U'}
                          </Avatar>
                          <Box>
                            <Typography sx={{ 
                              fontWeight: 600,
                              fontFamily: 'Georgia, serif',
                              color: designSystem.colors.text.primary
                            }}>
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user.username
                              }
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: designSystem.colors.text.muted,
                              fontFamily: 'monospace'
                            }}>
                              @{user.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BadgeIcon fontSize="small" sx={{ 
                            color: designSystem.colors.text.muted 
                          }} />
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'Georgia, serif',
                            color: designSystem.colors.text.secondary
                          }}>
                            {user.identityCard || 'Non renseigné'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email fontSize="small" sx={{ 
                            color: designSystem.colors.text.muted 
                          }} />
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'Georgia, serif',
                            color: designSystem.colors.text.secondary
                          }}>
                            {user.email}
                          </Typography>
                        </Box>
                        {user.phoneNumber && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Phone fontSize="small" sx={{ 
                              color: designSystem.colors.text.muted 
                            }} />
                            <Typography variant="caption" sx={{ 
                              fontFamily: 'Georgia, serif',
                              color: designSystem.colors.text.secondary
                            }}>
                              {user.phoneNumber}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {(user.roles || []).map((role, index) => (
                          <Chip
                            key={index}
                            label={getRoleDisplayName(role)}
                            size="small"
                            icon={role === 'ROLE_ADMIN' ? <Shield /> : <Person />}
                            sx={{ 
                              mr: 1,
                              fontFamily: 'Georgia, serif',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              bgcolor: role === 'ROLE_ADMIN' 
                                ? designSystem.colors.status.unavailable.bg
                                : designSystem.colors.background.hover,
                              color: role === 'ROLE_ADMIN' 
                                ? designSystem.colors.status.unavailable.text
                                : designSystem.colors.primary.main,
                              border: role === 'ROLE_ADMIN' 
                                ? `1px solid ${designSystem.colors.status.unavailable.border}`
                                : `1px solid ${designSystem.colors.border.light}`
                            }}
                          />
                        ))}
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title={user.enabled ? "Activer/Désactiver" : ""}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={user.enabled}
                                  onChange={() => handleToggleActivation(user.id)}
                                  color="success"
                                  size="small"
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                      color: designSystem.colors.status.available.text,
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: designSystem.colors.status.available.border,
                                    },
                                  }}
                                />
                              }
                              label=""
                            />
                          </Tooltip>
                          <Chip
                            label={user.enabled ? "Actif" : "Inactif"}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontFamily: 'Georgia, serif',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              bgcolor: user.enabled 
                                ? designSystem.colors.status.available.bg
                                : designSystem.colors.status.unavailable.bg,
                              color: user.enabled 
                                ? designSystem.colors.status.available.text
                                : designSystem.colors.status.unavailable.text,
                              border: user.enabled 
                                ? `1px solid ${designSystem.colors.status.available.border}`
                                : `1px solid ${designSystem.colors.status.unavailable.border}`
                            }}
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" sx={{ 
                            color: designSystem.colors.text.muted 
                          }} />
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'Georgia, serif',
                            color: designSystem.colors.text.secondary
                          }}>
                            {formatDate(user.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Box className="action-buttons" sx={{ opacity: 0.7, transition: 'opacity 0.2s' }}>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={() => openDialog('edit', user)}
                              sx={{ 
                                mr: 1,
                                color: designSystem.colors.primary.main,
                                '&:hover': { 
                                  bgcolor: designSystem.colors.background.hover 
                                }
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Modifier le rôle">
                            <IconButton
                              size="small"
                              onClick={() => openDialog('role', user)}
                              sx={{ 
                                mr: 1,
                                color: designSystem.colors.secondary.main,
                                '&:hover': { 
                                  bgcolor: designSystem.colors.background.hover 
                                }
                              }}
                            >
                              <AdminPanelSettings />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Réinitialiser le mot de passe">
                            <IconButton
                              size="small"
                              onClick={() => openDialog('reset', user)}
                              sx={{ 
                                mr: 1,
                                color: designSystem.colors.status.unavailable.text,
                                '&:hover': { 
                                  bgcolor: designSystem.colors.status.unavailable.bg 
                                }
                              }}
                            >
                              <LockReset />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              onClick={() => openDialog('delete', user)}
                              sx={{ 
                                color: designSystem.colors.status.unavailable.text,
                                '&:hover': { 
                                  bgcolor: designSystem.colors.status.unavailable.bg 
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              sx={{
                borderTop: `1px solid ${designSystem.colors.border.light}`,
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontFamily: 'Georgia, serif',
                  color: designSystem.colors.text.secondary
                }
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button for New User */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          bgcolor: designSystem.colors.primary.main,
          '&:hover': { 
            bgcolor: designSystem.colors.primary.light,
            transform: 'translateY(-2px)',
          }
        }}
        onClick={() => openDialog('edit')}
      >
        <Add />
      </Fab>

      {/* Dialogs */}
      
      {/* Edit/Create User Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'edit'} 
        onClose={closeDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            ...designSystem.card,
            bgcolor: designSystem.colors.background.main,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${designSystem.colors.border.light}`,
          py: 2
        }}>
          <Typography variant="h5" sx={designSystem.typography.h5}>
            {selectedUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
          </Typography>
        </DialogTitle>
        
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: designSystem.colors.border.light, 
          px: 3 
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontFamily: 'Georgia, serif',
                fontWeight: 600,
                color: designSystem.colors.text.secondary,
                '&.Mui-selected': {
                  color: designSystem.colors.primary.main,
                }
              }
            }}
          >
            <Tab label="Informations" />
            {!selectedUser && <Tab label="Mot de passe" />}
          </Tabs>
        </Box>
        
        <DialogContent>
          {tabValue === 0 && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur *"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    margin="normal"
                    required
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: designSystem.colors.border.medium,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    margin="normal"
                    required
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: designSystem.colors.border.medium,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    margin="normal"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: designSystem.colors.border.medium,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    margin="normal"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: designSystem.colors.border.medium,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CIN (Carte d'identité) *"
                    value={editForm.identityCard}
                    onChange={(e) => setEditForm({ ...editForm, identityCard: e.target.value })}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: designSystem.colors.text.muted }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: designSystem.colors.border.medium,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: designSystem.colors.text.muted }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: designSystem.colors.border.medium,
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              {selectedUser && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.enabled}
                      onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                      sx={{
                        color: designSystem.colors.primary.main,
                        '&.Mui-checked': {
                          color: designSystem.colors.primary.main,
                        }
                      }}
                    />
                  }
                  label="Compte activé"
                  sx={{ mt: 2, fontFamily: 'Georgia, serif' }}
                />
              )}
            </Box>
          )}
          
          {tabValue === 1 && !selectedUser && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                type="password"
                label="Mot de passe *"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                margin="normal"
                required
                helperText="Minimum 6 caractères"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Password sx={{ color: designSystem.colors.text.muted }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: designSystem.colors.border.medium,
                  }
                }}
              />
              
              <TextField
                fullWidth
                type="password"
                label="Confirmer le mot de passe *"
                value={editForm.confirmPassword}
                onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                margin="normal"
                required
                error={editForm.password !== editForm.confirmPassword && editForm.confirmPassword !== ''}
                helperText={editForm.password !== editForm.confirmPassword && editForm.confirmPassword !== '' ? "Les mots de passe ne correspondent pas" : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Password sx={{ color: designSystem.colors.text.muted }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: designSystem.colors.border.medium,
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button 
            onClick={closeDialog}
            sx={{
              fontFamily: designSystem.typography.button.fontFamily,
              fontWeight: designSystem.typography.button.fontWeight,
              textTransform: designSystem.typography.button.textTransform,
              color: designSystem.colors.text.secondary,
              '&:hover': {
                color: designSystem.colors.text.primary,
                bgcolor: designSystem.colors.background.hover,
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            disabled={!editForm.username || !editForm.email || !editForm.identityCard || (!selectedUser && (!editForm.password || editForm.password !== editForm.confirmPassword))}
            sx={{
              ...designSystem.button.contained,
              fontFamily: designSystem.typography.button.fontFamily,
              fontWeight: designSystem.typography.button.fontWeight,
              textTransform: designSystem.typography.button.textTransform,
            }}
          >
            {selectedUser ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'delete'} 
        onClose={closeDialog}
        PaperProps={{
          sx: {
            ...designSystem.card,
            bgcolor: designSystem.colors.background.main,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${designSystem.colors.border.light}`,
          py: 2
        }}>
          <Typography variant="h5" sx={designSystem.typography.h5}>
            Confirmer la suppression
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ 
            mb: 2,
            bgcolor: designSystem.colors.background.hover,
            color: designSystem.colors.text.secondary,
            border: `1px solid ${designSystem.colors.border.light}`,
            '& .MuiAlert-icon': {
              color: designSystem.colors.secondary.main
            }
          }}>
            <Typography fontWeight="600" sx={{ fontFamily: 'Georgia, serif' }}>
              Êtes-vous sûr de vouloir supprimer l'utilisateur ?
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
              Cette action est irréversible. Toutes les données associées à cet utilisateur seront supprimées.
            </Typography>
          </Alert>
          {selectedUser && (
            <Box sx={{ 
              p: 2, 
              bgcolor: designSystem.colors.background.card, 
              borderRadius: '2px',
              border: `1px solid ${designSystem.colors.border.light}`
            }}>
              <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif', mb: 0.5 }}>
                <strong>Nom:</strong> {selectedUser.firstName} {selectedUser.lastName}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif', mb: 0.5 }}>
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif', mb: 0.5 }}>
                <strong>CIN:</strong> {selectedUser.identityCard || 'Non renseigné'}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
                <strong>Rôle:</strong> {getRoleDisplayName(selectedUser.roles?.[0])}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button 
            onClick={closeDialog}
            sx={{
              fontFamily: designSystem.typography.button.fontFamily,
              fontWeight: designSystem.typography.button.fontWeight,
              textTransform: designSystem.typography.button.textTransform,
              color: designSystem.colors.text.secondary,
              '&:hover': {
                color: designSystem.colors.text.primary,
                bgcolor: designSystem.colors.background.hover,
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            sx={{
              bgcolor: designSystem.colors.status.unavailable.text,
              color: '#ffffff',
              fontFamily: designSystem.typography.button.fontFamily,
              fontWeight: designSystem.typography.button.fontWeight,
              textTransform: designSystem.typography.button.textTransform,
              '&:hover': {
                bgcolor: '#7f1d1d',
              }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'role'} 
        onClose={closeDialog}
        PaperProps={{
          sx: {
            ...designSystem.card,
            bgcolor: designSystem.colors.background.main,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${designSystem.colors.border.light}`,
          py: 2
        }}>
          <Typography variant="h5" sx={designSystem.typography.h5}>
            Modifier le rôle
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 300 }}>
            <Typography gutterBottom sx={{ fontFamily: 'Georgia, serif' }}>
              Sélectionnez le nouveau rôle pour l'utilisateur:
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ fontFamily: 'Georgia, serif' }}>Rôle</InputLabel>
              <Select
                value={roleForm}
                onChange={(e) => setRoleForm(e.target.value)}
                label="Rôle"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: designSystem.colors.border.medium,
                  }
                }}
              >
                <MenuItem value="ROLE_LECTEUR">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ color: designSystem.colors.primary.main }} />
                    <span style={{ fontFamily: 'Georgia, serif' }}>Lecteur</span>
                  </Box>
                </MenuItem>
                <MenuItem value="ROLE_ADMIN">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminPanelSettings sx={{ color: designSystem.colors.status.unavailable.text }} />
                    <span style={{ fontFamily: 'Georgia, serif' }}>Administrateur</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ 
              mt: 2,
              bgcolor: designSystem.colors.background.card,
              border: `1px solid ${designSystem.colors.border.light}`,
              '& .MuiAlert-icon': {
                color: designSystem.colors.primary.main
              }
            }}>
              <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
                <strong>Lecteur:</strong> Peut emprunter des livres et consulter son profil
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'Georgia, serif' }}>
                <strong>Administrateur:</strong> Accès complet à toutes les fonctionnalités du système
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button 
            onClick={closeDialog}
            sx={{
              fontFamily: designSystem.typography.button.fontFamily,
              fontWeight: designSystem.typography.button.fontWeight,
              textTransform: designSystem.typography.button.textTransform,
              color: designSystem.colors.text.secondary,
              '&:hover': {
                color: designSystem.colors.text.primary,
                bgcolor: designSystem.colors.background.hover,
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleUpdateRole} 
            variant="contained"
            sx={{
              ...designSystem.button.contained,
              fontFamily: designSystem.typography.button.fontFamily,
              fontWeight: designSystem.typography.button.fontWeight,
              textTransform: designSystem.typography.button.textTransform,
            }}
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'reset'} 
        onClose={closeDialog}
        PaperProps={{
          sx: {
            ...designSystem.card,
            bgcolor: designSystem.colors.background.main,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${designSystem.colors.border.light}`,
          py: 2
        }}>
          <Typography variant="h5" sx={designSystem.typography.h5}>
            Réinitialiser le mot de passe
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 300 }}>
            <Typography gutterBottom sx={{ fontFamily: 'Georgia, serif' }}>
              Définir un nouveau mot de passe pour <strong>{selectedUser?.username}</strong>:
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Nouveau mot de passe"
              value={passwordForm}
              onChange={(e) => setPasswordForm(e.target.value)}
              margin="normal"
              helperText="Minimum 6 caractères"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: designSystem.colors.border.medium,
                }
              }}
            />
            <Alert severity="warning" sx={{ 
              mt: 2,
              bgcolor: designSystem.colors.background.hover,
              color: designSystem.colors.text.secondary,
              border: `1px solid ${designSystem.colors.border.light}`,
              '& .MuiAlert-icon': {
                color: designSystem.colors.secondary.main
              }
            }}>
              <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
                L'utilisateur devra se reconnecter avec le nouveau mot de passe
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button 
            onClick={closeDialog}
            sx={{
              fontFamily: designSystem.typography.button.fontFamily,
              fontWeight: designSystem.typography.button.fontWeight,
              textTransform: designSystem.typography.button.textTransform,
              color: designSystem.colors.text.secondary,
              '&:hover': {
                color: designSystem.colors.text.primary,
                bgcolor: designSystem.colors.background.hover,
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained"
            disabled={passwordForm.length < 6}
            sx={{
              ...designSystem.button.contained,
              fontFamily: designSystem.typography.button.fontFamily,
              fontWeight: designSystem.typography.button.fontWeight,
              textTransform: designSystem.typography.button.textTransform,
            }}
          >
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            fontFamily: 'Georgia, serif',
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'error' 
                ? designSystem.colors.status.unavailable.text
                : snackbar.severity === 'warning'
                ? designSystem.colors.secondary.main
                : designSystem.colors.status.available.text
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminUsers;