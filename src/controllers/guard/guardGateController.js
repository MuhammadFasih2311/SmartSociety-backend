import Gate from '../../models/Gate.js';
import User from '../../models/User.js';
import Guard from '../../models/Guard.js';

export const getAllGuards = async (req, res) => {
  try {
    console.log('📋 Fetching all guards for selection...');
    
    const users = await User.find({ 
      role: 'guard'
    }).select('fullName email phone status isActive username _id');

    console.log(`👤 Found ${users.length} guard users in database`);

    if (!users || users.length === 0) {
      console.log('⚠️ No guards found in database');
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'No guards found. Please add guards first.'
      });
    }

    const guardProfiles = await Guard.find();
    console.log(`📁 Found ${guardProfiles.length} guard profiles`);

    const guards = users.map(user => {
      let profile = null;
      try {
        profile = guardProfiles.find(g => {
          if (!g || !g.userId) return false;
          return g.userId.toString() === user._id.toString();
        });
      } catch (e) {
        console.log('Error matching profile:', e.message);
        profile = null;
      }
      
      return {
        _id: user._id,
        fullName: user.fullName || user.username || 'Unknown Guard',
        email: user.email || '',
        phone: user.phone || '',
        status: user.status || 'Active',
        isActive: user.isActive !== false,
        employeeId: profile?.employeeId || '',
        gateAssigned: profile?.gateAssigned || '',
        shiftTiming: profile?.shiftTiming || '',
        emergencyContact: profile?.emergencyContact || '',
        address: profile?.address || ''
      };
    });

    console.log(`✅ Returning ${guards.length} guards`);
    console.log('📊 Guards data:', JSON.stringify(guards, null, 2));

    res.status(200).json({
      success: true,
      data: guards,
      count: guards.length
    });
  } catch (error) {
    console.error('❌ Get all guards error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching guards: ' + error.message 
    });
  }
};

