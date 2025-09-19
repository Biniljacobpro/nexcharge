import React, { useMemo, useState } from 'react';
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
import Link from '@mui/material/Link';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import { loginApi } from '../utils/api';
import SocialAuthRow from '../components/SocialAuthRow';

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: true,
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const allowedDomains = useMemo(() => ['gmail.com', 'mca.ajce.in'], []);
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailFormatValid) {
      newErrors.email = 'Invalid email format';
    } else if (!emailDomainValid) {
      newErrors.email = 'Enter a valid email domain';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    const value = field === 'remember' ? event.target.checked : event.target.value;
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Live validation as user types
    setErrors((prev) => {
      const next = { ...prev };
      if (field === 'email') {
        const email = updated.email.trim().toLowerCase();
        if (!email) next.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = 'Invalid email format';
        else if (!allowedDomains.includes((email.split('@')[1] || ''))) next.email = 'Enter a valid email domain';
        else next.email = '';
      }
      if (field === 'password') {
        if (!updated.password) next.password = 'Password is required';
        else next.password = '';
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    try {
      const data = await loginApi({ email: formData.email, password: formData.password });
      setShowSuccess(true);
      
      // Determine redirect based on user role
      let next = '/home';
      if (data?.user?.role === 'admin') {
        next = '/admin';
      } else if (data?.user?.role === 'corporate_admin') {
        // If backend signals password change required, redirect to first-login reset
        if (data?.user?.credentials?.mustChangePassword) {
          next = '/first-login-reset';
        } else {
          next = '/corporate/dashboard';
        }
      } else if (data?.user?.role === 'franchise_owner') {
        // If backend signals password change required, redirect to first-login reset
        if (data?.user?.credentials?.mustChangePassword) {
          next = '/first-login-reset';
        } else {
          next = '/franchise/dashboard';
        }
      }
      
      setTimeout(() => navigate(next), 600);
    } catch (e) {
      setErrors({ ...errors, password: e.message });
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
                  Charge Smarter
                </Typography>
                <Typography variant="h2" sx={{ color: theme.palette.secondary.dark, fontWeight: 700, mb: 2 }}>
                  Drive Greener
                </Typography>
                <Typography variant="h2" sx={{ color: theme.palette.secondary.dark, fontWeight: 700, mb: 3 }}>
                  To a Better Future
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
                 NexCharge makes EV charging effortless with smart booking, real-time station updates, and eco-friendly energy insights. 
                 Find nearby chargers, reserve slots, and power your journey with clean, reliable, and sustainable energy — all in one simple platform.
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
                        Login successful! Redirecting...
                      </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') { handleSubmit(e); } }}>
                      <Grid container spacing={2}>
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
                          <Typography variant="body2" color="text.secondary" align="right">
                            <Link component="button" variant="body2" underline="hover" onClick={() => navigate('/forgot-password')} sx={{ cursor: 'pointer' }}>
                              Forgot your password?
                            </Link>
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained" fullWidth sx={{ py: 1.25, mt: 2 }}>
                            Sign In
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>

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
                        Don’t have an account?{' '}
                        <Link component="button" variant="body2" underline="hover" onClick={() => navigate('/signup')} sx={{ cursor: 'pointer' }}>
                          Sign up
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

export default LoginPage;
