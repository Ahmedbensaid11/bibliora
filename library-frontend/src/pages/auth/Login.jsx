import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Login as LoginIcon,
  AutoStories,
  MenuBook,
  ImportContacts,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.usernameOrEmail) {
      newErrors.usernameOrEmail = 'Le nom d\'utilisateur ou l\'email est requis';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await login({
        email: formData.usernameOrEmail, // This will be transformed to usernameOrEmail in authService
        password: formData.password,
      });
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100%',
        width: '100vw',
        display: 'flex',
        background: 'linear-gradient(135deg, #1A252F 0%, #2C3E50 50%, #34495E 100%)',
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Animations de fond améliorées */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, i % 2 === 0 ? 100 : -100, 0],
              y: [0, i % 2 === 0 ? -50 : 50, 0],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            style={{
              position: 'absolute',
              width: 350 + i * 120,
              height: 350 + i * 120,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 18}%`,
              filter: 'blur(40px)',
            }}
          />
        ))}
      </Box>

      <Container 
        maxWidth={false} 
        disableGutters
        sx={{ 
          position: 'relative', 
          zIndex: 1, 
          display: 'flex', 
          alignItems: 'center',
          width: '100%',
          maxWidth: '100%',
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          py: { xs: 3, md: 4 },
          margin: 0,
        }}
      >
        <Grid container spacing={0} sx={{ width: '100%', minHeight: { xs: '100vh', md: '90vh' }, margin: 0 }}>
          {/* Colonne Gauche - Informations (cachée sur mobile) */}
          <Grid 
            item 
            xs={12} 
            md={6}
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'flex-start', 
              justifyContent: 'center', 
              px: { md: 3, lg: 5, xl: 8 },
              py: 4,
              pt: { md: 8, lg: 10, xl: 12 },
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              style={{ width: '100%', maxWidth: 550 }}
            >
              <Box sx={{ color: 'white' }}>
                <Typography 
                  variant="h2" 
                  fontWeight="800" 
                  gutterBottom 
                  sx={{ 
                    mb: 2, 
                    color: 'white',
                    fontSize: { md: '2.5rem', lg: '3rem', xl: '3.5rem' },
                  }}
                >
                  Bienvenue dans votre
                  <br />
                  Bibliothèque
                </Typography>

                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 4, 
                    opacity: 0.9, 
                    fontWeight: 300, 
                    lineHeight: 1.6,
                    color: 'white',
                    fontSize: { md: '1rem', lg: '1.1rem', xl: '1.25rem' },
                  }}
                >
                  Accédez à des milliers de livres, gérez vos emprunts et découvrez de nouvelles lectures passionnantes.
                </Typography>

                {/* Features */}
                <Box sx={{ mt: 6 }}>
                  {[
                    { icon: <AutoStories sx={{ fontSize: { md: 35, lg: 40, xl: 45 } }} />, title: 'Catalogue Complet', desc: 'Explorez notre vaste collection' },
                    { icon: <MenuBook sx={{ fontSize: { md: 35, lg: 40, xl: 45 } }} />, title: 'Gestion Simple', desc: 'Empruntez en quelques clics' },
                    { icon: <ImportContacts sx={{ fontSize: { md: 35, lg: 40, xl: 45 } }} />, title: 'Suivi Personnalisé', desc: 'Suivez vos lectures en temps réel' },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 3,
                            p: { md: 1.5, lg: 2 },
                            mr: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Box>
                          <Typography 
                            variant="h6" 
                            fontWeight="600" 
                            gutterBottom
                            sx={{ color: 'white',fontSize: { md: '1rem', lg: '1.1rem', xl: '1.25rem' } }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              opacity: 0.8,
                              fontSize: { md: '0.85rem', lg: '0.9rem', xl: '1rem' },
                            }}
                          >
                            {feature.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Colonne Droite - Formulaire */}
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              px: { xs: 0, sm: 2, md: 3, lg: 5, xl: 8 },
              py: { xs: 3, md: 4 },
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ width: '100%', maxWidth: 520 }}
            >
              {/* Logo mobile uniquement */}
              {isMobile && (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    component="img"
                    src="/logo.png"
                    alt="Library Logo"
                    sx={{
                      width: 200,
                      height: 200,
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                    }}
                  />
                </Box>
              )}

              <Paper
                elevation={24}
                sx={{
                  p: { xs: 3, sm: 4, md: 4, lg: 5 },
                  borderRadius: { xs: 3, md: 4 },
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  >
                    <Box
                      component="img"
                      src="/logo.png"
                      alt="Library Logo"
                      sx={{
                        width: { xs: 100, sm: 150, md: 200 },
                        height: { xs: 100, sm: 150, md: 200 },
                        mb: 3,
                        filter: 'drop-shadow(0 4px 12px rgba(44, 62, 80, 0.3))',
                      }}
                    />
                  </motion.div>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color="primary" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
                  >
                    Connexion
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', md: '0.9rem' } }}
                  >
                    Connectez-vous pour accéder à votre bibliothèque
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur ou Email"
                    name="usernameOrEmail"
                    type="text"
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                    error={!!errors.usernameOrEmail}
                    helperText={errors.usernameOrEmail}
                    margin="normal"
                    placeholder="Entrez votre nom d'utilisateur ou email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(44, 62, 80, 0.1)',
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Mot de passe"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(44, 62, 80, 0.1)',
                        },
                      },
                    }}
                  />

                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    mb: 3,
                    gap: { xs: 1, sm: 0 },
                  }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          color="primary"
                        />
                      }
                      label={<Typography sx={{ fontSize: { xs: '0.875rem', md: '0.9rem' } }}>Se souvenir de moi</Typography>}
                    />
                    <Link
                      to="/forgot-password"
                      style={{
                        color: '#2C3E50',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#1A252F';
                        e.target.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#2C3E50';
                        e.target.style.textDecoration = 'none';
                      }}
                    >
                      Mot de passe oublié ?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                    sx={{
                      py: { xs: 1.2, md: 1.5 },
                      mb: 2,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #34495E 0%, #2C3E50 100%)',
                      boxShadow: '0 4px 14px rgba(44, 62, 80, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2C3E50 0%, #1A252F 100%)',
                        boxShadow: '0 6px 20px rgba(44, 62, 80, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      OU
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9rem' } }}>
                      Vous n'avez pas de compte ?{' '}
                      <Link
                        to="/register"
                        style={{
                          color: '#2C3E50',
                          textDecoration: 'none',
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#1A252F';
                          e.target.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#2C3E50';
                          e.target.style.textDecoration = 'none';
                        }}
                      >
                        S'inscrire
                      </Link>
                    </Typography>
                  </Box>
                </form>
              </Paper>

              {/* Footer */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                  }}
                >
                  © 2025 Library Management System. Tous droits réservés.
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;