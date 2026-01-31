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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  History,
  Warning,
  Visibility,
  Refresh,
  Bookmark
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import loanService from '../../api/loanService';

const MesEmprunts = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedEmprunt, setSelectedEmprunt] = useState(null);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [returning, setReturning] = useState(false);

  // Data states
  const [empruntsEnCours, setEmpruntsEnCours] = useState([]);
  const [empruntsEnRetard, setEmpruntsEnRetard] = useState([]);
  const [historiqueEmprunts, setHistoriqueEmprunts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [activeRes, overdueRes, historyRes, statsRes] = await Promise.all([
        loanService.getMyActiveLoans(),
        loanService.getMyOverdueLoans(),
        loanService.getMyLoanHistory(),
        loanService.getMyLoanStats()
      ]);

      // Filter active loans (exclude overdue from active list)
      const activeLoans = (activeRes.data || []).filter(loan => loan.status === 'ACTIVE');
      setEmpruntsEnCours(activeLoans);
      setEmpruntsEnRetard(overdueRes.data || []);
      setHistoriqueEmprunts(historyRes.data || []);
      setStats(statsRes.data || null);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Erreur lors du chargement des emprunts');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleReturnBook = (emprunt) => {
    setSelectedEmprunt(emprunt);
    setReturnNotes('');
    setOpenReturnDialog(true);
  };

  const confirmReturn = async () => {
    if (!selectedEmprunt) return;

    setReturning(true);
    try {
      await loanService.returnBook(selectedEmprunt.id, returnNotes || null);
      toast.success('Livre retourné avec succès');
      setOpenReturnDialog(false);
      setSelectedEmprunt(null);
      setReturnNotes('');
      // Refresh data
      fetchAllData();
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du retour du livre');
    } finally {
      setReturning(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      ACTIVE: { label: 'En cours', color: 'success' },
      OVERDUE: { label: 'En retard', color: 'error' },
      RETURNED: { label: 'Retourné', color: 'default' },
      LOST: { label: 'Perdu', color: 'error' },
      CANCELLED: { label: 'Annulé', color: 'default' }
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant={status === 'RETURNED' ? 'outlined' : 'filled'}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Calculate days remaining or overdue
  const getDaysInfo = (loan) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(loan.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format late fee
  const formatLateFee = (fee) => {
    if (!fee || fee === 0) return '0.00€';
    return `${parseFloat(fee).toFixed(2)}€`;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={400} height={30} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height={400} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={3} key={i}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

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
          Mes Emprunts
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Gérez vos emprunts en cours et consultez votre historique
        </Typography>
      </Box>

      {/* Alertes */}
      {empruntsEnRetard.length > 0 && (
        <Alert
          severity="error"
          icon={<Warning />}
          sx={{ mb: 3 }}
        >
          Vous avez {empruntsEnRetard.length} emprunt(s) en retard. Des amendes peuvent s'appliquer.
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600 }
          }}
        >
          <Tab
            icon={<Bookmark />}
            iconPosition="start"
            label={`En cours (${empruntsEnCours.length})`}
          />
          <Tab
            icon={<Warning />}
            iconPosition="start"
            label={`En retard (${empruntsEnRetard.length})`}
          />
          <Tab
            icon={<History />}
            iconPosition="start"
            label={`Historique (${historiqueEmprunts.length})`}
          />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          {/* Tab 1: Emprunts en cours */}
          {currentTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Livre</TableCell>
                    <TableCell>Date d'emprunt</TableCell>
                    <TableCell>Retour prévu</TableCell>
                    <TableCell>Jours restants</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empruntsEnCours.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Aucun emprunt en cours
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    empruntsEnCours.map((emprunt) => {
                      const daysRemaining = getDaysInfo(emprunt);
                      return (
                        <TableRow key={emprunt.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <img
                                src={emprunt.book?.coverUrl || '/placeholder-book.png'}
                                alt={emprunt.book?.title}
                                style={{
                                  width: 40,
                                  height: 60,
                                  objectFit: 'cover',
                                  borderRadius: 4
                                }}
                                onError={(e) => { e.target.src = '/placeholder-book.png'; }}
                              />
                              <Box>
                                <Typography variant="body1" fontWeight="600">
                                  {emprunt.book?.title || 'Titre inconnu'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {emprunt.book?.author || 'Auteur inconnu'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{formatDate(emprunt.borrowDate)}</TableCell>
                          <TableCell>{formatDate(emprunt.dueDate)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body2"
                                color={daysRemaining <= 3 ? 'error' : 'text.primary'}
                                fontWeight="600"
                              >
                                {daysRemaining} jours
                              </Typography>
                              {daysRemaining <= 3 && (
                                <Warning color="error" fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(emprunt.status)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Refresh />}
                              onClick={() => handleReturnBook(emprunt)}
                            >
                              Retourner
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 2: Emprunts en retard */}
          {currentTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Livre</TableCell>
                    <TableCell>Date d'emprunt</TableCell>
                    <TableCell>Retour prévu</TableCell>
                    <TableCell>Jours de retard</TableCell>
                    <TableCell>Amende</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empruntsEnRetard.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Aucun emprunt en retard
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    empruntsEnRetard.map((emprunt) => {
                      const daysOverdue = Math.abs(getDaysInfo(emprunt));
                      return (
                        <TableRow key={emprunt.id} hover sx={{ bgcolor: 'error.lighter' }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <img
                                src={emprunt.book?.coverUrl || '/placeholder-book.png'}
                                alt={emprunt.book?.title}
                                style={{
                                  width: 40,
                                  height: 60,
                                  objectFit: 'cover',
                                  borderRadius: 4
                                }}
                                onError={(e) => { e.target.src = '/placeholder-book.png'; }}
                              />
                              <Box>
                                <Typography variant="body1" fontWeight="600">
                                  {emprunt.book?.title || 'Titre inconnu'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {emprunt.book?.author || 'Auteur inconnu'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{formatDate(emprunt.borrowDate)}</TableCell>
                          <TableCell>{formatDate(emprunt.dueDate)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="error" fontWeight="600">
                              {daysOverdue} jours
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="error" fontWeight="600">
                              {formatLateFee(emprunt.lateFee)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(emprunt.status)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<Refresh />}
                              onClick={() => handleReturnBook(emprunt)}
                            >
                              Retourner
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 3: Historique */}
          {currentTab === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Livre</TableCell>
                    <TableCell>Date d'emprunt</TableCell>
                    <TableCell>Retour prévu</TableCell>
                    <TableCell>Date de retour</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historiqueEmprunts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Aucun historique d'emprunt
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    historiqueEmprunts.map((emprunt) => (
                      <TableRow key={emprunt.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img
                              src={emprunt.book?.coverUrl || '/placeholder-book.png'}
                              alt={emprunt.book?.title}
                              style={{
                                width: 40,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: 4
                              }}
                              onError={(e) => { e.target.src = '/placeholder-book.png'; }}
                            />
                            <Box>
                              <Typography variant="body1" fontWeight="600">
                                {emprunt.book?.title || 'Titre inconnu'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {emprunt.book?.author || 'Auteur inconnu'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(emprunt.borrowDate)}</TableCell>
                        <TableCell>{formatDate(emprunt.dueDate)}</TableCell>
                        <TableCell>{formatDate(emprunt.returnDate)}</TableCell>
                        <TableCell>
                          {getStatusChip(emprunt.status)}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {stats?.activeLoans || empruntsEnCours.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Emprunts en cours
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h4" color="error" fontWeight="bold">
              {stats?.overdueLoans || empruntsEnRetard.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              En retard
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {stats?.totalLoans || historiqueEmprunts.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total emprunts
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {formatLateFee(stats?.totalLateFees)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Amende totale
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de retour */}
      <Dialog
        open={openReturnDialog}
        onClose={() => !returning && setOpenReturnDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Retourner le livre
        </DialogTitle>
        <DialogContent>
          {selectedEmprunt && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Confirmez-vous le retour de <strong>"{selectedEmprunt.book?.title}"</strong> ?
              </Typography>
              {selectedEmprunt.status === 'OVERDUE' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Ce livre est en retard. Une amende de {formatLateFee(selectedEmprunt.lateFee)} sera appliquée.
                </Alert>
              )}
              <TextField
                fullWidth
                label="Commentaire (optionnel)"
                multiline
                rows={3}
                placeholder="État du livre, remarques..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                disabled={returning}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReturnDialog(false)} disabled={returning}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={confirmReturn}
            disabled={returning}
            startIcon={returning && <CircularProgress size={16} />}
          >
            {returning ? 'Retour en cours...' : 'Confirmer le retour'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MesEmprunts;
