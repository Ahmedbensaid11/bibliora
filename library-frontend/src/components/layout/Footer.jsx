import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import {
  AutoStories,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn
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
        bgcolor: '#f5f5f4',
        color: '#292524',
        pt: 5,
        pb: 4,
        mt: 'auto',
        width: '100%',
        position: 'relative',
        left: 0,
        right: 0,
        borderRadius: 0,
        borderTop: '1px solid rgba(120, 53, 15, 0.1)'
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={4} sx={{ mb: 3 }}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
              <AutoStories sx={{ fontSize: 24, color: '#b45309' }} />
              <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: 'Georgia, serif', color: '#78350f' }}>
                BiblioRA
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, color: '#57534e', lineHeight: 1.6, maxWidth: 300 }}>
              Votre bibliothèque numérique moderne. Savoir & Tradition.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  sx={{
                    color: '#78350f',
                    bgcolor: 'rgba(120, 53, 15, 0.08)',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      bgcolor: 'rgba(120, 53, 15, 0.15)',
                      color: '#b45309'
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
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 1.5, color: '#78350f', fontFamily: 'Georgia, serif' }}>
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {section.links.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    underline="none"
                    sx={{
                      color: '#57534e',
                      fontSize: '0.85rem',
                      fontFamily: 'Georgia, serif',
                      fontStyle: 'italic',
                      '&:hover': {
                        color: '#b45309',
                        paddingLeft: '4px'
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
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 1.5, color: '#78350f', fontFamily: 'Georgia, serif' }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" sx={{ color: '#b45309', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#57534e' }}>
                  contact@bibliora.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" sx={{ color: '#b45309', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#57534e' }}>
                  +216 XX XXX XXX
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" sx={{ color: '#b45309', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#57534e' }}>
                  Tunis, Tunisie
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5, borderColor: 'rgba(120, 53, 15, 0.1)' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="caption" sx={{ color: '#78716c' }}>
            © 2025 BiblioRA. Tous droits réservés. Savoir & Tradition.
          </Typography>
          <Typography variant="caption" sx={{ color: '#78716c' }}>
            Fait avec ❤️ par l'équipe BiblioRA
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;