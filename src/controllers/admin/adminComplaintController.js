import Complaint from '../../models/Complaint.js';
import User from '../../models/User.js';

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching complaints' });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching complaint' });
  }
};

export const createComplaint = async (req, res) => {
  try {
    const {
      residentId, residentName, flatNumber,
      category, description, priority,
      assignedTo, images
    } = req.body;

    const errors = {};
    if (!residentId) errors.residentId = 'Resident is required';
    if (!residentName) errors.residentName = 'Resident name is required';
    if (!flatNumber) errors.flatNumber = 'Flat number is required';
    if (!category) errors.category = 'Category is required';
    if (!description) errors.description = 'Description is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const complaint = new Complaint({
      residentId,
      residentName,
      flatNumber,
      category,
      description,
      priority: priority || 'Medium',
      assignedTo: assignedTo || 'Unassigned',
      images: images || [],
      status: assignedTo && assignedTo !== 'Unassigned' ? 'In-Progress' : 'Pending'
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: 'Server error while creating complaint' });
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const {
      category, description, priority,
      assignedTo, status, resolution
    } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (category) complaint.category = category;
    if (description) complaint.description = description;
    if (priority) complaint.priority = priority;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (resolution !== undefined) complaint.resolution = resolution;
    
    if (status) {
      complaint.status = status;
      if (status === 'Resolved') {
        complaint.resolvedAt = new Date();
      } else {
        complaint.resolvedAt = null;
      }
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating complaint' });
  }
};

export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting complaint' });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
      if (resolution) complaint.resolution = resolution;
    } else {
      complaint.resolvedAt = null;
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: complaint
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating status' });
  }
};

export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.assignedTo = assignedTo;
    complaint.status = assignedTo === 'Unassigned' ? 'Pending' : 'In-Progress';

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Complaint assigned to ${assignedTo}`,
      data: complaint
    });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({ success: false, message: 'Server error while assigning complaint' });
  }
};