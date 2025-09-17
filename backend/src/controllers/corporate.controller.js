import Corporate from '../models/corporate.model.js';
import User from '../models/user.model.js';
import Station from '../models/station.model.js';
import Booking from '../models/booking.model.js';
import Franchise from '../models/franchise.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendFranchiseOwnerWelcomeEmail } from '../utils/emailService.js';

// Resolve corporateId from JWT payload or DB (for corporate admins)
const resolveCorporateIdFromRequest = async (req) => {
  if (req?.user?.corporateId) return req.user.corporateId;
  if (!req?.user?.sub) return null;
  try {
    const requester = await User.findById(req.user.sub).select('roleSpecificData.corporateAdminInfo.corporateId');
    return requester?.roleSpecificData?.corporateAdminInfo?.corporateId || null;
  } catch (_e) {
    return null;
  }
};

// Get corporate dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const corporateId = await resolveCorporateIdFromRequest(req);
    if (!corporateId) return res.status(403).json({ success: false, message: 'Corporate context not found' });
    
    // Get franchise owners (users with role 'franchise' under this corporate)
    const franchiseOwners = await User.find({ 
      role: 'franchise_owner', 
      'roleSpecificData.franchiseOwnerInfo.franchiseId': { $exists: true }
    }).select('personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone status createdAt roleSpecificData');

    // Get total stations under this corporate
    const stations = await Station.find({ corporateId: corporateId });
    
    // Get total bookings and revenue
    const bookings = await Booking.find({ 
      'roleSpecificData.franchiseOwnerInfo.franchiseId': { $exists: true },
      status: { $in: ['completed', 'in-progress'] }
    });

    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    
    // Calculate monthly growth (mock calculation)
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentMonthRevenue = bookings
      .filter(b => new Date(b.createdAt).getMonth() === currentMonth)
      .reduce((sum, booking) => sum + (booking.amount || 0), 0);
    const lastMonthRevenue = bookings
      .filter(b => new Date(b.createdAt).getMonth() === lastMonth)
      .reduce((sum, booking) => sum + (booking.amount || 0), 0);
    
    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    // Calculate network utilization (mock calculation)
    const totalCapacity = stations.length * 8; // Assuming 8 slots per station
    const activeBookings = bookings.filter(b => b.status === 'in-progress').length;
    const networkUtilization = totalCapacity > 0 ? (activeBookings / totalCapacity * 100).toFixed(1) : 0;

    // Get average rating (mock calculation)
    const averageRating = 4.6; // This would be calculated from actual ratings

    const dashboardData = {
      totalFranchises: franchiseOwners.length,
      totalStations: stations.length,
      totalRevenue: totalRevenue,
      monthlyGrowth: parseFloat(monthlyGrowth),
      activeBookings: activeBookings,
      totalUsers: bookings.length, // Total unique users who booked
      networkUtilization: parseFloat(networkUtilization),
      averageRating: averageRating,
      franchises: franchiseOwners.map(franchise => ({
        id: franchise._id,
        name: `${franchise.personalInfo?.firstName || ''} ${franchise.personalInfo?.lastName || ''}`.trim(),
        email: franchise.personalInfo?.email,
        phone: franchise.personalInfo?.phone,
        status: franchise.status,
        joinDate: franchise.createdAt
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Add new franchise owner
export const addFranchiseOwner = async (req, res) => {
  try {
    const {
      // Personal Information
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country = 'India',
      
      // Business Information
      franchiseName,
      businessType = 'individual',
      registrationNumber,
      gstNumber,
      panNumber,
      licenseNumber,
      
      // Financial Information
      profitShare = 15,
      commissionRate = 10,
      
      // Bank Details
      bankAccountNumber,
      bankIfscCode,
      bankName,
      bankAccountHolderName,
      
      // Operational Information
      territory,
      minimumStations = 1,
      maximumStations = 10,
      
      status = 'pending'
    } = req.body;

    const corporateId = await resolveCorporateIdFromRequest(req);
    if (!corporateId) {
      return res.status(403).json({ success: false, message: 'Corporate context not found' });
    }

    // Validation
    if (!firstName || !lastName || !email || !phone || !franchiseName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, phone, franchiseName'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be exactly 10 digits'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ 'personalInfo.email': email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check if franchise name already exists for this corporate
    const existingFranchise = await Franchise.findOne({ 
      name: franchiseName.trim(),
      'roleSpecificData.franchiseOwnerInfo.franchiseId': { $exists: true } 
    });
    if (existingFranchise) {
      return res.status(400).json({
        success: false,
        message: 'Franchise name already exists for this corporate'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create franchise owner user
    const franchiseOwner = await User.create({
      role: 'franchise_owner',
      personalInfo: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ''),
        address: address || '',
        city: city || '',
        state: state || '',
        pincode: pincode || ''
      },
      credentials: {
        passwordHash: hashedPassword,
        mustChangePassword: true,
        isActive: true
      },
      roleSpecificData: {
        franchiseOwnerInfo: {
          profitShare: Number(profitShare),
          managedStations: [],
          franchiseId: null
        }
      }
    });

    // Create franchise record
    const businessInfoPayload = {
      businessType: businessType,
    };
    if (registrationNumber && registrationNumber.toString().trim()) {
      businessInfoPayload.registrationNumber = registrationNumber.toString().trim();
    }
    if (gstNumber && gstNumber.toString().trim()) {
      businessInfoPayload.gstNumber = gstNumber.toString().trim();
    }
    if (panNumber && panNumber.toString().trim()) {
      businessInfoPayload.panNumber = panNumber.toString().trim();
    }
    if (licenseNumber && licenseNumber.toString().trim()) {
      businessInfoPayload.licenseNumber = licenseNumber.toString().trim();
    }

    const franchise = await Franchise.create({
      name: franchiseName.trim(),
      ownerId: franchiseOwner._id,
      'roleSpecificData.franchiseOwnerInfo.franchiseId': { $exists: true },
      contactInfo: {
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ''),
        address: address || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        country: country
      },
      businessInfo: businessInfoPayload,
      financialInfo: {
        profitShare: Number(profitShare),
        commissionRate: Number(commissionRate),
        bankDetails: {
          accountNumber: bankAccountNumber || '',
          ifscCode: bankIfscCode || '',
          bankName: bankName || '',
          accountHolderName: bankAccountHolderName || ''
        }
      },
      operationalInfo: {
        territory: territory || '',
        minimumStations: Number(minimumStations),
        maximumStations: Number(maximumStations)
      },
      status: status
    });

    // Update user with franchise reference
    await User.findByIdAndUpdate(franchiseOwner._id, {
      'roleSpecificData.franchiseOwnerInfo.franchiseId': franchise._id
    });

    // Send welcome email with temporary password
    await sendFranchiseOwnerWelcomeEmail({
      ownerName: `${firstName} ${lastName}`.trim(),
      ownerEmail: email.trim().toLowerCase(),
      tempPassword,
      franchiseName: franchiseName.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Franchise owner added successfully',
      data: {
        id: franchiseOwner._id,
        franchiseId: franchise._id,
        name: `${firstName} ${lastName}`.trim(),
        email: email.trim().toLowerCase(),
        franchiseName: franchiseName.trim()
      }
    });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'duplicate';
      return res.status(400).json({
        success: false,
        message: `Duplicate value for ${field}`
      });
    }
    console.error('Error adding franchise owner:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding franchise owner',
      error: error.message
    });
  }
};

// Update franchise owner
export const updateFranchiseOwner = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      status
    } = req.body;

    const corporateId = await resolveCorporateIdFromRequest(req);
    if (!corporateId) return res.status(403).json({ success: false, message: 'Corporate context not found' });

    // Find franchise owner under this corporate
    const franchiseOwner = await User.findOne({
      _id: franchiseId,
      role: 'franchise_owner',
      'roleSpecificData.franchiseOwnerInfo.franchiseId': { $exists: true }
    });

    if (!franchiseOwner) {
      return res.status(404).json({
        success: false,
        message: 'Franchise owner not found'
      });
    }

    // Check if email already exists (excluding current user)
    if (email && email !== franchiseOwner.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: franchiseId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update franchise owner
    const updateData = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (phone) updateData.phone = phone.replace(/\D/g, '');
    if (status) updateData.status = status;
    
    if (address || city || state || pincode) {
      updateData.personalInfo = {
        ...franchiseOwner.personalInfo,
        firstName: firstName ? firstName.trim() : franchiseOwner.personalInfo.firstName,
        lastName: lastName ? lastName.trim() : franchiseOwner.personalInfo.lastName,
        email: email ? email.trim().toLowerCase() : franchiseOwner.personalInfo.email,
        phone: phone ? phone.replace(/\D/g, '') : franchiseOwner.personalInfo.phone,
        address: address || franchiseOwner.personalInfo.address,
        city: city || franchiseOwner.personalInfo.city,
        state: state || franchiseOwner.personalInfo.state,
        pincode: pincode || franchiseOwner.personalInfo.pincode
      };
    }

    const updatedFranchiseOwner = await User.findByIdAndUpdate(
      franchiseId,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Franchise owner updated successfully',
      data: {
        id: updatedFranchiseOwner._id,
        name: `${updatedFranchiseOwner.firstName} ${updatedFranchiseOwner.lastName}`,
        email: updatedFranchiseOwner.email,
        status: updatedFranchiseOwner.status
      }
    });
  } catch (error) {
    console.error('Error updating franchise owner:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating franchise owner',
      error: error.message
    });
  }
};

