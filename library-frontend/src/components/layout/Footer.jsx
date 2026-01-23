import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { 
  MenuBook,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer = () => {
  const essentialLinks = [
    { label: 'Catalogue', path: '/catalogue' },
    { label: 'Mes Emprunts', path: '/emprunts' },
    { label: 'Contact', path: '/contact' },
    { label: 'CGU', path: '/terms' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#8B4513',
        color: 'white',
        pt: 4,
        pb: 3,
        width: '100%',
        borderTop: '1px solid rgba(255, 248, 240, 0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Brand Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  bgcolor: '#FFF8F0',
                  p: 1,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MenuBook sx={{ fontSize: 28, color: '#8B4513' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '0.5px'
                  }}
                >
                  BiblioTech
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 248, 240, 0.8)',
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic'
                  }}
                >
                  Votre bibliothèque numérique
                </Typography>
              </Box>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2, 
                opacity: 0.8,
                fontFamily: 'Georgia, serif',
                maxWidth: 400
              }}
            >
              Accédez à notre collection de livres depuis n'importe où, à tout moment.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={3}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                fontFamily: 'Georgia, serif',
                fontWeight: 600
              }}
            >
              Liens Rapides
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {essentialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.path}
                  color="inherit"
                  underline="hover"
                  sx={{ 
                    fontSize: '0.9rem',
                    fontFamily: 'Georgia, serif',
                    '&:hover': { 
                      color: '#fde68a'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                fontFamily: 'Georgia, serif',
                fontWeight: 600
              }}
            >
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 18, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem', opacity: 0.8 }}>
                  contact@bibliotech.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 18, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem', opacity: 0.8 }}>
                  +216 XX XXX XXX
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 18, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem', opacity: 0.8 }}>
                  Tunis, Tunisie
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              opacity: 0.7,
              fontFamily: 'Georgia, serif',
              fontSize: '0.8rem'
            }}
          >
            © {new Date().getFullYear()} BiblioTech. Tous droits réservés.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;