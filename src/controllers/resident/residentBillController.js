import MaintenanceBill from '../../models/MaintenanceBill.js';

export const getMyBills = async (req, res) => {
  try {
    console.log('🔍 Fetching bills for resident:', req.user._id);
    
    const bills = await MaintenanceBill.find({ residentId: req.user._id })
      .sort({ createdAt: -1 });
    
    const totalBills = bills.length;
    const pendingBills = bills.filter(b => b.status === 'Pending').length;
    const paidBills = bills.filter(b => b.status === 'Paid').length;
    const overdueBills = bills.filter(b => b.status === 'Overdue').length;
    const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
    const pendingAmount = bills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.amount, 0);
    const paidAmount = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);

    res.status(200).json({
      success: true,
      data: bills,
      summary: {
        totalBills,
        pendingBills,
        paidBills,
        overdueBills,
        totalAmount,
        pendingAmount,
        paidAmount
      }
    });
  } catch (error) {
    console.error('Get my bills error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await MaintenanceBill.findOne({ 
      _id: id, 
      residentId: req.user._id 
    });
    
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    
    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const payBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    
    const bill = await MaintenanceBill.findOne({ 
      _id: id, 
      residentId: req.user._id 
    });
    
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (bill.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This bill is already paid'
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
    console.error('Pay bill error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBillSummary = async (req, res) => {
  try {
    const bills = await MaintenanceBill.find({ residentId: req.user._id });
    
    const summary = {
      total: bills.length,
      paid: bills.filter(b => b.status === 'Paid').length,
      pending: bills.filter(b => b.status === 'Pending').length,
      overdue: bills.filter(b => b.status === 'Overdue').length,
      totalAmount: bills.reduce((sum, b) => sum + b.amount, 0),
      pendingAmount: bills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.amount, 0)
    };

    const recentBills = bills.slice(0, 3);

    res.status(200).json({
      success: true,
      data: { summary, recentBills }
    });
  } catch (error) {
    console.error('Get bill summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};