import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        mt: 'auto',
        background: '#f9fafb',
        borderTop: '1px solid #f3f4f6',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: { xs: 'center', sm: 'left' } }}
            >
              © NexCharge 2025. All rights reserved.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
              }}
            >
              <Link
                href="#"
                color="text.secondary"
                underline="hover"
                sx={{
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                color="text.secondary"
                underline="hover"
                sx={{
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                Terms of Service
              </Link>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Footer;
