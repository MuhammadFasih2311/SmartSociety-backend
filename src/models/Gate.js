import mongoose from 'mongoose';

const gateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Active'
  },
  guardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guardName: {
    type: String,
    default: 'N/A'
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', 'N/A'],
    default: 'N/A'
  },
  location: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Gate = mongoose.model('Gate', gateSchema);
export default Gate;