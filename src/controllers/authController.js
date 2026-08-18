import User from '../models/User.js';
import Resident from '../models/Resident.js';
import Guard from '../models/Guard.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role: role
    },
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      username,
      email,
      password,
      fullName,
      phone,
      flatNumber,
      blockName,
      occupancyType,
      vehicleNumber,
      emergencyContact,
      cnic,
      gender,
      dateOfBirth,
      occupation,
      floor,
      moveInDate
    } = req.body;

    const role = 'resident';


    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.trim() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    if (!flatNumber || !flatNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Flat / House number is required'
      });
    }

    if (!blockName || !blockName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Block name is required'
      });
    }

    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName.trim(),
      phone: phone.trim(),
      role: 'resident',

      isActive: false,
      status: 'Pending',

      flatNumber: flatNumber.trim(),
      blockName: blockName.trim(),

      cnic: cnic || '',
      gender: gender || 'Male',
      dateOfBirth: dateOfBirth || '',
      occupation: occupation || '',
      floor: floor || '1',
      moveInDate: moveInDate || ''
    });

    await user.save();

    const resident = new Resident({
      userId: user._id,

      flatNumber: flatNumber.trim(),
      blockName: blockName.trim(),

      occupancyType: occupancyType || 'owner',

      vehicleNumber: vehicleNumber || '',

      emergencyContact: emergencyContact || {},

      isActive: false
    });

    await resident.save();


    return res.status(201).json({
      success: true,
      message:
        'Registration submitted successfully. Your account is pending admin approval.',

      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          flatNumber: user.flatNumber,
          blockName: user.blockName,
          status: user.status,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    console.log('📝 Login attempt:', req.body.email);

    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.status === 'Pending') {
      return res.status(403).json({
        success: false,
        message:
          'Your registration is pending admin approval. Please wait for admin approval.'
      });
    }

    if (!user.isActive || user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message:
          'Your account is inactive. Please contact the administrator.'
      });
    }

    user.lastLogin = new Date();

    await user.save();

    const token = generateToken(user._id, user.role);

    let userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      status: user.status,
      isActive: user.isActive
    };

    if (user.role === 'resident') {
      const resident = await Resident.findOne({
        userId: user._id
      });

      if (resident) {
        userData = {
          ...userData,
          flatNumber: resident.flatNumber,
          blockName: resident.blockName,
          occupancyType: resident.occupancyType
        };
      }
    }

    if (user.role === 'guard') {
      const guard = await Guard.findOne({
        userId: user._id
      });

      if (guard) {
        userData = {
          ...userData,
          gateAssigned: guard.gateAssigned,
          shiftTiming: guard.shiftTiming
        };
      }
    }

    console.log('✅ Login successful:', email);

    return res.status(200).json({
      success: true,
      message: 'Login successful',

      data: {
        token,
        user: userData,
        redirectTo: `/${user.role}/dashboard`
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get me error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    const resetToken = jwt.sign(
      {
        id: user._id,
        purpose: 'reset'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '1h'
      }
    );

    console.log(
      `🔐 Reset token for ${email}: ${resetToken}`
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',

      data: {
        resetToken,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = password;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message:
          'Reset token has expired. Please request a new one.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};