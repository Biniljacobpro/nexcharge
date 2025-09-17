import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import RouteIcon from '@mui/icons-material/Route';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import Lottie from 'lottie-react';
import greenEnergyAnimation from '../assets/animations/greenEnergyAnimation.json';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const features = [
    {
      icon: RouteIcon,
      title: 'AI Route Planner',
      description: 'Intelligent route optimization for efficient charging stops.',
    },
    {
      icon: ScheduleIcon,
      title: 'Smart Booking',
      description: 'Reserve charging stations in advance with real-time availability.',
    },
    {
      icon: BatteryChargingFullIcon,
      title: 'Battery Health',
      description: 'Monitor and optimize your EV battery performance.',
    },
    {
      icon: LocationOnIcon,
      title: 'Station Finder',
      description: 'Find nearby charging stations with detailed information.',
    },
    {
      icon: SpeedIcon,
      title: 'Fast Charging',
      description: 'Access to high-speed charging networks.',
    },
    {
      icon: SecurityIcon,
      title: 'Secure Payments',
      description: 'Safe and encrypted payment processing.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero Section */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          pt: { xs: 6, md: 8 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    mb: 3,
                    textAlign: { xs: 'center', md: 'left' },
                    color: '#1f2937',
                    fontWeight: 700,
                  }}
                >
                  Power Your Future with Clean Energy
                </Typography>
                
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{
                    mb: 4,
                    textAlign: { xs: 'center', md: 'left' },
                    lineHeight: 1.6,
                    fontWeight: 400,
                    maxWidth: '500px',
                  }}
                >
                  AI-powered, intelligent, and sustainable charging ecosystem that revolutionizes your EV experience.
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/signup')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      background: '#00D4AA',
                      '&:hover': {
                        background: '#009B7A',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderColor: '#00D4AA',
                      color: '#00D4AA',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 212, 170, 0.05)',
                        borderColor: '#009B7A',
                      },
                    }}
                  >
                    Learn More
                  </Button>

                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: { xs: 300, md: 400 },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 250, md: 320 },
                      height: { xs: 250, md: 320 },
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Lottie
                      animationData={greenEnergyAnimation}
                      loop
                      autoplay
                      style={{ width: '85%', height: '85%' }}
                    />
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>


      {/* Features Section */}
      <Box sx={{ py: 8, background: '#f9fafb' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              textAlign="center"
              sx={{ mb: 6, color: '#1f2937' }}
            >
              Why Choose NexCharge?
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Grid item xs={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        textAlign: 'center',
                        p: 3,
                        background: '#ffffff',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          transition: 'transform 0.3s ease',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              background: 'rgba(0, 212, 170, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconComponent
                              sx={{
                                fontSize: 28,
                                color: '#00D4AA',
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: '0.875rem' }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, background: '#ffffff' }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h2"
                sx={{ 
                  mb: 3, 
                  color: '#1f2937',
                  fontWeight: 700,
                }}
              >
                Start Charging Smarter Today
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ 
                  mb: 4,
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Join thousands of EV drivers who are already experiencing the future of sustainable transportation.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  background: '#00D4AA',
                  '&:hover': {
                    background: '#009B7A',
                  },
                }}
              >
                Get Started Now
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default LandingPage;
