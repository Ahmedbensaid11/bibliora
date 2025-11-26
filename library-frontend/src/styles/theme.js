import { createTheme } from '@mui/material/styles';

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
      main: '#8B4513',        // Saddle brown - main brown color
      light: '#A0522D',       // Sienna - lighter brown
      dark: '#5D2E0F',        // Dark brown
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D2691E',        // Chocolate - warm secondary
      light: '#E89B5D',       // Light chocolate
      dark: '#A0522D',        // Dark chocolate
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFF8F0',     // Warm off-white
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3E2723',     // Dark brown for text
      secondary: '#6D4C41',   // Medium brown for secondary text
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
      main: '#F39C12',        // Golden orange - for "lumière" accent
      light: '#F1C40F',
    },
    info: {
      main: '#8B4513',        // Brown for info
      light: '#A0522D',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#3E2723',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#3E2723',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#3E2723',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#3E2723',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#3E2723',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#3E2723',
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
    '0px 2px 4px rgba(139, 69, 19, 0.05)',
    '0px 4px 8px rgba(139, 69, 19, 0.08)',
    '0px 8px 16px rgba(139, 69, 19, 0.1)',
    '0px 12px 24px rgba(139, 69, 19, 0.12)',
    '0px 16px 32px rgba(139, 69, 19, 0.15)',
    ...Array(19).fill('0px 20px 40px rgba(139, 69, 19, 0.2)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
          width: '100%',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
        },
        '#root': {
          margin: 0,
          padding: 0,
          width: '100%',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(139, 69, 19, 0.15)',
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
              borderColor: '#8B4513',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 12px rgba(139, 69, 19, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(139, 69, 19, 0.12)',
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