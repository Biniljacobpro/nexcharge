import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  BatteryChargingFull as BatteryIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMe } from '../utils/api';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import InteractiveMap from '../components/InteractiveMap';

const UserHomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getMe();
        if (profile.role === 'admin') {
          navigate('/admin');
          return;
        }
        setUser(profile);
      } catch (e) {
        setError(e.message);
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper sx={{ p: 3, maxWidth: 400 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Error</Typography>
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          <Typography variant="body2" color="text.secondary">Redirecting to login...</Typography>
        </Paper>
      </Box>
    );
  }

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <AnimatedBackground />
      <UserNavbar user={user} />

      <Box component="main" sx={{ flex: 1, py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Welcome Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937', mb: 2 }}>
                Welcome back, {user?.firstName || 'User'}! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Ready to power your EV journey? Find nearby charging stations, manage your bookings, and track your battery health.
              </Typography>
            </Box>

            {/* User Profile Card */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Avatar 
                      src={user?.profileImage || undefined}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        bgcolor: user?.profileImage ? 'transparent' : 'primary.main', 
                        fontSize: '3rem',
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      {!user?.profileImage && initials}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {user?.email}
                    </Typography>
                    <Chip 
                      label={user?.role || 'User'} 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<SettingsIcon />}
                        size="small"
                        onClick={() => navigate('/profile')}
                      >
                        Profile
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<LogoutIcon />}
                        size="small"
                        onClick={handleLogout}
                        color="error"
                      >
                        Logout
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  {/* Quick Actions */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Quick Actions
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <LocationIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          Find Stations
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Locate nearby charging stations
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <BatteryIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          Battery Health
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Monitor battery status
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <HistoryIcon sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          Bookings
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          View your reservations
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <PaymentIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          Payments
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Manage payment methods
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Interactive Map Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 3, textAlign: 'center' }}>
                Nearby Charging Stations
              </Typography>
              <InteractiveMap />
            </Box>

            {/* Recent Activity */}
            <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 6 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Activity
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No recent activity to show
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Start using NexCharge to see your activity here
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            {user?.roleSpecificData?.evUser?.vehicles && user.roleSpecificData.evUser.vehicles.length > 0 && (
              <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Your Vehicles
                  </Typography>
                  <Grid container spacing={3}>
                    {user.roleSpecificData.evUser.vehicles.map((vehicle, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper sx={{ p: 3, border: '1px solid #e5e7eb' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <CarIcon sx={{ color: 'primary.main' }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {vehicle.make} {vehicle.model}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {vehicle.year}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Battery: {vehicle.batteryCapacity} kWh
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default UserHomePage;







