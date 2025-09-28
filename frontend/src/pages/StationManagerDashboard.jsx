import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EvStation as StationIcon,
  BookOnline as BookingIcon,
  Build as MaintenanceIcon,
  AttachMoney as PricingIcon,
  Assessment as ReportsIcon,
  Reviews as FeedbackIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  Speed,
  CheckCircle,
  Warning,
  Error,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn,
  Schedule,
  Phone,
  Email,
  Power,
  LocalParking,
  AccessTime,
  Business,
  Description,
  Code,
  Map,
  AttachMoney as MoneyIcon,
  Settings
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import stationManagerService from '../services/stationManagerService';
import Footer from '../components/Footer';

const drawerWidth = 280;

const navigationItems = [
  { id: 'overview', label: 'Station Dashboard', icon: <DashboardIcon />, description: 'Real-time slot occupancy and operational status' },
  { id: 'bookings', label: 'Booking Management', icon: <BookingIcon />, description: 'Approve, monitor, or cancel reservations' },
  { id: 'maintenance', label: 'Maintenance Scheduling', icon: <MaintenanceIcon />, description: 'Block slots during repairs' },
  { id: 'pricing', label: 'Pricing & Offers', icon: <PricingIcon />, description: 'Set station-level pricing and promotions' },
  { id: 'reports', label: 'Performance Reports', icon: <ReportsIcon />, description: 'Utilization rates, uptime, and user ratings' },
  { id: 'feedback', label: 'Feedback Management', icon: <FeedbackIcon />, description: 'View and respond to customer reviews' },
  { id: 'profile', label: 'Profile Settings', icon: <ProfileIcon />, description: 'Manage account and preferences' }
];

const StationManagerDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  const loadUserData = async () => {
    try {
      const { getMe } = await import('../utils/api');
      const me = await getMe();
      setUser(me);
    } catch (error) {
      console.error('Error loading user data:', error);
      navigate('/login');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await stationManagerService.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load dashboard data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleViewBooking = (booking) => {
    // TODO: Implement booking view dialog
    console.log('View booking:', booking);
  };

  const handleEditBooking = (booking) => {
    // TODO: Implement booking edit dialog
    console.log('Edit booking:', booking);
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      // TODO: Implement approve booking API call
      console.log('Approve booking:', bookingId);
      setSnackbar({ open: true, message: 'Booking approved successfully', severity: 'success' });
      loadDashboardData();
    } catch (error) {
      console.error('Error approving booking:', error);
      setSnackbar({ open: true, message: 'Failed to approve booking', severity: 'error' });
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      // TODO: Implement cancel booking API call
      console.log('Cancel booking:', bookingId);
      setSnackbar({ open: true, message: 'Booking cancelled successfully', severity: 'success' });
      loadDashboardData();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setSnackbar({ open: true, message: 'Failed to cancel booking', severity: 'error' });
    }
  };

  const handleScheduleMaintenance = () => {
    // TODO: Implement schedule maintenance dialog
    console.log('Schedule maintenance');
  };

  const handleEditMaintenance = (maintenanceId) => {
    // TODO: Implement edit maintenance dialog
    console.log('Edit maintenance:', maintenanceId);
  };

  const handleCancelMaintenance = async (maintenanceId) => {
    try {
      // TODO: Implement cancel maintenance API call
      console.log('Cancel maintenance:', maintenanceId);
      setSnackbar({ open: true, message: 'Maintenance cancelled successfully', severity: 'success' });
      loadDashboardData();
    } catch (error) {
      console.error('Error cancelling maintenance:', error);
      setSnackbar({ open: true, message: 'Failed to cancel maintenance', severity: 'error' });
    }
  };

  const handleUpdatePricing = (stationId) => {
    // TODO: Implement update pricing dialog
    console.log('Update pricing for station:', stationId);
  };

  const handleCreatePromotion = () => {
    // TODO: Implement create promotion dialog
    console.log('Create promotion');
  };

  const handleBulkUpdatePricing = () => {
    // TODO: Implement bulk update pricing dialog
    console.log('Bulk update pricing');
  };

  const handleRespondToFeedback = (feedbackId) => {
    // TODO: Implement respond to feedback dialog
    console.log('Respond to feedback:', feedbackId);
  };

  const handleViewFeedbackDetails = (feedbackId) => {
    // TODO: Implement view feedback details dialog
    console.log('View feedback details:', feedbackId);
  };

  const renderOverview = () => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
        Station Dashboard
      </Typography>
      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
        Real-time monitoring of your assigned charging station
      </Typography>

      {/* Station Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.stationInfo?.availableSlots || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Available Slots
                    </Typography>
                  </Box>
                  <LocalParking sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.stationInfo?.uptime || 0}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Station Uptime
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.stationInfo?.utilizationRate || 0}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Utilization Rate
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      ₹{dashboardData?.stationInfo?.monthlyRevenue || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Monthly Revenue
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Assigned Stations Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                  Assigned Stations ({dashboardData?.assignedStations?.length || 0})
                </Typography>
                {dashboardData?.assignedStations?.map((station, index) => (
                  <Box
                    key={station.id}
                    onClick={() => navigate(`/station-manager/stations/${station.id}`)}
                    sx={{
                      mb: 3,
                      p: 3,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 2,
                      backgroundColor: 'grey.50',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { boxShadow: 3, borderColor: 'primary.light', backgroundColor: '#ffffff' }
                    }}
                  >
                    {/* Station Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <StationIcon fontSize="small" color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {station.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({station.code})
                        </Typography>
                      </Box>
                      <Chip 
                        label={station.status} 
                        color={station.status === 'active' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </Box>

                    {/* Station Description */}
                    {station.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {station.description}
                      </Typography>
                    )}

                    {/* Location Details */}
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <LocationOn fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {station.location?.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {station.location?.city}, {station.location?.state} - {station.location?.pincode}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Charger Information */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocalParking fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            <strong>{station.availableChargers}/{station.totalChargers}</strong> Chargers Available
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoney fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            <strong>₹{station.basePrice}/kWh</strong> Base Rate
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Charger Types */}
                    {station.chargerTypes && station.chargerTypes.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Charger Types:</strong>
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {station.chargerTypes.map((type, idx) => (
                            <Chip key={idx} label={type} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Amenities */}
                    {station.amenities && station.amenities.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Amenities:</strong>
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {station.amenities.map((amenity, idx) => (
                            <Chip key={idx} label={amenity} size="small" color="primary" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Contact Information */}
                    {station.contact && (station.contact.phone || station.contact.email) && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Contact:</strong>
                        </Typography>
                        <Box display="flex" gap={2}>
                          {station.contact.phone && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Phone fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {station.contact.phone}
                              </Typography>
                            </Box>
                          )}
                          {station.contact.email && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Email fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {station.contact.email}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Operational Status */}
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Power fontSize="small" color={station.operational?.isActive ? 'success' : 'error'} />
                        <Typography variant="body2" color="text.secondary">
                          {station.operational?.isActive ? 'Operational' : 'Offline'}
                        </Typography>
                      </Box>
                      {station.operational?.lastMaintenance && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Last Maintenance: {new Date(station.operational.lastMaintenance).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )) || (
                  <Typography variant="body2" color="text.secondary">
                    No assigned stations found. Please contact your franchise owner.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                  Quick Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button variant="outlined" startIcon={<BookingIcon />} fullWidth>
                    View Bookings
                  </Button>
                  <Button variant="outlined" startIcon={<MaintenanceIcon />} fullWidth>
                    Schedule Maintenance
                  </Button>
                  <Button variant="outlined" startIcon={<PricingIcon />} fullWidth>
                    Update Pricing
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'bookings':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Booking Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
              Monitor and manage reservations for your assigned stations
            </Typography>
            
            {/* Today's Bookings */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Bookings ({dashboardData?.todayBookings?.length || 0})
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Station</TableCell>
                        <TableCell>Time Slot</TableCell>
                        <TableCell>Charger Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData?.todayBookings?.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {booking.user}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.userEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{booking.vehicle}</TableCell>
                          <TableCell>{booking.stationName}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {booking.startTime} - {booking.endTime}
                            </Typography>
                          </TableCell>
                          <TableCell>{booking.chargerType}</TableCell>
                          <TableCell>
                            <Chip 
                              label={booking.status} 
                              color={
                                booking.status === 'confirmed' ? 'success' : 
                                booking.status === 'pending' ? 'warning' : 
                                booking.status === 'cancelled' ? 'error' : 'default'
                              } 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Button 
                                size="small" 
                                startIcon={<ViewIcon />}
                                onClick={() => handleViewBooking(booking)}
                                variant="outlined"
                              >
                                View
                              </Button>
                              {booking.status === 'pending' && (
                                <Button 
                                  size="small" 
                                  startIcon={<CheckCircle />}
                                  onClick={() => handleApproveBooking(booking.id)}
                                  color="success"
                                  variant="contained"
                                >
                                  Approve
                                </Button>
                              )}
                              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <Button 
                                  size="small" 
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleCancelBooking(booking.id)}
                                  color="error"
                                  variant="outlined"
                                >
                                  Cancel
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )) || []}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Bookings</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Station</TableCell>
                        <TableCell>Time Slot</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Cost</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData?.recentBookings?.slice(0, 10).map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {booking.user}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.userEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{booking.vehicle}</TableCell>
                          <TableCell>{booking.stationName}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {booking.startTime}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {booking.endTime}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={booking.status} 
                              color={
                                booking.status === 'confirmed' ? 'success' : 
                                booking.status === 'pending' ? 'warning' : 
                                booking.status === 'cancelled' ? 'error' : 'default'
                              } 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>₹{booking.totalCost}</TableCell>
                          <TableCell>
                            <Button 
                              size="small" 
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewBooking(booking)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )) || []}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        );
      case 'maintenance':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Maintenance Scheduling
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
              Block slots during repairs and maintenance
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Upcoming Maintenance</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleScheduleMaintenance}
                sx={{ backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
              >
                Schedule Maintenance
              </Button>
            </Box>
            
            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Station</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData?.maintenanceSchedule?.map((maintenance) => (
                        <TableRow key={maintenance.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <MaintenanceIcon fontSize="small" color="action" />
                              <Typography variant="body2" fontWeight="medium">
                                {maintenance.type}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {maintenance.station}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(maintenance.scheduledDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(maintenance.scheduledDate).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {maintenance.duration}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {maintenance.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={maintenance.status} 
                              color={
                                maintenance.status === 'scheduled' ? 'success' : 
                                maintenance.status === 'in-progress' ? 'warning' : 
                                maintenance.status === 'completed' ? 'info' : 'default'
                              } 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Button 
                                size="small" 
                                startIcon={<EditIcon />}
                                onClick={() => handleEditMaintenance(maintenance.id)}
                                variant="outlined"
                              >
                                Edit
                              </Button>
                              {maintenance.status === 'scheduled' && (
                                <Button 
                                  size="small" 
                                  startIcon={<DeleteIcon />} 
                                  color="error"
                                  onClick={() => handleCancelMaintenance(maintenance.id)}
                                  variant="outlined"
                                >
                                  Cancel
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )) || []}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        );
      case 'pricing':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Pricing & Offers
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
              Set station-level pricing and promotions
            </Typography>
            
            {/* Station Pricing Overview */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Current Station Pricing</Typography>
                {dashboardData?.assignedStations?.map((station) => (
                  <Box key={station.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {station.name}
                      </Typography>
                      <Chip 
                        label={station.status} 
                        color={station.status === 'active' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={3}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Base Price
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          ₹{station.basePrice}/kWh
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Charger Types
                        </Typography>
                        <Typography variant="body2">
                          {station.chargerTypes?.join(', ') || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Available Chargers
                        </Typography>
                        <Typography variant="body2">
                          {station.availableChargers}/{station.totalChargers}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={1} mt={2}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleUpdatePricing(station.id)}
                        variant="contained"
                        color="primary"
                      >
                        Update Pricing
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<ViewIcon />}
                        variant="outlined"
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                )) || (
                  <Typography variant="body2" color="text.secondary">
                    No assigned stations found.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Pricing Management */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Pricing Management</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Manage pricing strategies, discounts, and promotional offers for your assigned stations.
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleCreatePromotion}
                    sx={{ backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
                  >
                    Create Promotion
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    onClick={handleBulkUpdatePricing}
                  >
                    Bulk Update Pricing
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<ViewIcon />}
                  >
                    View Pricing History
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );
      case 'reports':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Performance Reports
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
              Utilization rates, uptime, and user ratings
            </Typography>
            
            {/* Performance Metrics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                          {dashboardData?.performanceMetrics?.utilizationRate || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Utilization Rate
                        </Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          {dashboardData?.performanceMetrics?.avgRating || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Rating
                        </Typography>
                      </Box>
                      <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                          {dashboardData?.performanceMetrics?.totalSessions || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Sessions
                        </Typography>
                      </Box>
                      <AttachMoney sx={{ fontSize: 40, color: 'info.main' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                          ₹{dashboardData?.performanceMetrics?.monthlyRevenue || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Monthly Revenue
                        </Typography>
                      </Box>
                      <AttachMoney sx={{ fontSize: 40, color: 'warning.main' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Performance Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Utilization Trends</Typography>
                    <Box height={300}>
                      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 10 }}>
                        Utilization chart will be displayed here
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Revenue Analysis</Typography>
                    <Box height={300}>
                      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 10 }}>
                        Revenue chart will be displayed here
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Station Performance Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Station Performance Summary</Typography>
                <Grid container spacing={2}>
                  {dashboardData?.assignedStations?.map((station) => (
                    <Grid item xs={12} sm={6} md={4} key={station.id}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {station.name}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">Utilization:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {station.analytics?.utilizationRate || 0}%
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">Rating:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {station.analytics?.averageRating || 0}/5
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">Sessions:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {station.analytics?.totalSessions || 0}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Revenue:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            ₹{station.analytics?.monthlyRevenue || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )) || []}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );
      case 'feedback':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Feedback Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
              View and respond to customer reviews
            </Typography>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Customer Reviews ({dashboardData?.recentFeedback?.length || 0})
                </Typography>
                {dashboardData?.recentFeedback?.map((feedback) => (
                  <Box key={feedback.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {feedback.user}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        {[...Array(5)].map((_, i) => (
                          <CheckCircle 
                            key={i} 
                            sx={{ 
                              fontSize: 16, 
                              color: i < feedback.rating ? 'gold' : 'grey.300' 
                            }} 
                          />
                        ))}
                        <Typography variant="body2" color="text.secondary">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Station: {feedback.stationName}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {feedback.comment}
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleRespondToFeedback(feedback.id)}
                        variant="contained"
                        color="primary"
                      >
                        Respond
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewFeedbackDetails(feedback.id)}
                        variant="outlined"
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                )) || (
                  <Typography variant="body2" color="text.secondary">
                    No recent feedback available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        );
      case 'profile':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Profile Settings
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
              Manage account and preferences
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Account Information</Typography>
                <Typography variant="body1" color="text.secondary">
                  Profile management features will be implemented here.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
          },
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            NexCharge
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Station Manager Portal
          </Typography>
        </Box>
        <Divider sx={{ borderColor: '#e2e8f0' }} />
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={activeSection === item.id}
                onClick={() => setActiveSection(item.id)}
                sx={{
                  mb: 0.5,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: '#f1f5f9',
                    '&:hover': { bgcolor: '#f1f5f9' },
                    color: '#1e293b'
                  },
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
              >
                <ListItemIcon sx={{ color: activeSection === item.id ? '#1e293b' : '#64748b', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: activeSection === item.id ? 600 : 400 }}
                  secondary={item.description}
                  secondaryTypographyProps={{ fontSize: '0.75rem', color: 'text.secondary' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <AppBar position="static" sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: 'text.primary', display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 700 }}>
              Station Manager Dashboard
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Welcome, {user?.firstName || 'Manager'}
              </Typography>
              <IconButton onClick={handleMenuClick} sx={{ color: 'text.primary' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.firstName?.charAt(0) || 'M'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <ProfileIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {renderContent()}
        </Box>

        {/* Footer */}
        <Footer />
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StationManagerDashboard;

