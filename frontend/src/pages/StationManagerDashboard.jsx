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
      // Mock data for now
      setDashboardData({
        stationInfo: {
          name: 'NexCharge Kochi Central',
          location: 'Kochi, Kerala',
          status: 'Active',
          totalSlots: 8,
          availableSlots: 6,
          occupiedSlots: 2,
          uptime: 98.5
        },
        recentBookings: [
          { id: 1, user: 'John Doe', vehicle: 'Tesla Model 3', startTime: '10:00 AM', endTime: '11:30 AM', status: 'Confirmed' },
          { id: 2, user: 'Jane Smith', vehicle: 'BMW i3', startTime: '2:00 PM', endTime: '3:00 PM', status: 'Pending' }
        ],
        maintenanceSchedule: [
          { id: 1, type: 'Routine Check', date: '2024-01-15', duration: '2 hours', status: 'Scheduled' },
          { id: 2, type: 'Software Update', date: '2024-01-20', duration: '1 hour', status: 'Pending' }
        ],
        performanceMetrics: {
          utilizationRate: 75,
          averageRating: 4.6,
          totalSessions: 156,
          revenue: 12500
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load dashboard data',
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

  const renderOverview = () => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#2d3436', fontWeight: 'bold' }}>
        Station Dashboard
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#636e72', mb: 3 }}>
        Real-time monitoring of your assigned charging station
      </Typography>

      {/* Station Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #00b894, #00a085)', color: 'white' }}>
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
            <Card sx={{ background: 'linear-gradient(135deg, #0984e3, #74b9ff)', color: 'white' }}>
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
            <Card sx={{ background: 'linear-gradient(135deg, #e17055, #fdcb6e)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.performanceMetrics?.utilizationRate || 0}%
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
            <Card sx={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      ₹{dashboardData?.performanceMetrics?.revenue || 0}
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

      {/* Station Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#2d3436', fontWeight: 'bold' }}>
                  Station Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <StationIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {dashboardData?.stationInfo?.name || 'Station Name'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {dashboardData?.stationInfo?.location || 'Location not set'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CheckCircle fontSize="small" color="success" />
                    <Typography variant="body2" color="text.secondary">
                      Status: {dashboardData?.stationInfo?.status || 'Active'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#2d3436', fontWeight: 'bold' }}>
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
            <Typography variant="h4" gutterBottom sx={{ color: '#2d3436', fontWeight: 'bold' }}>
              Booking Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#636e72', mb: 3 }}>
              Approve, monitor, or cancel reservations
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Bookings</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Time Slot</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData?.recentBookings?.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.user}</TableCell>
                          <TableCell>{booking.vehicle}</TableCell>
                          <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                          <TableCell>
                            <Chip 
                              label={booking.status} 
                              color={booking.status === 'Confirmed' ? 'success' : 'warning'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="small" startIcon={<ViewIcon />}>View</Button>
                            <Button size="small" startIcon={<EditIcon />}>Edit</Button>
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
            <Typography variant="h4" gutterBottom sx={{ color: '#2d3436', fontWeight: 'bold' }}>
              Maintenance Scheduling
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#636e72', mb: 3 }}>
              Block slots during repairs and maintenance
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Upcoming Maintenance</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData?.maintenanceSchedule?.map((maintenance) => (
                        <TableRow key={maintenance.id}>
                          <TableCell>{maintenance.type}</TableCell>
                          <TableCell>{maintenance.date}</TableCell>
                          <TableCell>{maintenance.duration}</TableCell>
                          <TableCell>
                            <Chip 
                              label={maintenance.status} 
                              color={maintenance.status === 'Scheduled' ? 'success' : 'warning'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="small" startIcon={<EditIcon />}>Edit</Button>
                            <Button size="small" startIcon={<DeleteIcon />} color="error">Cancel</Button>
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
            <Typography variant="h4" gutterBottom sx={{ color: '#2d3436', fontWeight: 'bold' }}>
              Pricing & Offers
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#636e72', mb: 3 }}>
              Set station-level pricing and promotions
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Current Pricing</Typography>
                <Typography variant="body1" color="text.secondary">
                  Pricing management features will be implemented here.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      case 'reports':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: '#2d3436', fontWeight: 'bold' }}>
              Performance Reports
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#636e72', mb: 3 }}>
              Utilization rates, uptime, and user ratings
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                <Typography variant="body1" color="text.secondary">
                  Performance reporting features will be implemented here.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      case 'feedback':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: '#2d3436', fontWeight: 'bold' }}>
              Feedback Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#636e72', mb: 3 }}>
              View and respond to customer reviews
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Customer Reviews</Typography>
                <Typography variant="body1" color="text.secondary">
                  Feedback management features will be implemented here.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      case 'profile':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: '#2d3436', fontWeight: 'bold' }}>
              Profile Settings
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#636e72', mb: 3 }}>
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
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #2d3436 0%, #636e72 100%)',
            color: 'white'
          },
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#00b894' }}>
            NexCharge
          </Typography>
          <Typography variant="body2" sx={{ color: '#bdc3c7' }}>
            Station Manager Portal
          </Typography>
        </Box>
        <Divider sx={{ borderColor: '#636e72' }} />
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={activeSection === item.id}
                onClick={() => setActiveSection(item.id)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#00b894',
                    '&:hover': {
                      backgroundColor: '#00a085'
                    }
                  },
                  '&:hover': {
                    backgroundColor: '#636e72'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  secondary={item.description}
                  secondaryTypographyProps={{ fontSize: '0.75rem', color: '#bdc3c7' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <AppBar position="static" sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: '#2d3436', display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#2d3436' }}>
              Station Manager Dashboard
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" sx={{ color: '#636e72' }}>
                Welcome, {user?.firstName || 'Manager'}
              </Typography>
              <IconButton onClick={handleMenuClick} sx={{ color: '#2d3436' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#00b894' }}>
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

