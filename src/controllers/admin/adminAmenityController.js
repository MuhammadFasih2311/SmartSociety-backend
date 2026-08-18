import Amenity from '../../models/Amenity.js';
import AmenityBooking from '../../models/AmenityBooking.js';

export const getAllAmenities = async (req, res) => {
  try {
    const amenities = await Amenity.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: amenities.length,
      data: amenities
    });
  } catch (error) {
    console.error('Get all amenities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAmenityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid amenity ID' });
    }

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid amenity ID format' });
    }

    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found' });
    }

    res.status(200).json({
      success: true,
      data: amenity
    });
  } catch (error) {
    console.error('Get amenity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createAmenity = async (req, res) => {
  try {
    const {
      name, type, location, capacity, pricePerHour,
      description, images, isActive, availableSlots, timings
    } = req.body;

    const errors = {};
    if (!name) errors.name = 'Name is required';
    if (!type) errors.type = 'Type is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const amenity = new Amenity({
      name: name.trim(),
      type,
      location: location || '',
      capacity: capacity || 10,
      pricePerHour: pricePerHour || 0,
      description: description || '',
      images: images || [],
      isActive: isActive !== undefined ? isActive : true,
      availableSlots: availableSlots || 5,
      timings: timings || { start: '08:00', end: '22:00' }
    });

    await amenity.save();

    res.status(201).json({
      success: true,
      message: 'Amenity created successfully',
      data: amenity
    });
  } catch (error) {
    console.error('Create amenity error:', error);
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateAmenity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid amenity ID' });
    }

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid amenity ID format' });
    }

    const {
      name, type, location, capacity, pricePerHour,
      description, images, isActive, availableSlots, timings
    } = req.body;

    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found' });
    }

    if (name) amenity.name = name.trim();
    if (type) amenity.type = type;
    if (location !== undefined) amenity.location = location || '';
    if (capacity) amenity.capacity = capacity;
    if (pricePerHour !== undefined) amenity.pricePerHour = pricePerHour || 0;
    if (description !== undefined) amenity.description = description || '';
    if (images) amenity.images = images;
    if (isActive !== undefined) amenity.isActive = isActive;
    if (availableSlots) amenity.availableSlots = availableSlots;
    if (timings) amenity.timings = timings;

    await amenity.save();

    res.status(200).json({
      success: true,
      message: 'Amenity updated successfully',
      data: amenity
    });
  } catch (error) {
    console.error('Update amenity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid amenity ID' });
    }

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid amenity ID format' });
    }

    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found' });
    }

    const bookings = await AmenityBooking.countDocuments({ amenityId: id });
    if (bookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete amenity because it has ${bookings} booking(s). Deactivate it instead.`
      });
    }

    await amenity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Amenity deleted successfully'
    });
  } catch (error) {
    console.error('Delete amenity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateAmenityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid amenity ID' });
    }

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid amenity ID format' });
    }

    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found' });
    }

    amenity.isActive = isActive;
    await amenity.save();

    res.status(200).json({
      success: true,
      message: `Amenity ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: amenity
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAmenityStats = async (req, res) => {
  try {
    const amenities = await Amenity.find();

    const stats = {
      total: amenities.length,
      active: amenities.filter(a => a.isActive).length,
      inactive: amenities.filter(a => !a.isActive).length,
      byType: {},
      totalCapacity: amenities.reduce((sum, a) => sum + (a.capacity || 0), 0),
      totalSlots: amenities.reduce((sum, a) => sum + (a.availableSlots || 0), 0)
    };

    amenities.forEach(a => {
      if (!stats.byType[a.type]) {
        stats.byType[a.type] = 0;
      }
      stats.byType[a.type]++;
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get amenity stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};