import Amenity from '../../models/Amenity.js';
import AmenityBooking from '../../models/AmenityBooking.js';
import User from '../../models/User.js';

const mapAmenityType = (type) => {
  const typeMap = {
    'Pool': 'swimming_pool',
    'Swimming Pool': 'swimming_pool',
    'Gym': 'gym',
    'Fitness Gym': 'gym',
    'Clubhouse': 'clubhouse',
    'Community Clubhouse': 'clubhouse',
    'Tennis': 'tennis_court',
    'Tennis Court': 'tennis_court',
    'Playground': 'playground',
    "Children's Playground": 'playground',
    'Library': 'library',
    'Community Library': 'library',
    'Party Hall': 'party_hall',
    'Other': 'other'
  };
  return typeMap[type] || 'other';
};

export const getAmenities = async (req, res) => {
  try {
    const amenities = await Amenity.find({ isActive: true });
    res.status(200).json({
      success: true,
      data: amenities
    });
  } catch (error) {
    console.error('❌ Get amenities error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

export const getAmenityById = async (req, res) => {
  try {
    const { id } = req.params;
    const amenity = await Amenity.findOne({ _id: id, isActive: true });
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found' });
    }
    res.status(200).json({
      success: true,
      data: amenity
    });
  } catch (error) {
    console.error('❌ Get amenity by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid amenity ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getResidentAmenities = async (req, res) => {
  try {
    const amenities = await Amenity.find({ isActive: true })
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: amenities.length,
      data: amenities
    });
  } catch (error) {
    console.error('❌ Get resident amenities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getResidentAmenityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const amenity = await Amenity.findOne({ _id: id, isActive: true });
    if (!amenity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Amenity not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: amenity
    });
  } catch (error) {
    console.error('❌ Get amenity by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid amenity ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getResidentAmenityStats = async (req, res) => {
  try {
    const amenities = await Amenity.find({ isActive: true });

    const stats = {
      total: amenities.length,
      byType: {}
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
    console.error('❌ Get amenity stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

export const getResidentBookings = async (req, res) => {
  try {
    const bookings = await AmenityBooking.find({ residentId: req.user._id })
      .sort({ createdAt: -1 });
    
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      amenityId: booking.amenityId,
      amenityName: booking.amenityName || 'Unknown',
      amenityType: booking.amenityType || 'other',
      date: booking.date ? booking.date.toISOString().split('T')[0] : '',
      time: booking.startTime || '',
      duration: calculateDuration(booking.startTime, booking.endTime),
      guests: booking.numberOfPeople || 1,
      status: booking.status || 'pending',
      notes: booking.notes || '',
      createdAt: booking.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedBookings
    });
  } catch (error) {
    console.error('❌ Get resident bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { 
      amenityId, 
      date, 
      time, 
      duration, 
      guests, 
      notes 
    } = req.body;

    console.log('📥 Received booking data:', req.body);

    const errors = {};
    if (!amenityId) errors.amenityId = 'Amenity is required';
    if (!date) errors.date = 'Date is required';
    if (!time) errors.time = 'Time is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const amenity = await Amenity.findById(amenityId);
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found' });
    }

    console.log('✅ Amenity found:', amenity.name);

    const existingBooking = await AmenityBooking.findOne({
      amenityId,
      date: new Date(date),
      startTime: time,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const user = await User.findById(req.user._id);
    console.log('✅ User found:', user?.fullName);

    const mappedType = mapAmenityType(amenity.type);
    console.log('✅ Mapped type:', mappedType);

    const booking = new AmenityBooking({
      residentId: req.user._id,
      amenityId: amenityId,
      residentName: user.fullName || 'Unknown',
      flatNumber: user.flatNumber || 'N/A',
      amenityType: mappedType,
      amenityName: amenity.name || 'Unknown',
      date: new Date(date),
      startTime: time,
      endTime: calculateEndTime(time, parseInt(duration) || 1),
      purpose: notes || '',
      numberOfPeople: parseInt(guests) || 1,
      status: 'pending',
      paymentStatus: 'pending',
      amount: (amenity.pricePerHour || 0) * (parseInt(duration) || 1),
      notes: notes || ''
    });

    console.log('📤 Saving booking:', booking);
    await booking.save();
    console.log('✅ Booking saved successfully!');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('❌ Create booking error:', error);
    console.error('❌ Error details:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await AmenityBooking.findOne({ 
      _id: id, 
      residentId: req.user._id 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or you are not authorized' 
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('❌ Cancel booking error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid booking ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBookingStats = async (req, res) => {
  try {
    const bookings = await AmenityBooking.find({ residentId: req.user._id });

    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      rejected: bookings.filter(b => b.status === 'rejected').length
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Get booking stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const calculateEndTime = (startTime, duration) => {
  if (!startTime) return '00:00';
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + (duration * 60);
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 1;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const diff = Math.round((endTotal - startTotal) / 60);
  return diff > 0 ? diff : 1;
};