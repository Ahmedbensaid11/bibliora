// src/components/Navbar.jsx - WITH ORIGINAL COLORS
import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Badge, 
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Container,
  InputBase,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  LibraryBooks,
  Bookmark,
  History,
  Notifications,
  Search,
  AccountCircle,
  Logout,
  Close,
  MenuBook,
  Dashboard,
  People,
  BarChart,
  Group,
  LocalLibrary,
  AdminPanelSettings,
  KeyboardArrowDown
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

// Design System Constants
const designSystem = {
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
    borderRadius: '2px',
    border: '1px solid #e7e5e4',
    transition: 'all 0.3s ease',
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

// Original colors from the first navbar version
const originalColors = {
  primary: '#8B4513', // SaddleBrown
  secondary: '#A0522D', // Sienna
  highlight: '#D2691E', // Chocolate
  admin: '#FFD700', // Gold
  light: '#FFF8F0' // FloralWhite
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [anchorElAdmin, setAnchorElAdmin] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const { user, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_EMPLOYEE');
  
  const userNavItems = [
    { label: 'Accueil', icon: <Home fontSize="small" />, path: '/dashboard' },
    { label: 'Catalogue', icon: <LibraryBooks fontSize="small" />, path: '/catalogue' },
    { label: 'Mes Emprunts', icon: <Bookmark fontSize="small" />, path: '/emprunts' },
    { label: 'Historique', icon: <History fontSize="small" />, path: '/historique' },
  ];

  const adminMenuItems = [
    { label: 'Dashboard Admin', icon: <Dashboard fontSize="small" />, path: '/admin/dashboard' },
    { label: 'Gestion Livres', icon: <LocalLibrary fontSize="small" />, path: '/admin/books' },
    { label: 'Gestion Utilisateurs', icon: <Group fontSize="small" />, path: '/admin/users' },
    { label: 'Gestion Prêts', icon: <Bookmark fontSize="small" />, path: '/admin/loans' },
    { label: 'Rapports', icon: <BarChart fontSize="small" />, path: '/admin/reports' }
  ];

  const notifications = [
    { id: 1, text: 'Votre emprunt expire dans 2 jours', time: '2h' },
    { id: 2, text: 'Nouveau livre disponible', time: '5h' },
    { id: 3, text: 'Retour accepté avec succès', time: '1j' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifMenu = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleCloseNotifMenu = () => {
    setAnchorElNotif(null);
  };

  const handleOpenAdminMenu = (event) => {
    setAnchorElAdmin(event.currentTarget);
  };

  const handleCloseAdminMenu = () => {
    setAnchorElAdmin(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleCloseUserMenu();
      navigate('/login');
    } catch (error) {
      handleCloseUserMenu();
      navigate('/login');
    }
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleAdminNavClick = (path) => {
    navigate(path);
    handleCloseAdminMenu();
    setMobileOpen(false);
  };

  const handleProfileClick = () => {
    handleCloseUserMenu();
    navigate('/profile');
  };

  const getUserInitials = () => {
    if (!user?.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ 
      width: 250, 
      bgcolor: originalColors.primary, 
      height: '100%', 
      color: 'white' 
    }}>
      {/* Logo in drawer */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            bgcolor: originalColors.light,
            p: 1,
            borderRadius: '50%',
            border: '2px solid rgba(255, 248, 240, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <MenuBook sx={{ fontSize: 24, color: originalColors.primary }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            fontFamily: 'serif', 
            letterSpacing: '0.5px' 
          }}>
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
          {isAdmin && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.625rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: originalColors.admin,
                fontWeight: 'bold',
                mt: 0.5
              }}
            >
              MODE ADMIN
            </Typography>
          )}
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      
      {/* User Navigation */}
      <List>
        {userNavItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton 
              onClick={() => handleNavClick(item.path)}
              sx={{ 
                color: 'white',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderLeft: `3px solid ${originalColors.admin}`
                },
                borderLeft: '3px solid transparent',
                transition: 'all 0.3s ease'
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                sx={{ 
                  '& .MuiTypography-root': {
                    fontFamily: designSystem.typography.button.fontFamily,
                    fontWeight: designSystem.typography.button.fontWeight
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Admin Navigation in Drawer */}
      {isAdmin && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" sx={{ 
              color: originalColors.admin, 
              fontWeight: 'bold', 
              letterSpacing: '1px' 
            }}>
              ADMINISTRATION
            </Typography>
          </Box>
          <List>
            {adminMenuItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton 
                  onClick={() => handleNavClick(item.path)}
                  sx={{ 
                    color: 'white',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 215, 0, 0.1)',
                      borderLeft: `3px solid ${originalColors.admin}`
                    },
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ListItemIcon sx={{ color: originalColors.admin, minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    sx={{ 
                      '& .MuiTypography-root': {
                        fontFamily: designSystem.typography.button.fontFamily,
                        fontWeight: designSystem.typography.button.fontWeight
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: `linear-gradient(135deg, ${originalColors.primary} 0%, ${originalColors.secondary} 100%)`,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          left: 0,
          right: 0,
          top: 0,
          borderRadius: 0
        }}
      >
        <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 70 } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                cursor: 'pointer',
                mr: 5,
                '&:hover .logo-icon': {
                  transform: 'scale(1.05)',
                },
                '&:hover .logo-text': {
                  color: 'rgba(255, 248, 240, 0.9)',
                }
              }}
              onClick={() => navigate('/dashboard')}
            >
              <Box
                className="logo-icon"
                sx={{
                  bgcolor: originalColors.light,
                  p: 1,
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 248, 240, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <MenuBook sx={{ fontSize: 28, color: originalColors.primary }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  className="logo-text"
                  variant="h5"
                  sx={{ 
                    fontWeight: 700,
                    display: { xs: 'none', sm: 'block' },
                    letterSpacing: '0.5px',
                    fontFamily: 'serif',
                    transition: 'color 0.3s ease',
                    lineHeight: 1.2
                  }}
                >
                  BiblioTech
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.625rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: 'rgba(255, 248, 240, 0.8)',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Savoir & Tradition
                </Typography>
                {isAdmin && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.6rem',
                      color: originalColors.admin,
                      fontWeight: 'bold',
                      display: { xs: 'none', sm: 'block' },
                      mt: 0.2
                    }}
                  >
                    • ADMINISTRATEUR •
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Navigation Items */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {userNavItems.map((item) => (
                <Button
                  key={item.label}
                  startIcon={item.icon}
                  onClick={() => handleNavClick(item.path)}
                  sx={{ 
                    color: 'white',
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    fontFamily: designSystem.typography.button.fontFamily,
                    fontWeight: designSystem.typography.button.fontWeight,
                    textTransform: designSystem.typography.button.textTransform,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: designSystem.shadows.cardHover
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Admin Dropdown Button */}
              {isAdmin && (
                <Button
                  startIcon={<AdminPanelSettings />}
                  endIcon={<KeyboardArrowDown />}
                  onClick={handleOpenAdminMenu}
                  sx={{ 
                    color: originalColors.admin,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    fontFamily: designSystem.typography.button.fontFamily,
                    fontWeight: 600,
                    textTransform: designSystem.typography.button.textTransform,
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 215, 0, 0.2)',
                      borderColor: 'rgba(255, 215, 0, 0.5)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Admin
                </Button>
              )}
            </Box>

            {/* Admin Dropdown Menu */}
            <Menu
              anchorEl={anchorElAdmin}
              open={Boolean(anchorElAdmin)}
              onClose={handleCloseAdminMenu}
              PaperProps={{
                sx: { 
                  width: 280, 
                  mt: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: `1px solid rgba(139, 69, 19, 0.1)`
                }
              }}
            >
              <Box sx={{ 
                px: 2.5, 
                py: 2, 
                bgcolor: originalColors.primary, 
                color: 'white' 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminPanelSettings />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Georgia, serif' }} fontWeight="bold">
                      Administration
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'Georgia, serif' }}>
                      Gestion de la bibliothèque
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider />
              {adminMenuItems.map((item) => (
                <MenuItem 
                  key={item.label}
                  onClick={() => handleAdminNavClick(item.path)}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    borderLeft: '3px solid transparent',
                    '&:hover': { 
                      bgcolor: originalColors.light,
                      borderLeftColor: originalColors.primary
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: originalColors.primary }}>
                    {item.icon}
                  </ListItemIcon>
                  <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }} fontWeight="500">
                    {item.label}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>

            {/* Right side icons */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {!searchOpen ? (
                <IconButton 
                  color="inherit"
                  onClick={handleSearchToggle}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <Search />
                </IconButton>
              ) : (
                <Fade in={searchOpen}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      borderRadius: 3,
                      px: 2,
                      py: 0.5,
                      minWidth: { xs: 200, sm: 300 }
                    }}
                  >
                    <Search sx={{ mr: 1, opacity: 0.7 }} />
                    <InputBase
                      placeholder="Rechercher..."
                      autoFocus
                      sx={{ 
                        color: 'white',
                        flex: 1,
                        fontFamily: 'Georgia, serif',
                        '& ::placeholder': {
                          color: 'rgba(255,255,255,0.7)'
                        }
                      }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={handleSearchToggle}
                      sx={{ color: 'white', ml: 1 }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </Fade>
              )}

              <IconButton 
                color="inherit" 
                onClick={handleOpenNotifMenu}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <Badge 
                  badgeContent={3} 
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#E74C3C', // Keeping original red
                      color: 'white',
                      fontWeight: 600
                    }
                  }}
                >
                  <Notifications />
                </Badge>
              </IconButton>

              <IconButton 
                onClick={handleOpenUserMenu} 
                sx={{ 
                  p: 0.5,
                  ml: 0.5,
                  border: '2px solid rgba(255,255,255,0.2)',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.4)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: isAdmin ? originalColors.admin : originalColors.highlight,
                    width: 38,
                    height: 38,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: isAdmin ? originalColors.primary : 'white',
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>
            </Box>

            {/* Notifications Menu */}
            <Menu
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={handleCloseNotifMenu}
              PaperProps={{
                sx: { 
                  width: 360, 
                  maxHeight: 450,
                  mt: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }
              }}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: originalColors.primary, 
                color: 'white' 
              }}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Georgia, serif' }} fontWeight="bold">
                  Notifications
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'Georgia, serif' }}>
                  Vous avez 3 nouvelles notifications
                </Typography>
              </Box>
              <Divider />
              {notifications.map((notif) => (
                <MenuItem 
                  key={notif.id} 
                  onClick={handleCloseNotifMenu}
                  sx={{
                    py: 2,
                    px: 2.5,
                    borderLeft: '3px solid transparent',
                    '&:hover': { 
                      bgcolor: originalColors.light,
                      borderLeftColor: originalColors.primary
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ 
                      mb: 0.5, 
                      fontWeight: 500,
                      fontFamily: 'Georgia, serif',
                      color: designSystem.colors.text.primary
                    }}>
                      {notif.text}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: designSystem.colors.text.muted,
                      fontFamily: 'Georgia, serif'
                    }}>
                      Il y a {notif.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
              <Divider />
              <Box sx={{ p: 1.5, textAlign: 'center' }}>
                <Button 
                  size="small" 
                  sx={{ 
                    color: originalColors.primary,
                    fontFamily: 'Georgia, serif',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: originalColors.light }
                  }}
                >
                  Voir toutes les notifications
                </Button>
              </Box>
            </Menu>

            {/* User Menu */}
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                sx: { 
                  width: 240, 
                  mt: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }
              }}
            >
              <Box sx={{ 
                px: 2.5, 
                py: 2, 
                bgcolor: originalColors.light 
              }}>
                <Typography variant="subtitle2" sx={{ 
                  fontFamily: 'Georgia, serif',
                  fontWeight: 'bold', 
                  color: originalColors.primary 
                }}>
                  {user?.username || 'Utilisateur'}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: designSystem.colors.text.secondary,
                  fontFamily: 'Georgia, serif'
                }}>
                  {user?.email || ''}
                </Typography>
                {isAdmin && (
                  <Typography variant="caption" sx={{ 
                    color: '#B8860B', // Original gold color
                    fontFamily: 'Georgia, serif',
                    fontWeight: 'bold', 
                    display: 'block', 
                    mt: 0.5 
                  }}>
                    ⭐ Administrateur
                  </Typography>
                )}
              </Box>
              <Divider />
              <MenuItem 
                onClick={handleProfileClick}
                sx={{ 
                  py: 1.5, 
                  px: 2.5,
                  '&:hover': { bgcolor: originalColors.light }
                }}
              >
                <ListItemIcon>
                  <AccountCircle fontSize="small" sx={{ color: originalColors.primary }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>
                  Mon Profil
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={handleLogout} 
                disabled={isLoading}
                sx={{ 
                  py: 1.5, 
                  px: 2.5,
                  '&:hover': { 
                    bgcolor: '#ffebee' // Original light red hover
                  }
                }}
              >
                <ListItemIcon>
                  {isLoading ? (
                    <CircularProgress size={20} sx={{ color: designSystem.colors.status.unavailable.text }} />
                  ) : (
                    <Logout fontSize="small" color="error" />
                  )}
                </ListItemIcon>
                <Typography variant="body2" sx={{ 
                  color: designSystem.colors.status.unavailable.text,
                  fontFamily: 'Georgia, serif'
                }}>
                  {isLoading ? 'Déconnexion...' : 'Déconnexion'}
                </Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250 
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;