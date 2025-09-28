import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Container, 
  TextField, 
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Snackbar,
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  MyLocation as MyLocationIcon,
  Directions as DirectionsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InteractiveMap = ({ compact = false, height }) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState('');

  // Handle station navigation
  const handleStationNavigation = useRef((event) => {
    const stationId = event.detail;
    navigate(`/station/${stationId}`);
  });

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setAlertMessage('Location detected successfully!');
          setAlertType('success');
          setShowAlert(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a fallback location (e.g., city center)
          setCurrentLocation({ lat: 40.7128, lng: -74.0060 }); // New York
          setAlertMessage('Using default location. Enable location access for better experience.');
          setAlertType('warning');
          setShowAlert(true);
        }
      );
    } else {
      // Fallback location if geolocation is not supported
      setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
      setAlertMessage('Location services not supported. Using default location.');
      setAlertType('warning');
      setShowAlert(true);
    }
  }, []);

  useEffect(() => {
    if (currentLocation && !map) {
      try {
        setIsLoading(true);
        setMapError('');

        // Ensure the container is free from a previous Leaflet instance (fixes "Map container is being reused")
        if (mapRef.current && mapRef.current._leaflet_id) {
          try { mapRef.current._leaflet_id = null; } catch (_) {}
        }

        // Initialize map
        const newMap = L.map(mapRef.current).setView([currentLocation.lat, currentLocation.lng], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(newMap);

        // Add current location marker
        const currentMarker = L.marker([currentLocation.lat, currentLocation.lng])
          .addTo(newMap)
          .bindPopup('<b>Your Location</b><br>You are here')
          .openPopup();

        // Custom icon for current location
        const currentLocationIcon = L.divIcon({
          className: 'custom-current-location',
          html: '<div style="background-color: #00D4AA; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        currentMarker.setIcon(currentLocationIcon);

        // Fetch real stations from backend (public endpoint)
        const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
        fetch(`${apiBase}/public/stations`)
          .then(async (res) => {
            if (!res.ok) throw new Error(`Failed to load stations: ${res.status}`);
            const body = await res.json();
            const stations = (body?.data || []).map((s, index) => ({
              id: s.id || s._id || `station-${index}`,
              name: s.name || 'Unknown Station',
              lat: s.location?.coordinates?.latitude || s.lat || 0,
              lng: s.location?.coordinates?.longitude || s.lng || 0,
              type: (Array.isArray(s.capacity?.chargerTypes) && s.capacity.chargerTypes.length > 0) ? s.capacity.chargerTypes[0] : 'Various',
              available: s.availableSlots ?? s.capacity?.availableSlots ?? 0,
              total: s.capacity?.totalChargers ?? 0,
              price: s.pricing?.basePrice ?? 0,
              status: s.operational?.status || 'active',
              rating: 4.5,
              amenities: s.amenities || []
            }));

            setNearbyStations(stations);
            setFilteredStations(stations);

            // Add charging station markers
            stations.forEach((station) => {
              // Blue for available, red for full, orange for maintenance
              const color = station.status === 'maintenance'
                ? '#f59e0b'
                : (station.available > 0 ? '#2563eb' : '#dc2626');
              const stationIcon = L.divIcon({
                className: 'custom-station-marker',
                html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              });

              const marker = L.marker([station.lat, station.lng], { icon: stationIcon })
                .addTo(newMap)
                .bindPopup(`
                  <div style="min-width: 250px;">
                    <h4 style="margin: 0 0 8px 0; color: #1f2937;">${station.name}</h4>
                    <p style="margin: 4px 0; color: #6b7280;">
                      <strong>Type:</strong> ${station.type}
                    </p>
                    <p style="margin: 4px 0; color: #6b7280;">
                      <strong>Available:</strong> ${station.available}/${station.total} slots
                    </p>
                    <p style="margin: 4px 0; color: #6b7280;">
                      <strong>Price:</strong> ₹${station.price}/kWh
                    </p>
                    <button
                      onclick="window.dispatchEvent(new CustomEvent('navigateToStation', { detail: '${station.id}' }))"
                      style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        margin-top: 8px;
                        width: 100%;
                      "
                    >
                      View Details
                    </button>
                  </div>
                `);

              // Add click event to center map on station
              marker.on('click', () => {
                newMap.setView([station.lat, station.lng], 16);
              });
            });
          })
          .catch((err) => {
            console.error('Failed loading stations:', err);
          });

        // Note: station markers are added after fetch resolves
        // Current location marker already added above
        
        // Add charging station markers (none here; handled after fetch)
        /* stations.forEach((station) => {
          const stationIcon = L.divIcon({
            className: 'custom-station-marker',
            html: `<div style="background-color: ${station.available > 0 ? '#2563eb' : '#dc2626'}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const marker = L.marker([station.lat, station.lng], { icon: stationIcon })
            .addTo(newMap)
            .bindPopup(`
              <div style="min-width: 250px;">
                <h4 style="margin: 0 0 8px 0; color: #1f2937;">${station.name}</h4>
                <p style="margin: 4px 0; color: #6b7280;">
                  <strong>Type:</strong> ${station.type}
                </p>
                <p style="margin: 4px 0; color: #6b7280;">
                  <strong>Available:</strong> ${station.available}/${station.total} slots
                </p>
                <p style="margin: 4px 0; color: #6b7280;">
                  <strong>Price:</strong> ₹${station.price}/kWh
                </p>
                <p style="margin: 4px 0; color: #6b7280;">
                  <strong>Rating:</strong> ⭐ ${station.rating}/5
                </p>
                <div style="margin-top: 8px;">
                  <span style="background-color: ${station.available > 0 ? '#10b981' : '#dc2626'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                    ${station.available > 0 ? 'Available' : 'Full'}
                  </span>
                </div>
              </div>
            `);

          // Add click event to center map on station
          marker.on('click', () => {
            newMap.setView([station.lat, station.lng], 16);
          });
        }); */

        // Add event listener for station navigation (capture handler for cleanup)
        const navHandler = handleStationNavigation.current;
        window.addEventListener('navigateToStation', navHandler);

        setMap(newMap);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to load map. Please refresh the page.');
        setIsLoading(false);
      }
    }

    return () => {
      if (map) {
        try { map.remove(); } catch (_) {}
      }
      // Clean up event listener
      const navHandler = handleStationNavigation.current;
      window.removeEventListener('navigateToStation', navHandler);
      // Also clear any Leaflet id tag on the container to prevent reuse errors
      if (mapRef.current && mapRef.current._leaflet_id) {
        try { mapRef.current._leaflet_id = null; } catch (_) {}
      }
    };
  }, [currentLocation, map]);

  // Filter stations based on search and filter criteria
  useEffect(() => {
    let filtered = nearbyStations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(station => station.type === filterType);
    }

    setFilteredStations(filtered);
  }, [searchTerm, filterType, nearbyStations]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const centerOnCurrentLocation = () => {
    if (map && currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lng], 13);
      setAlertMessage('Centered on your location!');
      setAlertType('info');
      setShowAlert(true);
    }
  };

  const getDirections = (station) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    window.open(url, '_blank');
  };

  if (!compact && mapError) {
    return (
      <Box sx={{ py: 6, background: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ fontSize: '1.1rem', py: 2 }}>
            {mapError}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (compact) {
    return (
      <Box sx={{ position: 'relative' }}>
        {isLoading && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)', zIndex: 1 }}>
            <CircularProgress size={40} />
          </Box>
        )}
        <Box ref={mapRef} sx={{ height: height || 400, width: '100%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, background: '#f8fafc' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937', mb: 2 }}>
              Find Charging Stations Near You
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
              Discover nearby EV charging stations with real-time availability and detailed information
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField fullWidth placeholder="Search stations by name..." value={searchTerm} onChange={handleSearch} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }} sx={{ backgroundColor: 'white' }} />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Station Type</InputLabel>
                  <Select value={filterType} label="Station Type" onChange={handleFilterChange} sx={{ backgroundColor: 'white' }}>
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="DC Fast">DC Fast</MenuItem>
                    <MenuItem value="Level 2">Level 2</MenuItem>
                    <MenuItem value="Level 1">Level 1</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth variant="outlined" startIcon={<MyLocationIcon />} onClick={centerOnCurrentLocation} sx={{ height: 56, borderColor: '#00D4AA', color: '#00D4AA', '&:hover': { borderColor: '#009B7A', backgroundColor: 'rgba(0, 212, 170, 0.05)' } }}>My Location</Button>
              </Grid>
            </Grid>
          </Box>

          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4, position: 'relative' }}>
            {isLoading && (
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1000 }}>
                <CircularProgress size={60} sx={{ color: '#00D4AA' }} />
              </Box>
            )}
            <Box ref={mapRef} sx={{ height: { xs: 400, md: 500 }, width: '100%', position: 'relative' }} />
          </Paper>

          {/* Nearby Stations Summary */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                Nearby Charging Stations ({filteredStations.length})
              </Typography>
              <Chip label={`${filteredStations.filter(s => s.available > 0).length} Available`} color="success" variant="outlined" />
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              {filteredStations.map((station, index) => (
                <motion.div key={station.id || `station-${index}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, minWidth: 280, border: '1px solid #e5e7eb', position: 'relative', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s ease', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' } }} onClick={() => navigate(`/stations/${station.id}`)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {station.name}
                        </Typography>
                        {station.status === 'maintenance' && (
                          <Box sx={{ ml: 0.5, px: 1, py: 0.25, borderRadius: 1, bgcolor: '#fef3c7', border: '1px solid #f59e0b', color: '#b45309', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            Under maintenance
                          </Box>
                        )}
                      </Box>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); getDirections(station); }} sx={{ color: '#00D4AA' }}>
                        <DirectionsIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={station.type} size="small" sx={{ backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 600 }} />
                      {station.status === 'maintenance' ? null : (
                        <Chip label={`⚡ ${station.available}/${station.total} available`} size="small" color={station.available > 0 ? 'success' : 'error'} variant={station.available > 0 ? 'outlined' : 'filled'} sx={{ fontWeight: 700 }} />
                      )}
                      <Chip label={`$${station.price}/kWh`} size="small" sx={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 600 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 2 }}>
                      ⭐ {station.rating}/5 • {(station.amenities && station.amenities.length > 0) ? station.amenities.join(', ') : 'No amenities listed'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 600, color: station.status === 'maintenance' ? '#b45309' : (station.available > 0 ? '#166534' : '#b91c1c') }}>
                      {station.status === 'maintenance' ? '🚧 Under maintenance' : (station.available > 0 ? '✅ Ready for charging' : '⛔ Currently full - check back later')}
                    </Typography>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Alert Snackbar */}
      <Snackbar open={showAlert} autoHideDuration={4000} onClose={() => setShowAlert(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setShowAlert(false)} severity={alertType} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InteractiveMap;

