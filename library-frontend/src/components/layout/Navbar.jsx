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
  Settings,
  Logout,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const { user, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Accueil', icon: <Home fontSize="small" />, path: '/dashboard' },
    { label: 'Catalogue', icon: <LibraryBooks fontSize="small" />, path: '/catalogue' },
    { label: 'Mes Emprunts', icon: <Bookmark fontSize="small" />, path: '/emprunts' },
    { label: 'Historique', icon: <History fontSize="small" />, path: '/historique' },
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

  const handleProfileClick = () => {
    handleCloseUserMenu();
    navigate('/profile');
  };

  const getUserInitials = () => {
    if (!user?.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250, bgcolor: '#3D5467', height: '100%', color: 'white' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LibraryBooks />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          BiblioRA
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton 
              onClick={() => handleNavClick(item.path)}
              sx={{ 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #3D5467 0%, #536D82 100%)',
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

            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                cursor: 'pointer',
                mr: 5
              }}
              onClick={() => navigate('/dashboard')}
            >
              <LibraryBooks sx={{ fontSize: 32 }} />
              <Typography
                variant="h5"
                sx={{ 
                  fontWeight: 700,
                  display: { xs: 'none', sm: 'block' },
                  letterSpacing: '-0.5px'
                }}
              >
                BiblioRA
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  startIcon={item.icon}
                  onClick={() => handleNavClick(item.path)}
                  sx={{ 
                    color: 'white',
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

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
                      bgcolor: '#E74C3C',
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
                    bgcolor: '#7F8C8D',
                    width: 38,
                    height: 38,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>
            </Box>

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
              <Box sx={{ p: 2.5, bgcolor: '#3D5467', color: 'white' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Notifications
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
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
                      bgcolor: '#f8f9fa',
                      borderLeftColor: '#3D5467'
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                      {notif.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
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
                    color: '#3D5467',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#f8f9fa' }
                  }}
                >
                  Voir toutes les notifications
                </Button>
              </Box>
            </Menu>

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
              <Box sx={{ px: 2.5, py: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#3D5467' }}>
                  {user?.username || 'Utilisateur'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || ''}
                </Typography>
              </Box>
              <Divider />
              <MenuItem 
                onClick={handleProfileClick}
                sx={{ 
                  py: 1.5, 
                  px: 2.5,
                  '&:hover': { bgcolor: '#f8f9fa' }
                }}
              >
                <ListItemIcon>
                  <AccountCircle fontSize="small" sx={{ color: '#3D5467' }} />
                </ListItemIcon>
                <Typography variant="body2">Mon Profil</Typography>
              </MenuItem>
              <MenuItem 
                onClick={handleCloseUserMenu} 
                sx={{ 
                  py: 1.5, 
                  px: 2.5,
                  '&:hover': { bgcolor: '#f8f9fa' }
                }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" sx={{ color: '#3D5467' }} />
                </ListItemIcon>
                <Typography variant="body2">Paramètres</Typography>
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={handleLogout} 
                disabled={isLoading}
                sx={{ 
                  py: 1.5, 
                  px: 2.5,
                  '&:hover': { bgcolor: '#ffebee' }
                }}
              >
                <ListItemIcon>
                  {isLoading ? (
                    <CircularProgress size={20} color="error" />
                  ) : (
                    <Logout fontSize="small" color="error" />
                  )}
                </ListItemIcon>
                <Typography variant="body2" color="error">
                  {isLoading ? 'Déconnexion...' : 'Déconnexion'}
                </Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;