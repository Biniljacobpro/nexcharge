import Station from '../models/station.model.js';

// GET /api/public/stations
// Returns a minimal list of stations for the public map (no auth required)
export const getPublicStations = async (_req, res) => {
  try {
    const stations = await Station.find({ 'operational.status': { $in: ['active', 'maintenance'] } })
      .select('name location coordinates capacity pricing operational');

    const result = stations.map((s) => ({
      id: s._id,
      name: s.name,
      address: s.location?.address || '',
      city: s.location?.city || '',
      state: s.location?.state || '',
      pincode: s.location?.pincode || '',
      dms: s.location?.dms || '',
      lat: s.location?.coordinates?.latitude ?? 0,
      lng: s.location?.coordinates?.longitude ?? 0,
      totalChargers: s.capacity?.totalChargers ?? 0,
      availableSlots: s.capacity?.chargers?.filter(c => c.isAvailable).length || s.capacity?.availableSlots || 0,
      chargerTypes: s.capacity?.chargerTypes || [],
      availableChargers: s.capacity?.chargers?.filter(c => c.isAvailable) || [],
      maxPowerPerCharger: s.capacity?.maxPowerPerCharger ?? 0,
      totalPowerCapacity: s.capacity?.totalPowerCapacity ?? 0,
      pricingModel: s.pricing?.model || 'per_kwh',
      basePrice: s.pricing?.basePrice ?? 0,
      status: s.operational?.status || 'inactive'
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching public stations:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/public/stations/:id
export const getPublicStationById = async (req, res) => {
  try {
    const { id } = req.params;
    const s = await Station.findById(id);
    if (!s) return res.status(404).json({ success: false, message: 'Station not found' });

    const data = {
      id: s._id,
      name: s.name,
      code: s.code,
      description: s.description || '',
      address: s.location?.address || '',
      city: s.location?.city || '',
      state: s.location?.state || '',
      country: s.location?.country || '',
      pincode: s.location?.pincode || '',
      dms: s.location?.dms || '',
      coordinates: {
        latitude: s.location?.coordinates?.latitude ?? 0,
        longitude: s.location?.coordinates?.longitude ?? 0,
      },
      nearbyLandmarks: s.location?.nearbyLandmarks || '',
      capacity: {
        totalChargers: s.capacity?.totalChargers ?? 0,
        chargerTypes: s.capacity?.chargerTypes || [],
        availableChargers: s.capacity?.chargers?.filter(c => c.isAvailable) || [],
        maxPowerPerCharger: s.capacity?.maxPowerPerCharger ?? 0,
        totalPowerCapacity: s.capacity?.totalPowerCapacity ?? 0,
        availableSlots: s.capacity?.chargers?.filter(c => c.isAvailable).length || s.capacity?.availableSlots || 0,
      },
      pricing: {
        model: s.pricing?.model || 'per_kwh',
        basePrice: s.pricing?.basePrice ?? 0,
        cancellationPolicy: s.pricing?.cancellationPolicy || ''
      },
      operational: s.operational || {},
      contact: s.contact || {},
      amenities: s.amenities || [],
      images: s.images || [],
      status: s.operational?.status || 'inactive',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching station by id:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


