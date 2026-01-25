import { createTheme } from '@mui/material/styles';

// BiblioRA Theme - Warm amber/brown library aesthetic
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
      main: '#78350f',      // amber-900
      light: '#b45309',     // amber-700
      dark: '#451a03',      // amber-950
      contrastText: '#fffbeb', // amber-50
    },
    secondary: {
      main: '#57534e',      // stone-600
      light: '#78716c',     // stone-500
      dark: '#292524',      // stone-800
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#fdfbf7',   // warm paper beige
      paper: '#fffcf5',     // warm cream
    },
    text: {
      primary: '#292524',   // stone-800
      secondary: '#57534e', // stone-600
    },
    success: {
      main: '#047857',      // emerald-700
      light: '#10b981',     // emerald-500
    },
    error: {
      main: '#dc2626',      // red-600
      light: '#ef4444',     // red-500
    },
    warning: {
      main: '#d97706',      // amber-600
      light: '#f59e0b',     // amber-500
    },
    info: {
      main: '#0369a1',      // sky-700
      light: '#0ea5e9',     // sky-500
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      fontFamily: '"Georgia", "Times New Roman", serif',
      color: '#292524',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      fontFamily: '"Georgia", "Times New Roman", serif',
      color: '#292524',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      fontFamily: '"Georgia", "Times New Roman", serif',
      color: '#292524',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      fontFamily: '"Georgia", "Times New Roman", serif',
      color: '#292524',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      fontFamily: '"Georgia", "Times New Roman", serif',
      color: '#292524',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      fontFamily: '"Georgia", "Times New Roman", serif',
      color: '#292524',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(120, 53, 15, 0.05)',
    '0px 4px 8px rgba(120, 53, 15, 0.08)',
    '0px 8px 16px rgba(120, 53, 15, 0.1)',
    '0px 12px 24px rgba(120, 53, 15, 0.12)',
    '0px 16px 32px rgba(120, 53, 15, 0.15)',
    ...Array(19).fill('0px 20px 40px rgba(120, 53, 15, 0.2)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
          width: '100%',
          backgroundColor: '#fdfbf7',
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
          borderRadius: 6,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(120, 53, 15, 0.15)',
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
            borderRadius: 6,
            backgroundColor: '#fdfbf7',
            '&:hover fieldset': {
              borderColor: '#b45309',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#78350f',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 12px rgba(120, 53, 15, 0.08)',
          border: '1px solid #e7e5e4',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(120, 53, 15, 0.12)',
            borderColor: '#fbbf24',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;