import mongoose from 'mongoose';

const residentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  flatNumber: {
    type: String,
    required: true,
    trim: true
  },
  blockName: {
    type: String,
    required: true,
    trim: true
  },
  occupancyType: {
    type: String,
    enum: ['owner', 'tenant', 'rental'],
    default: 'owner'
  },
  vehicleNumber: {
    type: String,
    default: '',
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['Car', 'Bike', 'Scooter', 'None'],
    default: 'None'
  },
  parkingSlot: {
    type: String,
    default: '',
    trim: true
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },
  familyMembers: [{
    name: String,
    relation: String,
    phone: String
  }],
  notes: {
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

const Resident = mongoose.model('Resident', residentSchema);
export default Resident;