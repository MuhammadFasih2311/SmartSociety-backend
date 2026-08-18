import User from '../../models/User.js';
import Resident from '../../models/Resident.js';

export const getAllResidents = async (req, res) => {
  try {
    const users = await User.find({ role: 'resident' }).select('-password').sort({ createdAt: -1 });
    const residents = await Resident.find();

    const mergedData = users.map(user => {
      const profile = residents.find(r => r.userId.toString() === user._id.toString());
      return {
        id: user._id,
        _id: user._id,
        firstName: user.fullName?.split(' ')[0] || '',
        lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        cnic: user.cnic || '',
        gender: user.gender || 'Male',
        dateOfBirth: user.dateOfBirth || '',
        occupation: user.occupation || '',
        floor: user.floor || '1',
        moveInDate: user.moveInDate || '',
        status: user.status || 'Active',
        joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        flatNumber: profile?.flatNumber || user.flatNumber || '',
        blockName: profile?.blockName || user.blockName || '',
        occupancyType: profile?.occupancyType || 'owner',
        vehicleNumber: profile?.vehicleNumber || '',
        vehicleType: profile?.vehicleType || 'None',
        parkingSlot: profile?.parkingSlot || '',
        emergencyContact: profile?.emergencyContact?.name || '',
        emergencyPhone: profile?.emergencyContact?.phone || '',
        familyMembers: profile?.familyMembers || [],
        notes: profile?.notes || '',
        profile: profile || null
      };
    });

    res.status(200).json({
      success: true,
      count: mergedData.length,
      data: mergedData
    });
  } catch (error) {
    console.error('Get all residents error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching residents' });
  }
};

export const getResidentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid resident ID' });
    }

    const user = await User.findById(id).select('-password');
    if (!user || user.role !== 'resident') {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    const profile = await Resident.findOne({ userId: user._id });

    const residentData = {
      id: user._id,
      _id: user._id,
      firstName: user.fullName?.split(' ')[0] || '',
      lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
      name: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      cnic: user.cnic || '',
      gender: user.gender || 'Male',
      dateOfBirth: user.dateOfBirth || '',
      occupation: user.occupation || '',
      floor: user.floor || '1',
      moveInDate: user.moveInDate || '',
      status: user.status || 'Active',
      joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      flatNumber: profile?.flatNumber || user.flatNumber || '',
      blockName: profile?.blockName || user.blockName || '',
      occupancyType: profile?.occupancyType || 'owner',
      vehicleNumber: profile?.vehicleNumber || '',
      vehicleType: profile?.vehicleType || 'None',
      parkingSlot: profile?.parkingSlot || '',
      emergencyContact: profile?.emergencyContact?.name || '',
      emergencyPhone: profile?.emergencyContact?.phone || '',
      familyMembers: profile?.familyMembers || [],
      notes: profile?.notes || '',
      profile: profile || null
    };

    res.status(200).json({ success: true, data: residentData });
  } catch (error) {
    console.error('Get resident error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching resident' });
  }
};

export const getResidentWithPassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid resident ID' });
    }

    const user = await User.findById(id);
    if (!user || user.role !== 'resident') {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    const profile = await Resident.findOne({ userId: user._id });

    const residentData = {
      id: user._id,
      _id: user._id,
      firstName: user.fullName?.split(' ')[0] || '',
      lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
      name: user.fullName || '',
      email: user.email || '',
      password: user.password, // Will be hashed, but we need to show it
      phone: user.phone || '',
      cnic: user.cnic || '',
      gender: user.gender || 'Male',
      dateOfBirth: user.dateOfBirth || '',
      occupation: user.occupation || '',
      floor: user.floor || '1',
      moveInDate: user.moveInDate || '',
      status: user.status || 'Active',
      joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      flatNumber: profile?.flatNumber || user.flatNumber || '',
      blockName: profile?.blockName || user.blockName || '',
      occupancyType: profile?.occupancyType || 'owner',
      vehicleNumber: profile?.vehicleNumber || '',
      vehicleType: profile?.vehicleType || 'None',
      parkingSlot: profile?.parkingSlot || '',
      emergencyContact: profile?.emergencyContact?.name || '',
      emergencyPhone: profile?.emergencyContact?.phone || '',
      familyMembers: profile?.familyMembers || [],
      notes: profile?.notes || '',
      profile: profile || null
    };

    res.status(200).json({ success: true, data: residentData });
  } catch (error) {
    console.error('Get resident with password error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching resident' });
  }
};

