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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  AddCircleOutline as AddIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMe, getModelsByMakeApi, getCapacitiesByMakeModelApi, setUserVehicleApi, getMakesApi } from '../utils/api';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import InteractiveMap from '../components/InteractiveMap';

const UserHomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', year: '', batteryCapacity: '', preferredChargingType: 'fast' });
  const [modelsForMake, setModelsForMake] = useState([]);
  const [makes, setMakes] = useState([]);
  const [capacitiesForModel, setCapacitiesForModel] = useState([]);
  const [capacityError, setCapacityError] = useState('');

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

  // Load available makes when dialog opens
  useEffect(() => {
    if (!vehicleDialogOpen) return;
    (async () => {
      try {
        const mk = await getMakesApi();
        setMakes(mk);
      } catch { setMakes([]); }
    })();
  }, [vehicleDialogOpen]);

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
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Greeting Block */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4 }}>
              <Avatar 
                src={user?.profileImage || undefined}
                sx={{ width: 56, height: 56, bgcolor: user?.profileImage ? 'transparent' : 'primary.main', fontSize: '1.25rem' }}
              >
                {!user?.profileImage && `${(user?.firstName || 'U')[0]}${(user?.lastName || 'N')[0]}`}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {(() => { const h=new Date().getHours(); const t=h<12?'Good morning':h<18?'Good afternoon':'Good evening'; return `${t}, ${user?.firstName || 'User'}!`; })()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Find stations, manage bookings, and keep your EV ready.
                </Typography>
              </Box>
            </Box>

            {/* User Profile Card */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={12} lg={12}>
                <Grid container spacing={3}>
                  {/* Quick Actions */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Quick Actions
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card onClick={() => navigate('/stations')} sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3, minHeight: 150 }}>
                        <LocationIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          Find Stations
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mx: 'auto' }}>
                          Locate nearby charging stations
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card onClick={() => setVehicleDialogOpen(true)} sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3, minHeight: 150 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                          <CarIcon sx={{ fontSize: 40, color: 'success.main' }} />
                          <AddIcon sx={{ position: 'absolute', right: -8, bottom: -6, fontSize: 20, color: 'success.main' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                          Add Your Vehicle
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mx: 'auto' }}>
                          Select from admin-added makes and models
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3, minHeight: 150 }}>
                        <HistoryIcon sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          Bookings
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mx: 'auto' }}>
                          View your reservations
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3, minHeight: 150 }}>
                        <PaymentIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          Payments
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mx: 'auto' }}>
                          Manage payment methods
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Nearby Charging Stations */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937', mb: 2 }}>
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
                  <Typography variant="body1" color="text.secondary">No recent activity.</Typography>
                  <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/stations')}>Book your first charge</Button>
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

      {/* Add Vehicle Dialog */}
      <Dialog open={vehicleDialogOpen} onClose={() => setVehicleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Your Vehicle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Make"
                value={vehicleForm.make}
                onChange={async (e) => {
                  const make = e.target.value;
                  setVehicleForm({ ...vehicleForm, make, model: '', batteryCapacity: '' });
                  setModelsForMake([]);
                  setCapacitiesForModel([]);
                  setCapacityError('');
                  if (make) {
                    try {
                      const models = await getModelsByMakeApi(make);
                      setModelsForMake(models);
                    } catch { setModelsForMake([]); }
                  }
                }}
                required
                helperText={makes.length === 0 ? 'No makes available' : ''}
              >
                {makes.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Model"
                value={vehicleForm.model}
                onChange={async (e) => {
                  const model = e.target.value;
                  setVehicleForm({ ...vehicleForm, model, batteryCapacity: '' });
                  setCapacityError('');
                  setCapacitiesForModel([]);
                  if (vehicleForm.make && model) {
                    try {
                      const caps = await getCapacitiesByMakeModelApi(vehicleForm.make, model);
                      setCapacitiesForModel(caps);
                    } catch { setCapacitiesForModel([]); }
                  }
                }}
                required
                helperText={!vehicleForm.make ? 'Select make first' : ''}
              >
                {modelsForMake.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                inputProps={{ min: 2015, max: 2025 }}
                value={vehicleForm.year}
                onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Battery Capacity (kWh)"
                value={vehicleForm.batteryCapacity}
                onChange={(e) => {
                  setVehicleForm({ ...vehicleForm, batteryCapacity: e.target.value });
                  setCapacityError('');
                }}
                required
                helperText={!vehicleForm.model ? 'Select model first' : capacityError}
                error={!!capacityError}
              >
                {capacitiesForModel.map((c) => (
                  <MenuItem key={c} value={String(c)}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Preferred Charging"
                value={vehicleForm.preferredChargingType}
                onChange={(e) => setVehicleForm({ ...vehicleForm, preferredChargingType: e.target.value })}
              >
                <MenuItem value="fast">Fast</MenuItem>
                <MenuItem value="slow">Slow</MenuItem>
                <MenuItem value="rapid">Rapid</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVehicleDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.batteryCapacity) {
                setCapacityError(!vehicleForm.batteryCapacity ? 'Battery capacity is required' : capacityError);
                return;
              }
            if (capacityError) return;
              try {
                await setUserVehicleApi({
                  make: vehicleForm.make.trim(),
                  model: vehicleForm.model.trim(),
                year: vehicleForm.year ? Number(vehicleForm.year) : undefined,
                batteryCapacity: Number(vehicleForm.batteryCapacity),
                  preferredChargingType: vehicleForm.preferredChargingType
                });
                const refreshed = await getMe();
                setUser(refreshed);
                setVehicleDialogOpen(false);
              } catch (e) {
                setError(e.message || 'Failed to save vehicle');
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserHomePage;







