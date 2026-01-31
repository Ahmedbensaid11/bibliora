// BiblioRA Design System - Consistent styling across the application

export const designSystem = {
  typography: {
    h1: {
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      color: '#451a03',
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      color: '#451a03',
      fontSize: '2rem',
    },
    h3: {
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      color: '#451a03',
      fontSize: '1.75rem',
    },
    h4: {
      fontFamily: 'Georgia, serif',
      fontWeight: 600,
      color: '#451a03',
      fontSize: '1.5rem',
    },
    h5: {
      fontFamily: 'Georgia, serif',
      fontWeight: 600,
      color: '#1c1917',
      fontSize: '1.25rem',
    },
    h6: {
      fontFamily: 'Georgia, serif',
      fontWeight: 600,
      color: '#1c1917',
      fontSize: '1.125rem',
    },
    subtitle: {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontWeight: 300,
      color: '#78716c',
      fontSize: '1rem',
    },
    body: {
      fontFamily: 'Georgia, serif',
      color: '#57534e',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    caption: {
      fontFamily: 'monospace',
      color: '#a8a29e',
      fontSize: '0.875rem',
    },
    button: {
      fontFamily: 'Georgia, serif',
      fontWeight: 700,
      textTransform: 'none',
      fontSize: '0.95rem',
    }
  },
  colors: {
    primary: {
      main: '#451a03',
      light: '#78350f',
      dark: '#1c1917',
    },
    secondary: {
      main: '#92400e',
      light: '#b45309',
    },
    background: {
      main: '#ffffff',
      light: '#fdfbf7',
      card: '#fffcf5',
      hover: '#fde68a',
    },
    text: {
      primary: '#1c1917',
      secondary: '#57534e',
      muted: '#78716c',
      caption: '#a8a29e',
    },
    status: {
      available: {
        bg: '#f0fdf4',
        text: '#166534',
        border: '#bbf7d0',
      },
      unavailable: {
        bg: '#fef2f2',
        text: '#991b1b',
        border: '#fecaca',
      }
    },
    border: {
      light: '#e7e5e4',
      medium: '#d6d3d1',
    }
  },
  spacing: {
    cardPadding: 2.5,
    sectionSpacing: 4,
    gridSpacing: 4,
  },
  shadows: {
    card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    cardHover: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    header: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },
  card: {
    borderRadius: '8px',
    border: '1px solid #e7e5e4',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      borderColor: '#fde68a',
    }
  },
  button: {
    primary: {
      color: '#92400e',
      fontWeight: 700,
      fontFamily: 'Georgia, serif',
      textTransform: 'none',
      fontSize: '0.95rem',
    },
    contained: {
      bgcolor: '#78350f',
      color: '#ffffff',
      '&:hover': {
        bgcolor: '#92400e',
      }
    }
  }
};

export default designSystem;
