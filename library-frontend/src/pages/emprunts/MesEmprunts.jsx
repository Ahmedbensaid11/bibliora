import React, { useState } from 'react';
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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  EventAvailable,
  History,
  Warning,
  Visibility,
  Refresh,
  Bookmark
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const MesEmprunts = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedEmprunt, setSelectedEmprunt] = useState(null);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);

  // Données simulées pour les emprunts
  const empruntsEnCours = [
    {
      id: 1,
      livre: "L'Étranger",
      auteur: "Albert Camus",
      dateEmprunt: "2024-01-15",
      dateRetourPrevu: "2024-02-15",
      dateRetour: null,
      statut: "en_cours",
      retard: false,
      joursRestants: 5,
      couverture: "/api/placeholder/80/120"
    },
    {
      id: 2,
      livre: "Le Petit Prince",
      auteur: "Antoine de Saint-Exupéry",
      dateEmprunt: "2024-01-20",
      dateRetourPrevu: "2024-02-20",
      dateRetour: null,
      statut: "en_cours",
      retard: false,
      joursRestants: 10,
      couverture: "/api/placeholder/80/120"
    }
  ];

  const empruntsEnRetard = [
    {
      id: 3,
      livre: "1984",
      auteur: "George Orwell",
      dateEmprunt: "2023-12-01",
      dateRetourPrevu: "2023-12-29",
      dateRetour: null,
      statut: "retard",
      retard: true,
      joursRetard: 17,
      amende: "5.00€",
      couverture: "/api/placeholder/80/120"
    }
  ];

  const historiqueEmprunts = [
    {
      id: 4,
      livre: "Les Misérables",
      auteur: "Victor Hugo",
      dateEmprunt: "2023-11-01",
      dateRetourPrevu: "2023-11-29",
      dateRetour: "2023-11-25",
      statut: "termine",
      retard: false,
      couverture: "/api/placeholder/80/120"
    },
    {
      id: 5,
      livre: "Bel-Ami",
      auteur: "Guy de Maupassant",
      dateEmprunt: "2023-10-15",
      dateRetourPrevu: "2023-11-12",
      dateRetour: "2023-11-10",
      statut: "termine",
      retard: false,
      couverture: "/api/placeholder/80/120"
    }
  ];

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleReturnBook = (emprunt) => {
    setSelectedEmprunt(emprunt);
    setOpenReturnDialog(true);
  };

  const confirmReturn = () => {
    // Logique de retour
    console.log('Retour du livre:', selectedEmprunt.id);
    setOpenReturnDialog(false);
    setSelectedEmprunt(null);
  };

  const getStatusChip = (statut, retard) => {
    const statusConfig = {
      en_cours: { label: 'En cours', color: 'success' },
      retard: { label: 'En retard', color: 'error' },
      termine: { label: 'Terminé', color: 'default' }
    };

    const config = statusConfig[statut];
    return (
      <Chip 
        label={config.label}
        color={config.color}
        size="small"
        variant={statut === 'termine' ? 'outlined' : 'filled'}
      />
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
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
                  {empruntsEnCours.map((emprunt) => (
                    <TableRow key={emprunt.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <img 
                            src={emprunt.couverture} 
                            alt={emprunt.livre}
                            style={{ 
                              width: 40, 
                              height: 60, 
                              objectFit: 'cover',
                              borderRadius: 4
                            }}
                          />
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {emprunt.livre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {emprunt.auteur}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(emprunt.dateEmprunt)}</TableCell>
                      <TableCell>{formatDate(emprunt.dateRetourPrevu)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body2" 
                            color={emprunt.joursRestants <= 3 ? 'error' : 'text.primary'}
                            fontWeight="600"
                          >
                            {emprunt.joursRestants} jours
                          </Typography>
                          {emprunt.joursRestants <= 3 && (
                            <Warning color="error" fontSize="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(emprunt.statut, emprunt.retard)}
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
                  ))}
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
                  {empruntsEnRetard.map((emprunt) => (
                    <TableRow key={emprunt.id} hover sx={{ bgcolor: 'error.light' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <img 
                            src={emprunt.couverture} 
                            alt={emprunt.livre}
                            style={{ 
                              width: 40, 
                              height: 60, 
                              objectFit: 'cover',
                              borderRadius: 4
                            }}
                          />
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {emprunt.livre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {emprunt.auteur}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(emprunt.dateEmprunt)}</TableCell>
                      <TableCell>{formatDate(emprunt.dateRetourPrevu)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error" fontWeight="600">
                          {emprunt.joursRetard} jours
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error" fontWeight="600">
                          {emprunt.amende}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(emprunt.statut, emprunt.retard)}
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
                  ))}
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
                  {historiqueEmprunts.map((emprunt) => (
                    <TableRow key={emprunt.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <img 
                            src={emprunt.couverture} 
                            alt={emprunt.livre}
                            style={{ 
                              width: 40, 
                              height: 60, 
                              objectFit: 'cover',
                              borderRadius: 4
                            }}
                          />
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {emprunt.livre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {emprunt.auteur}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(emprunt.dateEmprunt)}</TableCell>
                      <TableCell>{formatDate(emprunt.dateRetourPrevu)}</TableCell>
                      <TableCell>{formatDate(emprunt.dateRetour)}</TableCell>
                      <TableCell>
                        {getStatusChip(emprunt.statut, emprunt.retard)}
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
                  ))}
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
              {empruntsEnCours.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Emprunts en cours
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h4" color="error" fontWeight="bold">
              {empruntsEnRetard.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              En retard
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {historiqueEmprunts.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Historique
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              0.50€
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
        onClose={() => setOpenReturnDialog(false)}
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
                Confirmez-vous le retour de <strong>"{selectedEmprunt.livre}"</strong> ?
              </Typography>
              {selectedEmprunt.retard && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Ce livre est en retard de {selectedEmprunt.joursRetard} jours. 
                  Une amende de {selectedEmprunt.amende} sera appliquée.
                </Alert>
              )}
              <TextField
                fullWidth
                label="Commentaire (optionnel)"
                multiline
                rows={3}
                placeholder="État du livre, remarques..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReturnDialog(false)}>
            Annuler
          </Button>
          <Button variant="contained" onClick={confirmReturn}>
            Confirmer le retour
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MesEmprunts;