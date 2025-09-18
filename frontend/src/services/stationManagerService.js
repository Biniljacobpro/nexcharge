import { authFetch } from '../utils/api';

const API_BASE = '/station-manager';

export const stationManagerService = {
  // Get dashboard data
  getDashboardData: async () => {
    try {
      const response = await authFetch(`${API_BASE}/dashboard`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch dashboard data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get station bookings
  getStationBookings: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.date) queryParams.append('date', params.date);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await authFetch(`${API_BASE}/bookings?${queryParams}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch bookings');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status, notes = '') => {
    try {
      const response = await authFetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update booking status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Get performance reports
  getPerformanceReports: async (period = '30d') => {
    try {
      const response = await authFetch(`${API_BASE}/reports?period=${period}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch performance reports');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching performance reports:', error);
      throw error;
    }
  }
};

export default stationManagerService;