export const createResident = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, password,
      cnic, gender, dateOfBirth, occupation,
      flatNumber, blockName, floor, occupancyType,
      moveInDate, familyMembers, emergencyContact,
      emergencyPhone, vehicleNumber, vehicleType,
      parkingSlot, status, notes
    } = req.body;

    const errors = {};
    if (!firstName) errors.firstName = 'First name is required';
    if (!lastName) errors.lastName = 'Last name is required';
    if (!email) errors.email = 'Email is required';
    if (!phone) errors.phone = 'Phone number is required';
    if (!password) errors.password = 'Password is required';
    if (password && password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!flatNumber) errors.flatNumber = 'Flat number is required';
    if (!blockName) errors.blockName = 'Block name is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    const existingFlat = await Resident.findOne({ flatNumber, blockName });
    if (existingFlat) {
      return res.status(400).json({ 
        success: false, 
        message: `Flat ${flatNumber} in Block ${blockName} already has a resident` 
      });
    }

    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    const normalizedOccupancyType = occupancyType?.toLowerCase() || 'owner';

    const user = new User({
      username,
      email,
      password: password, 
      fullName: `${firstName || ''} ${lastName || ''}`.trim(),
      phone: phone || '',
      role: 'resident',
      status: status || 'Active',
      isActive: status === 'Active' || status === 'Pending',
      flatNumber: flatNumber || '',
      blockName: blockName || '',
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
      flatNumber: flatNumber || '',
      blockName: blockName || '',
      occupancyType: normalizedOccupancyType,
      vehicleNumber: vehicleNumber || '',
      vehicleType: vehicleType || 'None',
      parkingSlot: parkingSlot || '',
      emergencyContact: {
        name: emergencyContact || '',
        phone: emergencyPhone || '',
        relation: 'Emergency'
      },
      familyMembers: familyMembers ? [{ name: 'Family Member', relation: 'Family', phone: '' }] : [],
      notes: notes || '',
      isActive: status === 'Active' || status === 'Pending'
    });
    await resident.save();

    return res.status(201).json({
      success: true,
      message: 'Resident created successfully',
      data: {
        id: user._id,
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        phone: phone || '',
        flatNumber: flatNumber || '',
        blockName: blockName || '',
        status: status || 'Active'
      }
    });
  } catch (error) {
    console.error('Create resident error:', error);
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ success: false, errors });
    }
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error while creating resident' 
    });
  }
};

export const updateResident = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid resident ID' });
    }

    const {
      firstName, lastName, email, phone, password, 
      cnic, gender, dateOfBirth, occupation,
      flatNumber, blockName, floor, occupancyType,
      moveInDate, familyMembers, emergencyContact,
      emergencyPhone, vehicleNumber, vehicleType,
      parkingSlot, status, notes
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'resident') {
      return res.status(400).json({ success: false, message: 'User is not a resident' });
    }


    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email,
        _id: { $ne: user._id } 
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is already registered by another user' 
        });
      }
      user.email = email; 
    }

    if (flatNumber && blockName) {
      const existingFlat = await Resident.findOne({ 
        flatNumber, 
        blockName,
        userId: { $ne: user._id }
      });
      if (existingFlat) {
        return res.status(400).json({ 
          success: false, 
          message: `Flat ${flatNumber} in Block ${blockName} is already occupied by another resident` 
        });
      }
    }

    if (firstName || lastName) {
      user.fullName = `${firstName || user.fullName?.split(' ')[0] || ''} ${lastName || user.fullName?.split(' ').slice(1).join(' ') || ''}`.trim();
    }
    if (phone !== undefined) user.phone = phone || '';
    if (password && password.length >= 6) {
      user.password = password;
    }
    if (cnic !== undefined) user.cnic = cnic || '';
    if (gender) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth || '';
    if (occupation !== undefined) user.occupation = occupation || '';
    if (flatNumber !== undefined) user.flatNumber = flatNumber || '';
    if (blockName !== undefined) user.blockName = blockName || '';
    if (floor !== undefined) user.floor = floor || '1';
    if (moveInDate !== undefined) user.moveInDate = moveInDate || '';
    if (status) {
      user.status = status;
      user.isActive = status === 'Active' || status === 'Pending';
    }
    await user.save();

    let resident = await Resident.findOne({ userId: user._id });
    if (!resident) {
      resident = new Resident({ userId: user._id });
    }

    if (flatNumber !== undefined) resident.flatNumber = flatNumber || '';
    if (blockName !== undefined) resident.blockName = blockName || '';
    if (occupancyType) {
      resident.occupancyType = occupancyType.toLowerCase();
    }
    if (vehicleNumber !== undefined) resident.vehicleNumber = vehicleNumber || '';
    if (vehicleType) resident.vehicleType = vehicleType;
    if (parkingSlot !== undefined) resident.parkingSlot = parkingSlot || '';
    if (emergencyContact || emergencyPhone) {
      resident.emergencyContact = {
        name: emergencyContact || resident.emergencyContact?.name || '',
        phone: emergencyPhone || resident.emergencyContact?.phone || '',
        relation: 'Emergency'
      };
    }
    if (notes !== undefined) resident.notes = notes || '';
    if (status) {
      resident.isActive = status === 'Active' || status === 'Pending';
    }
    await resident.save();

    return res.status(200).json({
      success: true,
      message: 'Resident updated successfully'
    });
  } catch (error) {
    console.error('Update resident error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error while updating resident' 
    });
  }
};

export const deleteResident = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid resident ID' });
    }

    const user = await User.findById(id);
    if (!user || user.role !== 'resident') {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    await Resident.findOneAndDelete({ userId: user._id });
    await user.deleteOne();

    return res.status(200).json({ success: true, message: 'Resident deleted successfully' });
  } catch (error) {
    console.error('Delete resident error:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting resident' });
  }
};

export const updateResidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid resident ID' });
    }

    const user = await User.findById(id);
    if (!user || user.role !== 'resident') {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    user.status = status;
    user.isActive = status === 'Active' || status === 'Pending';
    await user.save();

    const resident = await Resident.findOne({ userId: user._id });
    if (resident) {
      resident.isActive = status === 'Active' || status === 'Pending';
      await resident.save();
    }

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error while updating status' 
    });
  }
};

export const resetResidentPassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid resident ID' });
    }

    const user = await User.findById(id);
    if (!user || user.role !== 'resident') {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let newPassword = '';
    for (let i = 0; i < 8; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: { password: newPassword }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resetting password'
    });
  }
};