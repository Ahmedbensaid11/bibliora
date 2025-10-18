import { createTheme } from '@mui/material/styles';

/**
 * Thème personnalisé pour l'application Library Management
 * Couleurs principales: #2C3E50 (bleu foncé) et gris clair
 */
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 2000,
    },
  },
  palette: {
    primary: {
      main: '#2C3E50',
      light: '#34495E',
      dark: '#1A252F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#95A5A6',
      light: '#BDC3C7',
      dark: '#7F8C8D',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
    success: {
      main: '#27AE60',
      light: '#2ECC71',
    },
    error: {
      main: '#E74C3C',
      light: '#EC7063',
    },
    warning: {
      main: '#F39C12',
      light: '#F1C40F',
    },
    info: {
      main: '#3498DB',
      light: '#5DADE2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2C3E50',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2C3E50',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#2C3E50',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2C3E50',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#2C3E50',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#2C3E50',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(44, 62, 80, 0.05)',
    '0px 4px 8px rgba(44, 62, 80, 0.08)',
    '0px 8px 16px rgba(44, 62, 80, 0.1)',
    '0px 12px 24px rgba(44, 62, 80, 0.12)',
    '0px 16px 32px rgba(44, 62, 80, 0.15)',
    ...Array(19).fill('0px 20px 40px rgba(44, 62, 80, 0.2)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(44, 62, 80, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover fieldset': {
              borderColor: '#2C3E50',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 12px rgba(44, 62, 80, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(44, 62, 80, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;