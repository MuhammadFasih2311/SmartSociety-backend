import User from '../../models/User.js';
import Guard from '../../models/Guard.js';
import Settings from '../../models/Settings.js';

export const getGuardProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const guardProfile = await Guard.findOne({ userId });

    const settings = await Settings.findOne();

    const profileData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      cnic: user.cnic || '',
      gender: user.gender || 'Male',
      dateOfBirth: user.dateOfBirth || '',
      address: user.address || '',

      employeeId: guardProfile?.employeeId || '',
      gateAssigned: guardProfile?.gateAssigned || '',
      shiftTiming: guardProfile?.shiftTiming || '',
      shiftStart: guardProfile?.shiftStart || '',
      shiftEnd: guardProfile?.shiftEnd || '',
      emergencyContact: guardProfile?.emergencyContact || '',
      guardAddress: guardProfile?.address || '',
      isGuardActive: guardProfile?.isActive !== false,

      societyName: settings?.societyName || 'SmartSociety',
      societyAddress: settings?.address || '',
      societyPhone: settings?.phone || '',
      societyEmail: settings?.email || '',
      societyWebsite: settings?.website || ''
    };

    res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('❌ Get guard profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};


export const updateGuardProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      fullName, 
      phone, 
      cnic, 
      gender, 
      dateOfBirth, 
      address,
      emergencyContact,
      guardAddress
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (cnic !== undefined) user.cnic = cnic;
    if (gender) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;

    await user.save();

    let guardProfile = await Guard.findOne({ userId });
    if (guardProfile) {
      if (emergencyContact !== undefined) guardProfile.emergencyContact = emergencyContact;
      if (guardAddress !== undefined) guardProfile.address = guardAddress;
      await guardProfile.save();
    }

    const updatedUser = await User.findById(userId).select('-password');
    const updatedGuard = await Guard.findOne({ userId });

    const profileData = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status,
      isActive: updatedUser.isActive,
      cnic: updatedUser.cnic || '',
      gender: updatedUser.gender || 'Male',
      dateOfBirth: updatedUser.dateOfBirth || '',
      address: updatedUser.address || '',
      employeeId: updatedGuard?.employeeId || '',
      gateAssigned: updatedGuard?.gateAssigned || '',
      shiftTiming: updatedGuard?.shiftTiming || '',
      emergencyContact: updatedGuard?.emergencyContact || '',
      guardAddress: updatedGuard?.address || ''
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData
    });
  } catch (error) {
    console.error('❌ Update guard profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
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
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
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
    console.error('❌ Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

export const getGuardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const guardProfile = await Guard.findOne({ userId });
    const user = await User.findById(userId).select('-password');

    const stats = {
      profile: {
        fullName: user?.fullName || 'N/A',
        email: user?.email || 'N/A',
        phone: user?.phone || 'N/A',
        employeeId: guardProfile?.employeeId || 'N/A',
        gateAssigned: guardProfile?.gateAssigned || 'N/A',
        shiftTiming: guardProfile?.shiftTiming || 'N/A',
        status: user?.status || 'Inactive'
      },
      account: {
        username: user?.username || 'N/A',
        role: user?.role || 'guard',
        isActive: user?.isActive !== false,
        lastLogin: user?.lastLogin || null
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Get guard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Profile image upload feature coming soon',
      data: {
        imageUrl: null
      }
    });
  } catch (error) {
    console.error('❌ Upload profile image error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};