import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Billing', 'Security', 'Event', 'Facility', 'Utility', 'General'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['Urgent', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Published', 'Draft', 'Archived'],
    default: 'Draft'
  },
  author: {
    type: String,
    default: 'Admin'
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;