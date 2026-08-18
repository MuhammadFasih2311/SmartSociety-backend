import MaintenanceBill from '../../models/MaintenanceBill.js';

export const getResidentBills = async (req, res) => {
  try {
    const bills = await MaintenanceBill.find({ residentId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    console.error('❌ Get resident bills error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getResidentBillById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bill = await MaintenanceBill.findOne({ 
      _id: id, 
      residentId: req.user._id 
    });
    
    if (!bill) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bill not found or you are not authorized' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (error) {
    console.error('❌ Get bill by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid bill ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getResidentBillStats = async (req, res) => {
  try {
    const bills = await MaintenanceBill.find({ residentId: req.user._id });

    const stats = {
      total: bills.length,
      paid: bills.filter(b => b.status === 'Paid').length,
      pending: bills.filter(b => b.status === 'Pending').length,
      overdue: bills.filter(b => b.status === 'Overdue').length,
      totalAmount: bills.reduce((sum, b) => sum + b.amount, 0),
      paidAmount: bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0),
      pendingAmount: bills.filter(b => b.status === 'Pending' || b.status === 'Overdue')
        .reduce((sum, b) => sum + b.amount, 0)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Get bill stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const payResidentBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await MaintenanceBill.findOne({ 
      _id: id, 
      residentId: req.user._id 
    });

    if (!bill) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bill not found or you are not authorized' 
      });
    }

    if (bill.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Bill is already paid'
      });
    }

    bill.status = 'Paid';
    bill.paidDate = new Date();
    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Bill paid successfully',
      data: bill
    });
  } catch (error) {
    console.error('❌ Pay bill error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid bill ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};