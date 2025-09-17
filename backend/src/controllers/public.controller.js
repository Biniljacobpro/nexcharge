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
      availableSlots: s.capacity?.availableSlots ?? 0,
      chargerTypes: s.capacity?.chargerTypes || [],
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


