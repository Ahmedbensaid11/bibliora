import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { LibraryBooks, ArrowForward, AutoStories, MenuBook, Close } from '@mui/icons-material';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import loanService from '../../api/loanService';

const API_URL = 'http://localhost:8080/api';

interface Book {
  id: number;
  title: string;
  author: string;
  coverUrl?: string;
  availableCopies: number;
  totalCopies: number;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  genre?: string;
  language?: string;
  numberOfPages?: number;
  summary?: string;
  categories?: { id: number; name: string }[];
}

const Home = () => {
  const { token } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowingBookId, setBorrowingBookId] = useState<number | null>(null);

  // Fetch featured books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`${API_URL}/books`, { headers });
        const data = await response.json();

        if (data.success) {
          // Get first 8 books as featured
          setBooks((data.data || []).slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [token]);

  const handleBorrow = async (bookId: number) => {
    if (!token) {
      toast.warning('Veuillez vous connecter pour emprunter un livre');
      return;
    }

    setBorrowingBookId(bookId);
    try {
      await loanService.borrowBook(bookId);
      toast.success('Livre emprunté avec succès !');

      // Update book's available copies locally
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.id === bookId
            ? { ...book, availableCopies: book.availableCopies - 1 }
            : book
        )
      );

      // Update selected book if open
      if (selectedBook?.id === bookId) {
        setSelectedBook(prev => prev ? { ...prev, availableCopies: prev.availableCopies - 1 } : null);
      }
    } catch (error: any) {
      console.error('Error borrowing book:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'emprunt du livre';
      toast.error(errorMessage);
    } finally {
      setBorrowingBookId(null);
    }
  };

  const handleReserve = (bookId: number) => {
    toast.info('La fonctionnalité de réservation sera bientôt disponible');
  };

  const getBookCover = (book: Book): string => {
    if (book.coverUrl && book.coverUrl.startsWith('http')) {
      return book.coverUrl;
    }
    return `https://via.placeholder.com/200x300/78350f/fffbeb?text=${encodeURIComponent(book.title?.substring(0, 10) || 'Book')}`;
  };

  const getStatusColor = (availableCopies: number): string => {
    if (availableCopies === 0) return '#dc2626';
    if (availableCopies <= 2) return '#d97706';
    return '#047857';
  };

  const getStatusText = (availableCopies: number): string => {
    if (availableCopies === 0) return "Indisponible";
    return "Disponible";
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#78350f',
          borderRadius: 3,
          p: { xs: 4, md: 8 },
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(120, 53, 15, 0.3)',
        }}
      >
        {/* Decorative element */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(251, 191, 36, 0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: '50%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            bgcolor: 'rgba(251, 191, 36, 0.05)',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AutoStories sx={{ color: '#fcd34d', fontSize: 20 }} />
            <Typography
              variant="overline"
              sx={{
                color: '#fcd34d',
                letterSpacing: 3,
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              Bibliothèque Numérique
            </Typography>
          </Box>

          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mt: 2,
              mb: 2,
              color: '#fffbeb',
              fontFamily: 'Georgia, serif',
              lineHeight: 1.2
            }}
          >
            La connaissance est <em style={{ color: '#fcd34d' }}>lumière</em>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#fef3c7',
              opacity: 0.9,
              mb: 4,
              maxWidth: 600,
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            Explorez notre collection d'ouvrages. Une bibliothèque complète à portée de main.
          </Typography>

          <Button
            component={Link}
            to="/catalogue"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#fffbeb',
              color: '#78350f',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#fef3c7',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              },
              transition: 'all 0.2s ease'
            }}
            startIcon={<LibraryBooks />}
          >
            Parcourir le catalogue
          </Button>
        </Box>
      </Box>

      {/* Featured Books Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MenuBook sx={{ color: '#78350f', fontSize: 28 }} />
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                fontFamily: 'Georgia, serif',
                color: '#292524'
              }}
            >
              Livres à découvrir
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/catalogue"
            endIcon={<ArrowForward />}
            sx={{
              color: '#78350f',
              fontWeight: 600,
              '&:hover': { bgcolor: '#fef3c7' }
            }}
          >
            Voir tout
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#78350f' }} />
          </Box>
        ) : books.length > 0 ? (
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <Card
                  onClick={() => setSelectedBook(book)}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid #e7e5e4',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(120, 53, 15, 0.15)',
                      borderColor: '#78350f'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={getBookCover(book)}
                    alt={book.title}
                    sx={{ objectFit: 'cover' }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = `https://via.placeholder.com/200x300/78350f/fffbeb?text=Book`;
                    }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip
                        label={getStatusText(book.availableCopies)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(book.availableCopies),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>

                    <Typography
                      variant="subtitle1"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        height: '48px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        color: '#292524',
                        fontFamily: 'Georgia, serif'
                      }}
                    >
                      {book.title}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#57534e' }} noWrap>
                      {book.author}
                    </Typography>

                    <Typography variant="caption" sx={{ color: '#78716c', mt: 1 }} display="block">
                      {book.availableCopies}/{book.totalCopies} exemplaires
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              bgcolor: '#fef3c7',
              borderRadius: 2,
              border: '1px dashed #b45309'
            }}
          >
            <AutoStories sx={{ fontSize: 48, color: '#b45309', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#78350f', mb: 1 }}>
              Aucun livre disponible
            </Typography>
            <Typography variant="body2" sx={{ color: '#92400e' }}>
              Revenez bientôt pour découvrir notre collection
            </Typography>
          </Box>
        )}
      </Box>

      {/* Categories Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            mb: 3,
            fontFamily: 'Georgia, serif',
            color: '#292524'
          }}
        >
          Découvrir par catégorie
        </Typography>

        <Grid container spacing={3}>
          {['Roman', 'Science-Fiction', 'Histoire', 'Philosophie'].map((genre) => (
            <Grid item xs={12} sm={6} md={3} key={genre}>
              <Card
                component={Link}
                to={`/catalogue?genre=${encodeURIComponent(genre)}`}
                sx={{
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  border: '1px solid #e7e5e4',
                  bgcolor: '#fffcf5',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(120, 53, 15, 0.1)',
                    borderColor: '#78350f',
                    bgcolor: '#fef3c7'
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      color: '#78350f',
                      fontFamily: 'Georgia, serif'
                    }}
                  >
                    {genre}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, color: '#b45309' }}>
                    <Typography variant="body2" fontWeight={500}>Explorer</Typography>
                    <ArrowForward fontSize="small" sx={{ ml: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Book Detail Dialog */}
      <Dialog
        open={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid #e7e5e4'
          }
        }}
      >
        {selectedBook && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid #e7e5e4', pb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="600" sx={{ fontFamily: 'Georgia, serif', color: '#292524' }}>
                  {selectedBook.title}
                </Typography>
                <IconButton onClick={() => setSelectedBook(null)} sx={{ color: '#78716c' }}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <CardMedia
                    component="img"
                    image={getBookCover(selectedBook)}
                    alt={selectedBook.title}
                    sx={{
                      borderRadius: 2,
                      maxHeight: 400,
                      objectFit: 'contain',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = `https://via.placeholder.com/200x300/78350f/fffbeb?text=Book`;
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={getStatusText(selectedBook.availableCopies)}
                      sx={{
                        bgcolor: getStatusColor(selectedBook.availableCopies),
                        color: 'white',
                        fontWeight: 600,
                        mr: 1
                      }}
                    />
                    {selectedBook.categories?.map(cat => (
                      <Chip
                        key={cat.id}
                        label={cat.name}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 0.5, borderColor: '#78350f', color: '#78350f' }}
                      />
                    ))}
                  </Box>

                  <Typography variant="h6" sx={{ color: '#57534e', mb: 2 }}>
                    par {selectedBook.author}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#78350f' }}>ISBN:</Typography>
                      <Typography variant="body2" sx={{ color: '#57534e' }}>{selectedBook.isbn || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#78350f' }}>Éditeur:</Typography>
                      <Typography variant="body2" sx={{ color: '#57534e' }}>{selectedBook.publisher || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#78350f' }}>Année:</Typography>
                      <Typography variant="body2" sx={{ color: '#57534e' }}>{selectedBook.publicationYear || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#78350f' }}>Genre:</Typography>
                      <Typography variant="body2" sx={{ color: '#57534e' }}>{selectedBook.genre || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#78350f' }}>Langue:</Typography>
                      <Typography variant="body2" sx={{ color: '#57534e' }}>{selectedBook.language || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#78350f' }}>Pages:</Typography>
                      <Typography variant="body2" sx={{ color: '#57534e' }}>{selectedBook.numberOfPages || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#78350f' }}>Exemplaires:</Typography>
                      <Typography variant="body2" sx={{ color: '#57534e' }}>
                        {selectedBook.availableCopies}/{selectedBook.totalCopies} disponibles
                      </Typography>
                    </Grid>
                  </Grid>

                  {selectedBook.summary && (
                    <>
                      <Typography variant="body2" fontWeight="600" gutterBottom sx={{ color: '#78350f' }}>
                        Résumé:
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#57534e' }}>
                        {selectedBook.summary}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid #e7e5e4', p: 2 }}>
              <Button
                onClick={() => setSelectedBook(null)}
                sx={{
                  color: '#57534e',
                  '&:hover': { bgcolor: '#f5f5f4' }
                }}
              >
                Fermer
              </Button>
              {selectedBook.availableCopies > 0 ? (
                <Button
                  variant="contained"
                  disabled={borrowingBookId === selectedBook.id}
                  onClick={() => handleBorrow(selectedBook.id)}
                  startIcon={borrowingBookId === selectedBook.id && <CircularProgress size={16} sx={{ color: 'white' }} />}
                  sx={{
                    bgcolor: '#78350f',
                    '&:hover': { bgcolor: '#92400e' },
                    '&:disabled': { bgcolor: '#d6d3d1' }
                  }}
                >
                  {borrowingBookId === selectedBook.id ? 'Emprunt en cours...' : 'Emprunter ce livre'}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => handleReserve(selectedBook.id)}
                  sx={{
                    borderColor: '#78350f',
                    color: '#78350f',
                    '&:hover': {
                      borderColor: '#92400e',
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

export default Home;
