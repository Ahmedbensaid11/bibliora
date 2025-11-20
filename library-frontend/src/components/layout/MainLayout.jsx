import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          bgcolor: '#f5f5f5',
          pt: { xs: 8, sm: 9, md: 10 },
          pb: 4,
          width: '100%'
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
