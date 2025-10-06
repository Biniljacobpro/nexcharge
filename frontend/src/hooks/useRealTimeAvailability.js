import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

// Custom hook for real-time availability of multiple stations
export const useRealTimeAvailability = (stationIds, refreshInterval = 30000) => {
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailability = useCallback(async () => {
    if (!stationIds || stationIds.length === 0) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/availability/stations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stationIds })
      });

      const result = await response.json();
      
      if (result.success) {
        setAvailability(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch availability');
      }
    } catch (err) {
      setError(err.message || 'Network error');
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  }, [stationIds]);

  // Initial fetch
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Set up interval for real-time updates
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(fetchAvailability, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAvailability, refreshInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return {
    availability,
    loading,
    error,
    refresh
  };
};

// Custom hook for single station availability
export const useSingleStationAvailability = (stationId, refreshInterval = 30000) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailability = useCallback(async () => {
    if (!stationId) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/availability/station/${stationId}`);
      const result = await response.json();
      
      if (result.success) {
        setAvailability(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch availability');
      }
    } catch (err) {
      setError(err.message || 'Network error');
      console.error('Error fetching station availability:', err);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  // Initial fetch
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Set up interval for real-time updates
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(fetchAvailability, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAvailability, refreshInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return {
    availability,
    loading,
    error,
    refresh
  };
};

export default useRealTimeAvailability;
