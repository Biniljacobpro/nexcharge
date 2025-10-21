import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMe, getMyVehiclesApi } from '../utils/api';
import { useSingleStationAvailability } from '../hooks/useRealTimeAvailability';
import {
  Box,
  Container,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Avatar,
  Divider,
  Stack,
  Rating
} from '@mui/material';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import GoogleMapsDirections from '../components/GoogleMapsDirections';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EvStationIcon from '@mui/icons-material/EvStation';
import DirectionsIcon from '@mui/icons-material/Directions';
import WifiIcon from '@mui/icons-material/Wifi';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WcIcon from '@mui/icons-material/Wc';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
 

const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [myVehicles, setMyVehicles] = useState([]);
  const [catalogVehicles, setCatalogVehicles] = useState([]); // public vehicles catalog
  const [myBookings, setMyBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real-time availability for this station
  const { availability: realTimeAvailability } = useSingleStationAvailability(id, 30000);
  const [bookingDialog, setBookingDialog] = useState(false);
  
  const [bookingForm, setBookingForm] = useState({
    chargerType: '',
    duration: '2', // Default 2 hours
    startTime: null,
    endTime: null,
    selectedVehicleIndex: '', // index in myVehicles
    currentCharge: '20',
    targetCharge: '80'
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [directionsDialog, setDirectionsDialog] = useState(false);
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
  const API_ORIGIN = API_BASE.replace(/\/api$/, '');

  // Duration options in 30-minute increments up to 5 hours
  const DURATION_OPTIONS = [
    { value: '0.5', label: '30 minutes' },
    { value: '1', label: '1 hour' },
    { value: '1.5', label: '1 hour 30 minutes' },
    { value: '2', label: '2 hours' },
    { value: '2.5', label: '2 hours 30 minutes' },
    { value: '3', label: '3 hours' },
    { value: '3.5', label: '3 hours 30 minutes' },
    { value: '4', label: '4 hours' },
    { value: '4.5', label: '4 hours 30 minutes' },
    { value: '5', label: '5 hours' }
  ];

  // Enrich user vehicles with catalog connectorTypes if missing (defined early to avoid TDZ)
  const enrichedMyVehicles = React.useMemo(() => {
    if (!Array.isArray(myVehicles) || myVehicles.length === 0) return [];
    const norm = (s) => String(s || '').trim().toLowerCase();
    return myVehicles.map((v) => {
      const hasAC = v?.chargingAC?.supported && Array.isArray(v?.chargingAC?.connectorTypes) && v.chargingAC.connectorTypes.length > 0;
      const hasDC = v?.chargingDC?.supported && Array.isArray(v?.chargingDC?.connectorTypes) && v.chargingDC.connectorTypes.length > 0;
      if (hasAC || hasDC) return v;
      const match = Array.isArray(catalogVehicles) ? catalogVehicles.find(cv => norm(cv.make) === norm(v?.make) && norm(cv.model) === norm(v?.model)) : null;
      if (!match) return v;
      return {
        ...v,
        chargingAC: match.chargingAC ? {
          supported: !!match.chargingAC.supported,
          ...(typeof match.chargingAC.maxPower === 'number' ? { maxPower: match.chargingAC.maxPower } : {}),
          connectorTypes: Array.isArray(match.chargingAC.connectorTypes) ? match.chargingAC.connectorTypes.map((t) => String(t).toLowerCase()) : []
        } : v.chargingAC,
        chargingDC: match.chargingDC ? {
          supported: !!match.chargingDC.supported,
          ...(typeof match.chargingDC.maxPower === 'number' ? { maxPower: match.chargingDC.maxPower } : {}),
          connectorTypes: Array.isArray(match.chargingDC.connectorTypes) ? match.chargingDC.connectorTypes.map((t) => String(t).toLowerCase()) : []
        } : v.chargingDC,
      };
    });
  }, [myVehicles, catalogVehicles]);

  const toLocalDateTimeValue = (date) => {
    if (!date) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  // Infer best charger type for a given vehicle based on station support and availability
  const getCompatibleTypesForVehicle = (vehicle) => {
    if (!station) return [];
    const stationTypes = Array.isArray(station.capacity?.chargerTypes) ? station.capacity.chargerTypes : [];
    // Filter types that the vehicle supports using existing checkVehicleSupport logic
    const compatible = stationTypes.filter((t) => checkVehicleSupport(t, [vehicle]));
    // Sort compatible types by current availability desc
    const withAvailability = compatible.map((t) => ({
      type: t,
      available: getAvailableChargersByType(t).length
    })).sort((a, b) => b.available - a.available);
    return withAvailability.map((x) => x.type);
  };

  // Auto-select charger type when vehicle or station changes
  useEffect(() => {
    try {
      const idx = Number(bookingForm.selectedVehicleIndex);
      const v = Number.isInteger(idx) ? enrichedMyVehicles[idx] : undefined;
      if (!v) return;
      const compat = getCompatibleTypesForVehicle(v);
      if (compat && compat.length > 0) {
        if (bookingForm.chargerType !== compat[0]) {
          setBookingForm((bf) => ({ ...bf, chargerType: compat[0] }));
        }
      } else {
        // Fallback: clear if no compatible
        if (bookingForm.chargerType) {
          setBookingForm((bf) => ({ ...bf, chargerType: '' }));
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingForm.selectedVehicleIndex, enrichedMyVehicles, station]);

  const getMinStartTime = () => {
    return toLocalDateTimeValue(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes from now
  };

  const handleStartTimeChange = (value) => {
    const start = value ? new Date(value) : null;
    
    // Validate that start time is at least 10 minutes from now
    if (start) {
      const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
      if (start < tenMinutesFromNow) {
        setSnackbar({ open: true, message: 'Start time must be at least 10 minutes from now', severity: 'error' });
        return;
      }
    }
    
    let computedEnd = null;
    if (start) {
      // Calculate end time based on selected duration
      const durationHours = parseFloat(bookingForm.duration);
      const startMs = start.getTime();
      const endMs = startMs + (durationHours * 60 * 60 * 1000);
      computedEnd = new Date(endMs);
    }
    setBookingForm({ ...bookingForm, startTime: value, endTime: computedEnd ? toLocalDateTimeValue(computedEnd) : '' });
  };

  const handleDurationChange = (duration) => {
    setBookingForm({ ...bookingForm, duration });
    // Recalculate end time if start time is set
    if (bookingForm.startTime) {
      const start = new Date(bookingForm.startTime);
      const durationHours = parseFloat(duration);
      const startMs = start.getTime();
      const endMs = startMs + (durationHours * 60 * 60 * 1000);
      const computedEnd = new Date(endMs);
      setBookingForm(prev => ({ ...prev, endTime: toLocalDateTimeValue(computedEnd) }));
    }
  };

  const loadMyVehicles = async () => {
    try {
      const list = await getMyVehiclesApi().catch(() => []);
      setMyVehicles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error loading my vehicles:', err);
      setMyVehicles([]);
    }
  };

  const loadCatalogVehicles = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
      const res = await fetch(`${apiBase}/public/vehicles`);
      if (!res.ok) throw new Error('Failed to load vehicle catalog');
      const data = await res.json();
      setCatalogVehicles(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      console.error(e);
      setCatalogVehicles([]);
    }
  };

  const loadMyBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setMyBookings([]); return; }
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
      const res = await fetch(`${apiBase}/bookings/my-bookings?limit=5&_=${Date.now()}` , { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) setMyBookings(Array.isArray(data.data) ? data.data : []);
    } catch (e) { console.error('Failed to load bookings', e); }
  };

  // Mapping between station charger types and vehicle connector types (new unified types)
  const chargerTypeToConnectorTypeMap = {
    'type1': ['type1'],
    'type2': ['type2'],
    'bharat_ac_001': ['bharat_ac_001', 'type2'],
    'bharat_dc_001': ['bharat_dc_001'],
    'ccs2': ['ccs2'],
    'chademo': ['chademo'],
    'gbt_type6': ['gbt_type6'],
    'type7_leccs': ['type7_leccs'],
    'mcs': ['mcs'],
    'chaoji': ['chaoji']
  };

  

  // Function to check if any user vehicle supports a specific charger type
  const checkVehicleSupport = (chargerType, vehicles) => {
    // If no vehicles, return false
    if (!vehicles || vehicles.length === 0) {
      return false;
    }
    
    // Get the connector types that match this charger type
    const key = String(chargerType || '').trim().toLowerCase();
    const supportedConnectorTypes = chargerTypeToConnectorTypeMap[key] || [];
    
    // Check if any vehicle supports any of these connector types
    return vehicles.some(vehicle => {
      // Check AC charging support
      if (vehicle.chargingAC && vehicle.chargingAC.supported) {
        if (vehicle.chargingAC.connectorTypes && 
            vehicle.chargingAC.connectorTypes.some(type => supportedConnectorTypes.includes(String(type).toLowerCase()))) {
          return true;
        }
      }
      
      // Check DC charging support
      if (vehicle.chargingDC && vehicle.chargingDC.supported) {
        if (vehicle.chargingDC.connectorTypes && 
            vehicle.chargingDC.connectorTypes.some(type => supportedConnectorTypes.includes(String(type).toLowerCase()))) {
          return true;
        }
      }
      
      return false;
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
        const [stationRes, userRes] = await Promise.all([
          fetch(`${apiBase}/public/stations/${id}`),
          getMe().catch(() => null)
        ]);
        
        if (!stationRes.ok) throw new Error(`Failed to load station: ${stationRes.status}`);
        const stationData = await stationRes.json();
        setStation(stationData?.data);

        // Load user's vehicles and catalog vehicles
        await Promise.all([loadMyVehicles(), loadCatalogVehicles(), loadMyBookings()]);

        if (userRes) {
          setUser(userRes);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        <AnimatedBackground />
        <UserNavbar user={user} />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const handleBookingSubmit = async () => {
    if (!bookingForm.chargerType || !bookingForm.startTime || !bookingForm.endTime || bookingForm.selectedVehicleIndex === '') {
      setSnackbar({ open: true, message: 'Please fill all required fields including vehicle selection', severity: 'error' });
      return;
    }
    
    // Validate that start time is at least 10 minutes from now
    const startTime = new Date(bookingForm.startTime);
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
    if (startTime < tenMinutesFromNow) {
      setSnackbar({ open: true, message: 'Start time must be at least 10 minutes from now', severity: 'error' });
      return;
    }
    
    // Validate charge fields (use defaults if not provided since they're hidden)
    const curr = Number(bookingForm.currentCharge || 20);
    const targ = Number(bookingForm.targetCharge || 80);
    if (Number.isNaN(curr) || Number.isNaN(targ) || curr < 0 || curr > 100 || targ < 0 || targ > 100 || curr >= targ) {
      setSnackbar({ open: true, message: 'Invalid charge levels detected. Please try again.', severity: 'error' });
      return;
    }

    // Map selected user vehicle to catalog vehicle ID (by make+model)
    const idx = Number(bookingForm.selectedVehicleIndex);
    const sel = myVehicles[idx];
    const norm = (s) => String(s || '').trim().toLowerCase();
    const catalogMatch = catalogVehicles.find(cv => norm(cv.make) === norm(sel?.make) && norm(cv.model) === norm(sel?.model));
    if (!catalogMatch?._id) {
      setSnackbar({ open: true, message: 'Selected vehicle not found in catalog. Please contact support.', severity: 'error' });
      return;
    }

    setBookingLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
      
      const requestBody = {
        stationId: id,
        chargerType: bookingForm.chargerType,
        startTime: new Date(bookingForm.startTime).toISOString(),
        endTime: new Date(bookingForm.endTime).toISOString(),
        vehicleId: catalogMatch._id,
        currentCharge: curr,
        targetCharge: targ
      };

      console.log('Creating payment order:', requestBody);

      // Create Razorpay order instead of direct booking
      const response = await fetch(`${apiBase}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Payment order response:', result);
      
      if (result.success) {
        // Initialize Razorpay payment
        const options = {
          key: result.data.keyId,
          amount: result.data.amount,
          currency: result.data.currency,
          name: 'NexCharge',
          description: `Charging at ${result.data.stationName}`,
          order_id: result.data.orderId,
          handler: async function (response) {
            console.log('Payment successful:', response);
            await handlePaymentSuccess(response, result.data.bookingId);
          },
          prefill: {
            name: user?.personalInfo?.firstName + ' ' + user?.personalInfo?.lastName,
            email: user?.personalInfo?.email,
            contact: user?.personalInfo?.phone
          },
          theme: {
            color: '#1976d2'
          },
          modal: {
            ondismiss: function() {
              console.log('Payment cancelled by user');
              setSnackbar({ open: true, message: 'Payment cancelled', severity: 'warning' });
              setBookingLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const errorMsg = result.message || `Failed to create payment order (${response.status})`;
        console.error('Payment order failed:', errorMsg, result);
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
        setBookingLoading(false);
      }
    } catch (err) {
      console.error('Payment order error:', err);
      const errorMsg = err?.message || 'Network error creating payment order';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse, bookingId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

      console.log('Verifying payment:', paymentResponse);

      const verifyResponse = await fetch(`${apiBase}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          bookingId: bookingId
        })
      });

      const verifyResult = await verifyResponse.json();
      console.log('Payment verification response:', verifyResult);

      if (verifyResult.success) {
        setSnackbar({ open: true, message: 'Payment successful! Booking confirmed.', severity: 'success' });
        setBookingDialog(false);
        // Refresh recent bookings list
        loadMyBookings();
        // Refresh station details to reflect updated availability
        try {
          const stationRes = await fetch(`${API_BASE}/public/stations/${id}`, { cache: 'no-store' });
          if (stationRes.ok) {
            const stationBody = await stationRes.json();
            if (stationBody?.data) setStation(stationBody.data);
          }
        } catch (_) {}
      } else {
        setSnackbar({ open: true, message: verifyResult.message || 'Payment verification failed', severity: 'error' });
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setSnackbar({ open: true, message: 'Payment verification failed', severity: 'error' });
    } finally {
      setBookingLoading(false);
    }
  };

  // Calculate available chargers by type - use real-time availability data
  const getAvailableChargersByType = (type) => {
    // Use real-time availability data if available
    if (realTimeAvailability?.availabilityByType?.[type]) {
      const typeData = realTimeAvailability.availabilityByType[type];
      return Array.from({ length: typeData.available }, (_, i) => ({
        chargerId: `realtime-${type}-${i}`,
        type: type,
        power: station?.capacity?.maxPowerPerCharger || 50,
        isAvailable: true
      }));
    }
    
    // Fallback to static data
    const availableChargers = station?.capacity?.availableChargers || [];
    const chargersOfType = availableChargers.filter(c => c.type === type);
    
    // If we have individual charger data, use it
    if (chargersOfType.length > 0) {
      return chargersOfType;
    }
    
    // Otherwise, if the station has this charger type, assume some are available
    const hasChargerType = station?.capacity?.chargerTypes?.includes(type);
    const totalAvailable = realTimeAvailability?.availableSlots ?? station?.capacity?.availableSlots ?? 0;
    if (hasChargerType && totalAvailable > 0) {
      // Return a mock array with available slots count
      return Array.from({ length: Math.min(totalAvailable, 5) }, (_, i) => ({
        chargerId: `mock-${type}-${i}`,
        type: type,
        power: station?.capacity?.maxPowerPerCharger || 50,
        isAvailable: true
      }));
    }
    
    return [];
  };

  if (error || !station) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        <AnimatedBackground />
        <UserNavbar user={user} />
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography color="error" sx={{ mb: 2 }}>{error || 'Station not found'}</Typography>
          <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>Back</Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <AnimatedBackground />
      <UserNavbar user={user} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="text"
            color="inherit"
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Map
          </Button>
          {station.operational?.status === 'maintenance' && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              🚧 This station is currently under maintenance. Booking is temporarily unavailable.
            </Alert>
          )}
        </Box>

        {/* Enhanced Hero Section */}
        <Card sx={{
          mb: 4,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          position: 'relative'
        }}>
          <Box sx={{
            p: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }
          }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    mr: 3,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <EvStationIcon sx={{ fontSize: 48 }} />
                  </Box>
                  <Box>
                    <Typography variant="h2" sx={{
                      fontWeight: 800,
                      mb: 1,
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      letterSpacing: '-0.025em'
                    }}>
                      {station.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOnIcon sx={{ mr: 1.5, fontSize: 20 }} />
                      <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1.1rem' }}>
                        {station.location?.address}, {station.location?.city}, {station.location?.state} {station.location?.pincode}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={4.5} readOnly precision={0.5} sx={{ color: '#fbbf24', mr: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>4.5 (128 reviews)</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ mr: 1, fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {station.operational?.operatingHours?.is24Hours ? '🟢 24/7 Open' : '🕐 Limited Hours'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{
                  textAlign: { xs: 'left', md: 'right' },
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Chip
                    label={station.operational?.status === 'maintenance' 
                      ? '🚧 Under maintenance' 
                      : (() => {
                          const available = realTimeAvailability?.availableSlots ?? station.capacity?.availableSlots ?? 0;
                          return available > 0 ? `⚡ ${available} Available` : '🚫 Full';
                        })()}
                    color={station.operational?.status === 'maintenance' 
                      ? 'warning' 
                      : (() => {
                          const available = realTimeAvailability?.availableSlots ?? station.capacity?.availableSlots ?? 0;
                          return available > 0 ? 'success' : 'error';
                        })()}
                    variant="filled"
                    sx={{
                      fontSize: '1rem',
                      py: 1.5,
                      px: 3,
                      mb: 3,
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Typography variant="h3" sx={{
                    fontWeight: 800,
                    mb: 1,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    ₹{station.pricing?.pricePerMinute ?? station.pricing?.basePrice ?? 0}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    per minute
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Left Column - Chargers and Amenities */}
          <Grid item xs={12} lg={8}>
            {/* Available Chargers Overview */}
            <Card sx={{ mb: 4, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <EvStationIcon sx={{ mr: 1 }} />
                  Charging Overview
                </Typography>

                {/* Enhanced Status Overview */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                    📊 Station Overview
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        border: '1px solid #e5e7eb',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                          {station.capacity?.totalChargers ?? 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Total Chargers
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: (() => {
                          const available = realTimeAvailability?.availableSlots ?? station.capacity?.availableSlots ?? 0;
                          return available > 0 ? '#f0fdf4' : '#fef2f2';
                        })(),
                        border: (() => {
                          const available = realTimeAvailability?.availableSlots ?? station.capacity?.availableSlots ?? 0;
                          return `1px solid ${available > 0 ? '#10b981' : '#dc2626'}`;
                        })(),
                        textAlign: 'center'
                      }}>
                        <Typography variant="h5" sx={{
                          fontWeight: 700,
                          color: (() => {
                            const available = realTimeAvailability?.availableSlots ?? station.capacity?.availableSlots ?? 0;
                            return available > 0 ? '#10b981' : '#dc2626';
                          })(),
                          mb: 0.5
                        }}>
                          {realTimeAvailability?.availableSlots ?? station.capacity?.availableSlots ?? 0}
                        </Typography>
                        <Typography variant="caption" sx={{
                          fontWeight: 500,
                          color: (() => {
                            const available = realTimeAvailability?.availableSlots ?? station.capacity?.availableSlots ?? 0;
                            return available > 0 ? '#059669' : '#b91c1c';
                          })()
                        }}>
                          Available Now
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0ea5e9', mb: 0.5 }}>
                          {station.capacity?.maxPowerPerCharger ?? 0}
                        </Typography>
                        <Typography variant="caption" color="#0369a1" sx={{ fontWeight: 500 }}>
                          Max Power (kW)
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: '#fef3c7',
                        border: '1px solid #f59e0b',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#92400e', mb: 0.5 }}>
                          {station.capacity?.totalPowerCapacity ?? 0}
                        </Typography>
                        <Typography variant="caption" color="#78350f" sx={{ fontWeight: 500 }}>
                          Total Capacity (kW)
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Charger Types Grid */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1f2937' }}>
                  Available Connector Types
                </Typography>
                <Grid container spacing={3}>
                  {(station.capacity?.chargerTypes || []).map((type, idx) => {
                    const available = getAvailableChargersByType(type);
                    const power = available[0]?.power || station.capacity?.maxPowerPerCharger || 50;
                    const isAvailable = available.length > 0;
                    
                    // Check if any user vehicle supports this charger type
                    const userHasCompatibleVehicle = checkVehicleSupport(type, enrichedMyVehicles);
                    const showNotSupported = !userHasCompatibleVehicle && myVehicles && myVehicles.length > 0;

                    return (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card sx={{
                          border: `2px solid ${isAvailable ? '#10b981' : '#f3f4f6'}`,
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          background: isAvailable ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' : '#fafafa',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            borderColor: isAvailable ? '#059669' : '#667eea'
                          }
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Avatar sx={{
                              bgcolor: isAvailable ? '#10b981' : '#dc2626',
                              width: 64,
                              height: 64,
                              mx: 'auto',
                              mb: 2,
                              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                            }}>
                              <EvStationIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1f2937' }}>
                              {type.replace('_', ' ').toUpperCase()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                              Power Output
                            </Typography>
                            <Typography variant="h4" sx={{
                              fontWeight: 800,
                              color: isAvailable ? '#10b981' : '#6b7280',
                              mb: 2,
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                              {power} kW
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center', flexDirection: 'column' }}>
                              <Chip
                                label={isAvailable ? `${available.length} Available` : 'Not Available'}
                                color={isAvailable ? "success" : "error"}
                                variant={isAvailable ? "filled" : "outlined"}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  '& .MuiChip-label': { fontSize: '0.8rem' }
                                }}
                              />
                              {isAvailable && !showNotSupported && (
                                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                                  ✓ Ready to charge
                                </Typography>
                              )}
                              {showNotSupported && (
                                <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                                  ⚠️ Not supported by your vehicles
                                </Typography>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>

            {/* Amenities Section */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1f2937' }}>
                  Amenities & Facilities
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Additional services available at this station
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { icon: <LocalParkingIcon />, label: 'Free Parking', available: station.operational?.parkingSlots > 0, description: `${station.operational?.parkingSlots || 0} spots` },
                    { icon: <WifiIcon />, label: 'Wi-Fi', available: true, description: 'High-speed internet' },
                    { icon: <RestaurantIcon />, label: 'Food & Drinks', available: false, description: 'Coming soon' },
                    { icon: <WcIcon />, label: 'Restrooms', available: true, description: 'Clean facilities' },
                  ].map((amenity, idx) => (
                    <Grid item xs={6} sm={3} key={idx}>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: amenity.available ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' : '#fafafa',
                        border: `2px solid ${amenity.available ? '#10b981' : '#e5e7eb'}`,
                        transition: 'all 0.3s ease',
                        cursor: amenity.available ? 'default' : 'not-allowed',
                        '&:hover': amenity.available ? {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.15)',
                          borderColor: '#059669'
                        } : {}
                      }}>
                        <Box sx={{
                          color: amenity.available ? '#10b981' : '#9ca3af',
                          mb: 1.5,
                          fontSize: '2rem'
                        }}>
                          {amenity.icon}
                        </Box>
                        <Typography variant="body2" sx={{
                          textAlign: 'center',
                          fontWeight: 600,
                          color: amenity.available ? '#1f2937' : '#6b7280',
                          mb: 0.5
                        }}>
                          {amenity.label}
                        </Typography>
                        <Typography variant="caption" sx={{
                          textAlign: 'center',
                          color: amenity.available ? '#059669' : '#9ca3af',
                          fontWeight: 500
                        }}>
                          {amenity.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Pricing and Booking */}
          <Grid item xs={12} lg={4}>
            {/* Pricing Card */}
            <Card sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1f2937' }}>
                  💰 Pricing & Booking
                </Typography>
                {station.operational?.status === 'maintenance' && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#fff7ed', borderRadius: 2, border: '1px solid #f59e0b' }}>
                    <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 600 }}>
                      This station is under maintenance. Booking is disabled.
                    </Typography>
                  </Box>
                )}

                {/* Price Highlight Box */}
                <Box sx={{
                  mb: 3,
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '2px solid #0ea5e9',
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Base Rate
                  </Typography>
                  <Typography variant="h3" sx={{
                    fontWeight: 800,
                    color: '#0ea5e9',
                    mb: 1,
                    textShadow: '0 2px 4px rgba(14, 165, 233, 0.2)'
                  }}>
                    ₹{station.pricing?.pricePerMinute ?? station.pricing?.basePrice ?? 0}
                  </Typography>
                  <Typography variant="body1" color="#0369a1" sx={{ fontWeight: 600 }}>
                    per minute
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                    Operating Hours
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ color: '#10b981', fontSize: 18 }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {station.operational?.operatingHours?.is24Hours ?
                        '🟢 Open 24/7' :
                        `🕐 ${station.operational?.operatingHours?.customHours?.start || '00:00'} - ${station.operational?.operatingHours?.customHours?.end || '23:59'}`
                      }
                    </Typography>
                  </Box>
                </Box>

                {station.pricing?.cancellationPolicy && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#fef3c7', borderRadius: 2, border: '1px solid #f59e0b' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#92400e', mb: 1 }}>
                      📋 Cancellation Policy
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#78350f' }}>
                      {station.pricing.cancellationPolicy}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Quick Actions */}
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<DirectionsIcon />}
                    onClick={() => setDirectionsDialog(true)}
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      borderColor: '#667eea',
                      color: '#667eea',
                      '&:hover': {
                        borderColor: '#5a67d8',
                        bgcolor: '#f0f4ff',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                      }
                    }}
                  >
                    🗺️ Get Directions
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setBookingDialog(true)}
                    disabled={station.operational?.status !== 'active' || station.capacity?.availableSlots === 0}
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: station.operational?.status === 'maintenance'
                        ? '#f59e0b'
                        : (station.capacity?.availableSlots === 0
                          ? '#dc2626'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
                      '&:hover': {
                        background: station.operational?.status === 'maintenance'
                          ? '#d97706'
                          : (station.capacity?.availableSlots === 0
                            ? '#b91c1c'
                            : 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'),
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                      },
                      '&:disabled': {
                        background: station.operational?.status === 'maintenance' ? '#f59e0b' : '#dc2626',
                        color: 'white'
                      }
                    }}
                  >
                    {station.operational?.status === 'maintenance'
                      ? '🚧 Under maintenance'
                      : (station.capacity?.availableSlots === 0 ? '🚫 Station Full' : '⚡ Book Now')}
                  </Button>
                </Stack>

                {/* Additional Info */}
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.85rem' }}>
                    💡 Book ahead to secure your charging slot and avoid wait times
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* My Recent Bookings */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1f2937' }}>
                  My Recent Bookings
                </Typography>
                {(!myBookings || myBookings.length === 0) ? (
                  <Typography variant="body2" color="text.secondary">No recent bookings.</Typography>
                ) : (
                  <Stack spacing={1.5}>
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
                        <Box key={b._id} sx={{ p: 1.5, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {b.stationId?.name || 'Station'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {start.toLocaleString()} → {end.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip size="small" color={chipColor} label={label} />
                              {isUpcoming && !isCancelled && (
                                <Button size="small" variant="outlined" onClick={() => navigate('/home')}>Edit</Button>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* Station Photos Section */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1f2937' }}>
                  Station Photos & Gallery
                </Typography>
                <Grid container spacing={2}>
                  {/* Main photo or placeholder */}
                  <Grid item xs={12} md={8}>
                    {station.images && station.images.length > 0 ? (
                      <Box sx={{
                        height: 320,
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb'
                      }}>
                        <img
                          alt="station-main"
                          src={`${API_ORIGIN}${station.images[0]}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{
                        height: 240,
                        bgcolor: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px dashed #9ca3af',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        }
                      }}>
                        <EvStationIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                        <Typography variant="h6" color="#6b7280" sx={{ fontWeight: 600, mb: 1 }}>
                          Station Gallery
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 2 }}>
                          High-quality photos of charging bays, facilities, and surroundings coming soon
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  {/* Thumbnails or placeholders */}
                  <Grid item xs={12} md={4}>
                    {station.images && station.images.length > 1 ? (
                      <Stack spacing={2}>
                        {station.images.slice(1, 4).map((u, idx) => (
                          <Box key={idx} sx={{ height: 96, borderRadius: 2, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                            <img alt={`thumb-${idx}`} src={`${API_ORIGIN}${u}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Stack spacing={2}>
                        {[1, 2, 3].map((i) => (
                          <Box key={i} sx={{
                            height: 70,
                            bgcolor: '#f9fafb',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px dashed #e5e7eb',
                            transition: 'all 0.3s ease',
                            '&:hover': { bgcolor: '#f3f4f6', borderColor: '#667eea' }
                          }}>
                            <Typography variant="caption" color="text.secondary">
                              Photo {i}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Grid>
                </Grid>

                
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Booking Dialog */}
        <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Book Charging Slot</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel shrink>Charger Type</InputLabel>
                  <Box sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 1,
                    px: 2,
                    py: 1.5,
                    color: bookingForm.chargerType ? 'text.primary' : 'text.secondary'
                  }}>
                    {bookingForm.chargerType
                      ? bookingForm.chargerType.replace('_',' ').toUpperCase()
                      : 'Auto-selected based on your vehicle'}
                  </Box>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    value={bookingForm.duration}
                    label="Duration"
                    onChange={(e) => handleDurationChange(e.target.value)}
                  >
                    {DURATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ 
                    min: getMinStartTime()
                  }}
                  value={bookingForm.startTime || ''}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  value={bookingForm.endTime || ''}
                  required
                />
              </Grid>
              
              {/* estimated Total */}
              <Grid item xs={12}>
                <Box sx={{ mt: 0.5, p: 2, borderRadius: 2, bgcolor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                    estimated Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0ea5e9' }}>
                    {(() => {
                      const ppm = Number(station?.pricing?.pricePerMinute ?? station?.pricing?.basePrice ?? 0);
                      const mins = Math.round((Number(bookingForm.duration || 0)) * 60);
                      const total = ppm * (Number.isFinite(mins) ? mins : 0);
                      return `₹${(Number.isFinite(total) ? total : 0).toFixed(2)}`;
                    })()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(() => {
                      const ppm = Number(station?.pricing?.pricePerMinute ?? station?.pricing?.basePrice ?? 0);
                      const mins = Math.round((Number(bookingForm.duration || 0)) * 60);
                      return `₹${ppm}/minute × ${mins} minutes`;
                    })()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Vehicle Selection (for charging optimization)
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Your Vehicle</InputLabel>
                  <Select
                    value={bookingForm.selectedVehicleIndex}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      selectedVehicleIndex: e.target.value
                    })}
                    label="Select Your Vehicle"
                  >
                    {myVehicles.length === 0 ? (
                      <MenuItem value="" disabled>
                        No vehicles found
                      </MenuItem>
                    ) : (
                      myVehicles.map((v, idx) => (
                        <MenuItem key={`${v.make}-${v.model}-${idx}`} value={String(idx)}>
                          {`${v.make || ''} ${v.model || ''}`.trim()} {v.year ? `(${v.year})` : ''} {v.batteryCapacity ? `- ${v.batteryCapacity} kWh` : ''}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                {myVehicles.length === 0 && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => {
                      localStorage.setItem('openAddVehicle', '1');
                      navigate('/home');
                    }}>
                      Add Vehicle
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                      You need to add a vehicle before booking
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                {/* Hidden from UI: current charge is assumed for optimization */}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                {/* Hidden from UI: target charge is assumed for optimization */}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleBookingSubmit} 
              variant="contained" 
              disabled={bookingLoading}
            >
              {bookingLoading ? 'Processing...' : 'Pay & Book Now'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({...snackbar, open: false})}
        >
          <Alert 
            onClose={() => setSnackbar({...snackbar, open: false})} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        
        {/* Google Maps Directions Dialog */}
        <GoogleMapsDirections
          open={directionsDialog}
          onClose={() => setDirectionsDialog(false)}
          destination={station ? {
            lat: station.location?.coordinates?.latitude,
            lng: station.location?.coordinates?.longitude
          } : null}
          stationName={station?.name}
        />
        </Container>
        <Footer />
      </Box>
  );
};

export default StationDetails;


