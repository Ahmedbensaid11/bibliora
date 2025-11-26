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

  const getStatusText = (available, availableCopies) => {
    if (!available) return "Épuisé";
    if (availableCopies === 0) return "Réservé";
    return "Disponible";
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
      {/* En-tête avec style vintage */}
      <Box sx={{ 
        mb: 4,
        pb: 3,
        borderBottom: '1px solid #e7e5e4'
      }}>
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

      {/* Barre de recherche et filtres */}
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
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d97706',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d97706',
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
                sx={{
                  bgcolor: '#fdfbf7',
                  fontFamily: 'Georgia, serif',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d6d3d1',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d97706',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d97706',
                  }
                }}
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
                sx={{
                  bgcolor: '#fdfbf7',
                  fontFamily: 'Georgia, serif',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d6d3d1',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d97706',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d97706',
                  }
                }}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="available">Disponible</MenuItem>
                <MenuItem value="unavailable">Indisponible</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Grille des livres avec style vintage */}
      {viewMode === 'grid' ? (
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
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    borderColor: '#fde68a'
                  }
                }}
              >
                {/* Image Container avec overlay */}
                <Box sx={{ position: 'relative', paddingTop: '150%', overflow: 'hidden', bgcolor: '#e7e5e4' }}>
                  <CardMedia
                    component="img"
                    image={book.cover}
                    alt={book.title}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'sepia(0.15)'
                    }}
                  />
                  {/* Hover Overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      '.MuiCard-root:hover &': {
                        opacity: 1
                      }
                    }}
                  />
                  {/* Status Badge */}
                  <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                    <Chip
                      label={getStatusText(book.available, book.availableCopies)}
                      size="small"
                      sx={{
                        bgcolor: book.availableCopies > 0 ? '#f0fdf4' : '#fef2f2',
                        color: book.availableCopies > 0 ? '#166534' : '#991b1b',
                        border: book.availableCopies > 0 ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        fontWeight: 700,
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.7rem',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                      }}
                    />
                  </Box>
                </Box>
                
                {/* Card Content */}
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  bgcolor: '#fffcf5',
                  p: 2.5
                }}>
                  {/* Genre Badge */}
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#b45309',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontSize: '0.65rem',
                        borderBottom: '1px solid #fde68a',
                        paddingBottom: '2px',
                        display: 'inline-block'
                      }}
                    >
                      {book.genre}
                    </Typography>
                  </Box>
                  
                  {/* Title */}
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
                    title={book.title}
                  >
                    {book.title}
                  </Typography>
                  
                  {/* Author */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#78716c',
                      mb: 2,
                      fontStyle: 'italic',
                      fontWeight: 500,
                      fontSize: '0.875rem'
                    }}
                  >
                    {book.author}
                  </Typography>
                  
                  {/* Footer */}
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
                        fontFamily: 'monospace',
                        fontSize: '0.7rem'
                      }}
                    >
                      {book.isbn}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setSelectedBook(book)}
                      sx={{
                        color: '#92400e',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        fontFamily: 'Georgia, serif',
                        textTransform: 'none',
                        borderBottom: '1px solid transparent',
                        borderRadius: 0,
                        padding: '2px 4px',
                        minWidth: 'auto',
                        '&:hover': {
                          bgcolor: 'transparent',
                          borderBottom: '1px solid #d97706',
                          color: '#d97706'
                        }
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
                bgcolor: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '2px',
                '&:hover': {
                  bgcolor: '#fdfbf7',
                  transform: 'translateX(4px)',
                  borderColor: '#fde68a'
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
                    sx={{ 
                      objectFit: 'cover', 
                      borderRadius: '2px',
                      filter: 'sepia(0.15)'
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    fontFamily: 'Georgia, serif',
                    color: '#1c1917'
                  }}>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#78716c',
                    fontStyle: 'italic'
                  }}>
                    {book.author}
                  </Typography>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Chip 
                    label={book.genre}
                    size="small"
                    sx={{
                      bgcolor: '#fffcf5',
                      border: '1px solid #e7e5e4',
                      fontFamily: 'Georgia, serif'
                    }}
                  />
                </Grid>
                <Grid item xs={4} md={2}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#78716c' }}>
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
                        bgcolor: book.availableCopies > 0 ? '#166534' : '#991b1b'
                      }}
                    />
                    <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
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
                        sx={{
                          bgcolor: '#78350f',
                          fontFamily: 'Georgia, serif',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: '#92400e'
                          }
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
                        sx={{
                          borderColor: '#d6d3d1',
                          color: '#78350f',
                          fontFamily: 'Georgia, serif',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#d97706',
                            bgcolor: '#fef3c7'
                          }
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 6,
          pt: 4,
          borderTop: '1px solid #e7e5e4'
        }}>
          <Pagination
            count={Math.ceil(filteredBooks.length / itemsPerPage)}
            page={currentPage}
            onChange={(event, value) => {
              setCurrentPage(value);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            sx={{
              '& .MuiPaginationItem-root': {
                fontFamily: 'Georgia, serif',
                fontWeight: 700,
                fontSize: '0.875rem',
                borderRadius: '2px',
                color: '#78716c',
                border: '1px solid #e7e5e4',
                '&:hover': {
                  bgcolor: '#fef3c7',
                  borderColor: '#fcd34d'
                },
                '&.Mui-selected': {
                  bgcolor: '#78350f',
                  color: '#fef3c7',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  '&:hover': {
                    bgcolor: '#92400e'
                  }
                }
              }
            }}
          />
        </Box>
      )}

      {/* Dialog détail du livre */}
      <Dialog 
        open={!!selectedBook} 
        onClose={() => setSelectedBook(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2px',
            bgcolor: '#fffcf5'
          }
        }}
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
                  <CardMedia
                    component="img"
                    image={selectedBook.cover}
                    alt={selectedBook.title}
                    sx={{ 
                      borderRadius: '2px',
                      filter: 'sepia(0.15)',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={getStatusText(selectedBook.available, selectedBook.availableCopies)}
                      sx={{
                        bgcolor: selectedBook.availableCopies > 0 ? '#f0fdf4' : '#fef2f2',
                        color: selectedBook.availableCopies > 0 ? '#166534' : '#991b1b',
                        border: selectedBook.availableCopies > 0 ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        fontWeight: 700,
                        fontFamily: 'Georgia, serif',
                        mb: 2
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
                  
                  <Box sx={{ mb: 2 }}>
                    <Rating value={selectedBook.rating} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      ({selectedBook.rating}/5)
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'Georgia, serif' }}>ISBN:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{selectedBook.isbn}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'Georgia, serif' }}>Éditeur:</Typography>
                      <Typography variant="body2">{selectedBook.publisher}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'Georgia, serif' }}>Année:</Typography>
                      <Typography variant="body2">{selectedBook.year}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'Georgia, serif' }}>Genre:</Typography>
                      <Typography variant="body2">{selectedBook.genre}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'Georgia, serif' }}>Exemplaires:</Typography>
                      <Typography variant="body2">
                        {selectedBook.availableCopies}/{selectedBook.totalCopies} disponibles
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="body1" sx={{ 
                    lineHeight: 1.6,
                    color: '#57534e',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {selectedBook.summary}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ bgcolor: '#ffffff', borderTop: '1px solid #e7e5e4', p: 2 }}>
              <Button 
                onClick={() => setSelectedBook(null)}
                sx={{
                  color: '#78716c',
                  fontFamily: 'Georgia, serif',
                  textTransform: 'none'
                }}
              >
                Fermer
              </Button>
              {selectedBook.available && selectedBook.availableCopies > 0 ? (
                <Button 
                  variant="contained" 
                  onClick={() => handleBorrow(selectedBook.id)}
                  sx={{
                    bgcolor: '#78350f',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '2px',
                    '&:hover': {
                      bgcolor: '#92400e'
                    }
                  }}
                >
                  Emprunter ce livre
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  onClick={() => handleReserve(selectedBook.id)}
                  sx={{
                    borderColor: '#d6d3d1',
                    color: '#78350f',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '2px',
                    '&:hover': {
                      borderColor: '#d97706',
                      bgcolor: '#fef3c7'
                    }
                  }}
                >
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