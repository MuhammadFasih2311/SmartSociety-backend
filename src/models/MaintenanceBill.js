import mongoose from 'mongoose';

const maintenanceBillSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flatNumber: {
    type: String,
    required: true,
    trim: true
  },
  residentName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    default: 'Monthly maintenance fee'
  },
  charges: {
    maintenance: { type: Number, default: 0 },
    security: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    repairs: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending'
  },
  paidDate: {
    type: Date,
    default: null
  },
  lateFee: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const MaintenanceBill = mongoose.model('MaintenanceBill', maintenanceBillSchema);
export default MaintenanceBill;