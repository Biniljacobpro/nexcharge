const API_BASE = process.env.REACT_APP_API_BASE || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://nexcharge-qu9o.vercel.app' 
    : 'http://localhost:4000');

const getTokens = () => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
});

const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};
