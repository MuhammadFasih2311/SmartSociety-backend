import User from '../../models/User.js';
import Guard from '../../models/Guard.js';

// Helper function to generate random password (fallback)
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const getAllGuards = async (req, res) => {
  try {
    const users = await User.find({ role: 'guard' }).select('-password').sort({ createdAt: -1 });
    const guards = await Guard.find();

    const mergedData = users.map(user => {
      const profile = guards.find(g => g.userId.toString() === user._id.toString());
      return {
        id: user._id,
        _id: user._id,
        name: user.fullName || '',
        employeeId: profile?.employeeId || '',
        email: user.email || '',
        phone: user.phone || '',
        shift: profile?.shiftTiming || 'Morning',
        gate: profile?.gateAssigned || 'Main Gate',
        status: user.status || 'Active',
        joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        emergency: profile?.emergencyContact || '',
        address: profile?.address || '',
        profile: profile || null
      };
    });

    res.status(200).json({
      success: true,
      count: mergedData.length,
      data: mergedData
    });
  } catch (error) {
    console.error('Get all guards error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching guards' });
  }
};

export const getGuardById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid guard ID' });
    }

    const user = await User.findById(id).select('-password');
    if (!user || user.role !== 'guard') {
      return res.status(404).json({ success: false, message: 'Guard not found' });
    }

    const profile = await Guard.findOne({ userId: user._id });

    const guardData = {
      id: user._id,
      _id: user._id,
      name: user.fullName || '',
      employeeId: profile?.employeeId || '',
      email: user.email || '',
      phone: user.phone || '',
      shift: profile?.shiftTiming || 'Morning',
      gate: profile?.gateAssigned || 'Main Gate',
      status: user.status || 'Active',
      joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      emergency: profile?.emergencyContact || '',
      address: profile?.address || '',
      profile: profile || null
    };

    res.status(200).json({ success: true, data: guardData });
  } catch (error) {
    console.error('Get guard error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching guard' });
  }
};

export const createGuard = async (req, res) => {
  try {
    const {
      name, employeeId, phone, email, password,
      shift, gate, status,
      emergency, address
    } = req.body;

    const errors = {};
    if (!name) errors.name = 'Name is required';
    if (!employeeId) errors.employeeId = 'Employee ID is required';
    if (!phone) errors.phone = 'Phone number is required';
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (password && password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!shift) errors.shift = 'Shift is required';
    if (!gate) errors.gate = 'Gate assignment is required';

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

    const existingEmployee = await Guard.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: `Employee ID ${employeeId} already exists`
      });
    }

    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

    const user = new User({
      username,
      email,
      password: password, 
      fullName: name,
      phone: phone || '',
      role: 'guard',
      status: status || 'Active',
      isActive: status === 'Active' || status === 'On Leave',
      gateAssigned: gate,
      shiftTiming: shift
    });
    await user.save();

    const guard = new Guard({
      userId: user._id,
      employeeId: employeeId,
      gateAssigned: gate,
      shiftTiming: shift,
      emergencyContact: emergency || '',
      address: address || '',
      isActive: status === 'Active' || status === 'On Leave'
    });
    await guard.save();

    return res.status(201).json({
      success: true,
      message: 'Guard created successfully',
      data: {
        id: user._id,
        name,
        employeeId,
        email,
        phone,
        shift,
        gate,
        status
      }
    });
  } catch (error) {
    console.error('Create guard error:', error);
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ success: false, errors });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating guard'
    });
  }
};

export const updateGuard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid guard ID' });
    }

    const {
      name, employeeId, phone, email, password,
      shift, gate, status,
      emergency, address
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'guard') {
      return res.status(400).json({ success: false, message: 'User is not a guard' });
    }


    if (employeeId) {
      const existingEmployee = await Guard.findOne({
        employeeId,
        userId: { $ne: user._id }
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: `Employee ID ${employeeId} already exists`
        });
      }
    }

    user.fullName = name || user.fullName;
    user.phone = phone || user.phone;
    user.gateAssigned = gate || user.gateAssigned;
    user.shiftTiming = shift || user.shiftTiming;

    if (password && password.length >= 6) {
      user.password = password; 
    }
    
    if (status) {
      user.status = status;
      user.isActive = status === 'Active' || status === 'On Leave';
    }
    await user.save();

    let guard = await Guard.findOne({ userId: user._id });
    if (!guard) {
      guard = new Guard({ userId: user._id });
    }

    if (employeeId) guard.employeeId = employeeId;
    if (gate) guard.gateAssigned = gate;
    if (shift) guard.shiftTiming = shift;
    if (emergency !== undefined) guard.emergencyContact = emergency || '';
    if (address !== undefined) guard.address = address || '';
    if (status) {
      guard.isActive = status === 'Active' || status === 'On Leave';
    }
    await guard.save();

    return res.status(200).json({
      success: true,
      message: 'Guard updated successfully'
    });
  } catch (error) {
    console.error('Update guard error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating guard'
    });
  }
};

export const deleteGuard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid guard ID' });
    }

    const user = await User.findById(id);
    if (!user || user.role !== 'guard') {
      return res.status(404).json({ success: false, message: 'Guard not found' });
    }

    await Guard.findOneAndDelete({ userId: user._id });
    await user.deleteOne();

    return res.status(200).json({ success: true, message: 'Guard deleted successfully' });
  } catch (error) {
    console.error('Delete guard error:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting guard' });
  }
};

export const updateGuardStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid guard ID' });
    }

    const validStatuses = ['Active', 'On Leave', 'Inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: Active, On Leave, or Inactive'
      });
    }

    const user = await User.findById(id);
    if (!user || user.role !== 'guard') {
      return res.status(404).json({ success: false, message: 'Guard not found' });
    }

    user.status = status;
    user.isActive = status === 'Active' || status === 'On Leave';
    await user.save();

    const guard = await Guard.findOne({ userId: user._id });
    if (guard) {
      guard.isActive = status === 'Active' || status === 'On Leave';
      await guard.save();
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

export const resetGuardPassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid guard ID' });
    }

    const user = await User.findById(id);
    if (!user || user.role !== 'guard') {
      return res.status(404).json({ success: false, message: 'Guard not found' });
    }

    const newPassword = generatePassword();
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