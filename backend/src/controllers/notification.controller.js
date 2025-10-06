import Notification from '../models/notification.model.js';

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = {
      userId,
      isDeleted: false
    };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedBookingId', 'startTime endTime status')
      .populate('relatedStationId', 'name location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get unread count only
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark notifications as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'notificationIds must be an array'
      });
    }

    await Notification.markAsRead(userId, notificationIds);

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;

    await Notification.updateMany(
      { userId, isRead: false, isDeleted: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to create notifications (used by other controllers)
export const createNotification = async (notificationData) => {
  try {
    return await Notification.createNotification(notificationData);
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Helper function to create booking-related notifications
export const createBookingNotification = async (userId, type, booking, station) => {
  try {
    let title, message, actionType, actionData;

    switch (type) {
      case 'booking_confirmed':
        title = '🎉 Booking Confirmed!';
        message = `Your charging slot at ${station?.name || 'the station'} has been confirmed. Payment successful.`;
        actionType = 'navigate_to_bookings';
        actionData = { bookingId: booking._id };
        break;

      case 'booking_cancelled':
        title = '❌ Booking Cancelled';
        message = `Your booking at ${station?.name || 'the station'} has been cancelled.`;
        actionType = 'navigate_to_bookings';
        actionData = { bookingId: booking._id };
        break;

      case 'payment_success':
        title = '💳 Payment Successful';
        message = `Payment of ₹${booking.pricing?.estimatedCost || 0} completed successfully for your booking.`;
        actionType = 'navigate_to_bookings';
        actionData = { bookingId: booking._id };
        break;

      case 'payment_failed':
        title = '❌ Payment Failed';
        message = `Payment for your booking at ${station?.name || 'the station'} could not be processed.`;
        actionType = 'navigate_to_bookings';
        actionData = { bookingId: booking._id };
        break;

      case 'booking_reminder':
        title = '⏰ Booking Reminder';
        message = `Your charging session at ${station?.name || 'the station'} starts in 30 minutes.`;
        actionType = 'navigate_to_bookings';
        actionData = { bookingId: booking._id };
        break;

      case 'booking_completed':
        title = '✅ Charging Complete';
        message = `Your charging session at ${station?.name || 'the station'} has been completed successfully.`;
        actionType = 'navigate_to_bookings';
        actionData = { bookingId: booking._id };
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    return await createNotification({
      userId,
      title,
      message,
      type,
      relatedBookingId: booking._id,
      relatedStationId: station?._id,
      actionType,
      actionData,
      priority: type === 'payment_failed' ? 'high' : 'medium'
    });

  } catch (error) {
    console.error('Error creating booking notification:', error);
    throw error;
  }
};
