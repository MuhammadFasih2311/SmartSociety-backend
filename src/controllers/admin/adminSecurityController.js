import Visitor from '../../models/Visitor.js';
import User from '../../models/User.js';

export const getAllLogs = async (req, res) => {
  try {
    const logs = await Visitor.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Get all logs error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching logs' });
  }
};

export const getLogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid log ID' });
    }

    const log = await Visitor.findById(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get log error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching log' });
  }
};

export const createLog = async (req, res) => {
  try {
    const {
      visitorName, flatNumber, vehicleNumber, phone,
      purpose, type, status, gate,
      entryTime, exitTime, date
    } = req.body;

    const errors = {};
    if (!visitorName) errors.visitorName = 'Visitor name is required';
    if (!flatNumber) errors.flatNumber = 'Flat number is required';
    if (!entryTime) errors.entryTime = 'Entry time is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const log = new Visitor({
      loggedBy: req.user._id,
      visitorName,
      flatNumber,
      vehicleNumber: vehicleNumber || '',
      phone: phone || '',
      purpose: purpose || '',
      type: type || 'visitor',
      status: status || 'Verified',
      gate: gate || 'Main Gate',
      entryTime,
      exitTime: exitTime || 'N/A',
      date: date || new Date().toISOString().split('T')[0],
      name: visitorName
    });

    await log.save();

    res.status(201).json({
      success: true,
      message: 'Log entry created successfully',
      data: log
    });
  } catch (error) {
    console.error('Create log error:', error);
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: 'Server error while creating log' });
  }
};

export const updateLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid log ID' });
    }

    const {
      visitorName, flatNumber, vehicleNumber, phone,
      purpose, type, status, gate,
      entryTime, exitTime, date
    } = req.body;

    const log = await Visitor.findById(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    if (visitorName) log.visitorName = visitorName;
    if (flatNumber) log.flatNumber = flatNumber;
    if (vehicleNumber !== undefined) log.vehicleNumber = vehicleNumber || '';
    if (phone !== undefined) log.phone = phone || '';
    if (purpose !== undefined) log.purpose = purpose || '';
    if (type) log.type = type;
    if (status) log.status = status;
    if (gate) log.gate = gate;
    if (entryTime) log.entryTime = entryTime;
    if (exitTime !== undefined) log.exitTime = exitTime || 'N/A';
    if (date) log.date = date;

    await log.save();

    res.status(200).json({
      success: true,
      message: 'Log updated successfully',
      data: log
    });
  } catch (error) {
    console.error('Update log error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating log' });
  }
};

export const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid log ID' });
    }

    const log = await Visitor.findById(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    await log.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Log deleted successfully'
    });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting log' });
  }
};

export const updateLogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid log ID' });
    }

    const validStatuses = ['Verified', 'Flagged', 'Resident', 'pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: Verified, Flagged, Resident, pending, approved, or rejected'
      });
    }

    const log = await Visitor.findById(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    log.status = status;
    await log.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: log
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating status' });
  }
};

export const exportLogs = async (req, res) => {
  try {
    const logs = await Visitor.find().sort({ createdAt: -1 });

    const headers = ['Log ID', 'Visitor Name', 'Flat Number', 'Vehicle Number', 'Phone', 'Type', 'Status', 'Gate', 'Entry Time', 'Exit Time', 'Date', 'Purpose'];
    
    let csvData = headers.join(',') + '\n';
    
    logs.forEach(log => {
      const row = [
        log._id.toString().slice(-6),
        log.visitorName || log.name || '',
        log.flatNumber || '',
        log.vehicleNumber || '',
        log.phone || '',
        log.type || '',
        log.status || '',
        log.gate || '',
        log.entryTime || '',
        log.exitTime || '',
        log.date || '',
        log.purpose || ''
      ];
      csvData += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=security-logs-${new Date().toISOString().split('T')[0]}.csv`);
    
    res.status(200).send(csvData);
  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).json({ success: false, message: 'Server error while exporting logs' });
  }
};