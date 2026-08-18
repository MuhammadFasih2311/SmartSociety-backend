import MaintenanceBill from '../../models/MaintenanceBill.js';
import User from '../../models/User.js';
import Resident from '../../models/Resident.js';

export const getAllBills = async (req, res) => {
  try {
    const bills = await MaintenanceBill.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    console.error('Get all bills error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching bills' });
  }
};

export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid bill ID' });
    }

    const bill = await MaintenanceBill.findById(id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching bill' });
  }
};

export const generateBills = async (req, res) => {
  try {
    const { residentIds, amount, dueDate, description, month, year, charges } = req.body;

    if (!residentIds || residentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one resident' });
    }

    if (!amount || !dueDate) {
      return res.status(400).json({ success: false, message: 'Amount and due date are required' });
    }

    const residents = await User.find({ 
      _id: { $in: residentIds },
      role: 'resident'
    });

    if (residents.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid residents found' });
    }

    const bills = [];
    const currentMonth = month || new Date().toLocaleString('default', { month: 'long' });
    const currentYear = year || new Date().getFullYear();

    for (const resident of residents) {
      const flatNumber = resident.flatNumber || 'N/A';
      
      const bill = new MaintenanceBill({
        residentId: resident._id,
        flatNumber: flatNumber,
        residentName: resident.fullName,
        amount: parseFloat(amount),
        month: currentMonth,
        year: currentYear,
        dueDate: new Date(dueDate),
        description: description || 'Monthly maintenance fee',
        charges: charges || {
          maintenance: parseFloat(amount) * 0.6,
          security: parseFloat(amount) * 0.2,
          water: parseFloat(amount) * 0.1,
          repairs: parseFloat(amount) * 0.05,
          other: parseFloat(amount) * 0.05
        },
        status: 'Pending'
      });
      
      await bill.save();
      bills.push(bill);
    }

    res.status(201).json({
      success: true,
      message: `${bills.length} bills generated successfully`,
      data: bills
    });
  } catch (error) {
    console.error('Generate bills error:', error);
    res.status(500).json({ success: false, message: 'Server error while generating bills' });
  }
};

export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid bill ID' });
    }

    const { amount, dueDate, status, description, paidDate } = req.body;

    const bill = await MaintenanceBill.findById(id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (amount) bill.amount = parseFloat(amount);
    if (dueDate) bill.dueDate = new Date(dueDate);
    if (status) {
      bill.status = status;
      if (status === 'Paid') {
        bill.paidDate = paidDate || new Date();
      } else {
        bill.paidDate = null;
      }
    }
    if (description) bill.description = description;

    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: bill
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating bill' });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid bill ID' });
    }

    const bill = await MaintenanceBill.findById(id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    await bill.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting bill' });
  }
};

export const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid bill ID' });
    }

    const bill = await MaintenanceBill.findById(id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    bill.status = status;
    if (status === 'Paid') {
      bill.paidDate = new Date();
    } else {
      bill.paidDate = null;
    }
    await bill.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: bill
    });
  } catch (error) {
    console.error('Update bill status error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating status' });
  }
};