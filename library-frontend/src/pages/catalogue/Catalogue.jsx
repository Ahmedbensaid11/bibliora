import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Pagination,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search,
  Close
} from '@mui/icons-material';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

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
  (error) => {
    return Promise.reject(error);
  }
);

const Catalogue = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const itemsPerPage = 8;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books');
      
      if (response.data.success) {
        setBooks(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      console.error('Error response:', err.response);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des livres',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Vous devez être connecté pour emprunter un livre',
        severity: 'warning'
      });
      return;
    }

    setBorrowing(true);
    try {
      const response = await api.post(`/loans/borrow/${bookId}`);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message || 'Livre emprunté avec succès!',
          severity: 'success'
        });
        
        // Refresh books to update available copies
        await fetchBooks();
        setSelectedBook(null);
      }
    } catch (err) {
      console.error('Error borrowing book:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'emprunt du livre';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setBorrowing(false);
    }
  };

  const genres = [...new Set(books.map(book => book.genre).filter(Boolean))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.isbn && book.isbn.includes(searchTerm));
    
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    const matchesStatus = !selectedStatus || book.status === selectedStatus;
    
    return matchesSearch && matchesGenre && matchesStatus;
  });

  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusText = (status, availableCopies) => {
    if (status === 'AVAILABLE') {
      return availableCopies > 0 ? 'Disponible' : 'Emprunté';
    }
    switch(status) {
      case 'OUT_OF_STOCK':
        return 'Épuisé';
      case 'MAINTENANCE':
        return 'En maintenance';
      case 'DISCONTINUED':
        return 'Arrêté';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = (status, availableCopies) => {
    if (status === 'AVAILABLE' && availableCopies > 0) {
      return {
        bgcolor: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0'
      };
    }
    return {
      bgcolor: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    };
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#78350f' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid #e7e5e4' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ 
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
              color: '#451a03',
              mb: 1
            }}>
              Le Catalogue
            </Typography>
            <Typography variant="h6" sx={{
              color: '#78716c',
              fontStyle: 'italic',
              fontWeight: 300,
              fontFamily: 'Georgia, serif'
            }}>
              Découvrez notre collection complète de livres
            </Typography>
          </Box>
          <Typography variant="body2" sx={{
            color: '#78716c',
            fontFamily: 'monospace'
          }}>
            Affichage {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredBooks.length)} sur {filteredBooks.length} résultats
          </Typography>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ 
        mb: 4, 
        p: 3,
        bgcolor: '#ffffff',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        border: '1px solid #e7e5e4',
        borderRadius: '2px'
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher par titre, auteur ou ISBN..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#a8a29e' }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: '#fdfbf7',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d6d3d1',
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                value={selectedGenre}
                label="Genre"
                onChange={(e) => {
                  setSelectedGenre(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ bgcolor: '#fdfbf7' }}
              >
                <MenuItem value="">Tous les genres</MenuItem>
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={selectedStatus}
                label="Statut"
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ bgcolor: '#fdfbf7' }}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="AVAILABLE">Disponible</MenuItem>
                <MenuItem value="OUT_OF_STOCK">Épuisé</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Books Grid */}
      {paginatedBooks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#78716c', fontFamily: 'Georgia, serif' }}>
            Aucun livre trouvé
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {paginatedBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#ffffff',
                  borderRadius: '2px',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                  border: '1px solid #e7e5e4',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    borderColor: '#fde68a'
                  }
                }}
              >
                <Box sx={{ position: 'relative', paddingTop: '150%', bgcolor: '#e7e5e4' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#d6d3d1',
                      color: '#78716c',
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.875rem'
                    }}
                  >
                    Pas d'image
                  </Box>
                  
                  <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                    <Chip
                      label={getStatusText(book.status, book.availableCopies)}
                      size="small"
                      sx={{
                        ...getStatusColor(book.status, book.availableCopies),
                        fontWeight: 700,
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                </Box>
                
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  bgcolor: '#fffcf5',
                  p: 2.5
                }}>
                  {book.genre && (
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#b45309',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          fontSize: '0.65rem'
                        }}
                      >
                        {book.genre}
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontFamily: 'Georgia, serif',
                      fontWeight: 700,
                      color: '#1c1917',
                      mb: 0.5,
                      lineHeight: 1.3,
                      fontSize: '1.15rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.6rem'
                    }}
                  >
                    {book.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#78716c',
                      mb: 2,
                      fontStyle: 'italic',
                      fontWeight: 500
                    }}
                  >
                    {book.author}
                  </Typography>
                  
                  <Box sx={{ 
                    mt: 'auto', 
                    pt: 2, 
                    borderTop: '1px solid #e7e5e4',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#a8a29e',
                        fontFamily: 'monospace'
                      }}
                    >
                      {book.availableCopies}/{book.totalCopies} exemplaires
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setSelectedBook(book)}
                      sx={{
                        color: '#92400e',
                        fontWeight: 700,
                        fontFamily: 'Georgia, serif',
                        textTransform: 'none'
                      }}
                    >
                      Voir Détails
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {filteredBooks.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination
            count={Math.ceil(filteredBooks.length / itemsPerPage)}
            page={currentPage}
            onChange={(e, value) => setCurrentPage(value)}
          />
        </Box>
      )}

      {/* Book Detail Dialog */}
      <Dialog 
        open={!!selectedBook} 
        onClose={() => setSelectedBook(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedBook && (
          <>
            <DialogTitle sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e7e5e4' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Georgia, serif',
                  fontWeight: 700,
                  color: '#451a03'
                }}>
                  {selectedBook.title}
                </Typography>
                <IconButton onClick={() => setSelectedBook(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '2/3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#d6d3d1',
                      color: '#78716c',
                      fontFamily: 'Georgia, serif',
                      borderRadius: '2px'
                    }}
                  >
                    Pas d'image
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={getStatusText(selectedBook.status, selectedBook.availableCopies)}
                      sx={{
                        ...getStatusColor(selectedBook.status, selectedBook.availableCopies),
                        fontWeight: 700,
                        fontFamily: 'Georgia, serif'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h6" sx={{ 
                    color: '#78716c',
                    fontStyle: 'italic',
                    fontFamily: 'Georgia, serif',
                    mb: 2
                  }}>
                    par {selectedBook.author}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600">ISBN:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{selectedBook.isbn}</Typography>
                    </Grid>
                    {selectedBook.genre && (
                      <Grid item xs={6}>
                        <Typography variant="body2" fontWeight="600">Genre:</Typography>
                        <Typography variant="body2">{selectedBook.genre}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600">Exemplaires:</Typography>
                      <Typography variant="body2">
                        {selectedBook.availableCopies}/{selectedBook.totalCopies} disponibles
                      </Typography>
                    </Grid>
                  </Grid>

                  {selectedBook.summary && (
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.6,
                      color: '#57534e',
                      fontFamily: 'Georgia, serif'
                    }}>
                      {selectedBook.summary}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ bgcolor: '#ffffff', borderTop: '1px solid #e7e5e4', p: 2 }}>
              <Button 
                onClick={() => setSelectedBook(null)}
                sx={{ color: '#78716c', fontFamily: 'Georgia, serif', textTransform: 'none' }}
              >
                Fermer
              </Button>
              {selectedBook.status === 'AVAILABLE' && selectedBook.availableCopies > 0 && (
                <Button 
                  variant="contained" 
                  onClick={() => handleBorrow(selectedBook.id)}
                  disabled={borrowing}
                  sx={{
                    bgcolor: '#78350f',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#92400e' }
                  }}
                >
                  {borrowing ? <CircularProgress size={24} /> : 'Emprunter ce livre'}
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
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Catalogue;