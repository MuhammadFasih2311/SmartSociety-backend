import Visitor from '../../models/Visitor.js';
import VisitorPass from '../../models/VisitorPass.js';

export const getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });

    const visitorPasses = await VisitorPass.find().sort({ createdAt: -1 });

    const mergedVisitors = [];
    visitors.forEach(v => {
      mergedVisitors.push({
        _id: v._id,
        source: 'visitor',
        visitorName: v.visitorName || v.name || 'Unknown',
        name: v.name || v.visitorName || 'Unknown',
        flatNumber: v.flatNumber || 'N/A',
        phone: v.phone || 'N/A',
        vehicleNumber: v.vehicleNumber || '',
        purpose: v.purpose || '',
        type: v.type || 'visitor',
        status: v.status || 'pending',
        gate: v.gate || 'Main Gate',
        entryTime: v.entryTime || 'N/A',
        exitTime: v.exitTime || 'N/A',
        date: v.date || new Date(v.createdAt).toISOString().split('T')[0],
        idType: v.idType || 'CNIC',
        idNumber: v.idNumber || '',
        notes: v.notes || '',
        createdAt: v.createdAt,
        passId: v.passId || null,
        residentId: v.residentId || null
      });
    });

    visitorPasses.forEach(vp => {
      const exists = mergedVisitors.some(v => 
        v.visitorName === vp.visitorName && 
        v.flatNumber === vp.flatNumber &&
        v.phone === vp.phone
      );

      if (!exists) {
        mergedVisitors.push({
          _id: vp._id,
          source: 'visitorpass',
          visitorName: vp.visitorName || 'Unknown',
          name: vp.visitorName || 'Unknown',
          flatNumber: vp.flatNumber || 'N/A',
          phone: vp.phone || 'N/A',
          vehicleNumber: '',
          purpose: vp.purpose || '',
          type: 'visitor',
          status: vp.status || 'pending',
          gate: 'Main Gate',
          entryTime: vp.visitTime || 'N/A',
          exitTime: 'N/A',
          date: vp.visitDate || new Date(vp.createdAt).toISOString().split('T')[0],
          idType: vp.idType || 'CNIC',
          idNumber: vp.idNumber || '',
          notes: vp.notes || '',
          createdAt: vp.createdAt,
          passId: vp._id,
          residentId: vp.residentId || null
        });
      }
    });

    mergedVisitors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: mergedVisitors.length,
      data: mergedVisitors
    });
  } catch (error) {
    console.error('❌ Get visitors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid visitor ID' });
    }

    let visitor = await Visitor.findById(id);
    
    if (!visitor) {
      visitor = await VisitorPass.findById(id);
    }
    
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      data: visitor 
    });
  } catch (error) {
    console.error('❌ Get visitor error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid visitor ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createVisitor = async (req, res) => {
  try {
    const {
      name, phone, flatNumber, purpose,
      vehicleNumber, entryTime, exitTime,
      idType, idNumber, notes
    } = req.body;

    const errors = {};
    if (!name) errors.name = 'Name is required';
    if (!phone) errors.phone = 'Phone number is required';
    if (!flatNumber) errors.flatNumber = 'Flat number is required';
    if (!purpose) errors.purpose = 'Purpose is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const visitor = new Visitor({
      guardId: req.user._id,
      loggedBy: req.user._id,
      name: name,
      visitorName: name,
      phone: phone,
      flatNumber: flatNumber,
      purpose: purpose,
      vehicleNumber: vehicleNumber || '',
      entryTime: entryTime || new Date().toLocaleTimeString(),
      exitTime: exitTime || 'N/A',
      date: new Date().toISOString().split('T')[0],
      idType: idType || 'CNIC',
      idNumber: idNumber || '',
      notes: notes || '',
      status: 'pending',
      type: 'visitor',
      gate: 'Main Gate'
    });

    await visitor.save();

    res.status(201).json({
      success: true,
      message: 'Visitor added successfully',
      data: visitor
    });
  } catch (error) {
    console.error('❌ Create visitor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid visitor ID' });
    }

    let visitor = await Visitor.findById(id);
    let isVisitorPass = false;

    if (!visitor) {
      visitor = await VisitorPass.findById(id);
      isVisitorPass = true;
    }

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    const {
      name, phone, flatNumber, purpose,
      vehicleNumber, entryTime, exitTime,
      idType, idNumber, notes, status
    } = req.body;

    visitor.name = name || visitor.name;
    visitor.visitorName = name || visitor.visitorName;
    visitor.phone = phone || visitor.phone;
    visitor.flatNumber = flatNumber || visitor.flatNumber;
    visitor.purpose = purpose || visitor.purpose;
    visitor.vehicleNumber = vehicleNumber !== undefined ? vehicleNumber : visitor.vehicleNumber;
    visitor.entryTime = entryTime || visitor.entryTime;
    visitor.exitTime = exitTime !== undefined ? exitTime : visitor.exitTime;
    visitor.idType = idType || visitor.idType;
    visitor.idNumber = idNumber !== undefined ? idNumber : visitor.idNumber;
    visitor.notes = notes !== undefined ? notes : visitor.notes;
    if (status) visitor.status = status;

    await visitor.save();

    await syncCollections(visitor, isVisitorPass, id);

    res.status(200).json({
      success: true,
      message: 'Visitor updated successfully',
      data: visitor
    });
  } catch (error) {
    console.error('❌ Update visitor error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid visitor ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid visitor ID' });
    }

    let visitor = await Visitor.findById(id);
    let isVisitorPass = false;

    if (!visitor) {
      visitor = await VisitorPass.findById(id);
      isVisitorPass = true;
    }

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    await visitor.deleteOne();

    if (isVisitorPass) {
      await Visitor.findOneAndDelete({ passId: id });
    }

    res.status(200).json({
      success: true,
      message: 'Visitor deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete visitor error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid visitor ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateVisitorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid visitor ID' });
    }

    const validStatuses = ['Verified', 'Flagged', 'Resident', 'pending', 'approved', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: Verified, Flagged, Resident, pending, approved, rejected, or cancelled'
      });
    }

    let visitor = await Visitor.findById(id);
    let isVisitorPass = false;
    let visitorPassDoc = null;

    if (!visitor) {
      visitor = await VisitorPass.findById(id);
      isVisitorPass = true;
      visitorPassDoc = visitor;
    }

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    visitor.status = status;
    
    if (status === 'cancelled') {
      visitor.exitTime = new Date().toLocaleTimeString();
    }
    
    await visitor.save();

    await syncCollections(visitor, isVisitorPass, id);

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: visitor
    });
  } catch (error) {
    console.error('❌ Update status error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid visitor ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const syncCollections = async (visitor, isVisitorPass, id) => {
  try {
    if (isVisitorPass && visitor) {
      let existingVisitor = await Visitor.findOne({ passId: id });
      
      if (!existingVisitor) {
        existingVisitor = await Visitor.findOne({
          visitorName: visitor.visitorName,
          flatNumber: visitor.flatNumber,
          phone: visitor.phone
        });
      }

      if (existingVisitor) {
        existingVisitor.status = visitor.status;
        existingVisitor.visitorName = visitor.visitorName;
        existingVisitor.name = visitor.visitorName;
        existingVisitor.flatNumber = visitor.flatNumber;
        existingVisitor.phone = visitor.phone;
        existingVisitor.purpose = visitor.purpose;
        existingVisitor.entryTime = visitor.visitTime || existingVisitor.entryTime;
        if (visitor.status === 'cancelled') {
          existingVisitor.exitTime = new Date().toLocaleTimeString();
        }
        await existingVisitor.save();
      } else {
        const newVisitor = new Visitor({
          visitorName: visitor.visitorName,
          name: visitor.visitorName,
          flatNumber: visitor.flatNumber,
          phone: visitor.phone,
          purpose: visitor.purpose,
          type: 'visitor',
          status: visitor.status,
          gate: 'Main Gate',
          entryTime: visitor.visitTime || new Date().toLocaleTimeString(),
          exitTime: visitor.status === 'cancelled' ? new Date().toLocaleTimeString() : 'N/A',
          date: visitor.visitDate || new Date().toISOString().split('T')[0],
          idType: visitor.idType || 'CNIC',
          idNumber: visitor.idNumber || '',
          notes: visitor.notes || '',
          loggedBy: visitor.loggedBy || null,
          guardId: visitor.guardId || null,
          passId: visitor._id,
          residentId: visitor.residentId || null
        });
        await newVisitor.save();
      }
    } else if (!isVisitorPass && visitor) {
      let visitorPass = await VisitorPass.findOne({ 
        $or: [
          { _id: visitor.passId },
          { visitorName: visitor.visitorName, flatNumber: visitor.flatNumber }
        ]
      });
      
      if (visitorPass) {
        visitorPass.status = visitor.status;
        visitorPass.visitorName = visitor.visitorName;
        visitorPass.flatNumber = visitor.flatNumber;
        visitorPass.phone = visitor.phone;
        visitorPass.purpose = visitor.purpose;
        if (visitor.status === 'cancelled') {
          visitorPass.exitTime = new Date().toLocaleTimeString();
        }
        await visitorPass.save();
      }
    }
  } catch (error) {
    console.log('⚠️ Sync error:', error.message);
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    const visitors = await Visitor.find();
    const visitorPasses = await VisitorPass.find();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allVisitors = [...visitors, ...visitorPasses];

    const stats = {
      totalVisitors: allVisitors.length,
      verified: allVisitors.filter(v => v.status === 'Verified' || v.status === 'approved').length,
      flagged: allVisitors.filter(v => v.status === 'Flagged' || v.status === 'rejected').length,
      resident: allVisitors.filter(v => v.status === 'Resident').length,
      pending: allVisitors.filter(v => v.status === 'pending').length,
      cancelled: allVisitors.filter(v => v.status === 'cancelled').length,
      todayVisitors: allVisitors.filter(v => new Date(v.createdAt) >= today).length,
      alerts: allVisitors.filter(v => v.status === 'Flagged' || v.status === 'pending').length
    };

    const recentVisitors = allVisitors.slice(0, 5);

    res.status(200).json({
      success: true,
      data: { stats, recentVisitors }
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyVisitor = async (req, res) => {
  try {
    const { searchTerm } = req.body;

    if (!searchTerm || searchTerm.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name, phone number, or CNIC'
      });
    }

    const term = searchTerm.trim();
    let visitor = null;

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(term);
    
    if (isValidObjectId) {
      visitor = await Visitor.findById(term);
      if (!visitor) {
        visitor = await VisitorPass.findById(term);
      }
    }

    if (!visitor) {
      visitor = await Visitor.findOne({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { visitorName: { $regex: term, $options: 'i' } },
          { phone: { $regex: term, $options: 'i' } },
          { cnic: { $regex: term, $options: 'i' } },
          { idNumber: { $regex: term, $options: 'i' } },
          { flatNumber: { $regex: term, $options: 'i' } }
        ]
      });
      
      if (!visitor) {
        visitor = await VisitorPass.findOne({
          $or: [
            { visitorName: { $regex: term, $options: 'i' } },
            { phone: { $regex: term, $options: 'i' } },
            { idNumber: { $regex: term, $options: 'i' } },
            { flatNumber: { $regex: term, $options: 'i' } }
          ]
        });
      }
    }

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'No visitor found matching your search'
      });
    }

    const validStatuses = ['approved', 'Verified', 'Resident'];
    const isVerified = validStatuses.includes(visitor.status);
    const isPending = visitor.status === 'pending';
    const isRejected = visitor.status === 'rejected' || visitor.status === 'Flagged';
    const isCancelled = visitor.status === 'cancelled';

    let verificationResult = {
      valid: false,
      message: '',
      visitor: visitor,
      status: visitor.status
    };

    if (isVerified) {
      verificationResult.valid = true;
      verificationResult.message = '✅ Visitor is verified. Entry allowed.';
    } else if (isPending) {
      verificationResult.valid = false;
      verificationResult.message = '⏳ Visitor is pending approval. Please wait.';
    } else if (isRejected) {
      verificationResult.valid = false;
      verificationResult.message = '❌ Visitor has been rejected or flagged. Entry not allowed.';
    } else if (isCancelled) {
      verificationResult.valid = false;
      verificationResult.message = '❌ Visitor pass has been cancelled. Entry not allowed.';
    } else {
      verificationResult.valid = false;
      verificationResult.message = '⚠️ Unknown visitor status. Please contact admin.';
    }

    visitor.lastVerified = new Date();
    await visitor.save();

    res.status(200).json({
      success: true,
      data: verificationResult
    });

  } catch (error) {
    console.error('❌ Verify visitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

export const allowEntry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visitor ID'
      });
    }

    let visitor = await Visitor.findById(id);
    if (!visitor) {
      visitor = await VisitorPass.findById(id);
    }

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    visitor.status = 'Verified';
    visitor.entryTime = new Date().toLocaleTimeString();
    visitor.entryAllowed = true;
    visitor.entryAllowedAt = new Date();
    await visitor.save();

    // Sync
    await syncCollections(visitor, visitor._id === id ? false : true, id);

    res.status(200).json({
      success: true,
      message: 'Entry allowed successfully',
      data: visitor
    });
  } catch (error) {
    console.error('❌ Allow entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const denyEntry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visitor ID'
      });
    }

    let visitor = await Visitor.findById(id);
    if (!visitor) {
      visitor = await VisitorPass.findById(id);
    }

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    visitor.status = 'rejected';
    visitor.entryDenied = true;
    visitor.entryDeniedAt = new Date();
    await visitor.save();

    // Sync
    await syncCollections(visitor, visitor._id === id ? false : true, id);

    res.status(200).json({
      success: true,
      message: 'Entry denied',
      data: visitor
    });
  } catch (error) {
    console.error('❌ Deny entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getGateLogs = async (req, res) => {
  try {
    const { search, type, status, date } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { visitorName: { $regex: search, $options: 'i' } },
        { flatNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (status && status !== 'all') {
      query.status = { $regex: status, $options: 'i' };
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const visitors = await Visitor.find(query).sort({ createdAt: -1 });
    const visitorPasses = await VisitorPass.find().sort({ createdAt: -1 });

    const allVisitors = [...visitors, ...visitorPasses];

    const logs = allVisitors.map(visitor => ({
      id: visitor._id,
      logId: visitor._id.toString().slice(-6),
      visitor: visitor.visitorName || visitor.name || 'Unknown',
      flat: visitor.flatNumber || 'N/A',
      vehicle: visitor.vehicleNumber || 'N/A',
      entryTime: visitor.entryTime || visitor.visitTime || 'N/A',
      exitTime: visitor.exitTime || 'N/A',
      status: visitor.status || 'pending',
      gate: visitor.gate || 'Main Gate',
      type: visitor.type || 'visitor',
      date: visitor.date || visitor.visitDate || new Date(visitor.createdAt).toISOString().split('T')[0],
      phone: visitor.phone || 'N/A',
      purpose: visitor.purpose || 'N/A',
      createdAt: visitor.createdAt
    }));

    const today = new Date().toISOString().split('T')[0];
    const stats = {
      total: logs.length,
      today: logs.filter(l => l.date === today).length,
      verified: logs.filter(l => l.status === 'Verified' || l.status === 'approved').length,
      flagged: logs.filter(l => l.status === 'Flagged' || l.status === 'rejected').length,
      resident: logs.filter(l => l.status === 'Resident').length,
      pending: logs.filter(l => l.status === 'pending').length,
      cancelled: logs.filter(l => l.status === 'cancelled').length
    };

    res.status(200).json({
      success: true,
      data: logs,
      stats: stats,
      count: logs.length
    });
  } catch (error) {
    console.error('❌ Get gate logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const exportGateLogs = async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    const visitorPasses = await VisitorPass.find().sort({ createdAt: -1 });
    
    const allVisitors = [...visitors, ...visitorPasses];
    
    const headers = ['Log ID', 'Visitor Name', 'Flat Number', 'Phone', 'Vehicle Number', 'Type', 'Status', 'Gate', 'Entry Time', 'Exit Time', 'Date', 'Purpose'];
    
    let csvData = headers.join(',') + '\n';
    
    allVisitors.forEach(visitor => {
      const row = [
        visitor._id.toString().slice(-6),
        visitor.visitorName || visitor.name || 'Unknown',
        visitor.flatNumber || 'N/A',
        visitor.phone || 'N/A',
        visitor.vehicleNumber || 'N/A',
        visitor.type || 'visitor',
        visitor.status || 'pending',
        visitor.gate || 'Main Gate',
        visitor.entryTime || visitor.visitTime || 'N/A',
        visitor.exitTime || 'N/A',
        visitor.date || visitor.visitDate || new Date(visitor.createdAt).toISOString().split('T')[0],
        visitor.purpose || 'N/A'
      ];
      csvData += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=gate-logs-${new Date().toISOString().split('T')[0]}.csv`);
    
    res.status(200).send(csvData);
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};