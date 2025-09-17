import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  useTheme,
  InputAdornment,
  IconButton,
  Grid,
  Stack,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import { signupApi } from '../utils/api';
import SocialAuthRow from '../components/SocialAuthRow';
import Link from '@mui/material/Link';

const SignupPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletter: true,
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'At least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: field === 'newsletter' ? event.target.checked : event.target.value,
    });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    try {
      const data = await signupApi({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      setShowSuccess(true);
      
      // Determine redirect based on user role
      let next = '/home';
      if (data?.user?.role === 'admin') {
        next = '/admin';
      } else if (data?.user?.role === 'corporate_admin') {
        next = '/corporate/dashboard';
      }
      
      setTimeout(() => navigate(next), 1000);
    } catch (e) {
      setErrors({ ...errors, email: e.message });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <AnimatedBackground />
      <Navbar />

      <Box component="main" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            {/* Left: Headline */}
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <Typography variant="h2" sx={{ color: '#1f2937', fontWeight: 700, mb: 2 }}>
                  The best offer
                </Typography>
                <Typography variant="h2" sx={{ color: theme.palette.secondary.dark, fontWeight: 700, mb: 2 }}>
                  for your
                </Typography>
                <Typography variant="h2" sx={{ color: theme.palette.secondary.dark, fontWeight: 700, mb: 3 }}>
                  business
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
                  Power your business with NexCharge — onboard customers faster, manage charging seamlessly, and unlock
                  real-time insights for stations, pricing, and performance.Also for the ev drivers, find nearby chargers, reserve slots, and power your journey with clean, reliable, and sustainable energy — all in one simple platform.
                </Typography>
              </motion.div>
            </Grid>

            {/* Right: Form Card */}
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent>
                    {showSuccess && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Account created successfully! Redirecting...
                      </Alert>
                    )}

                    {/* Email/password form */}
                    <Box component="form" onSubmit={handleSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="First name"
                            fullWidth
                            value={formData.firstName}
                            onChange={handleInputChange('firstName')}
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Last name"
                            fullWidth
                            value={formData.lastName}
                            onChange={handleInputChange('lastName')}
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Email address"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            error={!!errors.email}
                            helperText={errors.email}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            error={!!errors.password}
                            helperText={errors.password}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Confirm password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            fullWidth
                            value={formData.confirmPassword}
                            onChange={handleInputChange('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained" fullWidth sx={{ py: 1.25 }}>
                            Sign Up
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Divider and Social row */}
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ my: 2 }}>
                      <Divider flexItem />
                      <Typography variant="body2" color="text.secondary">
                        or continue with
                      </Typography>
                      <Divider flexItem />
                    </Stack>
                    <SocialAuthRow onGoogleSuccess={(data) => navigate(data?.user?.role === 'admin' ? '/admin' : '/home')} />

                    <Stack alignItems="center" sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <Link component="button" variant="body2" underline="hover" onClick={() => navigate('/login')} sx={{ cursor: 'pointer' }}>
                          Login
                        </Link>
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default SignupPage;
