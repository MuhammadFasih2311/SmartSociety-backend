import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import User from '../../models/User.js';
import Resident from '../../models/Resident.js';
import Guard from '../../models/Guard.js';
import Visitor from '../../models/Visitor.js';
import Complaint from '../../models/Complaint.js';
import MaintenanceBill from '../../models/MaintenanceBill.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/stats', async (req, res) => {
  try {
    const totalResidents = await User.countDocuments({ role: 'resident', isActive: true });
    const totalGuards = await User.countDocuments({ role: 'guard', isActive: true });
    const totalVisitors = await Visitor.countDocuments();
    const activeVisitors = await Visitor.countDocuments({ status: 'active' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const overdueBills = await MaintenanceBill.countDocuments({ paymentStatus: 'overdue' });
    const totalBills = await MaintenanceBill.countDocuments();
    const paidBills = await MaintenanceBill.countDocuments({ paymentStatus: 'paid' });

    res.json({
      success: true,
      data: {
        residents: totalResidents,
        guards: totalGuards,
        visitors: {
          total: totalVisitors,
          active: activeVisitors
        },
        complaints: {
          pending: pendingComplaints
        },
        bills: {
          total: totalBills,
          paid: paidBills,
          overdue: overdueBills
        }
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/residents', async (req, res) => {
  try {
    const residents = await User.find({ role: 'resident' }).select('-password');
    const residentsWithDetails = await Promise.all(
      residents.map(async (resident) => {
        const residentDetails = await Resident.findOne({ userId: resident._id });
        return {
          ...resident.toObject(),
          residentDetails
        };
      })
    );
    res.json({
      success: true,
      data: residentsWithDetails
    });
  } catch (error) {
    console.error('Get residents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/guards', async (req, res) => {
  try {
    const guards = await User.find({ role: 'guard' }).select('-password');
    const guardsWithDetails = await Promise.all(
      guards.map(async (guard) => {
        const guardDetails = await Guard.findOne({ userId: guard._id });
        return {
          ...guard.toObject(),
          guardDetails
        };
      })
    );
    res.json({
      success: true,
      data: guardsWithDetails
    });
  } catch (error) {
    console.error('Get guards error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/visitors', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: visitors
    });
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('residentId', 'fullName email phone flatNumber')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/complaints/:id', async (req, res) => {
  try {
    const { status, assignedTo, resolution } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status || complaint.status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (resolution) complaint.resolution = resolution;
    if (status === 'resolved') complaint.resolvedAt = new Date();

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/bills', async (req, res) => {
  try {
    const bills = await MaintenanceBill.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: bills
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/bills', async (req, res) => {
  try {
    const bill = new MaintenanceBill(req.body);
    await bill.save();
    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: bill
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;