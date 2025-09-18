import Station from '../models/station.model.js';
import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';

// Get dashboard data for station manager
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's assigned stations
    const user = await User.findById(userId).populate('roleSpecificData.stationManagerInfo.assignedStations');
    const assignedStations = user?.roleSpecificData?.stationManagerInfo?.assignedStations || [];
    
    if (assignedStations.length === 0) {
      return res.json({
        success: true,
        data: {
          stationInfo: {
            totalStations: 0,
            availableSlots: 0,
            totalSlots: 0,
            uptime: 0,
            utilizationRate: 0,
            monthlyRevenue: 0
          },
          assignedStations: [],
          todayBookings: [],
          recentBookings: [],
          maintenanceSchedule: [],
          performanceMetrics: {
            utilizationRate: 0,
            averageRating: 0,
            totalSessions: 0,
            monthlyRevenue: 0
          },
          recentFeedback: []
        }
      });
    }

    const stationIds = assignedStations.map(station => station._id);
    
    // Get station details
    const stations = await Station.find({ _id: { $in: stationIds } });
    
    // Calculate station info
    const totalSlots = stations.reduce((sum, station) => sum + (station.capacity?.totalChargers || 0), 0);
    const availableSlots = stations.reduce((sum, station) => {
      const available = station.capacity?.chargers?.filter(c => c.isAvailable).length || 0;
      return sum + available;
    }, 0);
    
    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayBookings = await Booking.find({
      station: { $in: stationIds },
      startTime: { $gte: today, $lt: tomorrow },
      status: { $in: ['confirmed', 'pending'] }
    }).populate('user', 'personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone')
      .populate('station', 'name location.address')
      .sort({ startTime: 1 });

    // Get recent bookings (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentBookings = await Booking.find({
      station: { $in: stationIds },
      startTime: { $gte: weekAgo },
      status: { $in: ['confirmed', 'completed', 'cancelled'] }
    }).populate('user', 'personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone')
      .populate('station', 'name location.address')
      .sort({ startTime: -1 })
      .limit(10);

    // Mock maintenance schedule (you can implement real maintenance tracking)
    const maintenanceSchedule = [
      {
        id: '1',
        type: 'Routine Inspection',
        station: stations[0]?.name || 'Station 1',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration: '2 hours',
        status: 'scheduled',
        description: 'Monthly routine inspection of charging equipment'
      },
      {
        id: '2',
        type: 'Software Update',
        station: stations[0]?.name || 'Station 1',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        duration: '1 hour',
        status: 'scheduled',
        description: 'Update charging station software to latest version'
      }
    ];

    // Calculate performance metrics
    const totalBookings = await Booking.countDocuments({
      station: { $in: stationIds },
      status: 'completed'
    });
    
    const utilizationRate = totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots * 100).toFixed(1) : 0;
    const monthlyRevenue = totalBookings * 150; // Mock calculation: ₹150 per booking

    // Mock recent feedback
    const recentFeedback = [
      {
        id: '1',
        user: 'John Doe',
        station: stations[0]?.name || 'Station 1',
        rating: 4.5,
        comment: 'Great charging experience, fast and reliable.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'pending'
      },
      {
        id: '2',
        user: 'Sarah Wilson',
        station: stations[0]?.name || 'Station 1',
        rating: 5.0,
        comment: 'Excellent service, will definitely come back!',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'responded'
      }
    ];

    res.json({
      success: true,
      data: {
        stationInfo: {
          totalStations: stations.length,
          availableSlots,
          totalSlots,
          uptime: 98.5, // Mock uptime percentage
          utilizationRate: parseFloat(utilizationRate),
          monthlyRevenue
        },
        assignedStations: stations.map(station => ({
          id: station._id,
          name: station.name,
          location: station.location?.address || 'N/A',
          status: station.operational?.isActive ? 'active' : 'inactive',
          totalChargers: station.capacity?.totalChargers || 0,
          availableChargers: station.capacity?.chargers?.filter(c => c.isAvailable).length || 0,
          chargerTypes: station.capacity?.chargerTypes || [],
          basePrice: station.pricing?.basePricePerKwh || 0
        })),
        todayBookings: todayBookings.map(booking => ({
          id: booking._id,
          user: `${booking.user?.personalInfo?.firstName || ''} ${booking.user?.personalInfo?.lastName || ''}`.trim(),
          email: booking.user?.personalInfo?.email || '',
          phone: booking.user?.personalInfo?.phone || '',
          station: booking.station?.name || '',
          chargerType: booking.chargerType,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          vehicleMake: booking.vehicleInfo?.make || '',
          vehicleModel: booking.vehicleInfo?.model || ''
        })),
        recentBookings: recentBookings.map(booking => ({
          id: booking._id,
          user: `${booking.user?.personalInfo?.firstName || ''} ${booking.user?.personalInfo?.lastName || ''}`.trim(),
          email: booking.user?.personalInfo?.email || '',
          phone: booking.user?.personalInfo?.phone || '',
          station: booking.station?.name || '',
          chargerType: booking.chargerType,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          vehicleMake: booking.vehicleInfo?.make || '',
          vehicleModel: booking.vehicleInfo?.model || ''
        })),
        maintenanceSchedule,
        performanceMetrics: {
          utilizationRate: parseFloat(utilizationRate),
          averageRating: 4.3, // Mock average rating
          totalSessions: totalBookings,
          monthlyRevenue
        },
        recentFeedback
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get bookings for assigned stations
export const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, date } = req.query;
    
    // Get user's assigned stations
    const user = await User.findById(userId);
    const assignedStations = user?.roleSpecificData?.stationManagerInfo?.assignedStations || [];
    
    if (assignedStations.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const query = { station: { $in: assignedStations } };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.startTime = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone')
      .populate('station', 'name location.address')
      .sort({ startTime: -1 });

    res.json({
      success: true,
      data: bookings.map(booking => ({
        id: booking._id,
        user: `${booking.user?.personalInfo?.firstName || ''} ${booking.user?.personalInfo?.lastName || ''}`.trim(),
        email: booking.user?.personalInfo?.email || '',
        phone: booking.user?.personalInfo?.phone || '',
        station: booking.station?.name || '',
        chargerType: booking.chargerType,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        vehicleMake: booking.vehicleInfo?.make || '',
        vehicleModel: booking.vehicleInfo?.model || ''
      }))
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if station manager has access to this booking's station
    const userId = req.user.id;
    const user = await User.findById(userId);
    const assignedStations = user?.roleSpecificData?.stationManagerInfo?.assignedStations || [];
    
    if (!assignedStations.includes(booking.station)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this booking'
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        id: booking._id,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Get performance reports
export const getReports = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's assigned stations
    const user = await User.findById(userId);
    const assignedStations = user?.roleSpecificData?.stationManagerInfo?.assignedStations || [];
    
    if (assignedStations.length === 0) {
      return res.json({
        success: true,
        data: {
          utilizationRate: 0,
          averageRating: 0,
          totalSessions: 0,
          monthlyRevenue: 0
        }
      });
    }

    // Calculate metrics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalBookings = await Booking.countDocuments({
      station: { $in: assignedStations },
      startTime: { $gte: thirtyDaysAgo },
      status: 'completed'
    });

    const monthlyRevenue = totalBookings * 150; // Mock calculation

    res.json({
      success: true,
      data: {
        utilizationRate: 75.5, // Mock data
        averageRating: 4.3, // Mock data
        totalSessions: totalBookings,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Placeholder functions for future implementation
export const getMaintenanceSchedule = async (req, res) => {
  res.json({
    success: true,
    data: []
  });
};

export const createMaintenanceTask = async (req, res) => {
  res.json({
    success: true,
    message: 'Maintenance task created successfully'
  });
};

export const updateMaintenanceTask = async (req, res) => {
  res.json({
    success: true,
    message: 'Maintenance task updated successfully'
  });
};

export const getFeedback = async (req, res) => {
  res.json({
    success: true,
    data: []
  });
};

export const respondToFeedback = async (req, res) => {
  res.json({
    success: true,
    message: 'Feedback response submitted successfully'
  });
};
