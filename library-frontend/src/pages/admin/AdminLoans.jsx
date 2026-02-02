// src/pages/admin/AdminLoans.jsx - DESIGN SYSTEM VERSION
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
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Grid,
  Badge,
  TablePagination,
  InputAdornment,
  Fab,
  Avatar,
  Tabs,
  Tab,
  Checkbox,
  Select
} from '@mui/material';

// Icons
import Search from '@mui/icons-material/Search';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import Refresh from '@mui/icons-material/Refresh';
import LibraryBooks from '@mui/icons-material/LibraryBooks';
import Person from '@mui/icons-material/Person';
import CalendarToday from '@mui/icons-material/CalendarToday';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import Update from '@mui/icons-material/Update';
import EventAvailable from '@mui/icons-material/EventAvailable';
import EventBusy from '@mui/icons-material/EventBusy';
import Warning from '@mui/icons-material/Warning';
import AssignmentReturned from '@mui/icons-material/AssignmentReturned';
import AssignmentLate from '@mui/icons-material/AssignmentLate';
import AttachMoney from '@mui/icons-material/AttachMoney';
import Close from '@mui/icons-material/Close';
import MoreTime from '@mui/icons-material/MoreTime';
import LocalShipping from '@mui/icons-material/LocalShipping';
import PlayArrow from '@mui/icons-material/PlayArrow';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

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

