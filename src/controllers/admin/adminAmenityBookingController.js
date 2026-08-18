import AmenityBooking from '../../models/AmenityBooking.js';


export const getAllBookings = async (req, res) => {
  try {
    console.log('📥 Fetching all amenity bookings...');
    
    const bookings = await AmenityBooking.find()
      .sort({ createdAt: -1 });

    console.log('📤 Found bookings:', bookings.length);

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      residentId: booking.residentId,
      residentName: booking.residentName || 'Unknown',
      flatNumber: booking.flatNumber || 'N/A',
      amenityType: booking.amenityType || 'other',
      amenityName: booking.amenityName || 'Unknown',
      date: booking.date ? new Date(booking.date).toISOString().split('T')[0] : '',
      startTime: booking.startTime || '',
      endTime: booking.endTime || '',
      numberOfPeople: booking.numberOfPeople || 1,
      status: booking.status || 'pending',
      purpose: booking.purpose || '',
      notes: booking.notes || '',
      amount: booking.amount || 0,
      paymentStatus: booking.paymentStatus || 'pending',
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: formattedBookings
    });
  } catch (error) {
    console.error('❌ Get all bookings error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await AmenityBooking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('❌ Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching booking' 
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('📥 Update booking status:', { id, status });

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be: pending, approved, rejected, cancelled, completed' 
      });
    }

    const booking = await AmenityBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;

    if (status === 'approved') {
      booking.approvedBy = req.user._id || req.user.id;
      booking.approvedAt = new Date();
    }

    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
    }

    const updatedBooking = await AmenityBooking.findByIdAndUpdate(
      id,
      {
        $set: {
          status: status,
          approvedBy: status === 'approved' ? (req.user._id || req.user.id) : undefined,
          approvedAt: status === 'approved' ? new Date() : undefined,
          cancelledAt: status === 'cancelled' ? new Date() : undefined
        }
      },
      { 
        new: true,
        runValidators: false 
      }
    );

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking
    });
  } catch (error) {
    console.error('❌ Update status error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating status: ' + error.message 
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await AmenityBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting booking' 
    });
  }
};

export const getBookingStats = async (req, res) => {
  try {
    console.log('📥 Fetching booking stats...');
    
    const total = await AmenityBooking.countDocuments();
    const pending = await AmenityBooking.countDocuments({ status: 'pending' });
    const approved = await AmenityBooking.countDocuments({ status: 'approved' });
    const rejected = await AmenityBooking.countDocuments({ status: 'rejected' });
    const cancelled = await AmenityBooking.countDocuments({ status: 'cancelled' });
    const completed = await AmenityBooking.countDocuments({ status: 'completed' });

    const result = {
      total,
      pending,
      approved,
      rejected,
      cancelled,
      completed
    };

    console.log('📤 Stats:', result);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching stats' 
    });
  }
};