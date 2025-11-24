import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { LibraryBooks, ArrowForward } from '@mui/icons-material';

const Home = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.dark',
          borderRadius: 2,
          p: { xs: 4, md: 8 },
          mb: 6,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Typography variant="overline" sx={{ color: 'primary.light', letterSpacing: 2 }}>
          Bibliothèque Numérique
        </Typography>
        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mt: 2, mb: 2 }}>
          La connaissance est <em>lumière</em>
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.8, mb: 4, maxWidth: 600 }}>
          Explorez notre collection d'ouvrages. Une bibliothèque complète à portée de main.
        </Typography>
        <Button
          component={Link}
          to="/catalogue"
          variant="contained"
          size="large"
          sx={{ bgcolor: 'white', color: 'primary.dark', '&:hover': { bgcolor: 'grey.100' } }}
          startIcon={<LibraryBooks />}
        >
          Parcourir le catalogue
        </Button>
      </Box>

      {/* Quick Stats or Categories - can be connected to API later */}
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Découvrir par catégorie
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {['Roman', 'Science-Fiction', 'Histoire', 'Philosophie'].map((genre) => (
          <Grid item xs={12} sm={6} md={3} key={genre}>
            <Card
              component={Link}
              to={`/catalogue?genre=${encodeURIComponent(genre)}`}
              sx={{
                textDecoration: 'none',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {genre}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'primary.main' }}>
                  <Typography variant="body2">Explorer</Typography>
                  <ArrowForward fontSize="small" sx={{ ml: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;