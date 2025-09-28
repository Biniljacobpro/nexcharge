import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Paper, Chip, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, Stack } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import { getMe, updateBookingApi, cancelBookingApi } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const BookingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [editBookingDialogOpen, setEditBookingDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({ startTime: '', duration: '60', chargerType: 'ac_type2' });

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setBookings([]); return; }
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
      const res = await fetch(`${apiBase}/bookings/my-bookings?limit=50&_=${Date.now()}` , { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) setBookings(Array.isArray(data.data) ? data.data : []);
      else setBookings([]);
    } catch (e) {
      setBookings([]);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => { loadBookings(); }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const now = new Date();
  const isCancelled = (b) => b.status === 'cancelled';
  const upcoming = bookings
    .filter(b => !isCancelled(b) && new Date(b.startTime) > now)
    .sort((a,b)=> new Date(a.startTime)-new Date(b.startTime));
  const ongoing = bookings
    .filter(b => !isCancelled(b) && new Date(b.startTime) <= now && new Date(b.endTime) >= now);
  const past = bookings
    .filter(b => !isCancelled(b) && new Date(b.endTime) < now)
    .sort((a,b)=> new Date(b.endTime)-new Date(a.endTime));
  const cancelled = bookings
    .filter(isCancelled)
    .sort((a,b)=> new Date(b.endTime || b.startTime) - new Date(a.endTime || a.startTime));
  const nextBooking = upcoming[0] || null;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <UserNavbar user={user} />

      <Box component="main" sx={{ flex: 1, py: { xs: 4, md: 8 } }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Your Bookings</Typography>
            </Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')}>
              Back to Home
            </Button>
          </Box>

          {/* Next Booking */}
          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Next Booking</Typography>
              {!nextBooking ? (
                <Stack spacing={1} alignItems="flex-start">
                  <Typography variant="body2" color="text.secondary">No upcoming bookings.</Typography>
                  <Button variant="contained" onClick={() => navigate('/stations')}>Find a station</Button>
                </Stack>
              ) : (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={7}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{nextBooking.stationId?.name || 'Station'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(nextBooking.startTime).toLocaleString()} → {new Date(nextBooking.endTime).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }}}>
                      <Chip size="small" color="primary" label="upcoming" />
                      <Button size="small" variant="outlined" onClick={() => {
                        setEditingBooking(nextBooking);
                        setEditForm({
                          startTime: new Date(nextBooking.startTime).toISOString().slice(0,16),
                          duration: String(Math.max(30, Math.round((new Date(nextBooking.endTime) - new Date(nextBooking.startTime))/(1000*60)))),
                          chargerType: nextBooking.chargerType || 'ac_type2'
                        });
                        setEditBookingDialogOpen(true);
                      }}>Edit</Button>
                      {(() => {
                        const now = new Date();
                        const start = new Date(nextBooking.startTime);
                        const canCancel = start.getTime() - now.getTime() >= 2*60*60*1000;
                        return canCancel ? (
                          <Button size="small" color="error" variant="outlined" onClick={async () => {
                            const ok = window.confirm('Are you sure you want to cancel this booking? The slot will be made available again.');
                            if (!ok) return;
                            try {
                              await cancelBookingApi(nextBooking._id, 'User requested');
                              await loadBookings();
                            } catch (e) {
                              alert(e.message || 'Failed to cancel booking');
                            }
                          }}>Cancel</Button>
                        ) : null;
                      })()}
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </CardContent>
          </Card>

          {/* Ongoing */}
          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon color="success" />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Ongoing</Typography>
              </Box>
              {ongoing.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No ongoing bookings.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {ongoing.map((b) => (
                    <Paper key={b._id} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{b.stationId?.name || 'Station'}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()}</Typography>
                        </Box>
                        <Chip size="small" color="success" label="ongoing" />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* History */}
        <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DoneAllIcon color="action" />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>History</Typography>
            </Box>
            {past.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No past bookings.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {past.map((b) => (
                  <Paper key={b._id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{b.stationId?.name || 'Station'}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()}</Typography>
                      </Box>
                      <Chip size="small" label="past" />
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Cancelled */}
        <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DoneAllIcon color="error" />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Cancelled</Typography>
            </Box>
            {cancelled.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No cancelled bookings.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {cancelled.map((b) => (
                  <Paper key={b._id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{b.stationId?.name || 'Station'}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()}</Typography>
                      </Box>
                      <Chip size="small" color="error" label="cancelled" />
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
        </Container>
      </Box>

      {/* Edit Booking Dialog */}
      <Dialog open={editBookingDialogOpen} onClose={() => { setEditBookingDialogOpen(false); setEditingBooking(null); }} maxWidth="sm" fullWidth>
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
              <TextField select fullWidth label="Duration (minutes)" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}>
                {[30,60,90,120,150,180,210,240,270,300].map((m) => (
                  <MenuItem key={m} value={String(m)}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Charger Type" value={editForm.chargerType} onChange={(e) => setEditForm({ ...editForm, chargerType: e.target.value })}>
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
              await updateBookingApi(editingBooking._id, { startTime: startISO, endTime: endISO, chargerType: editForm.chargerType });
              await loadBookings();
              setEditBookingDialogOpen(false);
              setEditingBooking(null);
            } catch (e) {
              alert(e.message || 'Failed to update booking');
            }
          }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default BookingsPage;
