import React from 'react';
import { Stack, Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { googleLoginApi } from '../utils/api';
import { firebaseGoogleSignIn } from '../utils/firebase';

const buttonSx = {
  border: '1px solid #e5e7eb',
  color: 'text.primary',
  backgroundColor: '#ffffff',
  textTransform: 'none',
  '&:hover': { backgroundColor: '#f9fafb' }
};

const SocialAuthRow = ({ onGoogleSuccess }) => {
  const handleGoogle = async () => {
    try {
      const { idToken } = await firebaseGoogleSignIn();
      const data = await googleLoginApi(idToken);
      if (onGoogleSuccess) onGoogleSuccess(data);
    } catch (e) {
      console.error(e);
      alert('Google sign-in failed: ' + e.message);
    }
  };

  return (
    <Stack direction="row" justifyContent="center">
      <Button onClick={handleGoogle} variant="outlined" startIcon={<GoogleIcon />} sx={buttonSx}>
        Continue with Google
      </Button>
    </Stack>
  );
};

export default SocialAuthRow;
