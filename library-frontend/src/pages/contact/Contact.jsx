import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert
} from '@mui/material';
import { Email, Phone, LocationOn, Send } from '@mui/icons-material';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual form submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Contactez-nous
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Nous sommes là pour vous aider
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Envoyez-nous un message
            </Typography>
            {submitted && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nom"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Sujet"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                multiline
                rows={6}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Send />}
                fullWidth
              >
                Envoyer le message
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email sx={{ color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Email
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  contact@bibliora.com
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Phone sx={{ color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Téléphone
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +33 1 23 45 67 89
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Adresse
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  123 Rue de la Bibliothèque
                  <br />
                  75001 Paris, France
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;
