import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
  Rating,
  Badge
} from '@mui/material';
import {
  Search,
  FilterList,
  ViewModule,
  ViewList,
  Bookmark,
  BookmarkBorder,
  Visibility,
  Close
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../../store/authStore';

const Catalogue = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);

  // Données simulées pour les livres
  const sampleBooks = [
    {
      id: 1,
      title: "L'Étranger",
      author: "Albert Camus",
      isbn: "9782070360021",
      publisher: "Gallimard",
      year: 1942,
      genre: "Roman Philosophique",
      summary: "Un classique de la littérature française qui explore l'absurdité de la condition humaine.",
      cover: "/api/placeholder/200/300",
      available: true,
      totalCopies: 5,
      availableCopies: 3,
      rating: 4.5
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      isbn: "9782070368225",
      publisher: "Gallimard",
      year: 1949,
      genre: "Science-Fiction",
      summary: "Une dystopie visionnaire sur les dangers du totalitarisme.",
      cover: "/api/placeholder/200/300",
      available: false,
      totalCopies: 3,
      availableCopies: 0,
      rating: 4.8
    },
    {
      id: 3,
      title: "Le Petit Prince",
      author: "Antoine de Saint-Exupéry",
      isbn: "9782070612758",
      publisher: "Gallimard",
      year: 1943,
      genre: "Conte Philosophique",
      summary: "Un conte poétique et philosophique sous l'apparence d'un livre pour enfants.",
      cover: "/api/placeholder/200/300",
      available: true,
      totalCopies: 8,
      availableCopies: 5,
      rating: 4.7
    },
    {
      id: 4,
      title: "Les Misérables",
      author: "Victor Hugo",
      isbn: "9782253009265",
      publisher: "Le Livre de Poche",
      year: 1862,
      genre: "Roman Historique",
      summary: "Une fresque sociale et historique de la France du XIXe siècle.",
      cover: "/api/placeholder/200/300",
      available: true,
      totalCopies: 4,
      availableCopies: 2,
      rating: 4.6
    },
    {
      id: 5,
      title: "Bel-Ami",
      author: "Guy de Maupassant",
      isbn: "9782253009266",
      publisher: "Le Livre de Poche",
      year: 1885,
      genre: "Roman",
      summary: "L'ascension sociale d'un jeune homme ambitieux dans le Paris du XIXe siècle.",
      cover: "/api/placeholder/200/300",
      available: true,
      totalCopies: 6,
      availableCopies: 4,
      rating: 4.3
    }
  ];

  const genres = ["Roman", "Science-Fiction", "Fantasy", "Policier", "Historique", "Biographie", "Philosophique", "Conte"];
  const itemsPerPage = 8;

  useEffect(() => {
    // Simuler un appel API
    setBooks(sampleBooks);
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    const matchesStatus = !selectedStatus || 
                         (selectedStatus === 'available' && book.available) ||
                         (selectedStatus === 'unavailable' && !book.available);
    
    return matchesSearch && matchesGenre && matchesStatus;
  });

  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBorrow = (bookId) => {
    // Logique d'emprunt
    console.log('Emprunter le livre:', bookId);
  };

  const handleReserve = (bookId) => {
    // Logique de réservation
    console.log('Réserver le livre:', bookId);
  };

  const getStatusColor = (available, availableCopies) => {
    if (!available) return theme.palette.error.main;
    if (availableCopies === 0) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getStatusText = (available, availableCopies) => {
    if (!available) return "Indisponible";
    if (availableCopies === 0) return "Réservé";
    return "Disponible";
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
          Catalogue des Livres
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Découvrez notre collection complète de livres
        </Typography>
      </Box>

      {/* Barre de recherche et filtres */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher par titre, auteur ou ISBN..."
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
              <InputLabel>Genre</InputLabel>
              <Select
                value={selectedGenre}
                label="Genre"
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <MenuItem value="">Tous les genres</MenuItem>
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>{genre}</MenuItem>
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
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="available">Disponible</MenuItem>
                <MenuItem value="unavailable">Indisponible</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <IconButton 
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
              <IconButton 
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Résultats */}
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        {filteredBooks.length} livre(s) trouvé(s)
      </Typography>

      {/* Grille des livres */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {paginatedBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => setSelectedBook(book)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={book.cover}
                  alt={book.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip 
                      label={getStatusText(book.available, book.availableCopies)}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(book.available, book.availableCopies),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Rating value={book.rating} readOnly size="small" />
                  </Box>
                  
                  <Typography variant="h6" component="h3" sx={{ 
                    fontWeight: 600,
                    mb: 1,
                    height: '48px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {book.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {book.author}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    {book.year} • {book.genre}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {book.availableCopies}/{book.totalCopies} exemplaires
                    </Typography>
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* Vue liste */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {paginatedBooks.map((book) => (
            <Card 
              key={book.id}
              sx={{ 
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateX(4px)'
                }
              }}
              onClick={() => setSelectedBook(book)}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={2} md={1}>
                  <CardMedia
                    component="img"
                    height="80"
                    image={book.cover}
                    alt={book.title}
                    sx={{ objectFit: 'cover', borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h6" fontWeight="600">
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {book.author}
                  </Typography>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Chip 
                    label={book.genre}
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={4} md={2}>
                  <Typography variant="body2">
                    ISBN: {book.isbn}
                  </Typography>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(book.available, book.availableCopies)
                      }}
                    />
                    <Typography variant="body2">
                      {getStatusText(book.available, book.availableCopies)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {book.available && book.availableCopies > 0 ? (
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBorrow(book.id);
                        }}
                      >
                        Emprunter
                      </Button>
                    ) : (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReserve(book.id);
                        }}
                      >
                        Réserver
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Card>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {filteredBooks.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredBooks.length / itemsPerPage)}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Dialog détail du livre */}
      <Dialog 
        open={!!selectedBook} 
        onClose={() => setSelectedBook(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedBook && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="600">
                  {selectedBook.title}
                </Typography>
                <IconButton onClick={() => setSelectedBook(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <CardMedia
                    component="img"
                    image={selectedBook.cover}
                    alt={selectedBook.title}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={getStatusText(selectedBook.available, selectedBook.availableCopies)}
                      sx={{
                        bgcolor: getStatusColor(selectedBook.available, selectedBook.availableCopies),
                        color: 'white',
                        fontWeight: 600,
                        mb: 2
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    par {selectedBook.author}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Rating value={selectedBook.rating} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      ({selectedBook.rating}/5)
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600">ISBN:</Typography>
                      <Typography variant="body2">{selectedBook.isbn}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600">Éditeur:</Typography>
                      <Typography variant="body2">{selectedBook.publisher}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600">Année:</Typography>
                      <Typography variant="body2">{selectedBook.year}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600">Genre:</Typography>
                      <Typography variant="body2">{selectedBook.genre}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600">Exemplaires:</Typography>
                      <Typography variant="body2">
                        {selectedBook.availableCopies}/{selectedBook.totalCopies} disponibles
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {selectedBook.summary}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedBook(null)}>
                Fermer
              </Button>
              {selectedBook.available && selectedBook.availableCopies > 0 ? (
                <Button variant="contained" onClick={() => handleBorrow(selectedBook.id)}>
                  Emprunter ce livre
                </Button>
              ) : (
                <Button variant="outlined" onClick={() => handleReserve(selectedBook.id)}>
                  Réserver ce livre
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Catalogue;