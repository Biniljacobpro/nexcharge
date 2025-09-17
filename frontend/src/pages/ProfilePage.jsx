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
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMe, updateProfileApi, updatePasswordApi, updateProfileImageApi, uploadProfileImageApi } from '../utils/api';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [imageForm, setImageForm] = useState({
    imageUrl: '',
    file: null
  });

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation states
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getMe();
        if (profile.role === 'admin') {
          navigate('/admin');
          return;
        }
        setUser(profile);
        setProfileForm({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phone: profile.phone || '',
          address: profile.address || ''
        });
      } catch (e) {
        setError(e.message);
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  // Validation functions
  const validateProfile = () => {
    const errors = {};
    if (!profileForm.firstName.trim()) errors.firstName = 'First name is required';
    else if (profileForm.firstName.length < 2) errors.firstName = 'First name must be at least 2 characters';
    else if (profileForm.firstName.length > 50) errors.firstName = 'First name must be less than 50 characters';

    if (!profileForm.lastName.trim()) errors.lastName = 'Last name is required';
    else if (profileForm.lastName.length < 2) errors.lastName = 'Last name must be at least 2 characters';
    else if (profileForm.lastName.length > 50) errors.lastName = 'Last name must be less than 50 characters';

    if (profileForm.phone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(profileForm.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (profileForm.address && profileForm.address.length > 200) {
      errors.address = 'Address must be less than 200 characters';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!passwordForm.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateImage = () => {
    const errors = {};
    if (!imageForm.imageUrl.trim()) errors.imageUrl = 'Image URL is required';
    else {
      try {
        new URL(imageForm.imageUrl);
      } catch {
        errors.imageUrl = 'Please enter a valid URL';
      }
    }

    setImageErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!validateProfile()) return;

    try {
      const result = await updateProfileApi(profileForm);
      setUser(result.user);
      setIsEditingProfile(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!validatePassword()) return;

    try {
      await updatePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setIsEditingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handle profile image update
  const handleImageUpdate = async () => {
    try {
      let result;
      if (imageForm.file) {
        // Upload file
        result = await uploadProfileImageApi(imageForm.file);
      } else if (imageForm.imageUrl) {
        // Update URL
        if (!validateImage()) return;
        result = await updateProfileImageApi(imageForm.imageUrl);
      } else {
        setError('Please select a file or enter an image URL');
        return;
      }
      
      setUser(result.user);
      setIsImageDialogOpen(false);
      setImageForm({ imageUrl: '', file: null });
      setSuccess('Profile image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Cancel editing functions
  const cancelProfileEdit = () => {
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setProfileErrors({});
    setIsEditingProfile(false);
  };

  const cancelPasswordEdit = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
    setIsEditingPassword(false);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <AnimatedBackground />
      <UserNavbar user={user} />

      <Box component="main" sx={{ flex: 1, py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <IconButton onClick={() => navigate('/home')} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                Profile Settings
              </Typography>
            </Box>

            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <Grid container spacing={4}>
              {/* Profile Image Section */}
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: 'fit-content' }}>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                      <Avatar 
                        src={user?.profileImage || undefined}
                        sx={{ 
                          width: 150, 
                          height: 150, 
                          bgcolor: user?.profileImage ? 'transparent' : 'primary.main', 
                          fontSize: '4rem',
                          mx: 'auto'
                        }}
                      >
                        {!user?.profileImage && initials}
                      </Avatar>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                        onClick={() => setIsImageDialogOpen(true)}
                      >
                        <PhotoCameraIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {user?.email}
                    </Typography>
                    <Chip 
                      label={user?.role || 'User'} 
                      color="primary" 
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Profile Details Section */}
              <Grid item xs={12} md={8}>
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 4 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Personal Information
                      </Typography>
                      {!isEditingProfile ? (
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => setIsEditingProfile(true)}
                        >
                          Edit
                        </Button>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleProfileUpdate}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={cancelProfileEdit}
                          >
                            Cancel
                          </Button>
                        </Box>
                      )}
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          disabled={!isEditingProfile}
                          error={!!profileErrors.firstName}
                          helperText={profileErrors.firstName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          disabled={!isEditingProfile}
                          error={!!profileErrors.lastName}
                          helperText={profileErrors.lastName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={user?.email || ''}
                          disabled
                          helperText="Email cannot be changed"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          disabled={!isEditingProfile}
                          error={!!profileErrors.phone}
                          helperText={profileErrors.phone}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          disabled={!isEditingProfile}
                          multiline
                          rows={3}
                          error={!!profileErrors.address}
                          helperText={profileErrors.address}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Password Section */}
                <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Password
                      </Typography>
                      {!isEditingPassword ? (
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => setIsEditingPassword(true)}
                          disabled={!user?.credentials?.passwordHash}
                        >
                          Change Password
                        </Button>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handlePasswordUpdate}
                          >
                            Update
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={cancelPasswordEdit}
                          >
                            Cancel
                          </Button>
                        </Box>
                      )}
                    </Box>

                    {!user?.credentials?.passwordHash && (
                      <Alert severity="info" sx={{ mb: 3 }}>
                        Password change is not available for Google accounts.
                      </Alert>
                    )}

                    {isEditingPassword && (
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Current Password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            error={!!passwordErrors.currentPassword}
                            helperText={passwordErrors.currentPassword}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  edge="end"
                                >
                                  {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            error={!!passwordErrors.newPassword}
                            helperText={passwordErrors.newPassword}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  edge="end"
                                >
                                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            error={!!passwordErrors.confirmPassword}
                            helperText={passwordErrors.confirmPassword}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                >
                                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Profile Image Dialog */}
      <Dialog open={isImageDialogOpen} onClose={() => setIsImageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Upload from Device</Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-image-file"
              type="file"
              onChange={(e) => setImageForm({ ...imageForm, file: e.target.files[0], imageUrl: '' })}
            />
            <label htmlFor="profile-image-file">
              <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />}>
                Choose Image
              </Button>
            </label>
            {imageForm.file && (
              <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                Selected: {imageForm.file.name}
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>
          
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Enter Image URL</Typography>
            <TextField
              fullWidth
              label="Image URL"
              value={imageForm.imageUrl}
              onChange={(e) => setImageForm({ ...imageForm, imageUrl: e.target.value, file: null })}
              error={!!imageErrors.imageUrl}
              helperText={imageErrors.imageUrl || "Enter a valid image URL"}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsImageDialogOpen(false);
            setImageForm({ imageUrl: '', file: null });
          }}>
            Cancel
          </Button>
          <Button onClick={handleImageUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default ProfilePage;
