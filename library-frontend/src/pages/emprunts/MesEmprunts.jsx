import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tab,
  Tabs,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  EventAvailable,
  History,
  Warning,
  Visibility,
  Refresh,
  Bookmark,
  CheckCircle,
  Schedule,
  Autorenew,
  AssignmentReturn,
  Close,
  Book,
  Person,
  MoreVert,
  Report,
  Cancel,
  ReportProblem,
  Search,
  Print,
  Download
} from '@mui/icons-material';
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

const MesEmprunts = () => {
  const { user } = useAuthStore();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [openRenewDialog, setOpenRenewDialog] = useState(false);
  const [openLostDialog, setOpenLostDialog] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [returnNotes, setReturnNotes] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLoanForMenu, setSelectedLoanForMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loans/my-loans');
      
      if (response.data.success) {
        setLoans(response.data.items || response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching loans:', err);
      showSnackbar('Erreur lors du chargement des emprunts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setCurrentPage(1);
  };

  const handleReturnBook = (loan) => {
    setSelectedLoan(loan);
    setReturnNotes('');
    setOpenReturnDialog(true);
  };

  const handleRenewBook = (loan) => {
    setSelectedLoan(loan);
    setOpenRenewDialog(true);
  };

  const handleLostBook = (loan) => {
    setSelectedLoan(loan);
    setLostReason('');
    setOpenLostDialog(true);
    handleCloseMenu();
  };

  const handleCancelLoan = async (loan) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cet emprunt ?')) {
      try {
        setActionLoading(true);
        const response = await api.put(`/loans/${loan.id}/cancel`);
        
        if (response.data.success) {
          showSnackbar('Emprunt annulé avec succès!', 'success');
          await fetchLoans();
        }
      } catch (err) {
        console.error('Error cancelling loan:', err);
        showSnackbar(err.response?.data?.message || 'Erreur lors de l\'annulation', 'error');
      } finally {
        setActionLoading(false);
        handleCloseMenu();
      }
    }
  };

  const handleOpenMenu = (event, loan) => {
    setAnchorEl(event.currentTarget);
    setSelectedLoanForMenu(loan);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedLoanForMenu(null);
  };

  const confirmReturn = async () => {
    if (!selectedLoan) return;
    
    try {
      setActionLoading(true);
      const response = await api.put(`/loans/${selectedLoan.id}/return`, {
        notes: returnNotes
      });
      
      if (response.data.success) {
        showSnackbar(response.data.message || 'Livre retourné avec succès!', 'success');
        await fetchLoans();
        setOpenReturnDialog(false);
        setSelectedLoan(null);
        setReturnNotes('');
      }
    } catch (err) {
      console.error('Error returning book:', err);
      showSnackbar(err.response?.data?.message || 'Erreur lors du retour', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmRenew = async () => {
    if (!selectedLoan) return;
    
    try {
      setActionLoading(true);
      const response = await api.put(`/loans/${selectedLoan.id}/renew`);
      
      if (response.data.success) {
        showSnackbar('Emprunt renouvelé avec succès!', 'success');
        await fetchLoans();
        setOpenRenewDialog(false);
        setSelectedLoan(null);
      }
    } catch (err) {
      console.error('Error renewing loan:', err);
      showSnackbar(err.response?.data?.message || 'Erreur lors du renouvellement', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmLost = async () => {
    if (!selectedLoan) return;
    
    try {
      setActionLoading(true);
      const response = await api.put(`/loans/${selectedLoan.id}/lost`, {
        reason: lostReason
      });
      
      if (response.data.success) {
        showSnackbar(response.data.message || 'Livre signalé comme perdu!', 'success');
        await fetchLoans();
        setOpenLostDialog(false);
        setSelectedLoan(null);
        setLostReason('');
      }
    } catch (err) {
      console.error('Error reporting lost book:', err);
      showSnackbar(err.response?.data?.message || 'Erreur lors du signalement', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'ACTIVE': { 
        label: 'En cours', 
        color: designSystem.colors.primary.light,
        bgColor: '#fef3c7',
        border: '#fbbf24',
        icon: <Schedule />
      },
      'OVERDUE': { 
        label: 'En retard', 
        color: designSystem.colors.status.unavailable.text,
        bgColor: designSystem.colors.status.unavailable.bg,
        border: designSystem.colors.status.unavailable.border,
        icon: <Warning />
      },
      'RETURNED': { 
        label: 'Retourné', 
        color: designSystem.colors.status.available.text,
        bgColor: designSystem.colors.status.available.bg,
        border: designSystem.colors.status.available.border,
        icon: <CheckCircle />
      },
      'CANCELLED': { 
        label: 'Annulé', 
        color: designSystem.colors.text.muted,
        bgColor: '#f5f5f5',
        border: '#e0e0e0',
        icon: <Cancel />
      },
      'LOST': { 
        label: 'Perdu', 
        color: designSystem.colors.status.unavailable.text,
        bgColor: designSystem.colors.status.unavailable.bg,
        border: designSystem.colors.status.unavailable.border,
        icon: <ReportProblem />
      }
    };

    const config = statusConfig[status] || { 
      label: status, 
      color: designSystem.colors.text.muted,
      bgColor: '#f5f5f5',
      border: '#e0e0e0',
      icon: null
    };
    
    return (
      <Chip 
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          bgcolor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.border}`,
          fontWeight: 700,
          fontFamily: designSystem.typography.body.fontFamily,
          fontSize: '0.75rem',
          '& .MuiChip-icon': {
            color: config.color
          }
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const activeLoans = loans.filter(loan => loan.status === 'ACTIVE');
  const overdueLoans = loans.filter(loan => loan.status === 'OVERDUE');
  const returnedLoans = loans.filter(loan => loan.status === 'RETURNED');
  const lostLoans = loans.filter(loan => loan.status === 'LOST');
  const allActiveLoans = [...activeLoans, ...overdueLoans];
  const allHistoryLoans = [...returnedLoans, ...lostLoans];
  
  const totalFines = loans.reduce((sum, loan) => sum + (loan.fineAmount || 0), 0);

  // Filter loans based on search term
  const filteredActiveLoans = allActiveLoans.filter(loan => 
    searchTerm === '' || 
    loan.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.book?.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistoryLoans = allHistoryLoans.filter(loan =>
    searchTerm === '' ||
    loan.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.book?.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedActiveLoans = filteredActiveLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedHistoryLoans = filteredHistoryLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentLoans = currentTab === 0 ? paginatedActiveLoans : paginatedHistoryLoans;
  const totalLoans = currentTab === 0 ? filteredActiveLoans.length : filteredHistoryLoans.length;

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
              Mes Emprunts
            </Typography>
            <Typography variant="h6" sx={{
              ...designSystem.typography.subtitle,
              fontStyle: 'italic',
              fontWeight: 300
            }}>
              Gérez vos emprunts en cours et consultez votre historique
            </Typography>
          </Box>
          <Typography variant="body2" sx={{
            ...designSystem.typography.caption
          }}>
            {currentTab === 0 
              ? `${filteredActiveLoans.length} emprunt(s) actif(s)` 
              : `${filteredHistoryLoans.length} emprunt(s) dans l'historique`}
          </Typography>
        </Box>
      </Box>

      {/* Search Bar - Catalogue Style */}
      <Card sx={{ 
        mb: 4, 
        p: 3,
        bgcolor: designSystem.colors.background.main,
        boxShadow: designSystem.shadows.header,
        border: `1px solid ${designSystem.colors.border.light}`,
        borderRadius: designSystem.card.borderRadius
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher par titre ou auteur..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: designSystem.colors.text.muted }} />
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
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Tooltip title="Actualiser">
                <IconButton 
                  onClick={fetchLoans}
                  sx={{ color: designSystem.colors.secondary.main }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={() => window.print()}
                sx={designSystem.button.primary}
              >
                Imprimer
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {overdueLoans.length > 0 && (
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
              onClick={fetchLoans}
              sx={designSystem.button.primary}
            >
              Actualiser
            </Button>
          }
        >
          Vous avez {overdueLoans.length} emprunt(s) en retard. Des amendes peuvent s'appliquer.
        </Alert>
      )}

      {/* Stats Cards - Catalogue Style */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            label: 'En cours', 
            value: activeLoans.length, 
            icon: <EventAvailable />, 
            color: designSystem.colors.primary.main,
            bgColor: '#fef3c7'
          },
          { 
            label: 'En retard', 
            value: overdueLoans.length, 
            icon: <Warning />, 
            color: designSystem.colors.status.unavailable.text,
            bgColor: designSystem.colors.status.unavailable.bg
          },
          { 
            label: 'Retournés', 
            value: returnedLoans.length, 
            icon: <History />, 
            color: designSystem.colors.status.available.text,
            bgColor: designSystem.colors.status.available.bg
          },
          { 
            label: 'Amende totale', 
            value: `${totalFines.toFixed(2)} TND`, 
            icon: <ReportProblem />, 
            color: designSystem.colors.primary.light,
            bgColor: '#fef3c7'
          }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3,
              bgcolor: stat.bgColor,
              border: `1px solid ${designSystem.colors.border.light}`,
              borderRadius: designSystem.card.borderRadius,
              transition: designSystem.card.transition,
              '&:hover': {
                borderColor: designSystem.colors.background.hover,
                boxShadow: designSystem.shadows.cardHover
              }
            }}>
              <Box sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: `${stat.color}20`,
                mb: 2,
                color: stat.color
              }}>
                {stat.icon}
              </Box>
              <Typography variant="h4" sx={{ 
                ...designSystem.typography.h4,
                color: stat.color,
                mb: 0.5
              }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ 
                ...designSystem.typography.body,
                color: designSystem.colors.text.muted
              }}>
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={designSystem.card}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: `1px solid ${designSystem.colors.border.light}`,
            '& .MuiTab-root': { 
              ...designSystem.typography.button,
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 64
            },
            '& .Mui-selected': {
              color: designSystem.colors.primary.main,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: designSystem.colors.primary.main,
            }
          }}
        >
          <Tab 
            icon={<Bookmark />} 
            iconPosition="start" 
            label={`Emprunts actifs (${allActiveLoans.length})`} 
          />
          <Tab 
            icon={<History />} 
            iconPosition="start" 
            label={`Historique (${allHistoryLoans.length})`} 
          />
        </Tabs>

        <CardContent sx={{ 
          p: 0,
          bgcolor: designSystem.colors.background.card
        }}>
          {currentTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: designSystem.colors.background.light }}>
                  <TableRow>
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
                      Date d'emprunt
                    </TableCell>
                    <TableCell sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 700,
                      color: designSystem.colors.primary.dark
                    }}>
                      Date de retour
                    </TableCell>
                    <TableCell sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 700,
                      color: designSystem.colors.primary.dark
                    }}>
                      Délai
                    </TableCell>
                    <TableCell sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 700,
                      color: designSystem.colors.primary.dark
                    }}>
                      Statut
                    </TableCell>
                    <TableCell sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 700,
                      color: designSystem.colors.primary.dark
                    }}>
                      Amende
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 700,
                      color: designSystem.colors.primary.dark
                    }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredActiveLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" sx={{ 
                          ...designSystem.typography.body,
                          color: designSystem.colors.text.muted
                        }}>
                          Aucun emprunt actif
                        </Typography>
                        <Button 
                          variant="outlined" 
                          sx={{ 
                            mt: 2,
                            ...designSystem.button.primary
                          }}
                          startIcon={<Book />}
                          onClick={() => window.location.href = '/catalogue'}
                        >
                          Explorer le catalogue
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedActiveLoans.map((loan) => {
                      const daysRemaining = getDaysRemaining(loan.dueDate);
                      const isOverdue = loan.status === 'OVERDUE';
                      const canRenew = loan.status === 'ACTIVE' && daysRemaining > 0 && loan.canRenew !== false;

                      return (
                        <TableRow key={loan.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ 
                                width: 40, 
                                height: 60, 
                                bgcolor: designSystem.colors.primary.light,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: designSystem.colors.primary.main
                              }}>
                                <Book />
                              </Box>
                              <Box>
                                <Typography variant="body1" sx={{ 
                                  ...designSystem.typography.body,
                                  fontWeight: 600,
                                  color: designSystem.colors.text.primary
                                }}>
                                  {loan.book?.title || 'Titre non disponible'}
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  ...designSystem.typography.body,
                                  color: designSystem.colors.text.muted,
                                  fontSize: '0.875rem'
                                }}>
                                  {loan.book?.author || 'Auteur non disponible'}
                                </Typography>
                                {loan.book?.isbn && (
                                  <Typography variant="caption" sx={{ 
                                    ...designSystem.typography.caption,
                                    color: designSystem.colors.text.muted
                                  }}>
                                    ISBN: {loan.book.isbn}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={designSystem.typography.body}>
                              {formatDate(loan.loanDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                ...designSystem.typography.body,
                                fontWeight: 600,
                                color: isOverdue ? designSystem.colors.status.unavailable.text : designSystem.colors.text.primary
                              }}
                            >
                              {formatDate(loan.dueDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {isOverdue ? (
                              <Typography variant="body2" sx={{ 
                                ...designSystem.typography.body,
                                color: designSystem.colors.status.unavailable.text,
                                fontWeight: 600
                              }}>
                                {Math.abs(daysRemaining)} jour(s) de retard
                              </Typography>
                            ) : (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  ...designSystem.typography.body,
                                  color: daysRemaining <= 3 ? '#f97316' : designSystem.colors.status.available.text,
                                  fontWeight: 600
                                }}
                              >
                                {daysRemaining} jour(s) restant(s)
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusChip(loan.status)}
                          </TableCell>
                          <TableCell>
                            {loan.fineAmount > 0 ? (
                              <Chip
                                label={`${loan.fineAmount.toFixed(2)} TND`}
                                size="small"
                                sx={{
                                  bgcolor: designSystem.colors.status.unavailable.bg,
                                  color: designSystem.colors.status.unavailable.text,
                                  border: `1px solid ${designSystem.colors.status.unavailable.border}`,
                                  fontWeight: 700,
                                  fontFamily: designSystem.typography.body.fontFamily
                                }}
                              />
                            ) : (
                              <Typography variant="body2" sx={{ 
                                ...designSystem.typography.caption,
                                color: designSystem.colors.text.muted
                              }}>
                                Aucune
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              {canRenew && (
                                <Tooltip title="Renouveler l'emprunt">
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Autorenew />}
                                    onClick={() => handleRenewBook(loan)}
                                    disabled={actionLoading}
                                    sx={{ 
                                      minWidth: 'auto',
                                      ...designSystem.button.primary
                                    }}
                                  >
                                    Renouveler
                                  </Button>
                                </Tooltip>
                              )}
                              <Tooltip title="Retourner le livre">
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<AssignmentReturn />}
                                  onClick={() => handleReturnBook(loan)}
                                  disabled={actionLoading}
                                  sx={{ 
                                    minWidth: 'auto',
                                    ...designSystem.button.contained
                                  }}
                                >
                                  Retourner
                                </Button>
                              </Tooltip>
                              <Tooltip title="Plus d'options">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleOpenMenu(e, loan)}
                                  disabled={actionLoading}
                                  sx={{ color: designSystem.colors.secondary.main }}
                                >
                                  <MoreVert />
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
          )}

          {currentTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: designSystem.colors.background.light }}>
                  <TableRow>
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
                      Date d'emprunt
                    </TableCell>
                    <TableCell sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 700,
                      color: designSystem.colors.primary.dark
                    }}>
                      Date de retour prévue
                    </TableCell>
                    <TableCell sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 700,
                      color: designSystem.colors.primary.dark
                    }}>
                      Date de retour effective
                    </TableCell>
                    <TableCell sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 700,
                      color: designSystem.colors.primary.dark
                    }}>
                      Durée
                    </TableCell>
                    <TableCell sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 700,
                      color: designSystem.colors.primary.dark
                    }}>
                      Statut
                    </TableCell>
                    <TableCell sx={{ 
                      ...designSystem.typography.body,
                      fontWeight: 700,
                      color: designSystem.colors.primary.dark
                    }}>
                      Amende
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistoryLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" sx={{ 
                          ...designSystem.typography.body,
                          color: designSystem.colors.text.muted
                        }}>
                          Aucun historique d'emprunt
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedHistoryLoans.map((loan) => {
                      const loanDuration = loan.returnDate 
                        ? Math.ceil((new Date(loan.returnDate) - new Date(loan.loanDate)) / (1000 * 60 * 60 * 24))
                        : null;
                      const isLost = loan.status === 'LOST';

                      return (
                        <TableRow key={loan.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ 
                                width: 40, 
                                height: 60, 
                                bgcolor: isLost ? designSystem.colors.status.unavailable.bg : designSystem.colors.border.medium,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isLost ? designSystem.colors.status.unavailable.text : designSystem.colors.text.muted
                              }}>
                                <Book />
                              </Box>
                              <Box>
                                <Typography variant="body1" sx={{ 
                                  ...designSystem.typography.body,
                                  fontWeight: 600,
                                  color: designSystem.colors.text.primary
                                }}>
                                  {loan.book?.title || 'Titre non disponible'}
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  ...designSystem.typography.body,
                                  color: designSystem.colors.text.muted,
                                  fontSize: '0.875rem'
                                }}>
                                  {loan.book?.author || 'Auteur non disponible'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={designSystem.typography.body}>
                              {formatDate(loan.loanDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={designSystem.typography.body}>
                              {formatDate(loan.dueDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={designSystem.typography.body}>
                              {loan.returnDate ? formatDate(loan.returnDate) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={designSystem.typography.body}>
                              {loanDuration ? `${loanDuration} jours` : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(loan.status)}
                          </TableCell>
                          <TableCell>
                            {loan.fineAmount > 0 ? (
                              <Chip
                                label={`${loan.fineAmount.toFixed(2)} TND`}
                                size="small"
                                sx={{
                                  bgcolor: designSystem.colors.status.unavailable.bg,
                                  color: designSystem.colors.status.unavailable.text,
                                  border: `1px solid ${designSystem.colors.status.unavailable.border}`,
                                  fontFamily: designSystem.typography.body.fontFamily
                                }}
                              />
                            ) : (
                              <Typography variant="body2" sx={{ 
                                ...designSystem.typography.caption,
                                color: designSystem.colors.status.available.text
                              }}>
                                Aucune
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalLoans > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Typography variant="body2" sx={{ 
            ...designSystem.typography.caption,
            color: designSystem.colors.text.muted
          }}>
            Page {currentPage} sur {Math.ceil(totalLoans / itemsPerPage)}
          </Typography>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: designSystem.card.borderRadius,
            border: designSystem.card.border
          }
        }}
      >
        {selectedLoanForMenu && selectedLoanForMenu.status === 'ACTIVE' && (
          <MenuItem onClick={() => handleCancelLoan(selectedLoanForMenu)}>
            <ListItemIcon>
              <Cancel sx={{ color: designSystem.colors.status.unavailable.text }} />
            </ListItemIcon>
            <ListItemText sx={{ 
              '& .MuiTypography-root': {
                ...designSystem.typography.body,
                color: designSystem.colors.status.unavailable.text
              }
            }}>
              Annuler l'emprunt
            </ListItemText>
          </MenuItem>
        )}
        
        {selectedLoanForMenu && (selectedLoanForMenu.status === 'ACTIVE' || selectedLoanForMenu.status === 'OVERDUE') && (
          <MenuItem onClick={() => handleLostBook(selectedLoanForMenu)}>
            <ListItemIcon>
              <ReportProblem sx={{ color: designSystem.colors.status.unavailable.text }} />
            </ListItemIcon>
            <ListItemText sx={{ 
              '& .MuiTypography-root': {
                ...designSystem.typography.body,
                color: designSystem.colors.status.unavailable.text
              }
            }}>
              Signaler comme perdu
            </ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Return Dialog - Catalogue Style */}
      <Dialog 
        open={openReturnDialog} 
        onClose={() => !actionLoading && setOpenReturnDialog(false)}
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
          <Typography variant="h5" sx={designSystem.typography.h5}>
            Retourner le livre
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.main }}>
          {selectedLoan && (
            <>
              <Typography variant="body1" sx={{ 
                ...designSystem.typography.body,
                mb: 2
              }}>
                Confirmez-vous le retour de <strong>"{selectedLoan.book?.title}"</strong> ?
              </Typography>
              
              {selectedLoan.status === 'OVERDUE' && (
                <Alert severity="warning" sx={{ 
                  mb: 2,
                  bgcolor: '#fef3c7',
                  border: `1px solid #fbbf24`,
                  color: '#92400e'
                }}>
                  Ce livre est en retard. 
                  {selectedLoan.fineAmount > 0 
                    ? ` Une amende de ${selectedLoan.fineAmount.toFixed(2)} TND sera appliquée.`
                    : ' Une amende pourrait être appliquée.'}
                </Alert>
              )}
              
              <TextField
                fullWidth
                label="Commentaire (optionnel)"
                multiline
                rows={3}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="État du livre, remarques..."
                sx={{ mt: 2 }}
                InputProps={{
                  sx: {
                    bgcolor: designSystem.colors.background.light,
                  }
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: designSystem.colors.background.main, 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button 
            onClick={() => setOpenReturnDialog(false)} 
            disabled={actionLoading}
            sx={designSystem.button.primary}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmReturn}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            sx={designSystem.button.contained}
          >
            {actionLoading ? 'En cours...' : 'Confirmer le retour'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Renew Dialog - Catalogue Style */}
      <Dialog 
        open={openRenewDialog} 
        onClose={() => !actionLoading && setOpenRenewDialog(false)}
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
          <Typography variant="h5" sx={designSystem.typography.h5}>
            Renouveler l'emprunt
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.main }}>
          {selectedLoan && (
            <>
              <Typography variant="body1" sx={{ 
                ...designSystem.typography.body,
                mb: 2
              }}>
                Confirmez-vous le renouvellement de l'emprunt de <strong>"{selectedLoan.book?.title}"</strong> ?
              </Typography>
              
              <Alert severity="info" sx={{ 
                mb: 2,
                bgcolor: '#e0f2fe',
                border: `1px solid #38bdf8`,
                color: '#0369a1'
              }}>
                <Typography variant="body2" sx={designSystem.typography.body}>
                  La date de retour sera prolongée de 14 jours.
                </Typography>
                <Typography variant="body2" sx={{ 
                  ...designSystem.typography.body,
                  mt: 0.5
                }}>
                  <strong>Nouvelle date de retour:</strong> {formatDate(new Date(selectedLoan.dueDate).setDate(new Date(selectedLoan.dueDate).getDate() + 14))}
                </Typography>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: designSystem.colors.background.main, 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button 
            onClick={() => setOpenRenewDialog(false)} 
            disabled={actionLoading}
            sx={designSystem.button.primary}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmRenew}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            sx={designSystem.button.contained}
          >
            {actionLoading ? 'En cours...' : 'Confirmer le renouvellement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lost Dialog - Catalogue Style */}
      <Dialog 
        open={openLostDialog} 
        onClose={() => !actionLoading && setOpenLostDialog(false)}
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
            <ReportProblem sx={{ color: designSystem.colors.status.unavailable.text }} />
            <Typography variant="h5" sx={designSystem.typography.h5}>
              Signaler un livre perdu
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.main }}>
          {selectedLoan && (
            <>
              <Alert severity="warning" sx={{ 
                mb: 2,
                bgcolor: '#fef3c7',
                border: `1px solid #fbbf24`,
                color: '#92400e'
              }}>
                <Typography variant="body2" sx={{ 
                  ...designSystem.typography.body,
                  fontWeight: 'bold'
                }}>
                  Attention: Signalement de livre perdu
                </Typography>
                <Typography variant="body2" sx={designSystem.typography.body}>
                  Si vous signalez ce livre comme perdu:
                  <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                    <li>Une amende de 50 TND sera appliquée (plus les frais de retard si applicable)</li>
                    <li>L'emprunt sera immédiatement terminé</li>
                    <li>Le livre sera marqué comme "Perdu" dans votre historique</li>
                  </ul>
                </Typography>
              </Alert>
              
              <Typography variant="body1" sx={{ 
                ...designSystem.typography.body,
                mb: 2
              }}>
                Confirmez-vous la perte de <strong>"{selectedLoan.book?.title}"</strong> ?
              </Typography>
              
              <TextField
                fullWidth
                label="Raison ou circonstances (optionnel)"
                multiline
                rows={3}
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="Ex: Égaré pendant un déménagement, volé, etc."
                sx={{ mt: 2 }}
                InputProps={{
                  sx: {
                    bgcolor: designSystem.colors.background.light,
                  }
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: designSystem.colors.background.main, 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button 
            onClick={() => setOpenLostDialog(false)} 
            disabled={actionLoading}
            sx={designSystem.button.primary}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmLost}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Report />}
            sx={{
              ...designSystem.button.contained,
              bgcolor: designSystem.colors.status.unavailable.text,
              '&:hover': { bgcolor: '#dc2626' }
            }}
          >
            {actionLoading ? 'En cours...' : 'Confirmer la perte'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default MesEmprunts;