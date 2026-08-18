import mongoose from 'mongoose';

const visitorPassSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visitorName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  flatNumber: {
    type: String,
    default: ''
  },
  purpose: {
    type: String,
    default: ''
  },
  visitDate: {
    type: String,
    required: true
  },
  visitTime: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '1'
  },
  idType: {
    type: String,
    enum: ['CNIC', 'Passport', 'Driver License', 'Other'],
    default: 'CNIC'
  },
  idNumber: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'approved', 'expired', 'cancelled'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  guardStatus: {
    type: String,
    enum: ['Verified', 'Flagged', 'Resident', 'pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  guardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guardUpdatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const VisitorPass = mongoose.model('VisitorPass', visitorPassSchema);
export default VisitorPass;