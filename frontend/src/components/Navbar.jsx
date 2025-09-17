import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import nexchargeLogo from '../assets/nexcharge-high-resolution-logo-transparent.png';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #f3f4f6',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <img
              src={nexchargeLogo}
              alt="NexCharge"
              style={{
                height: '52px',
                width: 'auto',
              }}
            />
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                minWidth: isMobile ? 60 : 80,
                fontSize: isMobile ? '0.875rem' : '1rem',
                borderColor: '#00D4AA',
                color: '#00D4AA',
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 170, 0.05)',
                  borderColor: '#009B7A',
                },
              }}
            >
              {isMobile ? 'Login' : 'Login'}
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/signup')}
              sx={{
                minWidth: isMobile ? 60 : 80,
                fontSize: isMobile ? '0.875rem' : '1rem',
                background: '#00D4AA',
                '&:hover': {
                  background: '#009B7A',
                },
              }}
            >
              {isMobile ? 'Signup' : 'Sign Up'}
            </Button>
          </Box>
        </motion.div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
