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
  Grid,
  CircularProgress,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Home,
  PersonAdd,
  LibraryBooks,
  School,
  Stars,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { register, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'error';
    if (passwordStrength <= 50) return 'warning';
    if (passwordStrength <= 75) return 'info';
    return 'success';
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Au moins 3 caractères requis';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Au moins 8 caractères requis';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Le nom est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100%',
        width: '100vw',
        display: 'flex',
        background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 50%, #5D2E0F 100%)',
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Animated background */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.12, 0.22, 0.12],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 18 + i * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
            style={{
              position: 'absolute',
              width: 300 + i * 100,
              height: 300 + i * 100,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)`,
              top: `${12 + i * 12}%`,
              right: `${3 + i * 15}%`,
              filter: 'blur(50px)',
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
        <Grid container spacing={0} sx={{ width: '100%', minHeight: { xs: '100vh', md: '90vh' }, margin: 0, position: 'relative' }}>

          {/* Left Column - Information */}
          <Grid 
            item 
            xs={12} 
            md={5}
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'flex-start', 
              justifyContent: 'center',
              px: { md: 3, lg: 4, xl: 6 },
              py: 4,
              pt: { md: 8, lg: 10, xl: 12 },
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              style={{ width: '100%', maxWidth: 450 }}
            >
              <Box sx={{ color: 'white' }}>
                <Typography 
                  variant="h2" 
                  fontWeight="800" 
                  gutterBottom 
                  sx={{ 
                    mb: 2, 
                    color: 'white',
                    fontSize: { md: '2.25rem', lg: '2.75rem', xl: '3.25rem' },
                  }}
                >
                  Rejoignez-nous
                </Typography>

                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 5, 
                    opacity: 0.9, 
                    fontWeight: 300, 
                    lineHeight: 1.6,
                    color: 'white',
                    fontSize: { md: '1rem', lg: '1.1rem', xl: '1.25rem' },
                  }}
                >
                  Créez votre compte et découvrez un monde infini de connaissances et de littérature.
                </Typography>

                {/* Benefits */}
                <Box sx={{ mt: 6 }}>
                  {[
                    { icon: <LibraryBooks sx={{fontSize: { md: 35, lg: 40, xl: 45 } }} />, title: 'Accès Illimité', desc: 'Des milliers de livres à portée de main' },
                    { icon: <School sx={{ fontSize: { md: 35, lg: 40, xl: 45 } }} />, title: 'Apprentissage', desc: 'Ressources éducatives de qualité' },
                    { icon: <Stars sx={{ fontSize: { md: 35, lg: 40, xl: 45 } }} />, title: 'Recommandations', desc: 'Suggestions personnalisées' },
                  ].map((benefit, index) => (
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
                          {benefit.icon}
                        </Box>
                        <Box>
                          <Typography 
                            variant="h6" 
                            fontWeight="600" 
                            gutterBottom
                            sx={{ color: 'white',fontSize: { md: '1rem', lg: '1.1rem', xl: '1.25rem' } }}
                          >
                            {benefit.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              opacity: 0.8,
                              fontSize: { md: '0.85rem', lg: '0.9rem', xl: '1rem' },
                            }}
                          >
                            {benefit.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Right Column - Form */}
          <Grid 
            item 
            xs={12} 
            md={7} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              px: { xs: 0, sm: 2, md: 3, lg: 4, xl: 6 },
              py: { xs: 3, md: 4 },
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ width: '100%', maxWidth: 750 }}
            >
              {/* Mobile logo */}
              {isMobile && (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    component="img"
                    src="/logo.png"
                    alt="Library Logo"
                    sx={{
                      width: 70,
                      height: 70,
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
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
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
                        filter: 'drop-shadow(0 4px 12px rgba(139, 69, 19, 0.3))',
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
                    Créer un compte
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', md: '0.9rem' } }}
                  >
                    Rejoignez notre bibliothèque numérique
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={{ xs: 2, md: 2.5 }}>
                    {/* Username */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nom d'utilisateur"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        error={!!errors.username}
                        helperText={errors.username}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    {/* First Name and Last Name */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Prénom"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nom"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    {/* Phone and Address */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Téléphone (optionnel)"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Adresse (optionnel)"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Home color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    {/* Password */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mot de passe"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
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
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
                            },
                          },
                        }}
                      />
                      {formData.password && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Force du mot de passe:
                            </Typography>
                            <Typography variant="caption" color={`${getStrengthColor()}.main`} fontWeight="bold">
                              {passwordStrength <= 25 && 'Faible'}
                              {passwordStrength > 25 && passwordStrength <= 50 && 'Moyen'}
                              {passwordStrength > 50 && passwordStrength <= 75 && 'Bon'}
                              {passwordStrength > 75 && 'Excellent'}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={passwordStrength}
                            color={getStrengthColor()}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      )}
                    </Grid>

                    {/* Confirm Password */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirmer le mot de passe"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
                    sx={{
                      mt: 4,
                      py: { xs: 1.2, md: 1.5 },
                      mb: 2,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
                      boxShadow: '0 4px 14px rgba(139, 69, 19, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8B4513 0%, #5D2E0F 100%)',
                        boxShadow: '0 6px 20px rgba(139, 69, 19, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {isLoading ? 'Inscription...' : 'S\'inscrire'}
                  </Button>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      OU
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9rem' } }}>
                      Vous avez déjà un compte ?{' '}
                      <Link
                        to="/login"
                        style={{
                          color: '#8B4513',
                          textDecoration: 'none',
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#5D2E0F';
                          e.target.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#8B4513';
                          e.target.style.textDecoration = 'none';
                        }}
                      >
                        Se connecter
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

export default Register;