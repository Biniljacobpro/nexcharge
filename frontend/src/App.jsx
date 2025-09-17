import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import theme from './theme';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserHomePage from './pages/UserHomePage';
import ProfilePage from './pages/ProfilePage';
import CorporateApplicationPage from './pages/CorporateApplicationPage';
import CorporateDashboard from './pages/CorporateDashboard';
import FranchiseOwnerDashboard from './pages/FranchiseOwnerDashboard';
import StationManagerDashboard from './pages/StationManagerDashboard';
import FirstLoginReset from './pages/FirstLoginReset';
import StationManagerPasswordReset from './pages/StationManagerPasswordReset';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/home" element={<UserHomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/apply-corporate" element={<CorporateApplicationPage />} />
            <Route path="/corporate/dashboard" element={<CorporateDashboard />} />
            <Route path="/franchise/dashboard" element={<FranchiseOwnerDashboard />} />
            <Route path="/station-manager/dashboard" element={<StationManagerDashboard />} />
            <Route path="/first-login-reset" element={<FirstLoginReset />} />
            <Route path="/station-manager/password-reset" element={<StationManagerPasswordReset />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </ThemeProvider>
  );
}

export default App;
