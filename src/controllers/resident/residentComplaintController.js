import Complaint from '../../models/Complaint.js';
import User from '../../models/User.js';

export const getResidentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ residentId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Get resident complaints error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getResidentComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const complaint = await Complaint.findOne({ 
      _id: id, 
      residentId: req.user._id 
    });
    
    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found or you are not authorized' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createResidentComplaint = async (req, res) => {
  try {
    const { 
      category, 
      description, 
      priority,
      images 
    } = req.body;

    const errors = {};
    if (!category) errors.category = 'Category is required';
    if (!description) errors.description = 'Description is required';
    if (description && description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const complaint = new Complaint({
      residentId: req.user._id,
      residentName: user.fullName || 'Unknown',
      flatNumber: user.flatNumber || 'N/A',
      category: category,
      description: description,
      priority: priority || 'Medium',
      status: 'Pending',
      images: images || [],
      assignedTo: 'Unassigned'
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateResidentComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, images } = req.body;

    const complaint = await Complaint.findOne({ 
      _id: id, 
      residentId: req.user._id 
    });

    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found or you are not authorized' 
      });
    }

    if (complaint.status === 'Resolved' || complaint.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: `Cannot update complaint with status: ${complaint.status}`
      });
    }

    if (description) complaint.description = description;
    if (images) complaint.images = images;

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteResidentComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findOne({ 
      _id: id, 
      residentId: req.user._id 
    });

    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found or you are not authorized' 
      });
    }

    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete complaint with status: ${complaint.status}. Only Pending complaints can be cancelled.`
      });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint cancelled successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getResidentComplaintStats = async (req, res) => {
  try {
    const complaints = await Complaint.find({ residentId: req.user._id });

    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      inProgress: complaints.filter(c => c.status === 'In-Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      rejected: complaints.filter(c => c.status === 'Rejected').length,
      byCategory: {}
    };

    complaints.forEach(c => {
      if (!stats.byCategory[c.category]) {
        stats.byCategory[c.category] = 0;
      }
      stats.byCategory[c.category]++;
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get complaint stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};