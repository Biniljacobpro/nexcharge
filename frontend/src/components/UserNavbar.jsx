import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Container,
  Chip
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import nexchargeLogo from '../assets/nexcharge-high-resolution-logo-transparent.png';

const UserNavbar = ({ user }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleHome = () => {
    handleClose();
    navigate('/home');
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 } }}>
          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/home')}>
              <img 
                src={nexchargeLogo} 
                alt="NexCharge" 
                style={{ height: '40px', marginRight: '12px' }}
              />
              {/* <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1f2937',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                NexCharge
              </Typography> */}
            </Box>
          </motion.div>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button 
              color="inherit" 
              sx={{ color: '#1f2937', fontWeight: 500 }}
              onClick={() => navigate('/home')}
              startIcon={<HomeIcon />}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              sx={{ color: '#1f2937', fontWeight: 500 }}
            >
              Stations
            </Button>
            <Button 
              color="inherit" 
              sx={{ color: '#1f2937', fontWeight: 500 }}
            >
              Bookings
            </Button>
            <Button 
              color="inherit" 
              sx={{ color: '#1f2937', fontWeight: 500 }}
            >
              Support
            </Button>
          </Box>

          {/* User Profile Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* User Info */}
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 500 }}>
                  Welcome, {user?.firstName || 'User'}
                </Typography>
                <Chip 
                  label={user?.role || 'User'} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>

              {/* User Avatar and Menu */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={user?.profileImage || undefined}
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: user?.profileImage ? 'transparent' : 'primary.main',
                    cursor: 'pointer',
                    border: '2px solid rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={handleMenu}
                >
                  {!user?.profileImage && initials}
                </Avatar>
                <IconButton
                  size="small"
                  onClick={handleMenu}
                  sx={{ color: '#1f2937', ml: 0.5 }}
                >
                  <ArrowDownIcon />
                </IconButton>
              </Box>

              {/* User Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    borderRadius: 2
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleHome} sx={{ py: 1.5 }}>
                  <HomeIcon sx={{ mr: 2, fontSize: 20 }} />
                  <Typography variant="body2">Home</Typography>
                </MenuItem>
                <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                  <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
                  <Typography variant="body2">Profile Settings</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                  <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
                  <Typography variant="body2">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </motion.div>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default UserNavbar;

