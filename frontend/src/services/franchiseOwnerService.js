import { authFetch } from '../utils/api';

// Always call the backend API host, not a relative path to the frontend
const API_BASE = `${process.env.REACT_APP_API_BASE || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://nexcharge-qu9o.vercel.app/api' 
    : 'http://localhost:4000/api')}/franchise-owner`;

export const franchiseOwnerService = {
  // Get dashboard overview data
  getDashboardData: async () => {
    try {
      const response = await authFetch(`${API_BASE}/dashboard`);
      const isJson = response.headers.get('content-type')?.includes('application/json');
      if (!response.ok) {
        if (isJson) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || err.error || 'Failed to fetch dashboard data');
        }
        throw new Error(`Request failed with status ${response.status}`);
      }
      return isJson ? await response.json() : {};
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get analytics data
  getAnalytics: async (period = '7d') => {
    try {
      const response = await authFetch(`${API_BASE}/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  },

  // Get stations list
  getStations: async () => {
    try {
      const response = await authFetch(`${API_BASE}/stations`);
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stations:', error);
      throw error;
    }
  },

  // Add new station
  addStation: async (stationData) => {
    try {
      const response = await authFetch(`${API_BASE}/stations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stationData),
      });
      if (!response.ok) {
        throw new Error('Failed to add station');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding station:', error);
      throw error;
    }
  },

  // Update station
  updateStation: async (stationId, stationData) => {
    try {
      const response = await authFetch(`${API_BASE}/stations/${stationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stationData),
      });
      if (!response.ok) {
        throw new Error('Failed to update station');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating station:', error);
      throw error;
    }
  },

  // Delete station
  deleteStation: async (stationId) => {
    try {
      const response = await authFetch(`${API_BASE}/stations/${stationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete station');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting station:', error);
      throw error;
    }
  },

  // Get compliance status
  getComplianceStatus: async () => {
    try {
      const response = await authFetch(`${API_BASE}/compliance`);
      if (!response.ok) {
        throw new Error('Failed to fetch compliance status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching compliance status:', error);
      throw error;
    }
  },

  // Get promotions
  getPromotions: async () => {
    try {
      const response = await authFetch(`${API_BASE}/promotions`);
      if (!response.ok) {
        throw new Error('Failed to fetch promotions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  },

  // Station managers
  getStationManagers: async () => {
    try {
      const response = await authFetch(`${API_BASE}/managers`);
      if (!response.ok) throw new Error('Failed to fetch station managers');
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error('Error fetching station managers:', error);
      throw error;
    }
  },

  addStationManager: async (managerData) => {
    try {
      const response = await authFetch(`${API_BASE}/managers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(managerData)
      });
      const isJson = response.headers.get('content-type')?.includes('application/json');
      if (!response.ok) {
        const err = isJson ? await response.json().catch(() => ({})) : {};
        throw new Error(err.message || err.error || 'Failed to add station manager');
      }
      return isJson ? await response.json() : {};
    } catch (error) {
      console.error('Error adding station manager:', error);
      throw error;
    }
  },

  updateStationManager: async (managerId, managerData) => {
    try {
      const response = await authFetch(`${API_BASE}/managers/${managerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(managerData)
      });
      if (!response.ok) throw new Error('Failed to update station manager');
      return await response.json();
    } catch (error) {
      console.error('Error updating station manager:', error);
      throw error;
    }
  },

  deleteStationManager: async (managerId) => {
    try {
      const response = await authFetch(`${API_BASE}/managers/${managerId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete station manager');
      return await response.json();
    } catch (error) {
      console.error('Error deleting station manager:', error);
      throw error;
    }
  },

  // Create promotion
  createPromotion: async (promotionData) => {
    try {
      const response = await authFetch(`${API_BASE}/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData),
      });
      if (!response.ok) {
        throw new Error('Failed to create promotion');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  },

  // Update promotion
  updatePromotion: async (promotionId, promotionData) => {
    try {
      const response = await authFetch(`${API_BASE}/promotions/${promotionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData),
      });
      if (!response.ok) {
        throw new Error('Failed to update promotion');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  },

  // Delete promotion
  deletePromotion: async (promotionId) => {
    try {
      const response = await authFetch(`${API_BASE}/promotions/${promotionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete promotion');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  },

  // Get bookings
  getBookings: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });

      const response = await authFetch(`${API_BASE}/bookings?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await authFetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Get revenue data
  getRevenue: async (startDate, endDate) => {
    try {
      const response = await authFetch(`${API_BASE}/revenue?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
  },

  // Get user feedback
  getUserFeedback: async () => {
    try {
      const response = await authFetch(`${API_BASE}/feedback`);
      if (!response.ok) {
        throw new Error('Failed to fetch user feedback');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      throw error;
    }
  },

  // Respond to feedback
  respondToFeedback: async (feedbackId, response) => {
    try {
      const res = await authFetch(`${API_BASE}/feedback/${feedbackId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) {
        throw new Error('Failed to respond to feedback');
      }
      return await res.json();
    } catch (error) {
      console.error('Error responding to feedback:', error);
      throw error;
    }
  },

  // Get maintenance requests
  getMaintenanceRequests: async () => {
    try {
      const response = await authFetch(`${API_BASE}/maintenance`);
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance requests');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      throw error;
    }
  },

  // Update maintenance request status
  updateMaintenanceStatus: async (requestId, status) => {
    try {
      const response = await authFetch(`${API_BASE}/maintenance/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update maintenance status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      throw error;
    }
  }
};

export default franchiseOwnerService;