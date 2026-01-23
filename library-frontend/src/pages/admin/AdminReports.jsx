// src/pages/admin/AdminReports.jsx - DESIGN SYSTEM VERSION
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import {
  LocalLibrary,
  Group,
  CheckCircle,
  Book,
  Download,
  Print,
  Refresh,
  TrendingUp,
  Category,
  Timeline,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    },
    chart: {
      primary: '#78350f',
      secondary: '#92400e',
      success: '#166534',
      warning: '#b45309',
      info: '#451a03'
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

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState({
    dashboardStats: null,
    loanStats: null,
    userStats: null,
    bookStats: null,
    categoryStats: null,
    topBorrowed: null,
    recentActivity: null,
    monthlyStats: null,
    comparativeStats: null,
    userActivity: null,
    peakHours: null,
    activityTimeline: null
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [timeRange, setTimeRange] = useState('month');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  const reportRef = useRef();

  const loadReportsData = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days: timeRange === 'week' ? 7 : 
              timeRange === 'month' ? 30 : 
              timeRange === 'quarter' ? 90 : 365
      };
      
      const apiCalls = [
        {
          key: 'dashboardStats',
          call: () => api.get('/admin/dashboard/stats'),
          label: 'Statistiques du tableau de bord'
        },
        {
          key: 'loanStats',
          call: () => api.get('/admin/loans/statistics'),
          label: 'Statistiques des prêts'
        },
        {
          key: 'userStats',
          call: () => api.get('/admin/users/statistics'),
          label: 'Statistiques des utilisateurs'
        },
        {
          key: 'bookStats',
          call: () => api.get('/admin/books/statistics'),
          label: 'Statistiques des livres'
        },
        {
          key: 'categoryStats',
          call: () => api.get('/admin/books/categories/statistics'),
          label: 'Statistiques par catégorie'
        },
        {
          key: 'topBorrowed',
          call: () => api.get('/admin/books/top-borrowed', { params: { limit: 10 } }),
          label: 'Livres les plus empruntés'
        },
        {
          key: 'recentActivity',
          call: () => api.get('/admin/dashboard/recent-activity', { params: { limit: 10 } }),
          label: 'Activité récente'
        },
        {
          key: 'monthlyStats',
          call: () => api.get('/admin/dashboard/monthly-stats', { params: { months: 6 } }),
          label: 'Statistiques mensuelles'
        },
        {
          key: 'comparativeStats',
          call: () => api.get('/admin/dashboard/comparative-stats', { params: { days: 30 } }),
          label: 'Statistiques comparatives'
        },
        {
          key: 'userActivity',
          call: () => api.get('/admin/dashboard/user-activity', { params: { days: 7 } }),
          label: 'Activité des utilisateurs'
        },
        {
          key: 'peakHours',
          call: () => api.get('/admin/dashboard/peak-hours', { params: { days: 30 } }),
          label: 'Heures de pointe'
        },
        {
          key: 'activityTimeline',
          call: () => api.get('/admin/loans/activity-timeline', { params: { days: 30, groupBy: 'daily' } }),
          label: 'Chronologie des activités'
        }
      ];
      
      const results = {};
      
      for (const apiCall of apiCalls) {
        try {
          const response = await apiCall.call();
          
          if (response.data && response.data.success) {
            results[apiCall.key] = response.data.data;
          } else {
            results[apiCall.key] = null;
          }
        } catch (error) {
          results[apiCall.key] = null;
        }
      }
      
      setReportsData(results);
      showSnackbar('Données des rapports chargées avec succès', 'success');
      
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      showSnackbar('Erreur lors du chargement des rapports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, [timeRange, startDate, endDate]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExportReport = async () => {
    try {
      setExportLoading(true);
      const input = reportRef.current;
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport-bibliotheque-${new Date().toISOString().split('T')[0]}.pdf`);
      
      showSnackbar('Rapport exporté en PDF avec succès', 'success');
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Erreur d\'exportation:', error);
      showSnackbar('Échec de l\'exportation', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const renderData = (data, renderFunction, fallback = 'Aucune donnée disponible') => {
    return data ? renderFunction(data) : (
      <Alert severity="info" sx={{ 
        mt: 2,
        bgcolor: designSystem.colors.background.card,
        border: `1px solid ${designSystem.colors.border.light}`,
        '& .MuiAlert-icon': {
          color: designSystem.colors.primary.main
        }
      }}>
        {fallback}
      </Alert>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ 
        py: designSystem.spacing.sectionSpacing, 
        mt: 8, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ 
            color: designSystem.colors.primary.main, 
            mb: 2 
          }} />
          <Typography variant="h6" sx={{ 
            color: designSystem.colors.text.secondary,
            fontFamily: 'Georgia, serif',
            mb: 1
          }}>
            Chargement des rapports...
          </Typography>
        </Box>
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
          <Box sx={{ 
            mb: designSystem.spacing.sectionSpacing, 
            pb: 3, 
            borderBottom: `1px solid ${designSystem.colors.border.light}` 
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: 2 
            }}>
              <Box>
                <Typography variant="h3" component="h1" sx={designSystem.typography.h3}>
                  Rapports d'Administration
                </Typography>
                
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontFamily: 'Georgia, serif' }}>Période</InputLabel>
                  <Select
                    value={timeRange}
                    label="Période"
                    onChange={(e) => setTimeRange(e.target.value)}
                    sx={{
                      fontFamily: 'Georgia, serif',
                      bgcolor: designSystem.colors.background.light,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: designSystem.colors.border.medium,
                      }
                    }}
                  >
                    <MenuItem value="week">7 derniers jours</MenuItem>
                    <MenuItem value="month">30 derniers jours</MenuItem>
                    <MenuItem value="quarter">90 derniers jours</MenuItem>
                    <MenuItem value="year">Année en cours</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  startIcon={<Refresh />}
                  onClick={loadReportsData}
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
                  startIcon={<Download />}
                  onClick={() => setExportDialogOpen(true)}
                  variant="contained"
                  sx={{
                    ...designSystem.button.contained,
                    fontFamily: designSystem.typography.button.fontFamily,
                    fontWeight: designSystem.typography.button.fontWeight,
                    textTransform: designSystem.typography.button.textTransform,
                  }}
                >
                  Exporter PDF
                </Button>
                
                <Button
                  startIcon={<Print />}
                  onClick={handlePrintReport}
                  variant="contained"
                  sx={{
                    bgcolor: designSystem.colors.secondary.main,
                    color: '#ffffff',
                    fontFamily: designSystem.typography.button.fontFamily,
                    fontWeight: designSystem.typography.button.fontWeight,
                    textTransform: designSystem.typography.button.textTransform,
                    '&:hover': { 
                      bgcolor: designSystem.colors.secondary.light,
                    }
                  }}
                >
                  Imprimer
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Main report content */}
          <div ref={reportRef}>
            {/* Summary Statistics */}
            <Grid container spacing={3} sx={{ mb: designSystem.spacing.sectionSpacing }}>
              {/* Dashboard Statistics */}
              {renderData(reportsData.dashboardStats, (data) => (
                <>
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
                              Livres Totaux
                            </Typography>
                            <Typography variant="h4" sx={designSystem.typography.h4}>
                              {data.totalBooks || 0}
                            </Typography>
                          </Box>
                          <Avatar sx={{ 
                            bgcolor: designSystem.colors.background.hover,
                            color: designSystem.colors.primary.main
                          }}>
                            <Book />
                          </Avatar>
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
                              Livres Disponibles
                            </Typography>
                            <Typography variant="h4" sx={{ 
                              ...designSystem.typography.h4,
                              color: designSystem.colors.status.available.text
                            }}>
                              {data.availableBooks || 0}
                            </Typography>
                          </Box>
                          <Avatar sx={{ 
                            bgcolor: designSystem.colors.status.available.bg,
                            color: designSystem.colors.status.available.text
                          }}>
                            <CheckCircle />
                          </Avatar>
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
                              Utilisateurs Totaux
                            </Typography>
                            <Typography variant="h4" sx={designSystem.typography.h4}>
                              {data.totalUsers || 0}
                            </Typography>
                          </Box>
                          <Avatar sx={{ 
                            bgcolor: designSystem.colors.background.hover,
                            color: designSystem.colors.primary.main
                          }}>
                            <Group />
                          </Avatar>
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
                              Prêts Actifs
                            </Typography>
                            <Typography variant="h4" sx={designSystem.typography.h4}>
                              {data.activeLoans || 0}
                            </Typography>
                          </Box>
                          <Avatar sx={{ 
                            bgcolor: designSystem.colors.background.hover,
                            color: designSystem.colors.primary.main
                          }}>
                            <LocalLibrary />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              ), 'Aucune statistique de tableau de bord disponible')}

              {/* Loan Statistics */}
              {renderData(reportsData.loanStats, (data) => (
                <Grid item xs={12}>
                  <Card sx={{ 
                    ...designSystem.card,
                    bgcolor: designSystem.colors.background.card,
                  }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom sx={designSystem.typography.h5}>
                        Statistiques des Prêts
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ 
                            color: designSystem.colors.text.caption,
                            fontFamily: 'monospace',
                            display: 'block'
                          }}>
                            Prêts Totaux
                          </Typography>
                          <Typography variant="h5" sx={designSystem.typography.h5}>
                            {data.totalLoans || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ 
                            color: designSystem.colors.text.caption,
                            fontFamily: 'monospace',
                            display: 'block'
                          }}>
                            Prêts Actifs
                          </Typography>
                          <Typography variant="h5" sx={designSystem.typography.h5}>
                            {data.activeLoans || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ 
                            color: designSystem.colors.text.caption,
                            fontFamily: 'monospace',
                            display: 'block'
                          }}>
                            Prêts En Retard
                          </Typography>
                          <Typography variant="h5" sx={{ 
                            ...designSystem.typography.h5,
                            color: designSystem.colors.status.unavailable.text
                          }}>
                            {data.overdueLoans || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ 
                            color: designSystem.colors.text.caption,
                            fontFamily: 'monospace',
                            display: 'block'
                          }}>
                            Taux de Retour
                          </Typography>
                          <Typography variant="h5" sx={{ 
                            ...designSystem.typography.h5,
                            color: designSystem.colors.status.available.text
                          }}>
                            {data.returnRate || 0}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ), null)}
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: designSystem.spacing.sectionSpacing }}>
              {/* Monthly Statistics Chart */}
              {renderData(reportsData.monthlyStats, (data) => (
                <Grid item xs={12} lg={8}>
                  <Card sx={{ 
                    ...designSystem.card,
                    bgcolor: designSystem.colors.background.main,
                  }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom sx={designSystem.typography.h5}>
                        Statistiques Mensuelles
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart 
                            data={data.monthlyLoans ? Object.entries(data.monthlyLoans).map(([month, loans]) => ({ month, loans })) : []}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.border.light} />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontFamily: 'Georgia, serif', fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fontFamily: 'Georgia, serif', fontSize: 12 }}
                            />
                            <RechartsTooltip 
                              contentStyle={{ 
                                fontFamily: 'Georgia, serif',
                                borderRadius: '2px',
                                border: `1px solid ${designSystem.colors.border.light}`,
                                backgroundColor: designSystem.colors.background.main
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="loans" 
                              name="Prêts" 
                              stroke={designSystem.colors.chart.primary} 
                              fill={designSystem.colors.chart.primary} 
                              fillOpacity={0.3} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ), null)}

              {/* Category Statistics */}
              {renderData(reportsData.categoryStats, (data) => (
                <Grid item xs={12} lg={4}>
                  <Card sx={{ 
                    ...designSystem.card,
                    bgcolor: designSystem.colors.background.main,
                  }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom sx={designSystem.typography.h5}>
                        Statistiques par Catégorie
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Array.isArray(data) ? data.slice(0, 5) : []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => entry.name}
                              outerRadius={80}
                              dataKey="loanCount"
                            >
                              {Array.isArray(data) && data.slice(0, 5).map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={[
                                    designSystem.colors.chart.primary,
                                    designSystem.colors.chart.secondary,
                                    designSystem.colors.chart.success,
                                    designSystem.colors.chart.warning,
                                    designSystem.colors.chart.info
                                  ][index % 5]} 
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ 
                                fontFamily: 'Georgia, serif',
                                borderRadius: '2px',
                                border: `1px solid ${designSystem.colors.border.light}`,
                                backgroundColor: designSystem.colors.background.main
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ), null)}

              {/* User Activity Chart */}
              {renderData(reportsData.userActivity, (data) => (
                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    ...designSystem.card,
                    bgcolor: designSystem.colors.background.main,
                  }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom sx={designSystem.typography.h5}>
                        Activité des Utilisateurs
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={Array.isArray(data) ? data : []}>
                            <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.border.light} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontFamily: 'Georgia, serif', fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fontFamily: 'Georgia, serif', fontSize: 12 }}
                            />
                            <RechartsTooltip 
                              contentStyle={{ 
                                fontFamily: 'Georgia, serif',
                                borderRadius: '2px',
                                border: `1px solid ${designSystem.colors.border.light}`,
                                backgroundColor: designSystem.colors.background.main
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ fontFamily: 'Georgia, serif' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="active" 
                              name="Utilisateurs Actifs" 
                              stroke={designSystem.colors.chart.primary} 
                              strokeWidth={2} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="new" 
                              name="Nouveaux Utilisateurs" 
                              stroke={designSystem.colors.chart.success} 
                              strokeWidth={2} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ), null)}

              {/* Activity Timeline Chart */}
              {renderData(reportsData.activityTimeline, (data) => (
                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    ...designSystem.card,
                    bgcolor: designSystem.colors.background.main,
                  }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom sx={designSystem.typography.h5}>
                        Chronologie des Prêts
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={Array.isArray(data) ? data : []}>
                            <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.border.light} />
                            <XAxis 
                              dataKey="label" 
                              tick={{ fontFamily: 'Georgia, serif', fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fontFamily: 'Georgia, serif', fontSize: 12 }}
                            />
                            <RechartsTooltip 
                              contentStyle={{ 
                                fontFamily: 'Georgia, serif',
                                borderRadius: '2px',
                                border: `1px solid ${designSystem.colors.border.light}`,
                                backgroundColor: designSystem.colors.background.main
                              }}
                            />
                            <Bar 
                              dataKey="loans" 
                              name="Prêts" 
                              fill={designSystem.colors.chart.primary} 
                              radius={[4, 4, 0, 0]} 
                            />
                            <Bar 
                              dataKey="returns" 
                              name="Retours" 
                              fill={designSystem.colors.chart.success} 
                              radius={[4, 4, 0, 0]} 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ), null)}
            </Grid>

            {/* Tables Section */}
            <Grid container spacing={3}>
              {/* Top Borrowed Books */}
              {renderData(reportsData.topBorrowed, (data) => (
                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    ...designSystem.card,
                    bgcolor: designSystem.colors.background.main,
                  }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom sx={designSystem.typography.h5}>
                        Livres les Plus Empruntés
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ 
                              bgcolor: designSystem.colors.background.light,
                              borderBottom: `2px solid ${designSystem.colors.border.light}`
                            }}>
                              <TableCell sx={{ 
                                fontWeight: 700,
                                fontFamily: 'Georgia, serif',
                                color: designSystem.colors.primary.dark
                              }}>
                                Livre
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                fontWeight: 700,
                                fontFamily: 'Georgia, serif',
                                color: designSystem.colors.primary.dark
                              }}>
                                Nombre de Prêts
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Array.isArray(data) && data.slice(0, 5).map((book) => (
                              <TableRow 
                                key={book.id}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: designSystem.colors.background.hover 
                                  }
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ 
                                      bgcolor: designSystem.colors.background.hover,
                                      color: designSystem.colors.primary.main,
                                      fontFamily: 'Georgia, serif',
                                      fontWeight: 600
                                    }}>
                                      <Book />
                                    </Avatar>
                                    <Box>
                                      <Typography sx={{ 
                                        fontWeight: 600,
                                        fontFamily: 'Georgia, serif',
                                        color: designSystem.colors.text.primary
                                      }}>
                                        {book.title}
                                      </Typography>
                                      <Typography variant="caption" sx={{ 
                                        color: designSystem.colors.text.muted,
                                        fontFamily: 'Georgia, serif',
                                        fontStyle: 'italic'
                                      }}>
                                        {book.author}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={book.loans || 0}
                                    sx={{
                                      bgcolor: designSystem.colors.background.hover,
                                      color: designSystem.colors.primary.main,
                                      border: `1px solid ${designSystem.colors.border.light}`,
                                      fontFamily: 'Georgia, serif',
                                      fontWeight: 600
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              ), null)}

              {/* Recent Activity */}
              {renderData(reportsData.recentActivity, (data) => (
                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    ...designSystem.card,
                    bgcolor: designSystem.colors.background.main,
                  }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom sx={designSystem.typography.h5}>
                        Activité Récente
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ 
                              bgcolor: designSystem.colors.background.light,
                              borderBottom: `2px solid ${designSystem.colors.border.light}`
                            }}>
                              <TableCell sx={{ 
                                fontWeight: 700,
                                fontFamily: 'Georgia, serif',
                                color: designSystem.colors.primary.dark
                              }}>
                                Utilisateur
                              </TableCell>
                              <TableCell sx={{ 
                                fontWeight: 700,
                                fontFamily: 'Georgia, serif',
                                color: designSystem.colors.primary.dark
                              }}>
                                Livre
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                fontWeight: 700,
                                fontFamily: 'Georgia, serif',
                                color: designSystem.colors.primary.dark
                              }}>
                                Date
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                fontWeight: 700,
                                fontFamily: 'Georgia, serif',
                                color: designSystem.colors.primary.dark
                              }}>
                                Statut
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Array.isArray(data) && data.slice(0, 5).map((activity, index) => (
                              <TableRow 
                                key={activity.id || index}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: designSystem.colors.background.hover 
                                  }
                                }}
                              >
                                <TableCell sx={{ 
                                  fontFamily: 'Georgia, serif',
                                  color: designSystem.colors.text.secondary
                                }}>
                                  {activity.user || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ 
                                  fontFamily: 'Georgia, serif',
                                  color: designSystem.colors.text.secondary
                                }}>
                                  {activity.book || 'N/A'}
                                </TableCell>
                                <TableCell align="right" sx={{ 
                                  fontFamily: 'Georgia, serif',
                                  color: designSystem.colors.text.secondary
                                }}>
                                  {activity.loanDate || 'N/A'}
                                </TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={
                                      activity.status === 'RETURNED' ? 'RETOURNÉ' :
                                      activity.status === 'OVERDUE' ? 'EN RETARD' :
                                      activity.status || 'N/A'
                                    } 
                                    size="small"
                                    sx={{
                                      fontFamily: 'Georgia, serif',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      bgcolor: activity.status === 'RETURNED' 
                                        ? designSystem.colors.status.available.bg
                                        : activity.status === 'OVERDUE'
                                        ? designSystem.colors.status.unavailable.bg
                                        : designSystem.colors.background.hover,
                                      color: activity.status === 'RETURNED' 
                                        ? designSystem.colors.status.available.text
                                        : activity.status === 'OVERDUE'
                                        ? designSystem.colors.status.unavailable.text
                                        : designSystem.colors.text.secondary,
                                      border: activity.status === 'RETURNED' 
                                        ? `1px solid ${designSystem.colors.status.available.border}`
                                        : activity.status === 'OVERDUE'
                                        ? `1px solid ${designSystem.colors.status.unavailable.border}`
                                        : `1px solid ${designSystem.colors.border.light}`
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              ), null)}
            </Grid>
          </div>

          {/* Export Dialog */}
          <Dialog 
            open={exportDialogOpen} 
            onClose={() => setExportDialogOpen(false)}
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
                Exporter le Rapport
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Typography variant="body2" sx={{ 
                mb: 2,
                fontFamily: 'Georgia, serif',
                color: designSystem.colors.text.secondary
              }}>
                Exporter la vue actuelle du rapport en document PDF.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ 
              borderTop: `1px solid ${designSystem.colors.border.light}`, 
              p: 2 
            }}>
              <Button 
                onClick={() => setExportDialogOpen(false)}
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
                onClick={handleExportReport} 
                variant="contained"
                disabled={exportLoading}
                startIcon={exportLoading ? <CircularProgress size={20} /> : <Download />}
                sx={{
                  ...designSystem.button.contained,
                  fontFamily: designSystem.typography.button.fontFamily,
                  fontWeight: designSystem.typography.button.fontWeight,
                  textTransform: designSystem.typography.button.textTransform,
                }}
              >
                {exportLoading ? 'Exportation...' : 'Exporter PDF'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
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
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminReports;