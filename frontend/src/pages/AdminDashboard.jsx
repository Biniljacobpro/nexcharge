import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  Business as BusinessIcon,
  Psychology as PsychologyIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Build as BuildIcon,
  Monitor as MonitorIcon,
  Assignment as AssignmentIcon,
  Folder as FolderIcon,
  Flag as FlagIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import nexchargeLogo from '../assets/nexcharge-high-resolution-logo-transparent.png';
import { motion } from 'framer-motion';
import * as api from '../utils/api';

const StatCard = ({ title, value, change, icon, color = 'primary', status }) => (
  <Card sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main` }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {title}
          </Typography>
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {change > 0 ? (
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
              ) : (
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
              )}
              <Typography variant="caption" color={change > 0 ? 'success.main' : 'error.main'}>
                {Math.abs(change)}% since last month
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: `${color}.light`, 
          color: `${color}.main`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
      {status && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
          <Typography variant="caption" color="success.main">
            {status}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const ChartCard = ({ title, value, subtitle, change, status, children, actionIcon }) => (
  <Card sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
              <Typography variant="caption" color="success.main">
                {change}
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {status && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
              <Typography variant="caption" color="success.main">
                {status}
              </Typography>
            </Box>
          )}
          {actionIcon && (
            <IconButton size="small">
              {actionIcon}
            </IconButton>
          )}
        </Box>
      </Box>
      {children}
    </CardContent>
  </Card>
);

// Corporate Admin Management Section Component
const CorporateAdminManagementSection = ({ admins, onRefresh }) => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({ status: 'approved', notes: '' });
  const [loading, setLoading] = useState(false);

  // Ensure admins is always an array
  const safeAdmins = Array.isArray(admins) ? admins : [];

  const getActiveChip = (isActive) => (
    <Chip 
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        bgcolor: isActive ? 'success.main' : 'warning.main',
        color: 'white'
      }}
    />
  );
  
  return (
    <>

      {/* Corporate Admins Table */}
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Corporate Admins ({safeAdmins.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
              >
                Refresh
              </Button>
            </Box>
          </Box>
          
          {safeAdmins.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BusinessIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No corporate admins found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add corporate admins to see them listed here
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>BRN</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeAdmins.map((adm) => (
                    <TableRow key={adm._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {adm.personalInfo?.firstName?.[0]}{adm.personalInfo?.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {adm.personalInfo?.firstName} {adm.personalInfo?.lastName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{adm.roleSpecificData?.corporateAdminInfo?.corporateId?.name || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{adm.roleSpecificData?.corporateAdminInfo?.corporateId?.businessRegistrationNumber || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{adm.personalInfo?.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{adm.personalInfo?.phone || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        {getActiveChip(adm.credentials?.isActive)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(adm.createdAt).toLocaleDateString()}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </>
  );
};

// Add Corporate Admin Section Component
const AddCorporateAdminSection = ({ onRefresh }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    businessRegistrationNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Client-side validation helpers
  const isValidEmail = (email) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(String(email).trim());
  const isValidPhone = (phone) => (/^\d{10}$/).test(String(phone).replace(/\D/g, ''));
  const isValidBRN = (brn) => (/^[A-Za-z0-9]{21}$/).test(String(brn).trim());
  const isLettersAndSpaces = (name) => (/^[A-Za-z ]+$/).test(String(name).trim());
  const validate = () => {
    if (!formData.companyName || formData.companyName.trim().length > 20) return 'Company name is required and must be <= 20 characters';
    if (!formData.companyEmail || !isValidEmail(formData.companyEmail)) return 'Enter a valid company email';
    if (!formData.firstName || !isLettersAndSpaces(formData.firstName)) return 'First name must contain only letters and spaces';
    if (!formData.lastName || !isLettersAndSpaces(formData.lastName)) return 'Last name must contain only letters and spaces';
    if (!formData.contactNumber || !isValidPhone(formData.contactNumber)) return 'Contact number must be exactly 10 digits';
    if (!formData.businessRegistrationNumber || !isValidBRN(formData.businessRegistrationNumber)) return 'Business Registration Number must be a 21-character alphanumeric code';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const msg = validate();
    if (msg) {
      setLoading(false);
      setError(msg);
      return;
    }
    
    try {
      const result = await api.addCorporateAdmin(formData);
      
      if (result.success) {
        setSuccess(true);
        setFormData({
          companyName: '',
          companyEmail: '',
          firstName: '',
          lastName: '',
          contactNumber: '',
          businessRegistrationNumber: ''
        });
        onRefresh();
      } else {
        setError(result.message || 'Failed to add corporate admin');
      }
    } catch (err) {
      console.error('Error adding corporate admin:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" sx={{ mb: 2, color: 'success.main' }}>
          Corporate Admin Added Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          A temporary password has been sent to the corporate admin's email address.
        </Typography>
        <Button
          variant="contained"
          onClick={() => setSuccess(false)}
          sx={{ mr: 2 }}
        >
          Add Another Corporate Admin
        </Button>
        <Button
          variant="outlined"
          onClick={() => onRefresh()}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
          Add Corporate Admin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new corporate admin account directly
        </Typography>
      </Box>

      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Email"
                  name="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Business Registration Number"
                  name="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              {/* Removed Additional Information field */}
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #00b894, #00a085)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #009B7A, #008F6F)'
                  }
                }}
              >
                {loading ? 'Adding...' : 'Add Corporate Admin'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => onRefresh()}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

// User Management Section Component
const UserManagementSection = ({ users }) => {
  return (
    <>
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            All Users ({users.length})
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>NAME</TableCell>
                  <TableCell>ROLE</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>JOINED</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {u.personalInfo?.firstName?.[0]}{u.personalInfo?.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {u.personalInfo?.firstName} {u.personalInfo?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {u.personalInfo?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={u.role} 
                        size="small" 
                        sx={{ 
                          bgcolor: u.role === 'admin' ? 'error.main' : 'primary.main',
                          color: 'white'
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Active" 
                        size="small" 
                        sx={{ bgcolor: 'success.main', color: 'white' }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [corporateAdmins, setCorporateAdmins] = useState([]);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('corporate-admins');
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const loadDashboard = async () => {
    try {
      const profile = await api.getMe();
      if (profile.role !== 'admin') {
        navigate('/login');
        return;
      }
      setUser(profile);
      
      const [ov, userList, corpAdmins] = await Promise.all([
        api.adminOverview(),
        api.adminUsers(),
        api.getCorporateAdmins()
      ]);
      
      console.log('Corporate Admins:', corpAdmins);
      
      setOverview(ov);
      setUsers(userList);
      setCorporateAdmins(corpAdmins || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [navigate]);

  useEffect(() => {
    console.log('AdminDashboard state changed:', { 
      activeSection,
      corporateAdmins: corporateAdmins?.length || 0
    });
  }, [activeSection, corporateAdmins]);

  const navigationItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: <HomeIcon />, active: true },
    { id: 'users', label: 'User Management', icon: <PeopleIcon /> },
    { id: 'corporate-admins', label: 'Corporate Admin Management', icon: <BusinessIcon /> },
    { id: 'add-corporate-admin', label: 'Add Corporate Admin', icon: <BusinessIcon /> },
    { id: 'stations', label: 'Station Management', icon: <StorageIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { id: 'ai-models', label: 'AI Models', icon: <PsychologyIcon /> },
    { id: 'system', label: 'System Health', icon: <MonitorIcon /> },
    { id: 'security', label: 'Security', icon: <SecurityIcon /> },
    { id: 'integrations', label: 'Integrations', icon: <BuildIcon /> },
    { id: 'policies', label: 'Policies', icon: <AssignmentIcon /> },
    { id: 'reports', label: 'Reports', icon: <BarChartIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

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
          <Button variant="contained" onClick={() => navigate('/login')}>Go to Login</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Left Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            bgcolor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <img src={nexchargeLogo} alt="NexCharge" style={{ height: '52px', width: 'auto' }} />
          <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 'bold', mt: 1 }}>Platform Admin</Typography>
        </Box>
        
        <List sx={{ px: 2, py: 1 }}>
          {navigationItems.map((item) => (
            <ListItem
              key={item.id}
              button
              onClick={() => setActiveSection(item.id)}
              sx={{
                mb: 1,
                borderRadius: 2,
                bgcolor: activeSection === item.id ? '#f1f5f9' : 'transparent',
                color: activeSection === item.id ? '#1e293b' : '#64748b',
                '&:hover': {
                  bgcolor: activeSection === item.id ? '#f1f5f9' : '#f8fafc',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: activeSection === item.id ? '#1e293b' : '#64748b',
                minWidth: 40 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: activeSection === item.id ? 600 : 400 
                }} 
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <Box sx={{ 
          bgcolor: '#ffffff', 
          borderBottom: '1px solid #e2e8f0',
          px: 4,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
              {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {{
                dashboard: 'Overview and KPIs',
                users: 'Manage platform users and their roles',
                'corporate-admins': 'View and manage corporate administrators',
                'add-corporate-admin': 'Create a new corporate admin account',
                stations: 'Manage charging stations and operational status',
                analytics: 'Platform analytics and insights',
                'ai-models': 'Manage AI models and configurations',
                system: 'System health and uptime metrics',
                security: 'Security and access controls',
                integrations: 'Third-party integrations and settings',
                policies: 'Policy management and permissions',
                reports: 'Operational and financial reports'
              }[activeSection] || ' '
              }
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Search..."
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            
            <IconButton>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton onClick={() => setActiveSection('settings')}>
              <SettingsIcon />
            </IconButton>
            
            <IconButton>
              <HelpIcon />
            </IconButton>
            
            <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                {user?.personalInfo?.firstName?.[0]}{user?.personalInfo?.lastName?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
            >
              <MenuItem onClick={() => { setActiveSection('settings'); setUserMenuAnchor(null); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={() => { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); navigate('/login'); }}>
                <ListItemIcon>
                  <LockIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Dashboard Content */}
        <Box sx={{ flexGrow: 1, p: 4 }}>
          <Container maxWidth="xl" disableGutters>
            {/* Conditional Content Based on Active Section */}
            {activeSection === 'dashboard' && (
              <>
                {/* KPI Cards Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                      title="Total Users"
                      value={overview?.totalUsers || 0}
                      change={12}
                      icon={<PeopleIcon />}
                      color="primary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                      title="Active Stations"
                      value={overview?.activeStations || 0}
                      change={8}
                      icon={<StorageIcon />}
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                      title="Total Revenue"
                      value={`$${(overview?.totalRevenue || 0).toLocaleString()}`}
                      change={23}
                      icon={<TrendingUpIcon />}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                      title="Charging Sessions"
                      value={(overview?.totalSessions || 0).toLocaleString()}
                      change={15}
                      icon={<BarChartIcon />}
                      color="info"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                      title="System Uptime"
                      value="99.9%"
                      status="Healthy"
                      icon={<CheckCircleIcon />}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                      title="AI Models"
                      value={overview?.aiModels || 0}
                      change={5}
                      icon={<PsychologyIcon />}
                      color="warning"
                    />
                  </Grid>
                </Grid>

                {/* Charts Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} lg={8}>
                    <ChartCard
                      title="This month"
                      value="$37.5K"
                      subtitle="Total Revenue"
                      change="+2.45%"
                      status="On track"
                      actionIcon={<MoreVertIcon />}
                    >
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Revenue Chart Placeholder
                        </Typography>
                      </Box>
                    </ChartCard>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <ChartCard
                      title="Weekly Revenue"
                      value="$12.3K"
                      subtitle="Current Week"
                      change="+5.2%"
                      actionIcon={<BarChartIcon />}
                    >
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Weekly Chart Placeholder
                        </Typography>
                      </Box>
                    </ChartCard>
                  </Grid>
                </Grid>

                {/* Bottom Row */}
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Recent Users
                          </Typography>
                          <IconButton size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>NAME</TableCell>
                                <TableCell>ROLE</TableCell>
                                <TableCell>STATUS</TableCell>
                                <TableCell>JOINED</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {users.slice(0, 5).map((u) => (
                                <TableRow key={u._id}>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                        {u.personalInfo?.firstName?.[0]}{u.personalInfo?.lastName?.[0]}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {u.personalInfo?.firstName} {u.personalInfo?.lastName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {u.personalInfo?.email}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={u.role} 
                                      size="small" 
                                      sx={{ 
                                        bgcolor: u.role === 'admin' ? 'error.main' : 'primary.main',
                                        color: 'white'
                                      }} 
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label="Active" 
                                      size="small" 
                                      sx={{ bgcolor: 'success.main', color: 'white' }} 
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(u.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} lg={3}>
                    <ChartCard
                      title="Daily Traffic"
                      value="2.579"
                      subtitle="Active Users"
                      change="+2.45%"
                    >
                      <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Traffic Chart
                        </Typography>
                      </Box>
                    </ChartCard>
                  </Grid>
                  
                  <Grid item xs={12} lg={3}>
                    <ChartCard
                      title="System Health"
                      value="98.5%"
                      subtitle="Overall Status"
                      status="Excellent"
                    >
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption">API Response</Typography>
                          <Typography variant="caption" color="success.main">99.2%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={99.2} sx={{ mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption">Database</Typography>
                          <Typography variant="caption" color="success.main">98.7%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={98.7} sx={{ mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption">AI Models</Typography>
                          <Typography variant="caption" color="warning.main">95.1%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={95.1} color="warning" />
                      </Box>
                    </ChartCard>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Corporate Admin Management Section */}
            {activeSection === 'corporate-admins' && (
              <CorporateAdminManagementSection 
                admins={corporateAdmins}
                onRefresh={loadDashboard}
              />
            )}

            {/* Add Corporate Admin Section */}
            {activeSection === 'add-corporate-admin' && (
              <AddCorporateAdminSection onRefresh={loadDashboard} />
            )}

            {/* User Management Section */}
            {activeSection === 'users' && (
              <UserManagementSection users={users} />
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <Box sx={{ maxWidth: 520 }}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Change Password
                    </Typography>
                    {passwordError && (
                      <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>
                    )}
                    {passwordSuccess && (
                      <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>
                    )}
                    <Box component="form" onSubmit={async (e) => {
                      e.preventDefault();
                      setPasswordError('');
                      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                        setPasswordError('New passwords do not match');
                        return;
                      }
                      setPasswordLoading(true);
                      try {
                        await api.updatePasswordApi({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
                        setPasswordSuccess('Password updated successfully');
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setTimeout(() => setPasswordSuccess(''), 3000);
                      } catch (err) {
                        setPasswordError(err.message || 'Failed to update password');
                      } finally {
                        setPasswordLoading(false);
                      }
                    }}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        margin="normal"
                        required
                      />
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        margin="normal"
                        required
                      />
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        margin="normal"
                        required
                      />
                      <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={passwordLoading}>
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Other sections can be added here */}
            {activeSection !== 'dashboard' && activeSection !== 'users' && activeSection !== 'corporate-admins' && activeSection !== 'add-corporate-admin' && activeSection !== 'settings' && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" color="text.secondary">
                  {navigationItems.find(item => item.id === activeSection)?.label} - Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                  This section is under development
                </Typography>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
