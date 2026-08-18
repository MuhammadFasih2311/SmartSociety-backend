import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  societyName: {
    type: String,
    default: 'SmartSociety'
  },
  address: {
    type: String,
    default: '123 Main Street, Gulshan-e-Iqbal, Karachi'
  },
  phone: {
    type: String,
    default: '+92 300 1234567'
  },
  email: {
    type: String,
    default: 'info@smartsociety.com'
  },
  website: {
    type: String,
    default: 'www.smartsociety.com'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;