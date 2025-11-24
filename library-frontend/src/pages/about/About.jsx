import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { LibraryBooks, People, TrendingUp } from '@mui/icons-material';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          À propos de BiblioRA
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Votre bibliothèque numérique moderne
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="body1" paragraph>
          BiblioRA est une plateforme de gestion de bibliothèque moderne conçue pour faciliter
          l'accès aux livres et la gestion des emprunts. Notre mission est de rendre la lecture
          accessible à tous grâce à une interface intuitive et des fonctionnalités avancées.
        </Typography>
        <Typography variant="body1" paragraph>
          Que vous soyez un lecteur passionné ou un bibliothécaire, BiblioRA vous offre tous
          les outils nécessaires pour gérer efficacement votre collection de livres et suivre
          vos emprunts.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <LibraryBooks sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Collection Riche
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Des milliers de livres disponibles dans tous les genres
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <People sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Communauté Active
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rejoignez une communauté de lecteurs passionnés
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Suivi Personnalisé
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Suivez vos emprunts et votre progression de lecture
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default About;
