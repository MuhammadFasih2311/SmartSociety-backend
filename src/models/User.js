import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
  type: String,
  enum: ['admin', 'resident', 'guard'],
  required: true,
  default: 'resident'
},
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Inactive', 'On Leave'],
    default: 'Active'
  },
  lastLogin: {
    type: Date
  },
  flatNumber: {
    type: String,
    sparse: true
  },
  blockName: {
    type: String,
    sparse: true
  },
  gateAssigned: {
    type: String,
    sparse: true
  },
  shiftTiming: {
    type: String,
    sparse: true
  },
  cnic: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  dateOfBirth: {
    type: String,
    default: ''
  },
  occupation: {
    type: String,
    default: ''
  },
  floor: {
    type: String,
    default: '1'
  },
  moveInDate: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;