import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { 
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  MenuBook
} from '@mui/icons-material';

const Footer = () => {
  const footerSections = [
    {
      title: 'Services',
      links: ['Catalogue', 'Emprunts', 'Aide']
    },
    {
      title: 'Ressources',
      links: ['FAQ', 'Blog', 'Support']
    },
    {
      title: 'Légal',
      links: ['CGU', 'Confidentialité', 'Mentions Légales']
    }
  ];

  const socialLinks = [
    { icon: <Facebook fontSize="small" />, label: 'Facebook' },
    { icon: <Twitter fontSize="small" />, label: 'Twitter' },
    { icon: <Instagram fontSize="small" />, label: 'Instagram' },
    { icon: <LinkedIn fontSize="small" />, label: 'LinkedIn' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#8B4513',
        color: 'white',
        pt: 4,
        pb: 3,
        mt: 'auto',
        width: '100%',
        position: 'relative',
        left: 0,
        right: 0,
        borderRadius: 0
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={4} sx={{ mb: 3 }}>
          {/* Brand Section with updated logo */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  bgcolor: '#FFF8F0',
                  p: 1,
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 248, 240, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <MenuBook sx={{ fontSize: 24, color: '#8B4513' }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'serif', letterSpacing: '0.5px', lineHeight: 1.2 }}>
                  BiblioTech
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.625rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: 'rgba(255, 248, 240, 0.8)'
                  }}
                >
                  Savoir & Tradition
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8, lineHeight: 1.6, maxWidth: 300 }}>
              Votre bibliothèque numérique moderne.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    width: 36,
                    height: 36,
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.2s'
                  }}
                  size="small"
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <Grid item xs={6} sm={4} md={2} key={section.title}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 1.5 }}>
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {section.links.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    color="inherit"
                    underline="none"
                    sx={{ 
                      opacity: 0.7,
                      fontSize: '0.85rem',
                      '&:hover': { 
                        opacity: 1,
                        paddingLeft: '4px',
                        transition: 'all 0.2s'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Contact Section */}
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 1.5 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" sx={{ opacity: 0.6, fontSize: 16 }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  contact@bibliotech.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" sx={{ opacity: 0.6, fontSize: 16 }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  +216 XX XXX XXX
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" sx={{ opacity: 0.6, fontSize: 16 }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Tunis, Tunisie
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            © 2025 BiblioTech. Tous droits réservés.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Fait avec ❤️ par l'équipe BiblioTech
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;