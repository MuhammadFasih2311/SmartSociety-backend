import mongoose from 'mongoose';

const guardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  gateAssigned: {
    type: String,
    required: true
  },
  shiftTiming: {
    type: String,
    enum: ['Morning', 'Evening', 'Night'],
    required: true
  },
  shiftStart: {
    type: String,
    default: ''
  },
  shiftEnd: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Guard = mongoose.model('Guard', guardSchema);
export default Guard;