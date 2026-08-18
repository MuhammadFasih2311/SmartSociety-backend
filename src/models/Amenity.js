import mongoose from 'mongoose';

const amenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Pool', 'Gym', 'Clubhouse', 'Tennis', 'Playground', 'Library', 'Party Hall', 'Other'],
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  capacity: {
    type: Number,
    default: 10
  },
  pricePerHour: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  availableSlots: {
    type: Number,
    default: 5
  },
  timings: {
    start: { type: String, default: '08:00' },
    end: { type: String, default: '22:00' }
  }
}, {
  timestamps: true
});

const Amenity = mongoose.model('Amenity', amenitySchema);
export default Amenity;