const AdminLoans = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [loanForm, setLoanForm] = useState({
    userId: '',
    bookId: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    notes: ''
  });
  
  const [returnForm, setReturnForm] = useState({
    condition: 'good',
    notes: '',
    finePaid: false
  });
  
  const [extendForm, setExtendForm] = useState({
    newDueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    reason: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [bookFilter, setBookFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDir, setSortDir] = useState('asc');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLoans, setTotalLoans] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const loadLoans = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: page,
        size: rowsPerPage,
        sortBy: sortBy,
        sortDir: sortDir
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (userFilter !== 'all') params.userId = userFilter;
      if (bookFilter !== 'all') params.bookId = bookFilter;
      if (dateFilter !== 'all') params.dateFilter = dateFilter;
      
      const loansResponse = await api.get('/admin/loans', { params });
      
      if (loansResponse.data.success) {
        const loansData = loansResponse.data.data || loansResponse.data.items || [];
        setLoans(loansData);
        setTotalLoans(loansResponse.data.totalElements || loansData.length);
        setTotalPages(loansResponse.data.totalPages || 1);
      }
      
      const statsResponse = await api.get('/admin/loans/statistics');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
      const usersResponse = await api.get('/admin/loans/users');
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data || usersResponse.data.items || []);
      }
      
      const booksResponse = await api.get('/admin/loans/books/available');
      if (booksResponse.data.success) {
        setBooks(booksResponse.data.data || booksResponse.data.items || []);
      }
      
    } catch (error) {
      console.error('Error loading loans:', error);
      showSnackbar(
        error.response?.data?.message || 'Erreur lors du chargement des prêts', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [page, rowsPerPage, sortBy, sortDir, statusFilter, userFilter, bookFilter, dateFilter, tabValue]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadLoans();
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const openDialog = (type, loan = null) => {
    setSelectedLoan(loan);
    setDialogType(type);
    
    if (type === 'new') {
      setLoanForm({
        userId: '',
        bookId: '',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        notes: ''
      });
    } else if (type === 'return' && loan) {
      setReturnForm({
        condition: 'good',
        notes: '',
        finePaid: false
      });
    } else if (type === 'extend' && loan) {
      setExtendForm({
        newDueDate: loan.dueDate ? new Date(loan.dueDate) : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        reason: ''
      });
    }
    
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedLoan(null);
  };

  const handleNewLoan = async () => {
    try {
      if (!loanForm.userId || !loanForm.bookId || !loanForm.dueDate) {
        showSnackbar('L\'utilisateur, le livre et la date de retour sont obligatoires', 'warning');
        return;
      }

      const formattedData = {
        ...loanForm,
        dueDate: loanForm.dueDate.toISOString().split('T')[0]
      };

      const response = await api.post('/admin/loans', formattedData);
      
      if (response.data.success) {
        showSnackbar('Prêt créé avec succès', 'success');
        loadLoans();
        closeDialog();
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de la création du prêt', 
        'error'
      );
    }
  };

  const handleReturnLoan = async () => {
    try {
      const response = await api.put(`/admin/loans/${selectedLoan.id}/return`, returnForm);
      
      if (response.data.success) {
        showSnackbar('Retour enregistré avec succès', 'success');
        loadLoans();
        closeDialog();
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Erreur lors du retour', 
        'error'
      );
    }
  };

  const handleExtendLoan = async () => {
    try {
      const formattedData = {
        ...extendForm,
        newDueDate: extendForm.newDueDate.toISOString().split('T')[0]
      };

      const response = await api.put(`/admin/loans/${selectedLoan.id}/extend`, formattedData);
      
      if (response.data.success) {
        showSnackbar('Prolongation enregistrée avec succès', 'success');
        loadLoans();
        closeDialog();
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de la prolongation', 
        'error'
      );
    }
  };

  const handleDeleteLoan = async () => {
    try {
      const response = await api.delete(`/admin/loans/${selectedLoan.id}`);

      if (response.data.success) {
        showSnackbar('Prêt supprimé avec succès', 'success');
        loadLoans();
        closeDialog();
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de la suppression',
        'error'
      );
    }
  };

  const handleActivateLoan = async (loanId) => {
    try {
      const response = await api.put(`/admin/loans/${loanId}/activate`);

      if (response.data.success) {
        showSnackbar('Prêt activé avec succès - Le livre est maintenant emprunté', 'success');
        loadLoans();
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de l\'activation du prêt',
        'error'
      );
    }
  };

  const calculateLateFee = (loan) => {
    if (!(loan.dueDate && new Date(loan.dueDate) < new Date())) return 0;
    
    const dueDate = new Date(loan.dueDate);
    const now = new Date();
    const daysLate = Math.max(0, Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)));
    return daysLate * 0.5;
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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        setStatusFilter('all');
        setDateFilter('all');
        break;
      case 1:
        setStatusFilter('PENDING_DELIVERY');
        setDateFilter('all');
        break;
      case 2:
        setStatusFilter('ACTIVE');
        setDateFilter('all');
        break;
      case 3:
        setDateFilter('overdue');
        setStatusFilter('ACTIVE');
        break;
      case 4:
        setStatusFilter('RETURNED');
        setDateFilter('all');
        break;
      case 5:
        setStatusFilter('CANCELLED');
        setDateFilter('all');
        break;
      default:
        setStatusFilter('all');
        setDateFilter('all');
    }
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getDaysRemaining = (dueDate, status) => {
    if (status !== 'ACTIVE') return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status, dueDate) => {
    if (status === 'PENDING_DELIVERY') {
      return 'warning';
    } else if (status === 'ACTIVE') {
      const daysRemaining = getDaysRemaining(dueDate, status);
      if (daysRemaining <= 0) return 'error';
      if (daysRemaining <= 3) return 'warning';
      return 'success';
    } else if (status === 'RETURNED') {
      return 'info';
    } else if (status === 'CANCELLED') {
      return 'default';
    } else {
      return 'default';
    }
  };

  const getStatusText = (status, dueDate) => {
    if (status === 'PENDING_DELIVERY') {
      return 'À livrer';
    } else if (status === 'ACTIVE') {
      const daysRemaining = getDaysRemaining(dueDate, status);
      if (daysRemaining <= 0) return 'En retard';
      return `${daysRemaining} jour(s) restant(s)`;
    } else if (status === 'RETURNED') {
      return 'Retourné';
    } else if (status === 'CANCELLED') {
      return 'Annulé';
    } else {
      return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_DELIVERY':
        return <LocalShipping />;
      case 'ACTIVE':
        return <EventAvailable />;
      case 'RETURNED':
        return <AssignmentReturned />;
      case 'CANCELLED':
        return <Cancel />;
      default:
        return <EventAvailable />;
    }
  };

  const isOverdue = (loan) => {
    return loan.status === 'ACTIVE' && 
           loan.dueDate && 
           new Date(loan.dueDate) < new Date();
  };

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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Container maxWidth="xl" sx={{ 
        py: designSystem.spacing.sectionSpacing, 
        mt: 8 
      }}>
        {/* Header */}
        <Box sx={{ mb: designSystem.spacing.sectionSpacing }}>
          <Typography variant="h3" component="h1" sx={designSystem.typography.h3}>
            Gestion des Prêts
          </Typography>
          <Typography variant="subtitle" sx={designSystem.typography.subtitle}>
            Gérez les emprunts, retours et réservations de livres
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
                        PRÊTS ACTIFS
                      </Typography>
                      <Typography variant="h4" sx={designSystem.typography.h4}>
                        {stats.activeLoans || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: designSystem.colors.text.muted,
                        fontFamily: 'Georgia, serif',
                      }}>
                        {stats.todayReturns || 0} retours aujourd'hui
                      </Typography>
                    </Box>
                    <LibraryBooks sx={{ 
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
                        EN RETARD
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        ...designSystem.typography.h4,
                        color: designSystem.colors.status.unavailable.text
                      }}>
                        {stats.overdueLoans || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: designSystem.colors.text.muted,
                        fontFamily: 'Georgia, serif',
                      }}>
                        {stats.totalLateFees || 0} € de pénalités
                      </Typography>
                    </Box>
                    <Warning sx={{ 
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
                        RETOURNÉS
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        ...designSystem.typography.h4,
                        color: designSystem.colors.status.available.text
                      }}>
                        {stats.returnedLoans || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: designSystem.colors.text.muted,
                        fontFamily: 'Georgia, serif',
                      }}>
                        Taux: {stats.returnRate || 0}%
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
                        TOTAL PRÊTS
                      </Typography>
                      <Typography variant="h4" sx={designSystem.typography.h4}>
                        {stats.totalLoans || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: designSystem.colors.text.muted,
                        fontFamily: 'Georgia, serif',
                      }}>
                        Historique complet
                      </Typography>
                    </Box>
                    <AssignmentReturned sx={{ 
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

        {/* Overdue Loans Alert */}
        {stats?.overdueLoans > 0 && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              bgcolor: designSystem.colors.status.unavailable.bg,
              color: designSystem.colors.status.unavailable.text,
              border: `1px solid ${designSystem.colors.status.unavailable.border}`,
              '& .MuiAlert-icon': {
                color: designSystem.colors.status.unavailable.text
              }
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => handleTabChange(null, 2)}
                sx={{
                  fontFamily: designSystem.typography.button.fontFamily,
                  fontWeight: designSystem.typography.button.fontWeight,
                  textTransform: designSystem.typography.button.textTransform,
                }}
              >
                VOIR LES RETARDS
              </Button>
            }
          >
            <Typography fontWeight="600" sx={{ fontFamily: 'Georgia, serif' }}>
              {stats.overdueLoans} prêt(s) en retard
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
              Des pénalités sont applicables. Veuillez contacter les emprunteurs.
            </Typography>
          </Alert>
        )}

        {/* Tabs for different loan statuses */}
        <Card sx={{ 
          mb: 3, 
          ...designSystem.card,
          bgcolor: designSystem.colors.background.main,
        }}>
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: designSystem.colors.border.light,
                '& .MuiTab-root': {
                  minHeight: 60,
                  fontFamily: 'Georgia, serif',
                  fontWeight: 600,
                  color: designSystem.colors.text.secondary,
                  '&.Mui-selected': {
                    color: designSystem.colors.primary.main,
                  }
                }
              }}
            >
              <Tab
                icon={<LibraryBooks />}
                label="Tous les prêts"
                iconPosition="start"
              />
              <Tab
                icon={<LocalShipping />}
                label={
                  <Badge
                    badgeContent={stats?.pendingDeliveryLoans || 0}
                    color="warning"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#d97706',
                        color: 'white'
                      }
                    }}
                  >
                    À livrer
                  </Badge>
                }
                iconPosition="start"
              />
              <Tab
                icon={<EventAvailable />}
                label="Actifs"
                iconPosition="start"
              />
              <Tab
                icon={<AssignmentLate />}
                label={
                  <Badge
                    badgeContent={stats?.overdueLoans || 0}
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: designSystem.colors.status.unavailable.text,
                        color: 'white'
                      }
                    }}
                  >
                    En retard
                  </Badge>
                }
                iconPosition="start"
              />
              <Tab
                icon={<AssignmentReturned />}
                label="Retournés"
                iconPosition="start"
              />
              <Tab
                icon={<Cancel />}
                label="Annulés"
                iconPosition="start"
              />
            </Tabs>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card sx={{ 
          mb: 3, 
          p: 3,
          ...designSystem.card,
          bgcolor: designSystem.colors.background.main,
          boxShadow: designSystem.shadows.card,
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher par utilisateur, livre, ID..."
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
                <InputLabel sx={{ fontFamily: 'Georgia, serif' }}>Utilisateur</InputLabel>
                <Select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  label="Utilisateur"
                  sx={{ 
                    bgcolor: designSystem.colors.background.light,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: designSystem.colors.border.medium,
                    }
                  }}
                >
                  <MenuItem value="all">Tous les utilisateurs</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Georgia, serif' }}>Livre</InputLabel>
                <Select
                  value={bookFilter}
                  onChange={(e) => setBookFilter(e.target.value)}
                  label="Livre"
                  sx={{ 
                    bgcolor: designSystem.colors.background.light,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: designSystem.colors.border.medium,
                    }
                  }}
                >
                  <MenuItem value="all">Tous les livres</MenuItem>
                  {books.map((book) => (
                    <MenuItem key={book.id} value={book.id}>
                      {book.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Georgia, serif' }}>Filtre date</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  label="Filtre date"
                  sx={{ 
                    bgcolor: designSystem.colors.background.light,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: designSystem.colors.border.medium,
                    }
                  }}
                >
                  <MenuItem value="all">Toutes dates</MenuItem>
                  <MenuItem value="today">Aujourd'hui</MenuItem>
                  <MenuItem value="tomorrow">Demain</MenuItem>
                  <MenuItem value="thisweek">Cette semaine</MenuItem>
                  <MenuItem value="overdue">En retard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  startIcon={<Refresh />}
                  onClick={loadLoans}
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
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={() => openDialog('new')}
                  sx={{
                    ...designSystem.button.contained,
                    fontFamily: designSystem.typography.button.fontFamily,
                    fontWeight: designSystem.typography.button.fontWeight,
                    textTransform: designSystem.typography.button.textTransform,
                  }}
                >
                  Nouveau prêt
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Loans Table */}
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
                      Livre
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700,
                      fontFamily: 'Georgia, serif',
                      color: designSystem.colors.primary.dark,
                      py: 2
                    }}>
                      Emprunté le
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700,
                      fontFamily: 'Georgia, serif',
                      color: designSystem.colors.primary.dark,
                      py: 2
                    }}>
                      Retour prévu
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
                      Pénalité
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
                  ) : loans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <LibraryBooks sx={{ 
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
                            Aucun prêt trouvé
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
                          <Button
                            variant="contained"
                            onClick={() => openDialog('new')}
                            sx={{
                              ...designSystem.button.contained,
                              fontFamily: designSystem.typography.button.fontFamily,
                              fontWeight: designSystem.typography.button.fontWeight,
                              textTransform: designSystem.typography.button.textTransform,
                            }}
                          >
                            <Add sx={{ mr: 1 }} />
                            Créer un nouveau prêt
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    loans.map((loan) => {
                      const overdue = isOverdue(loan);
                      return (
                        <TableRow 
                          key={loan.id}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: designSystem.colors.background.hover,
                              '& .action-buttons': { opacity: 1 }
                            },
                            ...(overdue && {
                              bgcolor: designSystem.colors.status.unavailable.bg,
                              '&:hover': { 
                                bgcolor: designSystem.colors.status.unavailable.bg,
                                opacity: 0.9
                              }
                            })
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{ 
                                  bgcolor: designSystem.colors.primary.main,
                                  width: 40, 
                                  height: 40,
                                  fontFamily: 'Georgia, serif',
                                  fontWeight: 600
                                }}
                              >
                                {loan.userFirstName?.[0] || 'U'}
                              </Avatar>
                              <Box>
                                <Typography sx={{ 
                                  fontWeight: 600,
                                  fontFamily: 'Georgia, serif',
                                  color: designSystem.colors.text.primary
                                }}>
                                  {loan.userFirstName} {loan.userLastName}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  color: designSystem.colors.text.muted,
                                  fontFamily: 'monospace'
                                }}>
                                  {loan.userEmail}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                variant="rounded"
                                sx={{ 
                                  bgcolor: designSystem.colors.secondary.main,
                                  width: 40, 
                                  height: 40,
                                  fontFamily: 'Georgia, serif',
                                  fontWeight: 600
                                }}
                              >
                                {loan.bookTitle?.[0] || 'L'}
                              </Avatar>
                              <Box>
                                <Typography sx={{ 
                                  fontWeight: 600, 
                                  fontFamily: 'Georgia, serif',
                                  color: designSystem.colors.text.primary,
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {loan.bookTitle}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  color: designSystem.colors.text.muted,
                                  fontFamily: 'Georgia, serif',
                                  fontStyle: 'italic'
                                }}>
                                  {loan.bookAuthor}
                                </Typography>
                              </Box>
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
                                {formatDate(loan.loanDate)}
                              </Typography>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday fontSize="small" sx={{ 
                                color: overdue 
                                  ? designSystem.colors.status.unavailable.text 
                                  : designSystem.colors.text.muted 
                              }} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'Georgia, serif',
                                  fontWeight: overdue ? 600 : 'normal',
                                  color: overdue 
                                    ? designSystem.colors.status.unavailable.text 
                                    : designSystem.colors.text.secondary
                                }}
                              >
                                {formatDate(loan.dueDate)}
                              </Typography>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              label={getStatusText(loan.status, loan.dueDate)}
                              color={getStatusColor(loan.status, loan.dueDate)}
                              size="small"
                              icon={getStatusIcon(loan.status)}
                              sx={{
                                fontFamily: 'Georgia, serif',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          
                          <TableCell>
                            {overdue || loan.fineAmount > 0 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AttachMoney fontSize="small" sx={{ 
                                  color: designSystem.colors.status.unavailable.text 
                                }} />
                                <Typography variant="body2" sx={{ 
                                  color: designSystem.colors.status.unavailable.text, 
                                  fontWeight: 600,
                                  fontFamily: 'Georgia, serif'
                                }}>
                                  {loan.fineAmount || calculateLateFee(loan).toFixed(2)} €
                                  {loan.finePaid && ' (Payé)'}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ 
                                color: designSystem.colors.text.muted,
                                fontFamily: 'Georgia, serif'
                              }}>
                                -
                              </Typography>
                            )}
                          </TableCell>
                          
                          <TableCell align="center">
                            <Box className="action-buttons" sx={{ opacity: 0.7, transition: 'opacity 0.2s' }}>
                              {loan.status === 'PENDING_DELIVERY' && (
                                <Tooltip title="Activer le prêt (livre livré)">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleActivateLoan(loan.id)}
                                    sx={{
                                      mr: 1,
                                      color: designSystem.colors.status.available.text,
                                      '&:hover': {
                                        bgcolor: designSystem.colors.status.available.bg
                                      }
                                    }}
                                  >
                                    <PlayArrow />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {loan.status === 'ACTIVE' && (
                                <>
                                  <Tooltip title="Enregistrer retour">
                                    <IconButton
                                      size="small"
                                      onClick={() => openDialog('return', loan)}
                                      sx={{
                                        mr: 1,
                                        color: designSystem.colors.status.available.text,
                                        '&:hover': {
                                          bgcolor: designSystem.colors.status.available.bg
                                        }
                                      }}
                                    >
                                      <AssignmentReturned />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Prolonger prêt">
                                    <IconButton
                                      size="small"
                                      onClick={() => openDialog('extend', loan)}
                                      sx={{
                                        mr: 1,
                                        color: designSystem.colors.primary.main,
                                        '&:hover': {
                                          bgcolor: designSystem.colors.background.hover
                                        }
                                      }}
                                    >
                                      <MoreTime />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}

                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  onClick={() => openDialog('delete', loan)}
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
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            {loans.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalLoans}
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

        {/* Floating Action Button for New Loan */}
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
          onClick={() => openDialog('new')}
        >
          <Add />
        </Fab>

        {/* Dialogs */}
        
        {/* New Loan Dialog */}
        <Dialog 
          open={dialogOpen && dialogType === 'new'} 
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
            bgcolor: designSystem.colors.background.main, 
            borderBottom: `1px solid ${designSystem.colors.border.light}`,
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Add sx={{ color: designSystem.colors.primary.main }} />
              <Typography variant="h5" sx={designSystem.typography.h5}>
                Nouveau Prêt
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel sx={{ fontFamily: 'Georgia, serif' }}>Utilisateur</InputLabel>
                <Select
                  value={loanForm.userId}
                  onChange={(e) => setLoanForm({ ...loanForm, userId: e.target.value })}
                  label="Utilisateur"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: designSystem.colors.border.medium,
                    }
                  }}
                >
                  <MenuItem value="">Sélectionner un utilisateur</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel sx={{ fontFamily: 'Georgia, serif' }}>Livre</InputLabel>
                <Select
                  value={loanForm.bookId}
                  onChange={(e) => setLoanForm({ ...loanForm, bookId: e.target.value })}
                  label="Livre"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: designSystem.colors.border.medium,
                    }
                  }}
                >
                  <MenuItem value="">Sélectionner un livre</MenuItem>
                  {books.map((book) => (
                    <MenuItem key={book.id} value={book.id}>
                      {book.title} par {book.author} ({book.availableCopies} disponible(s))
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <DatePicker
                label="Date de retour prévue"
                value={loanForm.dueDate}
                onChange={(newDate) => setLoanForm({ ...loanForm, dueDate: newDate })}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    required: true,
                    sx: {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: designSystem.colors.border.medium,
                      }
                    }
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Notes (optionnel)"
                value={loanForm.notes}
                onChange={(e) => setLoanForm({ ...loanForm, notes: e.target.value })}
                margin="normal"
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: designSystem.colors.border.medium,
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            bgcolor: designSystem.colors.background.main, 
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
              onClick={handleNewLoan} 
              variant="contained"
              disabled={!loanForm.userId || !loanForm.bookId || !loanForm.dueDate}
              sx={{
                ...designSystem.button.contained,
                fontFamily: designSystem.typography.button.fontFamily,
                fontWeight: designSystem.typography.button.fontWeight,
                textTransform: designSystem.typography.button.textTransform,
              }}
            >
              Créer le prêt
            </Button>
          </DialogActions>
        </Dialog>

        {/* Return Loan Dialog */}
        <Dialog 
          open={dialogOpen && dialogType === 'return'} 
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
            bgcolor: designSystem.colors.background.main, 
            borderBottom: `1px solid ${designSystem.colors.border.light}`,
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentReturned sx={{ color: designSystem.colors.primary.main }} />
              <Typography variant="h5" sx={designSystem.typography.h5}>
                Enregistrer un retour
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedLoan && (
              <Box sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ 
                  mb: 2,
                  bgcolor: designSystem.colors.status.available.bg,
                  color: designSystem.colors.status.available.text,
                  border: `1px solid ${designSystem.colors.status.available.border}`,
                  '& .MuiAlert-icon': {
                    color: designSystem.colors.status.available.text
                  }
                }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
                    <strong>Livre:</strong> {selectedLoan.bookTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
                    <strong>Emprunteur:</strong> {selectedLoan.userFirstName} {selectedLoan.userLastName}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
                    <strong>Date de retour prévue:</strong> {formatDate(selectedLoan.dueDate)}
                  </Typography>
                  {isOverdue(selectedLoan) && (
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'Georgia, serif',
                      color: designSystem.colors.status.unavailable.text 
                    }}>
                      <strong>Pénalité estimée:</strong> {calculateLateFee(selectedLoan).toFixed(2)} €
                    </Typography>
                  )}
                </Alert>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ fontFamily: 'Georgia, serif' }}>État du livre</InputLabel>
                  <Select
                    value={returnForm.condition}
                    onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                    label="État du livre"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: designSystem.colors.border.medium,
                      }
                    }}
                  >
                    <MenuItem value="excellent">Excellent</MenuItem>
                    <MenuItem value="good">Bon</MenuItem>
                    <MenuItem value="fair">Satisfaisant</MenuItem>
                    <MenuItem value="poor">Mauvais</MenuItem>
                    <MenuItem value="damaged">Endommagé</MenuItem>
                    <MenuItem value="lost">Perdu</MenuItem>
                  </Select>
                </FormControl>
                
                {isOverdue(selectedLoan) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Checkbox
                      checked={returnForm.finePaid}
                      onChange={(e) => setReturnForm({ ...returnForm, finePaid: e.target.checked })}
                      sx={{
                        color: designSystem.colors.primary.main,
                        '&.Mui-checked': {
                          color: designSystem.colors.primary.main,
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
                      Amende payée
                    </Typography>
                  </Box>
                )}
                
                <TextField
                  fullWidth
                  label="Notes de retour"
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                  margin="normal"
                  multiline
                  rows={2}
                  placeholder="Dégâts constatés, remarques..."
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
            bgcolor: designSystem.colors.background.main, 
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
              onClick={handleReturnLoan} 
              variant="contained"
              sx={{
                ...designSystem.button.contained,
                fontFamily: designSystem.typography.button.fontFamily,
                fontWeight: designSystem.typography.button.fontWeight,
                textTransform: designSystem.typography.button.textTransform,
              }}
            >
              Enregistrer le retour
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
    </LocalizationProvider>
  );
};

export default AdminLoans;