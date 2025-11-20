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
  Rating,
  Divider,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
  Share,
  Star,
  StarBorder,
  AccessTime,
  LibraryBooks,
  TrendingUp,
  LocalLibrary
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../../store/authStore';

const Historique = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('table');
  const [historiqueData, setHistoriqueData] = useState([]);

  // Données simulées pour l'historique
  const sampleHistorique = [
    {
      id: 1,
      livre: "L'Étranger",
      auteur: "Albert Camus",
      isbn: "9782070360021",
      dateEmprunt: "2024-01-15",
      dateRetourPrevu: "2024-02-15",
      dateRetour: "2024-02-12",
      statut: "returned",
      duree: 28,
      retard: false,
      evaluation: 5,
      commentaire: "Très belle lecture, un classique intemporel",
      couverture: "/api/placeholder/80/120"
    },
    {
      id: 2,
      livre: "1984",
      auteur: "George Orwell",
      isbn: "9782070368225",
      dateEmprunt: "2023-12-01",
      dateRetourPrevu: "2023-12-29",
      dateRetour: "2023-12-28",
      statut: "returned",
      duree: 27,
      retard: false,
      evaluation: 4,
      commentaire: "Visionnaire et troublant",
      couverture: "/api/placeholder/80/120"
    },
    {
      id: 3,
      livre: "Le Petit Prince",
      auteur: "Antoine de Saint-Exupéry",
      isbn: "9782070612758",
      dateEmprunt: "2023-11-10",
      dateRetourPrevu: "2023-12-08",
      dateRetour: "2023-12-10",
      statut: "returned_late",
      duree: 30,
      retard: true,
      joursRetard: 2,
      amende: "1.00€",
      evaluation: 5,
      commentaire: "À relire régulièrement",
      couverture: "/api/placeholder/80/120"
    },
    {
      id: 4,
      livre: "Les Misérables",
      auteur: "Victor Hugo",
      isbn: "9782253009265",
      dateEmprunt: "2023-10-05",
      dateRetourPrevu: "2023-11-02",
      dateRetour: "2023-10-30",
      statut: "returned",
      duree: 25,
      retard: false,
      evaluation: 4,
      commentaire: "Une fresque magistrale",
      couverture: "/api/placeholder/80/120"
    },
    {
      id: 5,
      livre: "Bel-Ami",
      auteur: "Guy de Maupassant",
      isbn: "9782253009266",
      dateEmprunt: "2023-09-15",
      dateRetourPrevu: "2023-10-13",
      dateRetour: "2023-10-13",
      statut: "returned",
      duree: 28,
      retard: false,
      evaluation: 3,
      commentaire: "Intéressant mais un peu long",
      couverture: "/api/placeholder/80/120"
    },
    {
      id: 6,
      livre: "Madame Bovary",
      auteur: "Gustave Flaubert",
      isbn: "9782070360022",
      dateEmprunt: "2023-08-20",
      dateRetourPrevu: "2023-09-17",
      dateRetour: "2023-09-20",
      statut: "returned_late",
      duree: 31,
      retard: true,
      joursRetard: 3,
      amende: "1.50€",
      evaluation: 4,
      commentaire: "Écriture remarquable",
      couverture: "/api/placeholder/80/120"
    },
    {
      id: 7,
      livre: "La Peste",
      auteur: "Albert Camus",
      isbn: "9782070360023",
      dateEmprunt: "2023-07-12",
      dateRetourPrevu: "2023-08-09",
      dateRetour: "2023-08-05",
      statut: "returned",
      duree: 24,
      retard: false,
      evaluation: 5,
      commentaire: "Très actuel et profond",
      couverture: "/api/placeholder/80/120"
    },
    {
      id: 8,
      livre: "Germinal",
      auteur: "Émile Zola",
      isbn: "9782253009267",
      dateEmprunt: "2023-06-01",
      dateRetourPrevu: "2023-06-29",
      dateRetour: "2023-06-25",
      statut: "returned",
      duree: 24,
      retard: false,
      evaluation: 4,
      commentaire: "Puissant et engagé",
      couverture: "/api/placeholder/80/120"
    }
  ];

  const periods = [
    { value: 'all', label: 'Toute période' },
    { value: 'month', label: 'Ce mois' },
    { value: '3months', label: '3 derniers mois' },
    { value: '6months', label: '6 derniers mois' },
    { value: 'year', label: 'Cette année' }
  ];

  const statuses = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'returned', label: 'Retournés à temps' },
    { value: 'returned_late', label: 'Retournés en retard' }
  ];

  const itemsPerPage = 6;

  useEffect(() => {
    // Simuler un appel API
    setHistoriqueData(sampleHistorique);
  }, []);

  // Filtrer et trier les données
  const filteredData = historiqueData.filter(loan => {
    const matchesSearch = loan.livre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.auteur.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPeriod = selectedPeriod === 'all' || 
                         (selectedPeriod === 'month' && isWithinDays(loan.dateEmprunt, 30)) ||
                         (selectedPeriod === '3months' && isWithinDays(loan.dateEmprunt, 90)) ||
                         (selectedPeriod === '6months' && isWithinDays(loan.dateEmprunt, 180)) ||
                         (selectedPeriod === 'year' && isWithinDays(loan.dateEmprunt, 365));
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'returned' && loan.statut === 'returned') ||
                         (selectedStatus === 'returned_late' && loan.statut === 'returned_late');
    
    return matchesSearch && matchesPeriod && matchesStatus;
  });

  // Trier les données
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.dateEmprunt) - new Date(a.dateEmprunt);
      case 'title':
        return a.livre.localeCompare(b.livre);
      case 'author':
        return a.auteur.localeCompare(b.auteur);
      case 'rating':
        return b.evaluation - a.evaluation;
      default:
        return 0;
    }
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fonction utilitaire pour vérifier si une date est dans les derniers jours
  const isWithinDays = (dateString, days) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusChip = (statut, retard) => {
    if (statut === 'returned_late') {
      return (
        <Chip 
          label="Retourné en retard"
          color="error"
          size="small"
          variant="outlined"
        />
      );
    }
    return (
      <Chip 
        label="Retourné à temps"
        color="success"
        size="small"
        variant="outlined"
      />
    );
  };

  const getStats = () => {
    const total = historiqueData.length;
    const onTime = historiqueData.filter(loan => loan.statut === 'returned').length;
    const late = historiqueData.filter(loan => loan.statut === 'returned_late').length;
    const averageRating = (historiqueData.reduce((sum, loan) => sum + loan.evaluation, 0) / total).toFixed(1);
    const totalDays = historiqueData.reduce((sum, loan) => sum + loan.duree, 0);
    const averageDays = (totalDays / total).toFixed(0);

    return { total, onTime, late, averageRating, averageDays };
  };

  const stats = getStats();

  const handleExport = () => {
    // Logique d'export
    console.log('Export de l\'historique');
  };

  const handlePrint = () => {
    window.print();
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
          Historique des Emprunts
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Retracez votre parcours de lecture et consultez vos anciens emprunts
        </Typography>
      </Box>

      {/* Statistiques résumées */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <LibraryBooks sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
            <Typography variant="body2">Total emprunts</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">{stats.onTime}</Typography>
            <Typography variant="body2">Retours à temps</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <AccessTime sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">{stats.late}</Typography>
            <Typography variant="body2">Retours en retard</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Star sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">{stats.averageRating}</Typography>
            <Typography variant="body2">Note moyenne</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">{stats.averageDays}</Typography>
            <Typography variant="body2">Jours moyen</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de recherche et filtres */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Rechercher un livre ou un auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={selectedPeriod}
                label="Période"
                onChange={(e) => setSelectedPeriod(e.target.value)}
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
                onChange={(e) => setSelectedStatus(e.target.value)}
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
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="date">Date récente</MenuItem>
                <MenuItem value="title">Titre</MenuItem>
                <MenuItem value="author">Auteur</MenuItem>
                <MenuItem value="rating">Note</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Exporter en PDF">
                <IconButton onClick={handleExport} color="primary">
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimer">
                <IconButton onClick={handlePrint} color="primary">
                  <Print />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Résultats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          {filteredData.length} emprunt(s) trouvé(s)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('table')}
          >
            Vue tableau
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('cards')}
          >
            Vue cartes
          </Button>
        </Box>
      </Box>

      {/* Contenu selon le mode de vue */}
      {viewMode === 'table' ? (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Livre</TableCell>
                <TableCell>Date d'emprunt</TableCell>
                <TableCell>Retour prévu</TableCell>
                <TableCell>Date de retour</TableCell>
                <TableCell>Durée</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Évaluation</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((loan) => (
                <TableRow key={loan.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        variant="rounded"
                        src={loan.couverture}
                        sx={{ width: 40, height: 60 }}
                      >
                        <Book />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {loan.livre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {loan.auteur}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(loan.dateEmprunt)}</TableCell>
                  <TableCell>{formatDate(loan.dateRetourPrevu)}</TableCell>
                  <TableCell>{formatDate(loan.dateRetour)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {loan.duree} jours
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(loan.statut, loan.retard)}
                    {loan.retard && (
                      <Typography variant="caption" color="error" display="block">
                        {loan.joursRetard} jour(s) de retard
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Rating value={loan.evaluation} readOnly size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir les détails">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => setSelectedLoan(loan)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // Vue cartes
        <Grid container spacing={3}>
          {paginatedData.map((loan) => (
            <Grid item xs={12} md={6} key={loan.id}>
              <Card 
                sx={{ 
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => setSelectedLoan(loan)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Avatar
                      variant="rounded"
                      src={loan.couverture}
                      sx={{ width: 80, height: 120 }}
                    >
                      <Book />
                    </Avatar>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" fontWeight="600">
                          {loan.livre}
                        </Typography>
                        {getStatusChip(loan.statut, loan.retard)}
                      </Box>
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        par {loan.auteur}
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Emprunté le
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {formatDate(loan.dateEmprunt)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Retourné le
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {formatDate(loan.dateRetour)}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Durée
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {loan.duree} jours
                          </Typography>
                        </Box>
                        <Rating value={loan.evaluation} readOnly size="small" />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {filteredData.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredData.length / itemsPerPage)}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Dialog détail de l'emprunt */}
      <Dialog 
        open={!!selectedLoan} 
        onClose={() => setSelectedLoan(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedLoan && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="600">
                  Détails de l'emprunt
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Avatar
                    variant="rounded"
                    src={selectedLoan.couverture}
                    sx={{ width: '100%', height: 200 }}
                  >
                    <Book />
                  </Avatar>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" fontWeight="700" gutterBottom>
                    {selectedLoan.livre}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    par {selectedLoan.auteur}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Rating value={selectedLoan.evaluation} readOnly size="large" />
                    <Typography variant="body2" color="text.secondary">
                      ({selectedLoan.evaluation}/5)
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" color="text.secondary">
                        Date d'emprunt:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedLoan.dateEmprunt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" color="text.secondary">
                        Retour prévu:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedLoan.dateRetourPrevu)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" color="text.secondary">
                        Date de retour:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedLoan.dateRetour)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" color="text.secondary">
                        Durée:
                      </Typography>
                      <Typography variant="body1">
                        {selectedLoan.duree} jours
                      </Typography>
                    </Grid>
                    {selectedLoan.retard && (
                      <Grid item xs={12}>
                        <Alert severity="warning">
                          Retourné avec {selectedLoan.joursRetard} jour(s) de retard
                          {selectedLoan.amende && ` - Amende: ${selectedLoan.amende}`}
                        </Alert>
                      </Grid>
                    )}
                  </Grid>

                  {selectedLoan.commentaire && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" fontWeight="600" color="text.secondary" gutterBottom>
                        Votre commentaire:
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        "{selectedLoan.commentaire}"
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedLoan(null)}>
                Fermer
              </Button>
              <Button variant="contained">
                Réemprunter ce livre
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Section recommandations basée sur l'historique */}
      {filteredData.length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
              Recommandations basées sur votre historique
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                  <LocalLibrary sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" fontWeight="600">
                    Autres livres de Camus
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Découvrez La Peste, La Chute...
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" fontWeight="600">
                    Romans classiques
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Votre genre préféré
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                  <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" fontWeight="600">
                    Vos livres 5 étoiles
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    À relire absolument
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                  <Book sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6" fontWeight="600">
                    Nouvelles acquisitions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dans vos genres favoris
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Historique;