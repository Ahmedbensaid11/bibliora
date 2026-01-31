import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Grid,
  Divider,
  TablePagination,
  InputAdornment,
  Fab,
  Avatar,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  LinearProgress
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  Add,
  Refresh,
  Download,
  LibraryBooks,
  Category,
  Person,
  CalendarToday,
  Numbers,
  Visibility,
  VisibilityOff,
  Bookmark,
  TrendingUp,
  CloudUpload,
  SaveAlt,
  Info,
  Description,
  CorporateFare,
  Label,
  CheckCircle,
  Cancel,
  Update,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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

const AdminBooks = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    genre: '',
    totalCopies: 1,
    categoryId: ''
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parentId: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalBooks, setTotalBooks] = useState(0);
  
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDialogType, setCategoryDialogType] = useState('create');

  const [bookDetails, setBookDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadBooks = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: page,
        size: rowsPerPage,
        sortBy: sortBy,
        sortDir: sortDir
      };
      
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const booksResponse = await api.get('/admin/books', { params });
      if (booksResponse.data.success) {
        const booksData = booksResponse.data.items || booksResponse.data.data || [];
        setBooks(booksData);
        setTotalBooks(booksResponse.data.totalElements || booksData.length);
      }
      
      const statsResponse = await api.get('/admin/books/statistics');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
      await loadCategories();
      
    } catch (error) {
      console.error('Error loading books:', error);
      showSnackbar('Erreur lors du chargement des livres', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesResponse = await api.get('/admin/books/categories');
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.items || categoriesResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showSnackbar('Erreur lors du chargement des catégories', 'error');
    }
  };

  const loadBookDetails = async (bookId) => {
    try {
      setDetailsLoading(true);
      const response = await api.get(`/admin/books/${bookId}`);
      if (response.data.success) {
        setBookDetails(response.data.data);
        setDialogType('view');
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Error loading book details:', error);
      showSnackbar('Erreur lors du chargement des détails du livre', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [page, rowsPerPage, sortBy, sortDir, categoryFilter, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadBooks();
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const openDialog = (type, book = null) => {
    setSelectedBook(book);
    setDialogType(type);
    
    if (type === 'edit' && book) {
      setBookForm({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        description: book.description || '',
        publisher: book.publisher || '',
        publicationYear: book.publicationYear || new Date().getFullYear(),
        genre: book.genre || '',
        totalCopies: book.totalCopies || 1,
        categoryId: book.categoryIds && book.categoryIds.size > 0 ? Array.from(book.categoryIds)[0] : ''
      });
    } else if (type === 'edit' && !book) {
      setBookForm({
        title: '',
        author: '',
        isbn: '',
        description: '',
        publisher: '',
        publicationYear: new Date().getFullYear(),
        genre: '',
        totalCopies: 1,
        categoryId: ''
      });
    } else if (type === 'view' && book) {
      loadBookDetails(book.id);
      return;
    }
    
    setDialogOpen(true);
  };

  const openCategoryDialog = (type, category = null) => {
    setSelectedCategory(category);
    setCategoryDialogType(type);
    setDialogType('category');
    
    if (type === 'edit' && category) {
      setCategoryForm({
        name: category.name || '',
        description: category.description || '',
        parentId: category.parentId || ''
      });
    } else {
      setCategoryForm({
        name: '',
        description: '',
        parentId: ''
      });
    }
    
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedBook(null);
    setSelectedCategory(null);
    setBookDetails(null);
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      description: '',
      publisher: '',
      publicationYear: new Date().getFullYear(),
      genre: '',
      totalCopies: 1,
      categoryId: ''
    });
    setCategoryForm({
      name: '',
      description: '',
      parentId: ''
    });
  };

  const handleSaveBook = async () => {
    try {
      if (!bookForm.title || !bookForm.author || !bookForm.isbn) {
        showSnackbar('Le titre, l\'auteur et l\'ISBN sont obligatoires', 'warning');
        return;
      }
      if (!bookForm.totalCopies || bookForm.totalCopies < 1) {
        showSnackbar('Le nombre d\'exemplaires doit être supérieur à 0', 'warning');
        return;
      }

      const requestData = {
        ...bookForm,
        categoryId: bookForm.categoryId || null
      };

      if (selectedBook) {
        const response = await api.put(`/admin/books/${selectedBook.id}`, requestData);
        
        if (response.data.success) {
          showSnackbar('Livre modifié avec succès', 'success');
          loadBooks();
          closeDialog();
        }
      } else {
        const response = await api.post('/admin/books', requestData);
        
        if (response.data.success) {
          showSnackbar('Livre créé avec succès', 'success');
          loadBooks();
          closeDialog();
        }
      }
    } catch (error) {
      console.error('Error saving book:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleDeleteBook = async () => {
    try {
      const response = await api.delete(`/admin/books/${selectedBook.id}`);
      
      if (response.data.success) {
        showSnackbar('Livre supprimé avec succès', 'success');
        loadBooks();
        closeDialog();
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (!categoryForm.name) {
        showSnackbar('Le nom de la catégorie est obligatoire', 'warning');
        return;
      }

      if (selectedCategory) {
        const response = await api.put(`/admin/books/categories/${selectedCategory.id}`, categoryForm);
        
        if (response.data.success) {
          showSnackbar('Catégorie modifiée avec succès', 'success');
          loadCategories();
          setShowCategories(false);
          closeDialog();
        }
      } else {
        const response = await api.post('/admin/books/categories', categoryForm);
        
        if (response.data.success) {
          showSnackbar('Catégorie créée avec succès', 'success');
          loadCategories();
          setShowCategories(false);
          closeDialog();
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de la création', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const response = await api.delete(`/admin/books/categories/${selectedCategory.id}`);
      
      if (response.data.success) {
        showSnackbar('Catégorie supprimée avec succès', 'success');
        loadCategories();
        setShowCategories(false);
        closeDialog();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const handleExport = async (format = 'excel') => {
    try {
      const response = await api.get(`/admin/books/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'csv' ? 'csv' : 'xlsx';
      link.setAttribute('download', `books_export.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showSnackbar(`Export ${format.toUpperCase()} réussi`, 'success');
    } catch (error) {
      console.error('Error exporting books:', error);
      showSnackbar('Erreur lors de l\'export', 'error');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const format = file.name.endsWith('.csv') ? 'csv' : 'excel';
      formData.append('format', format);
      
      const response = await api.post('/admin/books/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        showSnackbar(response.data.message, 'success');
        loadBooks();
      }
    } catch (error) {
      console.error('Error importing books:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de l\'import', 'error');
    }
    
    event.target.value = '';
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getStatusColor = (availableCopies) => {
    return availableCopies > 0 ? 'success' : 'error';
  };

  const getStatusText = (availableCopies) => {
    return availableCopies > 0 ? 'Disponible' : 'Indisponible';
  };

  const getAvailabilityPercentage = (availableCopies, totalCopies) => {
    return totalCopies > 0 ? (availableCopies / totalCopies) * 100 : 0;
  };

  const getCategoriesForDisplay = (bookData) => {
    if (!bookData) return [];
    
    if (bookData.categoryName && bookData.categoryName !== 'Non catégorisé') {
      return bookData.categoryName.split(', ').map(cat => cat.trim()).filter(cat => cat);
    }
    
    if (bookData.categoryNames && bookData.categoryNames.size > 0) {
      return Array.from(bookData.categoryNames);
    }
    
    if (bookData.categories && Array.isArray(bookData.categories)) {
      return bookData.categories;
    }
    
    return [];
  };

  const StatCard = ({ title, value, subtitle, icon, color, onClick }) => (
    <Card 
      sx={{ 
        height: '100%', 
        ...designSystem.card,
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: designSystem.colors.background.card
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography 
              variant="overline" 
              sx={{ 
                ...designSystem.typography.caption,
                fontWeight: 600,
                color: designSystem.colors.text.muted,
                display: 'block',
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            <Typography variant="h4" sx={{ 
              ...designSystem.typography.h4,
              fontWeight: 700,
              color: color
            }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ 
                ...designSystem.typography.body,
                color: designSystem.colors.text.muted,
                mt: 0.5
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: `${color}20`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && !stats) {
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
              Gestion des Livres
            </Typography>
            <Typography variant="h6" sx={{
              ...designSystem.typography.subtitle,
              fontStyle: 'italic',
              fontWeight: 300
            }}>
              Gérer le catalogue de livres de la bibliothèque
            </Typography>
          </Box>
          <Typography variant="body2" sx={{
            ...designSystem.typography.caption
          }}>
            Page {page + 1} sur {Math.ceil(totalBooks / rowsPerPage)}
          </Typography>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="TOTAL LIVRES"
              value={stats.totalBooks || 0}
              subtitle={`${stats.categories ? Object.keys(stats.categories).length : 0} catégories`}
              icon={<LibraryBooks fontSize="large" />}
              color={designSystem.colors.primary.main}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="DISPONIBLES"
              value={stats.availableBooks || 0}
              subtitle={`${((stats.availableBooks / (stats.totalBooks || 1)) * 100).toFixed(0)}% du stock`}
              icon={<Bookmark fontSize="large" />}
              color={designSystem.colors.status.available.text}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="EMPRUNTÉS"
              value={stats.borrowedBooks || 0}
              subtitle={`${((stats.borrowedBooks / (stats.totalBooks || 1)) * 100).toFixed(0)}% taux d'emprunt`}
              icon={<TrendingUp fontSize="large" />}
              color={designSystem.colors.primary.light}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="INDISPONIBLES"
              value={stats.unavailableBooks || 0}
              subtitle="En réapprovisionnement"
              icon={<VisibilityOff fontSize="large" />}
              color={designSystem.colors.status.unavailable.text}
            />
          </Grid>
        </Grid>
      )}

      {/* Categories Stats */}
      {stats?.categories && (
        <Card sx={{ 
          mb: 3,
          ...designSystem.card,
          bgcolor: designSystem.colors.background.card
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ 
              ...designSystem.typography.h6,
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            }}>
              <Category /> Répartition par Catégories
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(stats.categories).map(([category, count]) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={category}>
                  <Paper sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    bgcolor: designSystem.colors.background.card,
                    border: `1px solid ${designSystem.colors.border.light}`,
                    borderRadius: designSystem.card.borderRadius
                  }}>
                    <Typography variant="body2" sx={{ 
                      ...designSystem.typography.body,
                      color: designSystem.colors.text.muted,
                      noWrap: true
                    }}>
                      {category}
                    </Typography>
                    <Typography variant="h5" sx={{ 
                      ...designSystem.typography.h5,
                      fontWeight: 700,
                      color: designSystem.colors.primary.main
                    }}>
                      {count}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      ...designSystem.typography.caption,
                      color: designSystem.colors.text.muted
                    }}>
                      {((count / (stats.totalBooks || 1)) * 100).toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(count / (stats.totalBooks || 1)) * 100} 
                      sx={{ 
                        mt: 1, 
                        height: 4, 
                        borderRadius: 2,
                        bgcolor: designSystem.colors.primary.light,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: designSystem.colors.primary.main
                        }
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Categories Management */}
      <Card sx={{ 
        mb: 3,
        ...designSystem.card,
        bgcolor: designSystem.colors.background.card
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ 
              ...designSystem.typography.h6,
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            }}>
              <Category /> Gestion des Catégories
            </Typography>
            <Button
              onClick={() => setShowCategories(!showCategories)}
              variant="outlined"
              sx={designSystem.button.primary}
            >
              {showCategories ? 'Masquer' : 'Afficher'} les catégories
            </Button>
          </Box>
          
          <Collapse in={showCategories}>
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {categories.map((category) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                    <Paper sx={{ 
                      p: 2, 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      bgcolor: designSystem.colors.background.card,
                      border: `1px solid ${designSystem.colors.border.light}`,
                      borderRadius: designSystem.card.borderRadius
                    }}>
                      <Box>
                        <Typography fontWeight="600" sx={designSystem.typography.body}>
                          {category.name}
                        </Typography>
                        {category.description && (
                          <Typography variant="caption" sx={{ 
                            ...designSystem.typography.caption,
                            color: designSystem.colors.text.muted
                          }}>
                            {category.description}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            sx={{ color: designSystem.colors.secondary.main }}
                            onClick={() => openCategoryDialog('edit', category)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            sx={{ color: designSystem.colors.status.unavailable.text }}
                            onClick={() => openCategoryDialog('delete', category)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Button
                startIcon={<Add />}
                variant="contained"
                onClick={() => openCategoryDialog('create')}
                sx={designSystem.button.contained}
              >
                Nouvelle Catégorie
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card sx={{ 
        mb: 3,
        ...designSystem.card,
        bgcolor: designSystem.colors.background.card
      }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher par titre, auteur, ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Catégorie"
                  sx={{ bgcolor: designSystem.colors.background.light }}
                >
                  <MenuItem value="all">Toutes catégories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Statut"
                  sx={{ bgcolor: designSystem.colors.background.light }}
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="available">Disponibles</MenuItem>
                  <MenuItem value="unavailable">Indisponibles</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Trier par</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Trier par"
                  sx={{ bgcolor: designSystem.colors.background.light }}
                >
                  <MenuItem value="title">Titre</MenuItem>
                  <MenuItem value="author">Auteur</MenuItem>
                  <MenuItem value="publicationYear">Année</MenuItem>
                  <MenuItem value="createdAt">Date d'ajout</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleSort(sortBy)}
                sx={designSystem.button.primary}
              >
                {sortDir === 'asc' ? 'Croissant' : 'Décroissant'}
              </Button>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  startIcon={<Refresh />}
                  onClick={loadBooks}
                  sx={designSystem.button.primary}
                >
                  Actualiser
                </Button>
                <Button
                  startIcon={<SaveAlt />}
                  onClick={() => handleExport('excel')}
                  sx={designSystem.button.primary}
                >
                  Exporter
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component="label"
                  startIcon={<CloudUpload />}
                  variant="contained"
                  sx={designSystem.button.contained}
                >
                  Importer des livres
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImport}
                  />
                </Button>
                <Typography variant="caption" sx={{ 
                  ...designSystem.typography.caption,
                  color: designSystem.colors.text.muted,
                  alignSelf: 'center' 
                }}>
                  Formats acceptés: Excel (.xlsx, .xls) ou CSV
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card sx={{
        ...designSystem.card,
        bgcolor: designSystem.colors.background.card
      }}>
        <CardContent sx={{ p: 0 }}>
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
                    Auteur
                  </TableCell>
                  <TableCell sx={{ 
                    ...designSystem.typography.body,
                    fontWeight: 700,
                    color: designSystem.colors.primary.dark
                  }}>
                    ISBN
                  </TableCell>
                  <TableCell sx={{ 
                    ...designSystem.typography.body,
                    fontWeight: 700,
                    color: designSystem.colors.primary.dark
                  }}>
                    Catégorie
                  </TableCell>
                  <TableCell sx={{ 
                    ...designSystem.typography.body,
                    fontWeight: 700,
                    color: designSystem.colors.primary.dark
                  }}>
                    Exemplaires
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
                    Ajouté le
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress sx={{ my: 4 }} />
                    </TableCell>
                  </TableRow>
                ) : books.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <LibraryBooks sx={{ 
                          fontSize: 60, 
                          color: designSystem.colors.text.muted, 
                          mb: 2, 
                          opacity: 0.3 
                        }} />
                        <Typography variant="h6" sx={{ 
                          ...designSystem.typography.h6,
                          color: designSystem.colors.text.muted
                        }}>
                          Aucun livre trouvé
                        </Typography>
                        {searchTerm && (
                          <Typography variant="body2" sx={{ 
                            ...designSystem.typography.body,
                            color: designSystem.colors.text.muted
                          }}>
                            Essayez de modifier vos critères de recherche
                          </Typography>
                        )}
                        <Button
                          variant="contained"
                          sx={{ 
                            mt: 2,
                            ...designSystem.button.contained
                          }}
                          onClick={() => openDialog('edit')}
                        >
                          <Add sx={{ mr: 1 }} />
                          Ajouter un livre
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  books.map((book) => (
                    <TableRow 
                      key={book.id}
                      hover
                      sx={{ 
                        transition: designSystem.card.transition,
                        '&:hover': { 
                          bgcolor: designSystem.colors.background.light 
                        } 
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            variant="rounded"
                            sx={{ 
                              bgcolor: designSystem.colors.primary.main,
                              width: 50, 
                              height: 50,
                              fontSize: '1.2rem',
                              color: 'white'
                            }}
                          >
                            {book.title?.[0] || 'L'}
                          </Avatar>
                          <Box>
                            <Typography sx={{ 
                              ...designSystem.typography.body,
                              fontWeight: 600,
                              noWrap: true,
                              maxWidth: 200
                            }}>
                              {book.title}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              ...designSystem.typography.caption,
                              color: designSystem.colors.text.muted
                            }}>
                              {book.publicationYear || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" sx={{ color: designSystem.colors.text.muted }} />
                          <Typography sx={designSystem.typography.body}>
                            {book.author}
                          </Typography>
                        </Box>
                        {book.publisher && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <CorporateFare fontSize="small" sx={{ color: designSystem.colors.text.muted }} />
                            <Typography variant="caption" sx={designSystem.typography.caption}>
                              {book.publisher}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Numbers fontSize="small" sx={{ color: designSystem.colors.text.muted }} />
                          <Typography variant="body2" sx={{ 
                            ...designSystem.typography.body,
                            fontFamily: 'monospace'
                          }}>
                            {book.isbn}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={book.categoryName || 'Non catégorisé'}
                          size="small"
                          sx={{
                            bgcolor: '#fef3c7',
                            color: designSystem.colors.primary.main,
                            border: `1px solid ${designSystem.colors.primary.main}`,
                            fontWeight: 700,
                            fontFamily: designSystem.typography.body.fontFamily
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={designSystem.typography.body}>
                            {book.availableCopies} / {book.totalCopies} disponibles
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={getAvailabilityPercentage(book.availableCopies, book.totalCopies)} 
                            sx={{ 
                              mt: 0.5, 
                              height: 4, 
                              borderRadius: 2,
                              bgcolor: designSystem.colors.primary.light,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: book.availableCopies > 0 ? designSystem.colors.status.available.text : designSystem.colors.status.unavailable.text
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={getStatusText(book.availableCopies)}
                          size="small"
                          sx={{
                            bgcolor: book.availableCopies > 0 ? designSystem.colors.status.available.bg : designSystem.colors.status.unavailable.bg,
                            color: book.availableCopies > 0 ? designSystem.colors.status.available.text : designSystem.colors.status.unavailable.text,
                            border: `1px solid ${book.availableCopies > 0 ? designSystem.colors.status.available.border : designSystem.colors.status.unavailable.border}`,
                            fontWeight: 700,
                            fontFamily: designSystem.typography.body.fontFamily,
                            '& .MuiChip-icon': {
                              color: book.availableCopies > 0 ? designSystem.colors.status.available.text : designSystem.colors.status.unavailable.text
                            }
                          }}
                          icon={book.availableCopies > 0 ? <Visibility /> : <VisibilityOff />}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" sx={{ color: designSystem.colors.text.muted }} />
                          <Typography variant="body2" sx={designSystem.typography.body}>
                            {formatDate(book.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Box sx={{ opacity: 0.7, transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }}>
                          <Tooltip title="Voir détails">
                            <IconButton
                              size="small"
                              sx={{ color: designSystem.colors.secondary.main, mr: 1 }}
                              onClick={() => openDialog('view', book)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              sx={{ color: designSystem.colors.secondary.main, mr: 1 }}
                              onClick={() => openDialog('edit', book)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              sx={{ color: designSystem.colors.status.unavailable.text }}
                              onClick={() => openDialog('delete', book)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          {books.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalBooks}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button for New Book */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          ...designSystem.button.contained
        }}
        onClick={() => openDialog('edit')}
      >
        <Add />
      </Fab>

      {/* Dialogs */}
      
      {/* Edit/Create Book Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'edit'} 
        onClose={closeDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: designSystem.card.borderRadius,
            border: designSystem.card.border
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: designSystem.colors.background.card, 
          borderBottom: `1px solid ${designSystem.colors.border.light}` 
        }}>
          <Typography variant="h5" sx={designSystem.typography.h5}>
            {selectedBook ? 'Modifier le livre' : 'Ajouter un nouveau livre'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.card }}>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Titre *"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    sx: {
                      bgcolor: designSystem.colors.background.light,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ISBN *"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Numbers sx={{ color: designSystem.colors.text.muted }} />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: designSystem.colors.background.light,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Auteur *"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: designSystem.colors.text.muted }} />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: designSystem.colors.background.light,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={bookForm.categoryId}
                    onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })}
                    label="Catégorie"
                    sx={{ bgcolor: designSystem.colors.background.light }}
                  >
                    <MenuItem value="">Aucune catégorie</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                  InputProps={{
                    sx: {
                      bgcolor: designSystem.colors.background.light,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Éditeur"
                  value={bookForm.publisher}
                  onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                  margin="normal"
                  InputProps={{
                    sx: {
                      bgcolor: designSystem.colors.background.light,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Année de publication"
                  type="number"
                  value={bookForm.publicationYear}
                  onChange={(e) => setBookForm({ ...bookForm, publicationYear: e.target.value })}
                  margin="normal"
                  InputProps={{ 
                    inputProps: { min: 1000, max: new Date().getFullYear() },
                    sx: {
                      bgcolor: designSystem.colors.background.light,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Genre"
                  value={bookForm.genre}
                  onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                  margin="normal"
                  InputProps={{
                    sx: {
                      bgcolor: designSystem.colors.background.light,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre d'exemplaires *"
                  type="number"
                  value={bookForm.totalCopies}
                  onChange={(e) => setBookForm({ ...bookForm, totalCopies: parseInt(e.target.value) || 1 })}
                  margin="normal"
                  required
                  InputProps={{ 
                    inputProps: { min: 1 },
                    sx: {
                      bgcolor: designSystem.colors.background.light,
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: designSystem.colors.background.card, 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button onClick={closeDialog} sx={designSystem.button.primary}>
            Annuler
          </Button>
          <Button 
            onClick={handleSaveBook} 
            variant="contained"
            disabled={!bookForm.title || !bookForm.author || !bookForm.isbn || !bookForm.totalCopies}
            sx={designSystem.button.contained}
          >
            {selectedBook ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Book Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'delete'} 
        onClose={closeDialog}
        PaperProps={{
          sx: {
            borderRadius: designSystem.card.borderRadius,
            border: designSystem.card.border
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: designSystem.colors.background.card, 
          borderBottom: `1px solid ${designSystem.colors.border.light}` 
        }}>
          <Typography variant="h5" sx={designSystem.typography.h5}>
            Confirmer la suppression
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.card }}>
          <Alert severity="warning" sx={{ 
            mb: 2,
            bgcolor: '#fef3c7',
            border: `1px solid #fbbf24`,
            color: '#92400e'
          }}>
            <Typography sx={{ 
              ...designSystem.typography.body,
              fontWeight: "600" 
            }}>
              Êtes-vous sûr de vouloir supprimer ce livre ?
            </Typography>
            <Typography variant="body2" sx={designSystem.typography.body}>
              Cette action est irréversible. Toutes les données associées à ce livre seront supprimées.
            </Typography>
          </Alert>
          {selectedBook && (
            <Box sx={{ p: 2, bgcolor: designSystem.colors.background.light, borderRadius: 1 }}>
              <Typography variant="body2" sx={designSystem.typography.body}>
                <strong>Titre:</strong> {selectedBook.title}
              </Typography>
              <Typography variant="body2" sx={designSystem.typography.body}>
                <strong>Auteur:</strong> {selectedBook.author}
              </Typography>
              <Typography variant="body2" sx={designSystem.typography.body}>
                <strong>ISBN:</strong> {selectedBook.isbn}
              </Typography>
              <Typography variant="body2" sx={designSystem.typography.body}>
                <strong>Exemplaires:</strong> {selectedBook.availableCopies}/{selectedBook.totalCopies} disponibles
              </Typography>
              {selectedBook.availableCopies < selectedBook.totalCopies && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={designSystem.typography.body}>
                    Attention: {selectedBook.totalCopies - selectedBook.availableCopies} exemplaire(s) sont actuellement empruntés
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: designSystem.colors.background.card, 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button onClick={closeDialog} sx={designSystem.button.primary}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteBook} 
            variant="contained"
            disabled={selectedBook?.availableCopies < selectedBook?.totalCopies}
            sx={{
              ...designSystem.button.contained,
              bgcolor: designSystem.colors.status.unavailable.text,
              '&:hover': { bgcolor: '#dc2626' }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Book Details Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'view'} 
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: designSystem.card.borderRadius,
            border: designSystem.card.border
          }
        }}
      >
        {detailsLoading ? (
          <DialogContent sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 400,
            bgcolor: designSystem.colors.background.card
          }}>
            <CircularProgress sx={{ color: designSystem.colors.primary.light }} />
          </DialogContent>
        ) : bookDetails ? (
          <>
            <DialogTitle sx={{ 
              bgcolor: designSystem.colors.background.card, 
              borderBottom: `1px solid ${designSystem.colors.border.light}` 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{ 
                    bgcolor: designSystem.colors.primary.main,
                    width: 60,
                    height: 60,
                    fontSize: '1.5rem',
                    color: 'white'
                  }}
                >
                  {bookDetails.title?.[0] || 'L'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ 
                    ...designSystem.typography.h5,
                    fontWeight: 600
                  }}>
                    {bookDetails.title}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ 
                    ...designSystem.typography.body,
                    color: designSystem.colors.text.muted
                  }}>
                    {bookDetails.author}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.card }}>
              <Grid container spacing={3}>
                {/* Left Column - Basic Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ 
                    mb: 3,
                    border: `1px solid ${designSystem.colors.border.light}`,
                    bgcolor: designSystem.colors.background.card
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ 
                        ...designSystem.typography.h6,
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <Info /> Informations Générales
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: designSystem.colors.primary.light, 
                              width: 32, 
                              height: 32,
                              color: designSystem.colors.primary.main
                            }}>
                              <Numbers fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography sx={designSystem.typography.body}>
                                ISBN
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ 
                                ...designSystem.typography.body,
                                fontFamily: 'monospace'
                              }}>
                                {bookDetails.isbn}
                              </Typography>
                            }
                          />
                        </ListItem>
                        
                        <Divider component="li" sx={{ my: 1 }} />
                        
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: '#e0f2fe', 
                              width: 32, 
                              height: 32,
                              color: '#0369a1'
                            }}>
                              <Person fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography sx={designSystem.typography.body}>
                                Auteur
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={designSystem.typography.body}>
                                {bookDetails.author}
                              </Typography>
                            }
                          />
                        </ListItem>
                        
                        <Divider component="li" sx={{ my: 1 }} />
                        
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: designSystem.colors.status.available.bg, 
                              width: 32, 
                              height: 32,
                              color: designSystem.colors.status.available.text
                            }}>
                              <CorporateFare fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography sx={designSystem.typography.body}>
                                Éditeur
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={designSystem.typography.body}>
                                {bookDetails.publisher || 'Non spécifié'}
                              </Typography>
                            }
                          />
                        </ListItem>
                        
                        <Divider component="li" sx={{ my: 1 }} />
                        
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: '#fef3c7', 
                              width: 32, 
                              height: 32,
                              color: '#92400e'
                            }}>
                              <CalendarToday fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography sx={designSystem.typography.body}>
                                Année de publication
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={designSystem.typography.body}>
                                {bookDetails.publicationYear || 'Non spécifié'}
                              </Typography>
                            }
                          />
                        </ListItem>
                        
                        <Divider component="li" sx={{ my: 1 }} />
                        
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: designSystem.colors.background.light, 
                              width: 32, 
                              height: 32,
                              color: designSystem.colors.text.muted
                            }}>
                              <Label fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography sx={designSystem.typography.body}>
                                Genre
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={designSystem.typography.body}>
                                {bookDetails.genre || 'Non spécifié'}
                              </Typography>
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                  
                  {/* Categories */}
                  <Card variant="outlined" sx={{ 
                    border: `1px solid ${designSystem.colors.border.light}`,
                    bgcolor: designSystem.colors.background.card
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ 
                        ...designSystem.typography.h6,
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <Category /> Catégories
                      </Typography>
                      {(() => {
                        const categoriesList = getCategoriesForDisplay(bookDetails);
                        return categoriesList.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {categoriesList.map((category, index) => (
                              <Chip
                                key={index}
                                label={category}
                                size="small"
                                sx={{
                                  bgcolor: '#fef3c7',
                                  color: designSystem.colors.primary.main,
                                  border: `1px solid ${designSystem.colors.primary.main}`,
                                  fontWeight: 700,
                                  fontFamily: designSystem.typography.body.fontFamily
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ 
                            ...designSystem.typography.body,
                            color: designSystem.colors.text.muted, 
                            fontStyle: 'italic' 
                          }}>
                            Non catégorisé
                          </Typography>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Right Column - Stock & Status */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ 
                    mb: 3,
                    border: `1px solid ${designSystem.colors.border.light}`,
                    bgcolor: designSystem.colors.background.card
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ 
                        ...designSystem.typography.h6,
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <Bookmark /> Gestion du Stock
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={designSystem.typography.body}>
                            Exemplaires disponibles
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            ...designSystem.typography.body,
                            fontWeight: 600
                          }}>
                            {bookDetails.availableCopies} / {bookDetails.totalCopies}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={getAvailabilityPercentage(bookDetails.availableCopies, bookDetails.totalCopies)} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            bgcolor: designSystem.colors.primary.light,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: bookDetails.availableCopies > 0 ? designSystem.colors.status.available.text : designSystem.colors.status.unavailable.text,
                              borderRadius: 5
                            }
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={designSystem.typography.body}>
                          Statut
                        </Typography>
                        <Chip
                          label={getStatusText(bookDetails.availableCopies)}
                          size="small"
                          sx={{
                            bgcolor: bookDetails.availableCopies > 0 ? designSystem.colors.status.available.bg : designSystem.colors.status.unavailable.bg,
                            color: bookDetails.availableCopies > 0 ? designSystem.colors.status.available.text : designSystem.colors.status.unavailable.text,
                            border: `1px solid ${bookDetails.availableCopies > 0 ? designSystem.colors.status.available.border : designSystem.colors.status.unavailable.border}`,
                            fontWeight: 700,
                            fontFamily: designSystem.typography.body.fontFamily,
                            '& .MuiChip-icon': {
                              color: bookDetails.availableCopies > 0 ? designSystem.colors.status.available.text : designSystem.colors.status.unavailable.text
                            }
                          }}
                          icon={bookDetails.availableCopies > 0 ? <CheckCircle /> : <Cancel />}
                        />
                      </Box>
                      
                      {bookDetails.availableCopies < bookDetails.totalCopies && (
                        <Alert severity="info" sx={{ 
                          mt: 2,
                          bgcolor: '#e0f2fe',
                          border: `1px solid #38bdf8`,
                          color: '#0369a1'
                        }}>
                          <Typography variant="body2" sx={designSystem.typography.body}>
                            <strong>Note:</strong> {bookDetails.totalCopies - bookDetails.availableCopies} exemplaire(s) sont actuellement empruntés
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Description */}
                  <Card variant="outlined" sx={{ 
                    border: `1px solid ${designSystem.colors.border.light}`,
                    bgcolor: designSystem.colors.background.card
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ 
                        ...designSystem.typography.h6,
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <Description /> Description
                      </Typography>
                      {bookDetails.description ? (
                        <Typography variant="body2" sx={{ 
                          ...designSystem.typography.body,
                          whiteSpace: 'pre-line' 
                        }}>
                          {bookDetails.description}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ 
                          ...designSystem.typography.body,
                          color: designSystem.colors.text.muted, 
                          fontStyle: 'italic' 
                        }}>
                          Aucune description disponible
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Timestamps */}
                  <Card variant="outlined" sx={{ 
                    mt: 3,
                    border: `1px solid ${designSystem.colors.border.light}`,
                    bgcolor: designSystem.colors.background.card
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ 
                        ...designSystem.typography.h6,
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <Update /> Métadonnées
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ 
                            ...designSystem.typography.caption,
                            color: designSystem.colors.text.muted
                          }}>
                            Créé le
                          </Typography>
                          <Typography variant="body2" sx={designSystem.typography.body}>
                            {formatDate(bookDetails.createdAt)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ 
                            ...designSystem.typography.caption,
                            color: designSystem.colors.text.muted
                          }}>
                            Modifié le
                          </Typography>
                          <Typography variant="body2" sx={designSystem.typography.body}>
                            {formatDate(bookDetails.updatedAt) || 'Jamais modifié'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ 
              bgcolor: designSystem.colors.background.card, 
              borderTop: `1px solid ${designSystem.colors.border.light}`, 
              p: 2 
            }}>
              <Button onClick={closeDialog} sx={designSystem.button.primary}>
                Fermer
              </Button>
              <Button 
                variant="contained"
                onClick={() => {
                  closeDialog();
                  openDialog('edit', bookDetails);
                }}
                sx={designSystem.button.contained}
              >
                <Edit sx={{ mr: 1 }} />
                Modifier
              </Button>
            </DialogActions>
          </>
        ) : (
          <DialogContent sx={{ bgcolor: designSystem.colors.background.card }}>
            <Alert severity="error">
              <Typography sx={designSystem.typography.body}>
                Impossible de charger les détails du livre
              </Typography>
            </Alert>
          </DialogContent>
        )}
      </Dialog>

      {/* Create/Edit Category Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'category' && categoryDialogType !== 'delete'} 
        onClose={closeDialog}
        PaperProps={{
          sx: {
            borderRadius: designSystem.card.borderRadius,
            border: designSystem.card.border
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: designSystem.colors.background.card, 
          borderBottom: `1px solid ${designSystem.colors.border.light}` 
        }}>
          <Typography variant="h5" sx={designSystem.typography.h5}>
            {selectedCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.card }}>
          <Box sx={{ pt: 2, minWidth: 400 }}>
            <TextField
              fullWidth
              label="Nom de la catégorie *"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              margin="normal"
              required
              InputProps={{
                sx: {
                  bgcolor: designSystem.colors.background.light,
                }
              }}
            />
            <TextField
              fullWidth
              label="Description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
              InputProps={{
                sx: {
                  bgcolor: designSystem.colors.background.light,
                }
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Catégorie parente (optionnel)</InputLabel>
              <Select
                value={categoryForm.parentId || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value || null })}
                label="Catégorie parente"
                sx={{ bgcolor: designSystem.colors.background.light }}
              >
                <MenuItem value="">Aucune (catégorie principale)</MenuItem>
                {categories
                  .filter(cat => !selectedCategory || cat.id !== selectedCategory.id)
                  .map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: designSystem.colors.background.card, 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button onClick={closeDialog} sx={designSystem.button.primary}>
            Annuler
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained"
            disabled={!categoryForm.name}
            sx={designSystem.button.contained}
          >
            {selectedCategory ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'category' && categoryDialogType === 'delete'} 
        onClose={closeDialog}
        PaperProps={{
          sx: {
            borderRadius: designSystem.card.borderRadius,
            border: designSystem.card.border
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: designSystem.colors.background.card, 
          borderBottom: `1px solid ${designSystem.colors.border.light}` 
        }}>
          <Typography variant="h5" sx={designSystem.typography.h5}>
            Supprimer la Catégorie
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, bgcolor: designSystem.colors.background.card }}>
          <Alert severity="warning" sx={{ 
            mb: 2,
            bgcolor: '#fef3c7',
            border: `1px solid #fbbf24`,
            color: '#92400e'
          }}>
            <Typography sx={{ 
              ...designSystem.typography.body,
              fontWeight: "600" 
            }}>
              Êtes-vous sûr de vouloir supprimer cette catégorie ?
            </Typography>
            <Typography variant="body2" sx={designSystem.typography.body}>
              Cette action supprimera toutes les références à cette catégorie.
              Assurez-vous qu'aucun livre n'utilise cette catégorie.
            </Typography>
          </Alert>
          {selectedCategory && (
            <Box sx={{ p: 2, bgcolor: designSystem.colors.background.light, borderRadius: 1 }}>
              <Typography variant="body2" sx={designSystem.typography.body}>
                <strong>Nom:</strong> {selectedCategory.name}
              </Typography>
              {selectedCategory.description && (
                <Typography variant="body2" sx={designSystem.typography.body}>
                  <strong>Description:</strong> {selectedCategory.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: designSystem.colors.background.card, 
          borderTop: `1px solid ${designSystem.colors.border.light}`, 
          p: 2 
        }}>
          <Button onClick={closeDialog} sx={designSystem.button.primary}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteCategory} 
            variant="contained"
            sx={{
              ...designSystem.button.contained,
              bgcolor: designSystem.colors.status.unavailable.text,
              '&:hover': { bgcolor: '#dc2626' }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminBooks;