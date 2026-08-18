import User from '../../models/User.js';
import Resident from '../../models/Resident.js';
import Settings from '../../models/Settings.js';

export const getResidentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const residentProfile = await Resident.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      data: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        flatNumber: residentProfile?.flatNumber || user.flatNumber || '',
        blockName: residentProfile?.blockName || user.blockName || '',
        floor: residentProfile?.floor || user.floor || '1',
        moveInDate: residentProfile?.moveInDate || user.moveInDate || '',
        occupation: residentProfile?.occupation || user.occupation || '',
        cnic: residentProfile?.cnic || user.cnic || '',
        gender: residentProfile?.gender || user.gender || 'Male',
        dateOfBirth: residentProfile?.dateOfBirth || user.dateOfBirth || ''
      }
    });
  } catch (error) {
    console.error('Get resident profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateResidentProfile = async (req, res) => {
  try {
    const { 
      fullName, phone, flatNumber, blockName, floor, 
      moveInDate, occupation, cnic, gender, dateOfBirth 
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (flatNumber) user.flatNumber = flatNumber;
    if (blockName) user.blockName = blockName;
    if (floor) user.floor = floor;
    if (moveInDate) user.moveInDate = moveInDate;
    if (occupation) user.occupation = occupation;
    if (cnic) user.cnic = cnic;
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    await user.save();

    let residentProfile = await Resident.findOne({ userId: user._id });
    if (!residentProfile) {
      residentProfile = new Resident({ userId: user._id });
    }

    if (flatNumber) residentProfile.flatNumber = flatNumber;
    if (blockName) residentProfile.blockName = blockName;
    if (floor) residentProfile.floor = floor;
    if (moveInDate) residentProfile.moveInDate = moveInDate;
    if (occupation) residentProfile.occupation = occupation;
    if (cnic) residentProfile.cnic = cnic;
    if (gender) residentProfile.gender = gender;
    if (dateOfBirth) residentProfile.dateOfBirth = dateOfBirth;
    await residentProfile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        flatNumber: residentProfile.flatNumber || user.flatNumber,
        blockName: residentProfile.blockName || user.blockName,
        floor: residentProfile.floor || user.floor,
        moveInDate: residentProfile.moveInDate || user.moveInDate,
        occupation: residentProfile.occupation || user.occupation,
        cnic: residentProfile.cnic || user.cnic,
        gender: residentProfile.gender || user.gender,
        dateOfBirth: residentProfile.dateOfBirth || user.dateOfBirth
      }
    });
  } catch (error) {
    console.error('Update resident profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getSocietySettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({
        societyName: 'SmartSociety',
        address: '123 Main Street, Gulshan-e-Iqbal, Karachi',
        phone: '+92 300 1234567',
        email: 'info@smartsociety.com',
        website: 'www.smartsociety.com'
      });
      await settings.save();
    }
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get society settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getResidentStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const residentProfile = await Resident.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      data: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        flatNumber: residentProfile?.flatNumber || user.flatNumber || '',
        blockName: residentProfile?.blockName || user.blockName || '',
        status: user.status,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get resident stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};