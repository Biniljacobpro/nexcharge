import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Chip, 
  Paper, 
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
  Snackbar
} from '@mui/material';
 

const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingDialog, setBookingDialog] = useState(false);
  const ALL_CHARGER_TYPES = ['ac_type2', 'dc_ccs', 'dc_chademo', 'dc_gbt', 'ac_3pin'];
  
  const [bookingForm, setBookingForm] = useState({
    chargerType: '',
    startTime: null,
    endTime: null,
    vehicleInfo: {
      make: '',
      model: '',
      year: '',
      batteryCapacity: '',
      currentCharge: '',
      targetCharge: ''
    },
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

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

  const nowLocalValue = toLocalDateTimeValue(new Date());

  const handleStartTimeChange = (value) => {
    const start = value ? new Date(value) : null;
    let computedEnd = null;
    if (start) {
      // Enforce future start and fixed 2-hour duration
      const startMs = start.getTime();
      const endMs = startMs + 2 * 60 * 60 * 1000;
      computedEnd = new Date(endMs);
    }
    setBookingForm({ ...bookingForm, startTime: value, endTime: computedEnd ? toLocalDateTimeValue(computedEnd) : '' });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
        const res = await fetch(`${apiBase}/public/stations/${id}`);
        if (!res.ok) throw new Error(`Failed to load station: ${res.status}`);
        const body = await res.json();
        setStation(body?.data);
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
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleBookingSubmit = async () => {
    if (!bookingForm.chargerType || !bookingForm.startTime || !bookingForm.endTime) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    setBookingLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
      
      const response = await fetch(`${apiBase}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stationId: id,
          chargerType: bookingForm.chargerType,
          startTime: new Date(bookingForm.startTime).toISOString(),
          endTime: new Date(bookingForm.endTime).toISOString(),
          vehicleInfo: bookingForm.vehicleInfo,
          notes: bookingForm.notes
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSnackbar({ open: true, message: 'Booking created successfully!', severity: 'success' });
        setBookingDialog(false);
        // Refresh station data
        window.location.reload();
      } else {
        setSnackbar({ open: true, message: result.message || 'Failed to create booking', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error creating booking', severity: 'error' });
    } finally {
      setBookingLoading(false);
    }
  };

  const getAvailableChargersByType = (type) => {
    return station?.capacity?.availableChargers?.filter(c => c.type === type) || [];
  };

  if (error || !station) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography color="error" sx={{ mb: 2 }}>{error || 'Station not found'}</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>Go back</Button>
      </Container>
    );
  }

  return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{station.name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {station.address}, {station.city}, {station.state} {station.pincode}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => setBookingDialog(true)}
            disabled={station.capacity?.availableSlots === 0}
          >
            Book Now
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Available Chargers</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={`Total chargers: ${station.capacity?.totalChargers ?? 0}`} />
                <Chip 
                  label={`Available: ${station.capacity?.availableSlots ?? 0}`} 
                  color={station.capacity?.availableSlots > 0 ? "success" : "error"}
                  variant="filled"
                />
                <Chip label={`Max power: ${station.capacity?.maxPowerPerCharger ?? 0} kW`} />
                <Chip label={`Total capacity: ${station.capacity?.totalPowerCapacity ?? 0} kW`} />
              </Box>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Available Charger Types</Typography>
              <Grid container spacing={2}>
                {(station.capacity?.chargerTypes || []).map((type, idx) => {
                  const available = getAvailableChargersByType(type);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          {type.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Available: {available.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Power: {available[0]?.power || station.capacity?.maxPowerPerCharger} kW
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Pricing</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Model:</strong> {station.pricing?.model}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Base price:</strong> ₹{station.pricing?.basePrice ?? 0}/kWh
              </Typography>
              {station.pricing?.cancellationPolicy && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <strong>Cancellation Policy:</strong><br />
                  {station.pricing.cancellationPolicy}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Booking Dialog */}
        <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Book Charging Slot</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Charger Type</InputLabel>
                  <Select
                    value={bookingForm.chargerType}
                    label="Charger Type"
                    onChange={(e) => setBookingForm({...bookingForm, chargerType: e.target.value})}
                  >
                    {ALL_CHARGER_TYPES.map((type) => {
                      const available = getAvailableChargersByType(type);
                      const disabled = available.length === 0;
                      return (
                        <MenuItem key={type} value={type} disabled={disabled}>
                          {type.replace('_', ' ').toUpperCase()} ({available.length} available)
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: nowLocalValue }}
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
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Make"
                  value={bookingForm.vehicleInfo.make}
                  onChange={(e) => setBookingForm({
                    ...bookingForm, 
                    vehicleInfo: {...bookingForm.vehicleInfo, make: e.target.value}
                  })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Model"
                  value={bookingForm.vehicleInfo.model}
                  onChange={(e) => setBookingForm({
                    ...bookingForm, 
                    vehicleInfo: {...bookingForm.vehicleInfo, model: e.target.value}
                  })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Battery Capacity (kWh)"
                  type="number"
                  value={bookingForm.vehicleInfo.batteryCapacity}
                  onChange={(e) => setBookingForm({
                    ...bookingForm, 
                    vehicleInfo: {...bookingForm.vehicleInfo, batteryCapacity: e.target.value}
                  })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Charge (%)"
                  type="number"
                  value={bookingForm.vehicleInfo.currentCharge}
                  onChange={(e) => setBookingForm({
                    ...bookingForm, 
                    vehicleInfo: {...bookingForm.vehicleInfo, currentCharge: e.target.value}
                  })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Charge (%)"
                  type="number"
                  value={bookingForm.vehicleInfo.targetCharge}
                  onChange={(e) => setBookingForm({
                    ...bookingForm, 
                    vehicleInfo: {...bookingForm.vehicleInfo, targetCharge: e.target.value}
                  })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                />
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
              {bookingLoading ? 'Booking...' : 'Book Now'}
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
      </Container>
  );
};

export default StationDetails;


