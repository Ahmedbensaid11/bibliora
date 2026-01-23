import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar'; // You'll need to create this
import Footer from './Footer';

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <AdminNavbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          bgcolor: '#f8f9fa',
          pt: { xs: 8, sm: 9, md: 10 },
          pb: 4,
          width: '100%'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;