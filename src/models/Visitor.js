import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  visitorName: {
    type: String,
    required: true
  },
  flatNumber: {
    type: String,
    required: true
  },
  vehicleNumber: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  purpose: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['visitor', 'delivery', 'resident'],
    default: 'visitor'
  },
  status: {
    type: String,
    enum: ['Verified', 'Flagged', 'Resident', 'pending', 'approved', 'rejected', 'cancelled'],
    default: 'Verified'
  },
  gate: {
    type: String,
    enum: ['Main Gate', 'Side Gate', 'Back Gate', 'Parking Gate'],
    default: 'Main Gate'
  },
  entryTime: {
    type: String,
    required: true
  },
  exitTime: {
    type: String,
    default: 'N/A'
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    trim: true
  },
  idType: {
    type: String,
    enum: ['CNIC', 'Passport', 'Driving License', 'Other'],
    default: 'CNIC'
  },
  idNumber: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String,
    default: ''
  },
  passId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResidentPass'
  },
  lastVerified: {
    type: Date
  },
  entryAllowed: {
    type: Boolean,
    default: false
  },
  entryAllowedAt: {
    type: Date
  },
  entryDenied: {
    type: Boolean,
    default: false
  },
  entryDeniedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Visitor = mongoose.model('Visitor', visitorSchema);
export default Visitor;