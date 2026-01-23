import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Badge
} from '@mui/material';
import {
  Search,
  FilterList,
  CalendarToday,
  Book,
  Person,
  CheckCircle,
  Cancel,
  Visibility,
  Download,
  Print,
  Star,
  StarBorder,
  AccessTime,
  LibraryBooks,
  TrendingUp,
  LocalLibrary,
  History,
  Refresh,
  Warning,
  Schedule,
  Close
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
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

const Historique = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('table');
  const [historiqueData, setHistoriqueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const periods = [
    { value: 'all', label: 'Toute période' },
    { value: 'month', label: 'Ce mois' },
    { value: '3months', label: '3 derniers mois' },
    { value: '6months', label: '6 derniers mois' },
    { value: 'year', label: 'Cette année' }
  ];

  const statuses = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'RETURNED', label: 'Retournés' },
    { value: 'CANCELLED', label: 'Annulés' },
    { value: 'LOST', label: 'Perdus' }
  ];

  const itemsPerPage = 6;

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loans/my-loans');
      
      if (response.data.success) {
        const loans = response.data.items || response.data.data || [];
        const returnedLoans = loans.filter(loan => 
          loan.status === 'RETURNED' || 
          loan.status === 'CANCELLED' || 
          loan.status === 'LOST'
        );
        setHistoriqueData(returnedLoans);
      }
    } catch (err) {
      console.error('Error fetching loan history:', err);
      showSnackbar('Erreur lors du chargement de l\'historique', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const filteredData = historiqueData.filter(loan => {
    const matchesSearch = searchTerm === '' || 
                         (loan.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          loan.book?.author?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPeriod = selectedPeriod === 'all' || 
                         (selectedPeriod === 'month' && isWithinDays(loan.loanDate, 30)) ||
                         (selectedPeriod === '3months' && isWithinDays(loan.loanDate, 90)) ||
                         (selectedPeriod === '6months' && isWithinDays(loan.loanDate, 180)) ||
                         (selectedPeriod === 'year' && isWithinDays(loan.loanDate, 365));
    
    const matchesStatus = selectedStatus === 'all' || loan.status === selectedStatus;
    
    return matchesSearch && matchesPeriod && matchesStatus;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.loanDate) - new Date(a.loanDate);
      case 'title':
        return (a.book?.title || '').localeCompare(b.book?.title || '');
      case 'author':
        return (a.book?.author || '').localeCompare(b.book?.author || '');
      default:
        return 0;
    }
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isWithinDays = (dateString, days) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'RETURNED': { 
        label: 'Retourné', 
        color: designSystem.colors.status.available.text,
        bgColor: designSystem.colors.status.available.bg,
        border: designSystem.colors.status.available.border
      },
      'CANCELLED': { 
        label: 'Annulé', 
        color: designSystem.colors.text.muted,
        bgColor: '#f5f5f5',
        border: '#e0e0e0'
      },
      'LOST': { 
        label: 'Perdu', 
        color: designSystem.colors.status.unavailable.text,
        bgColor: designSystem.colors.status.unavailable.bg,
        border: designSystem.colors.status.unavailable.border
      }
    };

    const config = statusConfig[status] || { 
      label: status, 
      color: designSystem.colors.text.muted,
      bgColor: '#f5f5f5',
      border: '#e0e0e0'
    };
    return (
      <Chip 
        label={config.label}
        size="small"
        sx={{
          bgcolor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.border}`,
          fontWeight: 700,
          fontFamily: designSystem.typography.body.fontFamily,
          fontSize: '0.75rem'
        }}
      />
    );
  };

  const getDaysDiff = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStats = () => {
    const total = historiqueData.length;
    const returned = historiqueData.filter(loan => loan.status === 'RETURNED').length;
    const cancelled = historiqueData.filter(loan => loan.status === 'CANCELLED').length;
    const lost = historiqueData.filter(loan => loan.status === 'LOST').length;
    
    const returnedLoans = historiqueData.filter(loan => loan.status === 'RETURNED');
    const totalDays = returnedLoans.reduce((sum, loan) => {
      if (loan.loanDate && loan.returnDate) {
        return sum + getDaysDiff(loan.loanDate, loan.returnDate);
      }
      return sum;
    }, 0);
    const averageDays = returnedLoans.length > 0 ? Math.round(totalDays / returnedLoans.length) : 0;

    return { total, returned, cancelled, lost, averageDays };
  };

  const stats = getStats();

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'historique_emprunts.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSnackbar('Historique exporté avec succès', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBorrowAgain = async (bookId) => {
    try {
      const response = await api.post(`/loans/borrow/${bookId}`);
      if (response.data.success) {
        showSnackbar('Livre emprunté avec succès!', 'success');
        fetchLoans();
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Erreur lors de l\'emprunt', 'error');
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
              Historique des Emprunts
            </Typography>
            <Typography variant="h6" sx={{
              ...designSystem.typography.subtitle,
              fontStyle: 'italic',
              fontWeight: 300
            }}>
              Retracez votre parcours de lecture et consultez vos anciens emprunts
            </Typography>
          </Box>
          <Typography variant="body2" sx={{
            ...designSystem.typography.caption
          }}>
            Affichage {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)} sur {filteredData.length} résultats
          </Typography>
        </Box>
      </Box>

      {/* Statistiques résumées - Catalogue Style */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            label: 'Total emprunts', 
            value: stats.total, 
            icon: <LibraryBooks />, 
            color: designSystem.colors.primary.main,
            bgColor: '#fef3c7'
          },
          { 
            label: 'Retournés', 
            value: stats.returned, 
            icon: <CheckCircle />, 
            color: designSystem.colors.status.available.text,
            bgColor: designSystem.colors.status.available.bg
          },
          { 
            label: 'Perdus', 
            value: stats.lost, 
            icon: <Warning />, 
            color: designSystem.colors.status.unavailable.text,
            bgColor: designSystem.colors.status.unavailable.bg
          },
          { 
            label: 'Annulés', 
            value: stats.cancelled, 
            icon: <Cancel />, 
            color: designSystem.colors.secondary.main,
            bgColor: '#fef3c7'
          },
          { 
            label: 'Jours moyen', 
            value: stats.averageDays, 
            icon: <Schedule />, 
            color: designSystem.colors.primary.light,
            bgColor: '#fef3c7'
          }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 2,
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
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: `${stat.color}20`,
                mb: 1,
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
                ...designSystem.typography.caption,
                color: designSystem.colors.text.muted
              }}>
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search and Filters - Catalogue Style */}
      <Card sx={{ 
        mb: 4, 
        p: 3,
        bgcolor: designSystem.colors.background.main,
        boxShadow: designSystem.shadows.header,
        border: `1px solid ${designSystem.colors.border.light}`,
        borderRadius: designSystem.card.borderRadius
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Rechercher un livre ou un auteur..."
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={selectedPeriod}
                label="Période"
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ bgcolor: designSystem.colors.background.light }}
              >
                {periods.map((period) => (
                  <MenuItem key={period.value} value={period.value}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={selectedStatus}
                label="Statut"
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ bgcolor: designSystem.colors.background.light }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Trier par</InputLabel>
              <Select
                value={sortBy}
                label="Trier par"
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ bgcolor: designSystem.colors.background.light }}
              >
                <MenuItem value="date">Date récente</MenuItem>
                <MenuItem value="title">Titre</MenuItem>
                <MenuItem value="author">Auteur</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Actualiser">
                <IconButton 
                  onClick={fetchLoans} 
                  sx={{ color: designSystem.colors.secondary.main }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exporter en JSON">
                <IconButton 
                  onClick={handleExport} 
                  sx={{ color: designSystem.colors.secondary.main }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimer">
                <IconButton 
                  onClick={handlePrint} 
                  sx={{ color: designSystem.colors.secondary.main }}
                >
                  <Print />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Results Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="body1" sx={{
          ...designSystem.typography.body,
          color: designSystem.colors.text.muted
        }}>
          {filteredData.length} emprunt(s) trouvé(s)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('table')}
            sx={viewMode === 'table' ? designSystem.button.contained : designSystem.button.primary}
          >
            Vue tableau
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('cards')}
            sx={viewMode === 'cards' ? designSystem.button.contained : designSystem.button.primary}
          >
            Vue cartes
          </Button>
        </Box>
      </Box>

      {/* Table View - Catalogue Style */}
      {viewMode === 'table' ? (
        <Card sx={designSystem.card}>
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
                    Retour prévu
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
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" sx={{ 
                        ...designSystem.typography.body,
                        color: designSystem.colors.text.muted
                      }}>
                        Aucun emprunt dans l'historique
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((loan) => {
                    const loanDuration = loan.returnDate 
                      ? getDaysDiff(loan.loanDate, loan.returnDate)
                      : null;
                    const isLate = loan.status === 'RETURNED' && loan.returnDate && loan.dueDate && 
                                  new Date(loan.returnDate) > new Date(loan.dueDate);

                    return (
                      <TableRow key={loan.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              variant="rounded"
                              sx={{ 
                                width: 40, 
                                height: 60, 
                                bgcolor: designSystem.colors.primary.light,
                                color: designSystem.colors.primary.main
                              }}
                            >
                              <Book />
                            </Avatar>
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
                          <Typography variant="body2" sx={{ 
                            ...designSystem.typography.body,
                            fontWeight: isLate ? 600 : 'normal',
                            color: isLate ? designSystem.colors.status.unavailable.text : designSystem.colors.text.primary
                          }}>
                            {formatDate(loan.returnDate)}
                          </Typography>
                          {isLate && (
                            <Typography variant="caption" sx={{ 
                              ...designSystem.typography.caption,
                              color: designSystem.colors.status.unavailable.text
                            }}>
                              En retard
                            </Typography>
                          )}
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
                          <Tooltip title="Voir les détails">
                            <IconButton 
                              size="small" 
                              sx={{ color: designSystem.colors.secondary.main }}
                              onClick={() => setSelectedLoan(loan)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        // Card View - Catalogue Style
        <Grid container spacing={3}>
          {paginatedData.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ 
                textAlign: 'center', 
                p: 4,
                ...designSystem.card,
                bgcolor: designSystem.colors.background.card
              }}>
                <History sx={{ 
                  fontSize: 60, 
                  color: designSystem.colors.text.muted, 
                  mb: 2 
                }} />
                <Typography variant="h6" sx={{ 
                  ...designSystem.typography.h6,
                  color: designSystem.colors.text.muted
                }}>
                  Aucun emprunt dans l'historique
                </Typography>
              </Card>
            </Grid>
          ) : (
            paginatedData.map((loan) => {
              const loanDuration = loan.returnDate 
                ? getDaysDiff(loan.loanDate, loan.returnDate)
                : null;
              const isLate = loan.status === 'RETURNED' && loan.returnDate && loan.dueDate && 
                            new Date(loan.returnDate) > new Date(loan.dueDate);

              return (
                <Grid item xs={12} md={6} key={loan.id}>
                  <Card 
                    sx={designSystem.card}
                    onClick={() => setSelectedLoan(loan)}
                  >
                    <CardContent sx={{ 
                      bgcolor: designSystem.colors.background.card,
                      p: designSystem.spacing.cardPadding
                    }}>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Avatar
                          variant="rounded"
                          sx={{ 
                            width: 80, 
                            height: 120, 
                            bgcolor: designSystem.colors.primary.light,
                            color: designSystem.colors.primary.main
                          }}
                        >
                          <Book />
                        </Avatar>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start', 
                            mb: 1 
                          }}>
                            <Typography variant="h6" sx={{ 
                              ...designSystem.typography.h6,
                              fontWeight: 700
                            }}>
                              {loan.book?.title || 'Titre non disponible'}
                            </Typography>
                            {getStatusChip(loan.status)}
                          </Box>
                          
                          <Typography variant="body2" sx={{ 
                            ...designSystem.typography.body,
                            color: designSystem.colors.text.muted,
                            fontStyle: 'italic',
                            mb: 2
                          }}>
                            par {loan.book?.author || 'Auteur non disponible'}
                          </Typography>

                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                              <Typography variant="caption" sx={{ 
                                ...designSystem.typography.caption,
                                display: 'block'
                              }}>
                                Emprunté le
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                ...designSystem.typography.body,
                                fontWeight: 500
                              }}>
                                {formatDate(loan.loanDate)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" sx={{ 
                                ...designSystem.typography.caption,
                                display: 'block'
                              }}>
                                Retourné le
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                ...designSystem.typography.body,
                                fontWeight: 500
                              }}>
                                {formatDate(loan.returnDate)}
                              </Typography>
                            </Grid>
                          </Grid>

                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}>
                            <Box>
                              <Typography variant="caption" sx={{ 
                                ...designSystem.typography.caption,
                                display: 'block'
                              }}>
                                Durée
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                ...designSystem.typography.body,
                                fontWeight: 500
                              }}>
                                {loanDuration ? `${loanDuration} jours` : '-'}
                              </Typography>
                            </Box>
                            {loan.fineAmount > 0 && (
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
                            )}
                          </Box>
                          {isLate && (
                            <Alert severity="warning" sx={{ 
                              mt: 1, 
                              bgcolor: '#fef3c7',
                              border: `1px solid #fbbf24`,
                              color: '#92400e'
                            }}>
                              Retourné en retard
                            </Alert>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      {/* Pagination */}
      {filteredData.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination
            count={Math.ceil(filteredData.length / itemsPerPage)}
            page={currentPage}
            onChange={(e, value) => setCurrentPage(value)}
            sx={{
              '& .MuiPaginationItem-root': {
                fontFamily: designSystem.typography.body.fontFamily,
              },
              '& .Mui-selected': {
                backgroundColor: designSystem.colors.primary.light + '!important',
                color: 'white !important',
              }
            }}
          />
        </Box>
      )}

      {/* Dialog détail de l'emprunt - Catalogue Style */}
      <Dialog 
        open={!!selectedLoan} 
        onClose={() => setSelectedLoan(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: designSystem.card.borderRadius,
            border: designSystem.card.border
          }
        }}
      >
        {selectedLoan && (
          <>
            <DialogTitle sx={{ 
              bgcolor: designSystem.colors.background.main, 
              borderBottom: `1px solid ${designSystem.colors.border.light}` 
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <Typography variant="h5" sx={{ 
                  ...designSystem.typography.h5,
                  fontWeight: 700,
                  color: designSystem.colors.primary.dark
                }}>
                  Détails de l'emprunt
                </Typography>
                <IconButton onClick={() => setSelectedLoan(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.main }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Avatar
                    variant="rounded"
                    sx={{ 
                      width: '100%', 
                      height: 200,
                      bgcolor: designSystem.colors.primary.light,
                      color: designSystem.colors.primary.main
                    }}
                  >
                    <Book sx={{ fontSize: 80 }} />
                  </Avatar>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography 
                    variant="h4" 
                    gutterBottom
                    sx={{ 
                      ...designSystem.typography.h4,
                      fontWeight: 700
                    }}
                  >
                    {selectedLoan.book?.title || 'Titre non disponible'}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      ...designSystem.typography.h6,
                      color: designSystem.colors.text.muted,
                      fontStyle: 'italic'
                    }}
                  >
                    par {selectedLoan.book?.author || 'Auteur non disponible'}
                  </Typography>
                  
                  {selectedLoan.book?.isbn && (
                    <Typography 
                      variant="body2" 
                      gutterBottom
                      sx={{ 
                        ...designSystem.typography.body,
                        color: designSystem.colors.text.muted
                      }}
                    >
                      ISBN: {selectedLoan.book.isbn}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ 
                        ...designSystem.typography.body,
                        fontWeight: 600,
                        color: designSystem.colors.text.muted
                      }}>
                        Date d'emprunt:
                      </Typography>
                      <Typography variant="body1" sx={designSystem.typography.body}>
                        {formatDate(selectedLoan.loanDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ 
                        ...designSystem.typography.body,
                        fontWeight: 600,
                        color: designSystem.colors.text.muted
                      }}>
                        Retour prévu:
                      </Typography>
                      <Typography variant="body1" sx={designSystem.typography.body}>
                        {formatDate(selectedLoan.dueDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ 
                        ...designSystem.typography.body,
                        fontWeight: 600,
                        color: designSystem.colors.text.muted
                      }}>
                        Date de retour:
                      </Typography>
                      <Typography variant="body1" sx={designSystem.typography.body}>
                        {formatDate(selectedLoan.returnDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ 
                        ...designSystem.typography.body,
                        fontWeight: 600,
                        color: designSystem.colors.text.muted
                      }}>
                        Durée:
                      </Typography>
                      <Typography variant="body1" sx={designSystem.typography.body}>
                        {getDaysDiff(selectedLoan.loanDate, selectedLoan.returnDate)} jours
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ 
                        ...designSystem.typography.body,
                        fontWeight: 600,
                        color: designSystem.colors.text.muted
                      }}>
                        Statut:
                      </Typography>
                      {getStatusChip(selectedLoan.status)}
                    </Grid>
                    {selectedLoan.fineAmount > 0 && (
                      <Grid item xs={12}>
                        <Alert severity="warning" sx={{ 
                          bgcolor: '#fef3c7',
                          border: `1px solid #fbbf24`,
                          color: '#92400e'
                        }}>
                          Amende appliquée: {selectedLoan.fineAmount.toFixed(2)} TND
                        </Alert>
                      </Grid>
                    )}
                    {selectedLoan.notes && (
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ 
                          ...designSystem.typography.body,
                          fontWeight: 600,
                          color: designSystem.colors.text.muted
                        }}>
                          Notes:
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          ...designSystem.typography.body,
                          fontStyle: 'italic'
                        }}>
                          "{selectedLoan.notes}"
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ 
              bgcolor: designSystem.colors.background.main, 
              borderTop: `1px solid ${designSystem.colors.border.light}`, 
              p: 2 
            }}>
              <Button 
                onClick={() => setSelectedLoan(null)}
                sx={designSystem.button.primary}
              >
                Fermer
              </Button>
              {selectedLoan.book?.id && selectedLoan.status === 'RETURNED' && (
                <Button 
                  variant="contained"
                  onClick={() => handleBorrowAgain(selectedLoan.book.id)}
                  sx={designSystem.button.contained}
                >
                  Réemprunter ce livre
                </Button>
              )}
            </DialogActions>
          </>
        )}
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

export default Historique;