// Delete franchise owner
export const deleteFranchiseOwner = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const corporateId = await resolveCorporateIdFromRequest(req);
    if (!corporateId) return res.status(403).json({ success: false, message: 'Corporate context not found' });

    // Find franchise owner under this corporate
    const franchiseOwner = await User.findOne({
      _id: franchiseId,
      role: 'franchise_owner',
      'roleSpecificData.franchiseOwnerInfo.franchiseId': { $exists: true }
    });

    if (!franchiseOwner) {
      return res.status(404).json({
        success: false,
        message: 'Franchise owner not found'
      });
    }

    // Check if franchise owner has active stations
    const activeStations = await Station.find({
      franchiseId: franchiseId,
      status: 'active'
    });

    if (activeStations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete franchise owner with active stations. Please transfer or deactivate stations first.'
      });
    }

    // Soft delete - change status to inactive
    await User.findByIdAndUpdate(franchiseId, { status: 'inactive' });

    res.json({
      success: true,
      message: 'Franchise owner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting franchise owner:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting franchise owner',
      error: error.message
    });
  }
};

// Get franchise owners list
export const getFranchiseOwners = async (req, res) => {
  try {
    const corporateId = await resolveCorporateIdFromRequest(req);
    if (!corporateId) return res.status(403).json({ success: false, message: 'Corporate context not found' });
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {
      role: 'franchise_owner',
      'roleSpecificData.franchiseOwnerInfo.franchiseId': { $exists: true },
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const franchiseOwners = await User.find(query)
      .select('personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone status createdAt roleSpecificData')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get additional data for each franchise owner
    const franchiseData = await Promise.all(
      franchiseOwners.map(async (franchise) => {
        const stations = await Station.find({ franchiseId: franchise._id });
        const bookings = await Booking.find({ franchiseId: franchise._id });
        const revenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);

        return {
          id: franchise._id,
          name: `${franchise.personalInfo?.firstName || ''} ${franchise.personalInfo?.lastName || ''}`.trim(),
          email: franchise.personalInfo?.email,
          phone: franchise.personalInfo?.phone,
          location: `${franchise.personalInfo?.city || ''}, ${franchise.personalInfo?.state || ''}`.replace(/^,\s*|,\s*$/g, ''),
          stations: stations.length,
          revenue: revenue,
          status: franchise.status,
          rating: 4.5, // Mock rating - implement actual rating system
          joinDate: franchise.createdAt
        };
      })
    );

    res.json({
      success: true,
      data: {
        franchises: franchiseData,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching franchise owners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching franchise owners',
      error: error.message
    });
  }
};

// Get corporate analytics
export const getAnalytics = async (req, res) => {
  try {
    const corporateId = await resolveCorporateIdFromRequest(req);
    if (!corporateId) return res.status(403).json({ success: false, message: 'Corporate context not found' });
    const { period = 'month' } = req.query;

    // Get revenue data for the specified period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }

    const bookings = await Booking.find({
      'roleSpecificData.franchiseOwnerInfo.franchiseId': { $exists: true },
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['completed', 'in-progress'] }
    });

    // Group by time period
    const revenueData = [];
    const stationData = [];
    
    // Mock data for demonstration - replace with actual calculations
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const revenueValues = [850000, 920000, 1100000, 1250000, 1180000, 1320000];
    const bookingValues = [1200, 1350, 1580, 1720, 1650, 1890];

    months.forEach((month, index) => {
      revenueData.push({
        month: month,
        revenue: revenueValues[index],
        bookings: bookingValues[index]
      });
    });

    // Station type distribution
    stationData.push(
      { name: 'Fast Charging', value: 35, color: '#0088FE' },
      { name: 'Standard Charging', value: 45, color: '#00C49F' },
      { name: 'Slow Charging', value: 20, color: '#FFBB28' }
    );

    // Performance metrics
    const performanceMetrics = {
      networkEfficiency: 87,
      customerSatisfaction: 4.6,
      stationUptime: 96.2,
      revenuePerStation: 26042
    };

    res.json({
      success: true,
      data: {
        revenueData,
        stationData,
        performanceMetrics
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// Get recent bookings
export const getRecentBookings = async (req, res) => {
  try {
    const corporateId = await resolveCorporateIdFromRequest(req);
    if (!corporateId) return res.status(403).json({ success: false, message: 'Corporate context not found' });
    const { limit = 10 } = req.query;

    const bookings = await Booking.find({ corporateId: corporateId })
      .populate('userId', 'firstName lastName')
      .populate('stationId', 'name location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const bookingData = bookings.map(booking => ({
      id: booking._id,
      user: `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`.trim(),
      station: booking.stationId?.name || 'Unknown Station',
      amount: booking.amount || 0,
      time: getTimeAgo(booking.createdAt),
      status: booking.status
    }));

    res.json({
      success: true,
      data: bookingData
    });
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent bookings',
      error: error.message
    });
  }
};

// Helper function to get time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
};

// named exports above




