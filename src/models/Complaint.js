import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'Elevator', 'Security', 'AC Repair', 'Carpentry', 'Painting', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In-Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Urgent', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  assignedTo: {
    type: String,
    default: 'Unassigned'
  },
  assignedStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  images: [{
    type: String
  }],
  resolution: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;