export const getGates = async (req, res) => {
  try {
    const gates = await Gate.find()
      .populate('guardId', 'fullName email phone')
      .sort({ createdAt: -1 });
    
    // Format gates for display
    const formattedGates = gates.map(gate => {
      let guardName = gate.guardId?.fullName || gate.guardName || 'N/A';
      
      return {
        id: gate._id,
        name: gate.name,
        status: gate.status,
        guardId: gate.guardId?._id || null,
        guard: guardName,
        guardEmail: gate.guardId?.email || '',
        guardPhone: gate.guardId?.phone || '',
        shift: gate.shift || 'N/A',
        lastUpdated: new Date(gate.lastUpdated).toLocaleTimeString(),
        location: gate.location || '',
        description: gate.description || '',
        isActive: gate.isActive
      };
    });

    const stats = {
      total: gates.length,
      active: gates.filter(g => g.status === 'Active').length,
      inactive: gates.filter(g => g.status === 'Inactive').length,
      maintenance: gates.filter(g => g.status === 'Maintenance').length
    };

    res.status(200).json({
      success: true,
      data: formattedGates,
      stats: stats,
      count: gates.length
    });
  } catch (error) {
    console.error('Get gates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAvailableGuards = async (req, res) => {
  try {
    const users = await User.find({ 
      role: 'guard'
    }).select('fullName email phone status isActive _id');

    const guardProfiles = await Guard.find();

    const guards = users.map(user => {
      let profile = null;
      try {
        profile = guardProfiles.find(g => {
          if (!g || !g.userId) return false;
          return g.userId.toString() === user._id.toString();
        });
      } catch (e) {
        profile = null;
      }
      return {
        _id: user._id,
        fullName: user.fullName || 'Unknown Guard',
        email: user.email || '',
        phone: user.phone || '',
        status: user.status || 'Active',
        isActive: user.isActive !== false,
        employeeId: profile?.employeeId || '',
        gateAssigned: profile?.gateAssigned || '',
        shiftTiming: profile?.shiftTiming || ''
      };
    });

    const activeGuards = guards.filter(g => g.isActive === true);

    const assignedGuardIds = await Gate.distinct('guardId', { guardId: { $ne: null } });
    const assignedIds = assignedGuardIds.map(id => id.toString());

    const availableGuards = activeGuards.filter(guard => 
      !assignedIds.includes(guard._id.toString())
    );

    res.status(200).json({
      success: true,
      data: availableGuards,
      count: availableGuards.length
    });
  } catch (error) {
    console.error('Get available guards error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getGateById = async (req, res) => {
  try {
    const { id } = req.params;
    const gate = await Gate.findById(id).populate('guardId', 'fullName email phone');
    
    if (!gate) {
      return res.status(404).json({ success: false, message: 'Gate not found' });
    }

    res.status(200).json({
      success: true,
      data: gate
    });
  } catch (error) {
    console.error('Get gate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateGateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Active', 'Inactive', 'Maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: Active, Inactive, or Maintenance'
      });
    }

    const gate = await Gate.findById(id);
    if (!gate) {
      return res.status(404).json({ success: false, message: 'Gate not found' });
    }

    gate.status = status;
    gate.isActive = status === 'Active';
    gate.lastUpdated = new Date();
    await gate.save();

    res.status(200).json({
      success: true,
      message: `Gate status updated to ${status}`,
      data: gate
    });
  } catch (error) {
    console.error('Update gate status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateGate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, guardId, shift, location, description } = req.body;

    const gate = await Gate.findById(id);
    if (!gate) {
      return res.status(404).json({ success: false, message: 'Gate not found' });
    }

    if (name) gate.name = name;
    if (status) {
      gate.status = status;
      gate.isActive = status === 'Active';
    }

    if (guardId !== undefined) {
      if (guardId) {
        const guard = await User.findById(guardId);
        if (!guard || guard.role !== 'guard') {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid guard selected' 
          });
        }
        gate.guardId = guardId;
        gate.guardName = guard.fullName || 'N/A';
      } else {
        gate.guardId = null;
        gate.guardName = 'N/A';
      }
    }
    
    if (shift) gate.shift = shift;
    if (location !== undefined) gate.location = location || '';
    if (description !== undefined) gate.description = description || '';
    gate.lastUpdated = new Date();

    await gate.save();

    const updatedGate = await Gate.findById(id).populate('guardId', 'fullName email phone');

    res.status(200).json({
      success: true,
      message: 'Gate updated successfully',
      data: updatedGate
    });
  } catch (error) {
    console.error('Update gate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createGate = async (req, res) => {
  try {
    const { name, status, guardId, shift, location, description } = req.body;

    const errors = {};
    if (!name) errors.name = 'Gate name is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    let guardName = 'N/A';
    if (guardId) {
      const guard = await User.findById(guardId);
      if (guard && guard.role === 'guard') {
        guardName = guard.fullName || 'N/A';
      }
    }

    const gate = new Gate({
      name,
      status: status || 'Active',
      guardId: guardId || null,
      guardName: guardName,
      shift: shift || 'N/A',
      location: location || '',
      description: description || '',
      isActive: status === 'Active'
    });

    await gate.save();

    res.status(201).json({
      success: true,
      message: 'Gate created successfully',
      data: gate
    });
  } catch (error) {
    console.error('Create gate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteGate = async (req, res) => {
  try {
    const { id } = req.params;
    const gate = await Gate.findById(id);
    
    if (!gate) {
      return res.status(404).json({ success: false, message: 'Gate not found' });
    }

    await gate.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Gate deleted successfully'
    });
  } catch (error) {
    console.error('Delete gate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getGateStats = async (req, res) => {
  try {
    const gates = await Gate.find();
    
    const stats = {
      total: gates.length,
      active: gates.filter(g => g.status === 'Active').length,
      inactive: gates.filter(g => g.status === 'Inactive').length,
      maintenance: gates.filter(g => g.status === 'Maintenance').length
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get gate stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};