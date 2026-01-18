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
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search,
  ViewModule,
  ViewList,
  Visibility,
  Close,
  MenuBook
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useAuthStore from '../../store/authStore';

const API_URL = 'http://localhost:8080/api';

const Catalogue = () => {
  const theme = useTheme();
  const { token } = useAuthStore();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 12;

  // Fetch books and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        // Fetch books
        const booksResponse = await fetch(`${API_URL}/books`, { headers });
        const booksData = await booksResponse.json();

        if (booksData.success) {
          setBooks(booksData.data || []);
        }

        // Fetch categories
        const categoriesResponse = await fetch(`${API_URL}/categories`, { headers });
        const categoriesData = await categoriesResponse.json();

        if (categoriesData.success) {
          setCategories(categoriesData.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesSearch = !searchTerm ||
        book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn?.includes(searchTerm);

    const matchesCategory = !selectedCategory ||
        book.categories?.some(cat => cat.id === parseInt(selectedCategory));

    const matchesStatus = !selectedStatus ||
        (selectedStatus === 'available' && book.availableCopies > 0) ||
        (selectedStatus === 'unavailable' && book.availableCopies === 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Group books by category for display
  const booksByCategory = categories.reduce((acc, category) => {
    const categoryBooks = books.filter(book =>
        book.categories?.some(cat => cat.id === category.id)
    );
    if (categoryBooks.length > 0) {
      acc[category.name] = categoryBooks;
    }
    return acc;
  }, {});

  // Paginate filtered books
  const paginatedBooks = filteredBooks.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handleBorrow = (bookId) => {
    console.log('Emprunter le livre:', bookId);
    // TODO: Implement borrow logic
  };

  const handleReserve = (bookId) => {
    console.log('Réserver le livre:', bookId);
    // TODO: Implement reserve logic
  };

  const getStatusColor = (availableCopies) => {
    if (availableCopies === 0) return theme.palette.error.main;
    if (availableCopies <= 2) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getStatusText = (availableCopies) => {
    if (availableCopies === 0) return "Indisponible";
    return "Disponible";
  };

  const getBookCover = (book) => {
    if (book.coverUrl && book.coverUrl.startsWith('http')) {
      return book.coverUrl;
    }
    // Default placeholder
    return `https://via.placeholder.com/200x300/1976d2/ffffff?text=${encodeURIComponent(book.title?.substring(0, 10) || 'Book')}`;
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  if (loading) {
    return (
        <Container maxWidth="xl" sx={{ py: 4, mt: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Chargement du catalogue...</Typography>
        </Container>
    );
  }

  if (error) {
    return (
        <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
    );
  }

  // Determine view: grouped by category or filtered list
  const showGroupedView = !searchTerm && !selectedCategory && !selectedStatus;

  return (
      <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
        {/* Header */}
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
            {books.length} livres disponibles dans notre collection
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                    value={selectedCategory}
                    label="Catégorie"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">Toutes les catégories</MenuItem>
                  {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
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

        {/* Results count */}
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {filteredBooks.length} livre(s) trouvé(s)
        </Typography>

        {/* Grouped by Category View */}
        {showGroupedView ? (
            <Box>
              {Object.entries(booksByCategory).map(([categoryName, categoryBooks]) => (
                  <Box key={categoryName} sx={{ mb: 5 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 3,
                      pb: 1,
                      borderBottom: `2px solid ${theme.palette.primary.main}`
                    }}>
                      <MenuBook color="primary" />
                      <Typography variant="h5" fontWeight="600">
                        {categoryName}
                      </Typography>
                      <Chip
                          label={`${categoryBooks.length} livre(s)`}
                          size="small"
                          color="primary"
                          variant="outlined"
                      />
                    </Box>

                    <Grid container spacing={3}>
                      {categoryBooks.slice(0, 6).map((book) => (
                          <Grid item xs={12} sm={6} md={4} lg={2} key={book.id}>
                            <BookCard
                                book={book}
                                theme={theme}
                                getBookCover={getBookCover}
                                getStatusColor={getStatusColor}
                                getStatusText={getStatusText}
                                onClick={() => setSelectedBook(book)}
                            />
                          </Grid>
                      ))}
                    </Grid>

                    {categoryBooks.length > 6 && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Button
                              variant="outlined"
                              onClick={() => setSelectedCategory(categories.find(c => c.name === categoryName)?.id.toString() || '')}
                          >
                            Voir tous les {categoryBooks.length} livres de cette catégorie
                          </Button>
                        </Box>
                    )}
                  </Box>
              ))}
            </Box>
        ) : (
            /* Filtered View */
            <>
              {viewMode === 'grid' ? (
                  <Grid container spacing={3}>
                    {paginatedBooks.map((book) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                          <BookCard
                              book={book}
                              theme={theme}
                              getBookCover={getBookCover}
                              getStatusColor={getStatusColor}
                              getStatusText={getStatusText}
                              onClick={() => setSelectedBook(book)}
                          />
                        </Grid>
                    ))}
                  </Grid>
              ) : (
                  /* List View */
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
                                  image={getBookCover(book)}
                                  alt={book.title}
                                  sx={{ objectFit: 'cover', borderRadius: 1 }}
                                  onError={(e) => {
                                    e.target.src = `https://via.placeholder.com/200x300/1976d2/ffffff?text=Book`;
                                  }}
                              />
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="h6" fontWeight="600" noWrap>
                                {book.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {book.author}
                              </Typography>
                            </Grid>
                            <Grid item xs={4} md={2}>
                              {book.categories?.slice(0, 2).map(cat => (
                                  <Chip
                                      key={cat.id}
                                      label={cat.name}
                                      size="small"
                                      variant="outlined"
                                      sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                              ))}
                            </Grid>
                            <Grid item xs={4} md={2}>
                              <Typography variant="body2" color="text.secondary">
                                {book.publisher}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {book.publicationYear}
                              </Typography>
                            </Grid>
                            <Grid item xs={4} md={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: getStatusColor(book.availableCopies)
                                    }}
                                />
                                <Typography variant="body2">
                                  {book.availableCopies}/{book.totalCopies} dispo
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4} md={2}>
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                {book.availableCopies > 0 ? (
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
            </>
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
                          image={getBookCover(selectedBook)}
                          alt={selectedBook.title}
                          sx={{ borderRadius: 2, maxHeight: 400, objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/200x300/1976d2/ffffff?text=Book`;
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
                                sx={{ mr: 0.5 }}
                            />
                        ))}
                      </Box>

                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        par {selectedBook.author}
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight="600">ISBN:</Typography>
                          <Typography variant="body2">{selectedBook.isbn || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight="600">Éditeur:</Typography>
                          <Typography variant="body2">{selectedBook.publisher || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight="600">Année:</Typography>
                          <Typography variant="body2">{selectedBook.publicationYear || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight="600">Genre:</Typography>
                          <Typography variant="body2">{selectedBook.genre || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight="600">Langue:</Typography>
                          <Typography variant="body2">{selectedBook.language || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight="600">Pages:</Typography>
                          <Typography variant="body2">{selectedBook.numberOfPages || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight="600">Exemplaires:</Typography>
                          <Typography variant="body2">
                            {selectedBook.availableCopies}/{selectedBook.totalCopies} disponibles
                          </Typography>
                        </Grid>
                      </Grid>

                      {selectedBook.summary && (
                          <>
                            <Typography variant="body2" fontWeight="600" gutterBottom>
                              Résumé:
                            </Typography>
                            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                              {selectedBook.summary}
                            </Typography>
                          </>
                      )}
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setSelectedBook(null)}>
                    Fermer
                  </Button>
                  {selectedBook.availableCopies > 0 ? (
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

// BookCard Component
const BookCard = ({ book, theme, getBookCover, getStatusColor, getStatusText, onClick }) => (
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
        onClick={onClick}
    >
      <CardMedia
          component="img"
          height="180"
          image={getBookCover(book)}
          alt={book.title}
          sx={{ objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/200x300/1976d2/ffffff?text=Book`;
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

        <Typography variant="subtitle1" component="h3" sx={{
          fontWeight: 600,
          mb: 0.5,
          height: '48px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {book.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" noWrap>
          {book.author}
        </Typography>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {book.availableCopies}/{book.totalCopies} exemplaires
        </Typography>
      </CardContent>
    </Card>
);

export default Catalogue;