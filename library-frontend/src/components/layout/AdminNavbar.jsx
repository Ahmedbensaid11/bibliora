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
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Container,
  Badge,
  InputBase,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  LibraryBooks,
  People,
  Bookmark,
  BarChart,
  Settings,
  Notifications,
  Search,
  AccountCircle,
  Logout,
  Close,
  AdminPanelSettings,
  Home,
  Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const { user, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const adminNavItems = [
    { label: 'Tableau de bord', icon: <Dashboard fontSize="small" />, path: '/admin/dashboard' },
    { label: 'Livres', icon: <LibraryBooks fontSize="small" />, path: '/admin/books' },
    { label: 'Utilisateurs', icon: <People fontSize="small" />, path: '/admin/users' },
    { label: 'Prêts', icon: <Bookmark fontSize="small" />, path: '/admin/loans' },
    { label: 'Rapports', icon: <BarChart fontSize="small" />, path: '/admin/reports' },
    { label: 'Paramètres', icon: <Settings fontSize="small" />, path: '/admin/settings' },
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

  const handleSwitchToUser = () => {
    handleCloseUserMenu();
    navigate('/dashboard');
  };

  const getUserInitials = () => {
    if (!user?.username) return 'A';
    return user.username.charAt(0).toUpperCase();
  };

  const drawer = (
    <Box sx={{ width: 280, bgcolor: '#1a237e', height: '100%', color: 'white' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            bgcolor: '#fff',
            p: 1,
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <AdminPanelSettings sx={{ fontSize: 28, color: '#1a237e' }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Admin Panel
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Gestion Bibliothèque
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {adminNavItems.map((item) => (
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
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleSwitchToUser}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <Home fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Vue utilisateur" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
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

            {/* Admin Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                cursor: 'pointer',
                mr: 5,
                '&:hover .logo-icon': {
                  transform: 'scale(1.05)',
                }
              }}
              onClick={() => navigate('/admin/dashboard')}
            >
              <Box
                className="logo-icon"
                sx={{
                  bgcolor: '#fff',
                  p: 1,
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.3s ease'
                }}
              >
                <AdminPanelSettings sx={{ fontSize: 28, color: '#1a237e' }} />
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
                <Typography
                  variant="h5"
                  sx={{ 
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                  }}
                >
                  Admin BiblioTech
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.625rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    opacity: 0.8,
                  }}
                >
                  Administration
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {adminNavItems.slice(0, 4).map((item) => (
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
                    },
                    transition: 'all 0.3s'
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
                    }
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
                      minWidth: 300
                    }}
                  >
                    <Search sx={{ mr: 1, opacity: 0.7 }} />
                    <InputBase
                      placeholder="Rechercher dans l'admin..."
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
                onClick={handleOpenUserMenu} 
                sx={{ 
                  p: 0.5,
                  ml: 0.5,
                  border: '2px solid rgba(255,255,255,0.2)',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.4)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: '#3949ab',
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
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                sx: { 
                  width: 280, 
                  mt: 1.5,
                  borderRadius: 3,
                }
              }}
            >
              <Box sx={{ px: 2.5, py: 2, bgcolor: '#f5f5f5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#1a237e' }}>
                    <AdminPanelSettings />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {user?.username || 'Administrateur'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.roles?.includes('ROLE_ADMIN') ? 'Administrateur' : 'Employé'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider />
              <MenuItem 
                onClick={handleProfileClick}
                sx={{ py: 1.5, px: 2.5 }}
              >
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">Mon Profil</Typography>
              </MenuItem>
              <MenuItem 
                onClick={handleSwitchToUser}
                sx={{ py: 1.5, px: 2.5 }}
              >
                <ListItemIcon>
                  <Home fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">Vue utilisateur</Typography>
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default AdminNavbar;