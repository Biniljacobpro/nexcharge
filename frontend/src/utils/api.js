const API_BASE = process.env.REACT_APP_API_BASE || 
  (process.env.NODE_ENV === 'production'
    ? 'https://nexcharge-qu9o.vercel.app/api'
    : 'http://localhost:4000/api');

const getTokens = () => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
});

const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

const authFetch = async (url, options = {}) => {
  const { accessToken, refreshToken } = getTokens();
  
  // Add auth header if we have an access token
  const headers = {
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    ...options.headers,
  };
  
  let res = await fetch(url, { ...options, headers });
  
  // If we get a 401 and have a refresh token, try to refresh
  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (refreshRes.ok) {
      const { accessToken: newAccessToken } = await refreshRes.json();
      setTokens({ accessToken: newAccessToken, refreshToken });
      
      // Retry the original request with new token
      const retryHeaders = {
        ...headers,
        'Authorization': `Bearer ${newAccessToken}`,
      };
      res = await fetch(url, { ...options, headers: retryHeaders });
    }
  }
  
  return res;
};

// Auth API
export const loginApi = async ({ email, password }) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || 'Login failed');
    error.status = res.status;
    throw error;
  }
  setTokens(data);
  return data;
};

export const googleSignInApi = async (idToken) => {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Google sign-in failed');
  setTokens(data);
  return data;
};

export const signupApi = async ({ firstName, lastName, email, password }) => {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.errors && Array.isArray(data.errors)) {
      throw new Error(`Validation error: ${data.errors.join(', ')}`);
    }
    throw new Error(data.error || data.message || 'Signup failed');
  }
  return data;
};

export const logoutApi = async () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const meApi = async () => {
  const res = await authFetch(`${API_BASE}/auth/me`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
  return data;
};

export const refreshApi = async (refreshToken) => {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Token refresh failed');
  return data;
};

// Admin Station Management API
export const adminGetStations = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const res = await authFetch(`${API_BASE}/admin/stations${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to load stations');
  return data.data || [];
};

export const adminUpdateStationStatus = async (id, status) => {
  const res = await authFetch(`${API_BASE}/admin/stations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to update station status');
  return data.data;
};

export const adminUpdateStationManager = async (id, managerId) => {
  const res = await authFetch(`${API_BASE}/admin/stations/${id}/manager`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ managerId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to update station manager');
  return data.data;
};

// Vehicles
export const getVehiclesApi = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const res = await authFetch(`${API_BASE}/vehicles${qs ? `?${qs}` : ''}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to load vehicles');
  return data;
};

export const createVehicleApi = async (payload) => {
  const res = await authFetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.errors && Array.isArray(data.errors)) {
      throw new Error(`Validation error: ${data.errors.join(', ')}`);
    }
    throw new Error(data.error || data.message || 'Failed to create vehicle');
  }
  return data;
};

export const updateVehicleApi = async (id, payload) => {
  const res = await authFetch(`${API_BASE}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.errors && Array.isArray(data.errors)) {
      throw new Error(`Validation error: ${data.errors.join(', ')}`);
    }
    throw new Error(data.error || data.message || 'Failed to update vehicle');
  }
  return data;
};

export const deleteVehicleApi = async (id, hardDelete = false) => {
  const res = await authFetch(`${API_BASE}/vehicles/${id}?hardDelete=${hardDelete ? 'true' : 'false'}`, { method: 'DELETE' });    
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to delete vehicle');
  return data;
};

// Vehicle Requests
export const createVehicleRequestApi = async ({ make, model }) => {
  const res = await authFetch(`${API_BASE}/vehicle-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ make, model })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to submit vehicle request');
  return data;
};

export const getVehicleRequestsApi = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const res = await authFetch(`${API_BASE}/vehicle-requests${qs ? `?${qs}` : ''}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to load vehicle requests');
  return data;
};

export const updateVehicleRequestStatusApi = async (id, { status, notes }) => {
  const res = await authFetch(`${API_BASE}/vehicle-requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to update vehicle request');
  return data;
};

export const deleteVehicleRequestApi = async (id) => {
  const res = await authFetch(`${API_BASE}/vehicle-requests/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to delete vehicle request');
  return data;
};

export const getModelsByMakeApi = async (make) => {
  const url = `${API_BASE}/vehicles/models?make=${encodeURIComponent(make)}`;
  const res = await authFetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to load models');
  return data.data || [];
};

export const getCapacitiesByMakeModelApi = async (make, model) => {
  const url = `${API_BASE}/vehicles/capacities?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
  const res = await authFetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to load capacities');
  return data.data || [];
};

export const getMakesApi = async () => {
  const url = `${API_BASE}/vehicles/makes`;
  const res = await authFetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to load makes');
  return data.data || [];
};

// Public stations listing
export const getPublicStationsApi = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const url = `${API_BASE}/public/stations${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to load stations');
  return data;
};

// Bookings
export const updateBookingApi = async (bookingId, payload) => {
  const res = await authFetch(`${API_BASE}/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to update booking');
  return data;
};

export const cancelBookingApi = async (bookingId, reason) => {
  const res = await authFetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to cancel booking');
  return data;
};

// OTP and charging functions
export const generateOTPApi = async (bookingId) => {
  const res = await authFetch(`${API_BASE}/bookings/${bookingId}/generate-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to generate OTP');
  return data;
};

export const verifyOTPApi = async (bookingId, otp) => {
  const res = await authFetch(`${API_BASE}/bookings/${bookingId}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to verify OTP');
  return data;
};

export const stopChargingApi = async (bookingId) => {
  const res = await authFetch(`${API_BASE}/bookings/${bookingId}/stop-charging`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to stop charging');
  return data;
};

export default API_BASE;