import VisitorPass from '../../models/VisitorPass.js';
import User from '../../models/User.js';
import Visitor from '../../models/Visitor.js';

export const getMyPasses = async (req, res) => {
  try {
    const passes = await VisitorPass.find({ residentId: req.user._id })
      .sort({ createdAt: -1 });
    
    const passesWithSync = await Promise.all(passes.map(async (pass) => {
      const visitor = await Visitor.findOne({ passId: pass._id });

      if (visitor) {
        const statusMap = {
          'Verified': 'active',
          'approved': 'active',
          'Resident': 'active',
          'Flagged': 'expired',
          'rejected': 'expired',
          'cancelled': 'cancelled',
          'pending': 'pending'
        };
        
        const mappedStatus = statusMap[visitor.status] || 'pending';
        
        if (pass.status !== mappedStatus) {
          pass.status = mappedStatus;
          pass.guardStatus = visitor.status;
          await pass.save();
        }
      }
      
      return pass;
    }));
    
    res.status(200).json({
      success: true,
      data: passesWithSync
    });
  } catch (error) {
    console.error('❌ Get passes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createPass = async (req, res) => {
  try {
    const {
      visitorName, phone, flatNumber, purpose,
      visitDate, visitTime, duration, idType, idNumber, notes
    } = req.body;

    if (!visitorName || !phone || !visitDate || !visitTime) {
      return res.status(400).json({
        success: false,
        message: 'Visitor name, phone, date and time are required'
      });
    }

    const user = await User.findById(req.user._id);

    const pass = new VisitorPass({
      residentId: req.user._id,
      visitorName,
      phone,
      flatNumber: flatNumber || user?.flatNumber || '',
      purpose: purpose || '',
      visitDate,
      visitTime,
      duration: duration || '1',
      idType: idType || 'CNIC',
      idNumber: idNumber || '',
      notes: notes || '',
      status: 'pending',
      guardStatus: 'pending'
    });

    await pass.save();

    const visitor = new Visitor({
      visitorName: visitorName,
      name: visitorName,
      phone: phone,
      flatNumber: flatNumber || user?.flatNumber || '',
      purpose: purpose || '',
      type: 'visitor',
      status: 'pending',
      gate: 'Main Gate',
      entryTime: visitTime || new Date().toLocaleTimeString(),
      exitTime: 'N/A',
      date: visitDate || new Date().toISOString().split('T')[0],
      idType: idType || 'CNIC',
      idNumber: idNumber || '',
      notes: notes || '',
      loggedBy: req.user._id,
      guardId: null,
      passId: pass._id,
      residentId: req.user._id
    });
    await visitor.save();

    res.status(201).json({
      success: true,
      message: 'Visitor pass created successfully',
      data: pass
    });
  } catch (error) {
    console.error('❌ Create pass error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const cancelPass = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pass = await VisitorPass.findOne({ _id: id, residentId: req.user._id });
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    if (pass.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Pass is already cancelled'
      });
    }

    pass.status = 'cancelled';
    pass.guardStatus = 'cancelled';
    await pass.save();

    const visitor = await Visitor.findOne({ passId: id });
    if (visitor) {
      visitor.status = 'cancelled';
      visitor.exitTime = new Date().toLocaleTimeString();
      await visitor.save();
    }

    res.status(200).json({
      success: true,
      message: 'Pass cancelled successfully',
      data: pass
    });
  } catch (error) {
    console.error('❌ Cancel pass error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const syncGuardStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pass = await VisitorPass.findById(id);
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    const statusMap = {
      'Verified': 'active',
      'approved': 'active',
      'Resident': 'active',
      'Flagged': 'expired',
      'rejected': 'expired',
      'cancelled': 'cancelled',
      'pending': 'pending'
    };

    const mappedStatus = statusMap[status] || 'pending';
    
    pass.status = mappedStatus;
    pass.guardStatus = status;
    pass.guardId = req.user._id;
    pass.guardUpdatedAt = new Date();
    await pass.save();

    res.status(200).json({
      success: true,
      message: 'Status synced successfully',
      data: pass
    });
  } catch (error) {
    console.error('❌ Sync guard status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};