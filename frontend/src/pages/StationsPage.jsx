import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Chip, IconButton, TextField, MenuItem, Button } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import { getMe, getPublicStationsApi } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const StationsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe().catch(() => null);
        setUser(me);
      } catch {}
    })();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const data = await getPublicStationsApi({ search, type: type === 'all' ? '' : type });
      setStations(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      setError(e.message || 'Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStations(); // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <UserNavbar user={user} />
      <Box component="main" sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>Stations</Typography>
            <Typography variant="body2" color="text.secondary">Browse and find charging stations near you</Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth placeholder="Search stations by name..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth select label="Station Type" value={type} onChange={(e) => setType(e.target.value)}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="ac_type2">AC Type 2</MenuItem>
                <MenuItem value="dc_ccs2">DC CCS2</MenuItem>
                <MenuItem value="dc_chademo">DC CHAdeMO</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="outlined" startIcon={<MyLocationIcon />} onClick={loadStations}>My Location</Button>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {loading && (
              <Grid item xs={12}><Typography>Loading stations...</Typography></Grid>
            )}
            {!loading && stations.length === 0 && (
              <Grid item xs={12}><Typography color="text.secondary">No stations found.</Typography></Grid>
            )}
            {stations.map((s) => {
              const pricingLabel = s && typeof s.pricing === 'object'
                ? (s.pricing.basePrice ? `${s.pricing.currency || '₹'}${s.pricing.basePrice}/kWh` : (s.pricing.model || 'Pricing'))
                : (s?.pricing || null);
              const chargerTypes = Array.isArray(s?.chargerTypes)
                ? s.chargerTypes.map((t) => (typeof t === 'string' ? t : (t?.type || 'charger')))
                : [];
              const available = typeof s?.availablePorts === 'number' ? s.availablePorts : (s?.availability?.available || undefined);
              const total = typeof s?.totalPorts === 'number' ? s.totalPorts : (s?.availability?.total || undefined);
              const statusText = typeof s?.status === 'string' ? s.status : (s?.status?.text || undefined);
              const rating = typeof s?.rating === 'number' ? s.rating : (typeof s?.ratingAverage === 'number' ? s.ratingAverage : undefined);
              const amenities = Array.isArray(s?.amenities) && s.amenities.length > 0 ? s.amenities : null;
              return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={s._id}>
                <Card elevation={2} onClick={() => navigate(`/stations/${s._id}`)} sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                  <CardContent sx={{ p: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name || 'Station'}</Typography>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/stations/${s._id}`); }}><DirectionsIcon /></IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 1 }}>
                      {chargerTypes[0] && (
                        <Chip size="small" label={chargerTypes[0]} />
                      )}
                      {typeof available === 'number' && (
                        <Chip size="small" label={`${available}/${total ?? available} available`} />
                      )}
                      {pricingLabel && (
                        <Chip size="small" label={pricingLabel} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {`⭐ ${rating ? rating.toFixed(1) : '4.5'}/5`} • {amenities ? `${amenities.length} amenities` : 'No amenities listed'}
                    </Typography>
                    {statusText && (
                      <Typography variant="body2" color="text.secondary">{statusText}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );})}
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default StationsPage;


