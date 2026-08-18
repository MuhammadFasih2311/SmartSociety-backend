import mongoose from 'mongoose';

const residentPassSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  residentName: {
    type: String,
    required: true
  },
  flatNumber: {
    type: String,
    required: true
  },
  blockName: {
    type: String,
    required: true
  },
  visitorName: {
    type: String,
    required: true
  },
  visitorPhone: {
    type: String,
    required: true
  },
  visitorCNIC: {
    type: String,
    default: ''
  },
  purpose: {
    type: String,
    required: true
  },
  visitDate: {
    type: Date,
    required: true
  },
  visitTime: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '2 hours'
  },
  vehicleNumber: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'used', 'expired', 'cancelled'],
    default: 'pending'
  },
  passCode: {
    type: String,
    unique: true
  },
  qrCode: {
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
  usedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

residentPassSchema.pre('save', function(next) {
  if (!this.passCode) {
    const prefix = 'PASS';
    const random = Math.floor(100000 + Math.random() * 900000);
    this.passCode = `${prefix}${random}`;
  }
  if (!this.expiresAt) {
    const expiryDate = new Date(this.visitDate);
    expiryDate.setHours(expiryDate.getHours() + 4);
    this.expiresAt = expiryDate;
  }
  next();
});

const ResidentPass = mongoose.model('ResidentPass', residentPassSchema);
export default ResidentPass;