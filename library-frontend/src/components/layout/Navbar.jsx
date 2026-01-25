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
  Close,
  Info,
  Email,
  Dashboard as DashboardIcon,
  AutoStories
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
    { label: 'Accueil', icon: <Home fontSize="small" />, path: '/home' },
    { label: 'Livres', icon: <LibraryBooks fontSize="small" />, path: '/catalogue' },
    { label: 'Mes Emprunts', icon: <Bookmark fontSize="small" />, path: '/emprunts' },
    { label: 'Historique', icon: <History fontSize="small" />, path: '/historique' },
    { label: 'À propos', icon: <Info fontSize="small" />, path: '/about' },
    { label: 'Contact', icon: <Email fontSize="small" />, path: '/contact' },
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
    <Box onClick={handleDrawerToggle} sx={{ width: 280, bgcolor: '#78350f', height: '100%', color: '#fffbeb' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          bgcolor: '#fffbeb',
          p: 1,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(251, 191, 36, 0.3)'
        }}>
          <AutoStories sx={{ color: '#78350f', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'Georgia, serif', color: '#fffbeb' }}>
            BiblioRA
          </Typography>
          <Typography sx={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#fcd34d', opacity: 0.8 }}>
            Savoir & Tradition
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(251, 191, 36, 0.2)' }} />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => handleNavClick(item.path)}
              sx={{
                color: '#fef3c7',
                '&:hover': { bgcolor: 'rgba(251, 191, 36, 0.15)' }
              }}
            >
              <ListItemIcon sx={{ color: '#fcd34d', minWidth: 40 }}>
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
          background: '#78350f',
          borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
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
                gap: 2,
                cursor: 'pointer',
                mr: 5
              }}
              onClick={() => navigate('/home')}
            >
              <Box sx={{
                bgcolor: '#fffbeb',
                p: 1,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(251, 191, 36, 0.3)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <AutoStories sx={{ color: '#78350f', fontSize: 24 }} />
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    color: '#fffbeb',
                    letterSpacing: '0.02em',
                    lineHeight: 1
                  }}
                >
                  BiblioRA
                </Typography>
                <Typography sx={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#fcd34d',
                  opacity: 0.8,
                  mt: 0.5
                }}>
                  Savoir & Tradition
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  startIcon={item.icon}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    color: '#fef3c7',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    '&:hover': {
                      bgcolor: 'rgba(251, 191, 36, 0.15)',
                      color: '#fffbeb'
                    },
                    transition: 'all 0.2s ease'
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
                    bgcolor: 'rgba(180, 83, 9, 0.4)',
                    color: '#fef3c7',
                    '&:hover': {
                      bgcolor: 'rgba(180, 83, 9, 0.6)',
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
                      bgcolor: 'rgba(180, 83, 9, 0.4)',
                      borderRadius: 2,
                      px: 2,
                      py: 0.5,
                      minWidth: { xs: 200, sm: 300 },
                      border: '1px solid rgba(251, 191, 36, 0.2)'
                    }}
                  >
                    <Search sx={{ mr: 1, opacity: 0.7, color: '#fef3c7' }} />
                    <InputBase
                      placeholder="Rechercher..."
                      autoFocus
                      sx={{
                        color: '#fffbeb',
                        flex: 1,
                        '& ::placeholder': {
                          color: 'rgba(254, 243, 199, 0.7)'
                        }
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleSearchToggle}
                      sx={{ color: '#fef3c7', ml: 1 }}
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
                  bgcolor: 'rgba(180, 83, 9, 0.4)',
                  color: '#fef3c7',
                  '&:hover': {
                    bgcolor: 'rgba(180, 83, 9, 0.6)',
                  },
                  transition: 'all 0.2s'
                }}
              >
                <Badge
                  badgeContent={3}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#dc2626',
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
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(180, 83, 9, 0.4)',
                    borderColor: 'rgba(251, 191, 36, 0.5)',
                  },
                  transition: 'all 0.2s'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#92400e',
                    width: 38,
                    height: 38,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#fffbeb',
                    border: '2px solid #b45309'
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
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(120, 53, 15, 0.15)',
                  border: '1px solid #e7e5e4'
                }
              }}
            >
              <Box sx={{ p: 2.5, bgcolor: '#78350f', color: '#fffbeb' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: 'Georgia, serif' }}>
                  Notifications
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, color: '#fcd34d' }}>
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
                      bgcolor: '#fef3c7',
                      borderLeftColor: '#78350f'
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: '#292524' }}>
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
                    color: '#78350f',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#fef3c7' }
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
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(120, 53, 15, 0.15)',
                  border: '1px solid #e7e5e4'
                }
              }}
            >
              <Box sx={{ px: 2.5, py: 2, bgcolor: '#fef3c7' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#78350f', fontFamily: 'Georgia, serif' }}>
                  {user?.username || 'Utilisateur'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#92400e' }}>
                  {user?.email || ''}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={handleProfileClick}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  '&:hover': { bgcolor: '#fef3c7' }
                }}
              >
                <ListItemIcon>
                  <AccountCircle fontSize="small" sx={{ color: '#78350f' }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ color: '#292524' }}>Mon Profil</Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseUserMenu();
                  navigate('/dashboard');
                }}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  '&:hover': { bgcolor: '#fef3c7' }
                }}
              >
                <ListItemIcon>
                  <DashboardIcon fontSize="small" sx={{ color: '#78350f' }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ color: '#292524' }}>Tableau de Bord</Typography>
              </MenuItem>
              <MenuItem
                onClick={handleCloseUserMenu}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  '&:hover': { bgcolor: '#fef3c7' }
                }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" sx={{ color: '#78350f' }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ color: '#292524' }}>Paramètres</Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  '&:hover': { bgcolor: '#fef2f2' }
                }}
              >
                <ListItemIcon>
                  {isLoading ? (
                    <CircularProgress size={20} sx={{ color: '#dc2626' }} />
                  ) : (
                    <Logout fontSize="small" sx={{ color: '#dc2626' }} />
                  )}
                </ListItemIcon>
                <Typography variant="body2" sx={{ color: '#dc2626' }}>
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