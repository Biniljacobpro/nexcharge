import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { signupApi, checkEmailAvailabilityApi } from '../utils/api';
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
  const [emailChecking, setEmailChecking] = useState(false);
  const debounceTimerRef = useRef(null);
  const allowedDomains = useMemo(() => ['gmail.com', 'mca.ajce.in'], []);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailFormatValid = useMemo(() => {
    const email = formData.email.trim().toLowerCase();
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  }, [formData.email]);

  const emailDomainValid = useMemo(() => {
    const email = formData.email.trim().toLowerCase();
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    return allowedDomains.includes(parts[1]);
  }, [formData.email, allowedDomains]);

  const validateForm = () => {
    const newErrors = {};

    const nameRegex = /^[A-Za-z]+$/;

    // First name: required, letters only, no spaces
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!nameRegex.test(formData.firstName)) {
      newErrors.firstName = 'Letters only, no spaces';
    }

    // Last name: required, letters only, no spaces
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName = 'Letters only, no spaces';
    }

    // Email: required, format, and allowed domain check
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailFormatValid) {
      newErrors.email = 'Invalid email format';
    } else if (!emailDomainValid) {
      newErrors.email = 'Enter a valid email domain';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'At least 6 characters';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Include at least one number';
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?`~]/.test(formData.password)) {
      newErrors.password = 'Include at least one special character';
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
    const value = field === 'newsletter' ? event.target.checked : event.target.value;
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Live validation per field
    setErrors((prev) => {
      const next = { ...prev };
      if (field === 'firstName') {
        const nameRegex = /^[A-Za-z]+$/;
        if (!updated.firstName.trim()) next.firstName = 'First name is required';
        else if (!nameRegex.test(updated.firstName)) next.firstName = 'Letters only, no spaces';
        else next.firstName = '';
      }
      if (field === 'lastName') {
        const nameRegex = /^[A-Za-z]+$/;
        if (!updated.lastName.trim()) next.lastName = 'Last name is required';
        else if (!nameRegex.test(updated.lastName)) next.lastName = 'Letters only, no spaces';
        else next.lastName = '';
      }
      if (field === 'password') {
        if (!updated.password) next.password = 'Password is required';
        else if (updated.password.length < 6) next.password = 'At least 6 characters';
        else if (!/\d/.test(updated.password)) next.password = 'Include at least one number';
        else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?`~]/.test(updated.password)) next.password = 'Include at least one special character';
        else next.password = '';
        // Also update confirm match on password change
        if (updated.confirmPassword && updated.confirmPassword !== updated.password) {
          next.confirmPassword = 'Passwords do not match';
        } else if (updated.confirmPassword) {
          next.confirmPassword = '';
        }
      }
      if (field === 'confirmPassword') {
        if (!updated.confirmPassword) next.confirmPassword = 'Confirm your password';
        else if (updated.confirmPassword !== updated.password) next.confirmPassword = 'Passwords do not match';
        else next.confirmPassword = '';
      }
      if (field === 'email') {
        const email = updated.email.trim().toLowerCase();
        if (!email) next.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = 'Invalid email format';
        else if (!allowedDomains.includes(email.split('@')[1] || '')) next.email = 'Enter a valid email domain';
        else next.email = '';
      }
      return next;
    });
  };

  // Real-time email availability check with debounce
  useEffect(() => {
    if (!formData.email) {
      return;
    }
    if (!emailFormatValid) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
      return;
    }
    if (!emailDomainValid) {
      setErrors((prev) => ({ ...prev, email: 'Enter a valid email domain' }));
      return;
    }
    setErrors((prev) => ({ ...prev, email: '' }));
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setEmailChecking(true);
        const { available } = await checkEmailAvailabilityApi(formData.email.trim());
        if (!available) {
          setErrors((prev) => ({ ...prev, email: 'Email already in use' }));
        }
      } catch (e) {
        setErrors((prev) => ({ ...prev, email: e.message || 'Failed to validate email' }));
      } finally {
        setEmailChecking(false);
      }
    }, 400);
    return () => debounceTimerRef.current && clearTimeout(debounceTimerRef.current);
  }, [formData.email, emailFormatValid]);

  const handleEmailBlur = async () => {
    if (!formData.email || !emailFormatValid) return;
    try {
      setEmailChecking(true);
      const { available } = await checkEmailAvailabilityApi(formData.email.trim());
      if (!available) {
        setErrors((prev) => ({ ...prev, email: 'Email already in use' }));
      }
    } catch (e) {
      setErrors((prev) => ({ ...prev, email: e.message || 'Failed to validate email' }));
    } finally {
      setEmailChecking(false);
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
                            onBlur={handleEmailBlur}
                            error={!!errors.email}
                            helperText={errors.email || (emailChecking ? 'Checking email…' : '')}
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
