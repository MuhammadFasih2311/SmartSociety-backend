import mongoose from 'mongoose';

const amenityBookingSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amenityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Amenity',

    required: false
  },
  residentName: {
    type: String,
    required: true
  },
  flatNumber: {
    type: String,
    required: true
  },
  amenityType: {
    type: String,
    enum: ['clubhouse', 'swimming_pool', 'tennis_court', 'party_hall', 'gym', 'library', 'playground', 'other'],
    required: true
  },
  amenityName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    default: ''
  },
  numberOfPeople: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

const AmenityBooking = mongoose.model('AmenityBooking', amenityBookingSchema);
export default AmenityBooking;