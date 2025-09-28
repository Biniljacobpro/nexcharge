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
  Skeleton,
  Tooltip,
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
import { getMe, getModelsByMakeApi, getCapacitiesByMakeModelApi, getMakesApi, getMyVehiclesApi, addUserVehicleApi, removeUserVehicleApi, updateUserVehicleAtIndexApi, updateBookingApi, cancelBookingApi } from '../utils/api';
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
  const [yearError, setYearError] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [myVehicles, setMyVehicles] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [editBookingDialogOpen, setEditBookingDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({ startTime: '', duration: '60', chargerType: 'ac_type2' });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getMe();
        if (profile.role === 'admin') {
          navigate('/admin');
          return;
        }
        setUser(profile);

        // Fire vehicles fetch in background
        (async () => {
          try {
            setVehiclesLoading(true);
            const list = await getMyVehiclesApi();
            setMyVehicles(Array.isArray(list) ? list : []);
          } catch {
            setMyVehicles([]);
          } finally {
            setVehiclesLoading(false);
          }
        })();

        // Fire bookings fetch in background
        (async () => {
          try {
            setBookingsLoading(true);
            const token = localStorage.getItem('accessToken');
            if (token) {
              const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
              const res = await fetch(`${apiBase}/bookings/my-bookings?limit=5&_=${Date.now()}` , { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
              const data = await res.json();
              if (res.ok && data.success) setMyBookings(Array.isArray(data.data) ? data.data : []);
              else setMyBookings([]);
            } else {
              setMyBookings([]);
            }
          } catch (e) {
            // ignore booking load errors in dashboard
          } finally {
            setBookingsLoading(false);
          }
        })();

        // If redirected here to add a vehicle from StationDetails
        const flag = localStorage.getItem('openAddVehicle');
        if (flag === '1') {
          setVehicleDialogOpen(true);
          localStorage.removeItem('openAddVehicle');
        }
      } catch (e) {
        setError(e.message);
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        // We can render the page while lists load (skeletons will show)
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
            {/* Hero / Greeting */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 5 }}>
              <Avatar
                src={user?.profileImage || undefined}
                sx={{ width: 60, height: 60, bgcolor: user?.profileImage ? 'transparent' : 'primary.main', fontSize: '1.25rem', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
              >
                {!user?.profileImage && `${(user?.firstName || 'U')[0]}${(user?.lastName || 'N')[0]}`}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: -0.2 }}>
                  {(() => { const h=new Date().getHours(); const t=h<12?'Good morning':h<18?'Good afternoon':'Good evening'; return `${t}, ${user?.firstName || 'User'}!`; })()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Find stations, manage bookings, and keep your EV ready.
                </Typography>
              </Box>
            </Box>

            {/* Next Booking Widget */}
            <Box sx={{ mb: 4 }}>
              {bookingsLoading ? (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Skeleton variant="text" width={180} height={24} />
                  <Skeleton variant="text" width={280} height={18} />
                  <Skeleton variant="rectangular" height={36} sx={{ mt: 1, borderRadius: 1 }} />
                </Paper>
              ) : (() => {
                const now = new Date();
                const upcoming = (myBookings || [])
                  .filter(b => (b.status !== 'cancelled' && b.status !== 'completed') && new Date(b.startTime) > now)
                  .sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
                const next = upcoming[0];
                if (!next) return null;
                const start = new Date(next.startTime);
                const end = new Date(next.endTime);
                const canCancel = (start.getTime() - Date.now()) >= 2*60*60*1000;
                return (
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={7}>
                        <Typography variant="subtitle2" color="text.secondary">Next Booking</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{next.stationId?.name || 'Station'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {start.toLocaleString()} → {end.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={5} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                        <Chip size="small" color="primary" label="upcoming" />
                        <Button size="small" variant="outlined" onClick={() => {
                          setEditingBooking(next);
                          setEditForm({
                            startTime: new Date(next.startTime).toISOString().slice(0,16),
                            duration: String(Math.max(30, Math.round((new Date(next.endTime) - new Date(next.startTime)) / (1000*60)))) ,
                            chargerType: next.chargerType || 'ac_type2'
                          });
                          setEditBookingDialogOpen(true);
                        }}>Edit</Button>
                        {canCancel && (
                          <Tooltip title="Cancellations are allowed up to 2 hours before the start time">
                            <Button size="small" color="error" variant="outlined" onClick={async () => {
                              const ok = window.confirm('Are you sure you want to cancel this booking? The slot will be made available again.');
                              if (!ok) return;
                              try {
                                await cancelBookingApi(next._id, 'User requested');
                                // refresh bookings
                                const token = localStorage.getItem('accessToken');
                                if (token) {
                                  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
                                  const res = await fetch(`${apiBase}/bookings/my-bookings?limit=5&_=${Date.now()}` , { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
                                  const data = await res.json();
                                  if (res.ok && data.success) setMyBookings(Array.isArray(data.data) ? data.data : []);
                                  else setMyBookings([]);
                                }
                              } catch (e) {
                                alert(e.message || 'Failed to cancel booking');
                              }
                            }}>Cancel</Button>
                          </Tooltip>
                        )}
                        <Button size="small" onClick={() => navigate('/bookings')}>View all</Button>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })()}
            </Box>

            {/* User Profile Card */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={12} lg={12}>
                <Grid container spacing={3}>
                  {/* Quick Actions */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        Quick Actions
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card onClick={() => navigate('/stations')} sx={{ height: '100%', borderRadius: 3, boxShadow: '0 6px 24px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(0,0,0,0.12)' } }}>
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
                    <Card onClick={() => setVehicleDialogOpen(true)} sx={{ height: '100%', borderRadius: 3, boxShadow: '0 6px 24px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(0,0,0,0.12)' } }}>
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
                    <Card onClick={() => navigate('/bookings')} sx={{ height: '100%', borderRadius: 3, boxShadow: '0 6px 24px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(0,0,0,0.12)' } }}>
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
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 6px 24px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(0,0,0,0.12)' } }}>
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
            <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 6, borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Recent Activity
                  </Typography>
                  <Button size="small" onClick={() => navigate('/bookings')}>View all</Button>
                </Box>
                {(!myBookings || myBookings.length === 0) ? (
                  bookingsLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[1,2,3].map(k => (
                        <Paper key={k} variant="outlined" sx={{ p: 2 }}>
                          <Skeleton variant="text" width={220} height={20} />
                          <Skeleton variant="text" width={300} height={16} />
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">No recent bookings.</Typography>
                      <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/stations')}>Book your first charge</Button>
                    </Box>
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {myBookings.map((b) => {
                      const now = new Date();
                      const start = new Date(b.startTime);
                      const end = new Date(b.endTime);
                      const isPast = end < now;
                      const isUpcoming = start > now;
                      const isCancelled = b.status === 'cancelled';
                      const isCompleted = b.status === 'completed';
                      const label = isCancelled ? 'cancelled' : (isCompleted ? 'completed' : (isPast ? 'past' : (isUpcoming ? 'upcoming' : 'ongoing')));
                      const chipColor = isCancelled ? 'error' : (isCompleted ? 'default' : (isPast ? 'default' : (isUpcoming ? 'primary' : 'success')));
                      return (
                        <Paper key={b._id} variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {b.stationId?.name || 'Station'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {start.toLocaleString()} → {end.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip size="small" color={chipColor} label={label} />
                              {isUpcoming && !isCancelled && (
                                <Button size="small" variant="outlined" onClick={() => {
                                  setEditingBooking(b);
                                  setEditForm({
                                    startTime: new Date(b.startTime).toISOString().slice(0,16),
                                    duration: String(Math.max(30, Math.round((new Date(b.endTime) - new Date(b.startTime)) / (1000*60)))),
                                    chargerType: b.chargerType || 'ac_type2'
                                  });
                                  setEditBookingDialogOpen(true);
                                }}>Edit</Button>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mt: 4, borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Your Vehicles
                  </Typography>
                  <Button variant="outlined" onClick={() => setVehicleDialogOpen(true)}>Add Vehicle</Button>
                </Box>
                {myVehicles.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No vehicles added yet.</Typography>
                ) : (
                  <Grid container spacing={3}>
                    {myVehicles.map((vehicle, index) => (
                      <Grid item xs={12} sm={6} md={4} key={`${vehicle.make}-${vehicle.model}-${index}`}>
                        <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <CarIcon sx={{ color: 'primary.main' }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {vehicle.make} {vehicle.model}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {vehicle.year || ''}
                              </Typography>
                            </Box>
                            <Button size="small" sx={{ mr: 1 }} onClick={() => {
                              setEditIndex(index);
                              setVehicleDialogOpen(true);
                              setVehicleForm({
                                make: vehicle.make || '',
                                model: vehicle.model || '',
                                year: vehicle.year ? String(vehicle.year) : '',
                                batteryCapacity: vehicle.batteryCapacity ? String(vehicle.batteryCapacity) : '',
                                preferredChargingType: vehicle.preferredChargingType || 'fast'
                              });
                            }}>Edit</Button>
                            <Button size="small" color="error" onClick={async () => {
                              try {
                                const list = await removeUserVehicleApi(index);
                                setMyVehicles(list);
                              } catch (e) {
                                setError(e.message || 'Failed to remove vehicle');
                              }
                            }}>Remove</Button>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Battery: {vehicle.batteryCapacity} kWh
                          </Typography>
                          {vehicle.preferredChargingType && (
                            <Typography variant="body2" color="text.secondary">Preferred: {vehicle.preferredChargingType}</Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>

            
          </motion.div>
        </Container>
      </Box>

      <Footer />

      {/* Add Vehicle Dialog */}
      <Dialog open={vehicleDialogOpen} onClose={() => { setVehicleDialogOpen(false); setEditIndex(null); }} maxWidth="sm" fullWidth>
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
                  setDuplicateError('');
                  setYearError('');
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
                  setDuplicateError('');
                  setYearError('');
                  setCapacitiesForModel([]);
                  if (vehicleForm.make && model) {
                    try {
                      const caps = await getCapacitiesByMakeModelApi(vehicleForm.make, model);
                      setCapacitiesForModel(caps);
                    } catch { setCapacitiesForModel([]); }
                  }
                }}
                required
                helperText={!vehicleForm.make ? 'Select make first' : (duplicateError || '')}
                error={!!duplicateError}
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
                inputProps={{ min: 2015, max: new Date().getFullYear() }}
                value={vehicleForm.year}
                onChange={(e) => { setVehicleForm({ ...vehicleForm, year: e.target.value }); setYearError(''); setDuplicateError(''); }}
                helperText={yearError || ((vehicleForm.year && (Number(vehicleForm.year) < 2015 || Number(vehicleForm.year) > new Date().getFullYear())) ? `Enter a year between 2015 and ${new Date().getFullYear()}` : '')}
                error={!!yearError || (!!vehicleForm.year && (Number(vehicleForm.year) < 2015 || Number(vehicleForm.year) > new Date().getFullYear()))}
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
                  setDuplicateError('');
                  setYearError('');
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
          <Button onClick={() => { setVehicleDialogOpen(false); setEditIndex(null); setCapacityError(''); setYearError(''); setDuplicateError(''); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setCapacityError(''); setYearError(''); setDuplicateError('');
              if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.batteryCapacity) {
                setCapacityError(!vehicleForm.batteryCapacity ? 'Battery capacity is required' : capacityError);
                return;
              }
            if (capacityError) return;
            // Inline duplicate validation (case-insensitive, trim)
            const norm = (s) => String(s || '').trim().toLowerCase();
            const make = vehicleForm.make.trim();
            const model = vehicleForm.model.trim();
            const year = vehicleForm.year ? Number(vehicleForm.year) : undefined;
            const batteryCapacity = Number(vehicleForm.batteryCapacity);
            const dup = myVehicles.some((v, i) => (editIndex === null || i !== editIndex) &&
              norm(v.make) === norm(make) &&
              norm(v.model) === norm(model) &&
              (v.year || undefined) === year &&
              Number(v.batteryCapacity) === batteryCapacity
            );
            if (dup) {
              setDuplicateError('Vehicle with same details already exists');
              return;
            }
            // Year bounds
            if (year && (year < 2015 || year > new Date().getFullYear())) {
              setYearError(`Enter a year between 2015 and ${new Date().getFullYear()}`);
              return;
            }
              try {
                let list;
                if (editIndex !== null) {
                  list = await updateUserVehicleAtIndexApi(editIndex, {
                    make,
                    model,
                    year,
                    batteryCapacity,
                    preferredChargingType: vehicleForm.preferredChargingType
                  });
                } else {
                  list = await addUserVehicleApi({
                    make,
                    model,
                    year,
                    batteryCapacity,
                    preferredChargingType: vehicleForm.preferredChargingType
                  });
                }
                setMyVehicles(Array.isArray(list) ? list : []);
                setVehicleDialogOpen(false);
                setEditIndex(null);
                setCapacityError(''); setYearError(''); setDuplicateError('');
              } catch (e) {
                setError(e.message || 'Failed to save vehicle');
              }
            }}
          >
            {editIndex !== null ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={editBookingDialogOpen} onClose={() => { setEditBookingDialogOpen(false); setEditingBooking(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                value={editForm.startTime}
                onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Duration (minutes)"
                value={editForm.duration}
                onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
              >
                {[30,60,90,120,150,180,210,240,270,300].map((m) => (
                  <MenuItem key={m} value={String(m)}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Charger Type"
                value={editForm.chargerType}
                onChange={(e) => setEditForm({ ...editForm, chargerType: e.target.value })}
              >
                {['ac_type2','dc_ccs','dc_chademo','dc_gbt','ac_3pin'].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditBookingDialogOpen(false); setEditingBooking(null); }}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!editingBooking) return;
            const startISO = new Date(editForm.startTime).toISOString();
            const endISO = new Date(new Date(editForm.startTime).getTime() + Number(editForm.duration) * 60000).toISOString();
            try {
              await updateBookingApi(editingBooking._id, {
                startTime: startISO,
                endTime: endISO,
                chargerType: editForm.chargerType
              });
              // refresh list
              const token = localStorage.getItem('accessToken');
              if (token) {
                const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
                const res = await fetch(`${apiBase}/bookings/my-bookings?limit=5&_=${Date.now()}` , { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
                const data = await res.json();
                if (res.ok && data.success) setMyBookings(Array.isArray(data.data) ? data.data : []);
              }
              setEditBookingDialogOpen(false);
              setEditingBooking(null);
            } catch (e) {
              alert(e.message || 'Failed to update booking');
            }
          }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserHomePage;







