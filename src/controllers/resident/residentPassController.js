import ResidentPass from '../../models/ResidentPass.js';
import User from '../../models/User.js';
import Visitor from '../../models/Visitor.js';


export const getMyPasses = async (req, res) => {
  try {
    const passes = await ResidentPass.find({ residentId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: passes.length,
      data: passes
    });
  } catch (error) {
    console.error('Get my passes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPassById = async (req, res) => {
  try {
    const { id } = req.params;
    const pass = await ResidentPass.findOne({ 
      _id: id, 
      residentId: req.user._id 
    });
    
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }
    
    res.status(200).json({
      success: true,
      data: pass
    });
  } catch (error) {
    console.error('Get pass error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createPass = async (req, res) => {
  try {
    const {
      visitorName,
      visitorPhone,
      visitorCNIC,
      purpose,
      visitDate,
      visitTime,
      duration,
      vehicleNumber,
      notes
    } = req.body;

    const errors = {};
    if (!visitorName) errors.visitorName = 'Visitor name is required';
    if (!visitorPhone) errors.visitorPhone = 'Visitor phone is required';
    if (!purpose) errors.purpose = 'Purpose is required';
    if (!visitDate) errors.visitDate = 'Visit date is required';
    if (!visitTime) errors.visitTime = 'Visit time is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const pass = new ResidentPass({
      residentId: req.user._id,
      residentName: user.fullName,
      flatNumber: user.flatNumber || 'N/A',
      blockName: user.blockName || 'A',
      visitorName,
      visitorPhone,
      visitorCNIC: visitorCNIC || '',
      purpose,
      visitDate: new Date(visitDate),
      visitTime,
      duration: duration || '2 hours',
      vehicleNumber: vehicleNumber || '',
      status: 'pending',
      notes: notes || ''
    });

    await pass.save();

    const visitor = new Visitor({
      guardId: null,
      loggedBy: req.user._id,
      name: visitorName,
      visitorName: visitorName,
      phone: visitorPhone,
      flatNumber: user.flatNumber || 'N/A',
      purpose: purpose,
      vehicleNumber: vehicleNumber || '',
      entryTime: visitTime,
      exitTime: 'N/A',
      date: new Date(visitDate).toISOString().split('T')[0],
      idType: 'CNIC',
      idNumber: visitorCNIC || '',
      notes: notes || '',
      status: 'pending',
      type: 'visitor',
      gate: 'Main Gate',
      passId: pass._id  
    });
    await visitor.save();

    res.status(201).json({
      success: true,
      message: 'Visitor pass created successfully',
      data: {
        pass,
        visitor
      }
    });
  } catch (error) {
    console.error('Create pass error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

export const cancelPass = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pass = await ResidentPass.findOne({ 
      _id: id, 
      residentId: req.user._id 
    });
    
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    if (pass.status === 'approved' || pass.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel approved or used pass'
      });
    }

    if (pass.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Pass is already cancelled'
      });
    }

    pass.status = 'cancelled';
    await pass.save();

    try {
      let visitor = await Visitor.findOne({ passId: pass._id });
      
      if (!visitor) {
        visitor = await Visitor.findOne({
          visitorName: pass.visitorName,
          flatNumber: pass.flatNumber,
          status: { $nin: ['cancelled', 'rejected'] }
        });
      }

      if (!visitor) {
        visitor = await Visitor.findOne({
          phone: pass.visitorPhone,
          flatNumber: pass.flatNumber,
          status: { $nin: ['cancelled', 'rejected'] }
        });
      }

      if (visitor) {
        visitor.status = 'cancelled';
        visitor.exitTime = new Date().toLocaleTimeString();
        await visitor.save();
        console.log('✅ Visitor updated to cancelled:', visitor._id);
      } else {
        console.log('⚠️ No matching visitor found to update');
      }
    } catch (visitorError) {
      console.log('⚠️ Could not update Visitor collection:', visitorError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Pass cancelled successfully',
      data: pass
    });
  } catch (error) {
    console.error('Cancel pass error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllPasses = async (req, res) => {
  try {
    const passes = await ResidentPass.find()
      .populate('residentId', 'fullName email phone')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: passes.length,
      data: passes
    });
  } catch (error) {
    console.error('Get all passes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updatePassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: approved or rejected'
      });
    }

    const pass = await ResidentPass.findById(id);
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    pass.status = status;
    if (status === 'approved') {
      pass.approvedBy = req.user._id;
      pass.approvedAt = new Date();
    }
    if (notes) pass.notes = notes;
    await pass.save();

    await Visitor.findOneAndUpdate(
      { passId: pass._id },
      { status: status === 'approved' ? 'approved' : 'rejected' }
    );

    res.status(200).json({
      success: true,
      message: `Pass ${status} successfully`,
      data: pass
    });
  } catch (error) {
    console.error('Update pass status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const verifyPass = async (req, res) => {
  try {
    const { passCode } = req.body;

    if (!passCode) {
      return res.status(400).json({
        success: false,
        message: 'Pass code is required'
      });
    }

    const pass = await ResidentPass.findOne({ passCode: passCode.toUpperCase() })
      .populate('residentId', 'fullName email phone')
      .populate('approvedBy', 'fullName');

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Invalid pass code'
      });
    }

    if (pass.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Pass is pending approval'
      });
    }

    if (pass.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Pass has been rejected'
      });
    }

    if (pass.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'Pass has already been used'
      });
    }

    if (pass.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Pass has been cancelled'
      });
    }

    if (new Date(pass.expiresAt) < new Date()) {
      pass.status = 'expired';
      await pass.save();
      return res.status(400).json({
        success: false,
        message: 'Pass has expired'
      });
    }

    pass.status = 'used';
    pass.usedAt = new Date();
    await pass.save();

    await Visitor.findOneAndUpdate(
      { passId: pass._id },
      { 
        status: 'Verified',
        entryTime: new Date().toLocaleTimeString()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Pass verified successfully',
      data: {
        pass,
        visitorInfo: {
          name: pass.visitorName,
          phone: pass.visitorPhone,
          flat: pass.flatNumber,
          block: pass.blockName,
          purpose: pass.purpose,
          resident: pass.residentId?.fullName || pass.residentName
        }
      }
    });
  } catch (error) {
    console.error('Verify pass error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};