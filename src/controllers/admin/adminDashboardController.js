import User from '../../models/User.js';
import Resident from '../../models/Resident.js';
import Guard from '../../models/Guard.js';
import Complaint from '../../models/Complaint.js';
import MaintenanceBill from '../../models/MaintenanceBill.js';
import Visitor from '../../models/Visitor.js';
import Notice from '../../models/Notice.js';
import AmenityBooking from '../../models/AmenityBooking.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalResidents = await User.countDocuments({ role: 'resident' });
    const activeResidents = await User.countDocuments({ role: 'resident', isActive: true });
    const totalGuards = await User.countDocuments({ role: 'guard' });
    const activeGuards = await User.countDocuments({ role: 'guard', isActive: true }); 

    const bills = await MaintenanceBill.find();
    const totalBills = bills.length;
    const totalAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
    const collectedAmount = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + (b.amount || 0), 0);
    const pendingAmount = bills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + (b.amount || 0), 0);
    const overdueAmount = bills.filter(b => b.status === 'Overdue').reduce((sum, b) => sum + (b.amount || 0), 0);

    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'In-Progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const visitorsToday = await Visitor.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const totalNotices = await Notice.countDocuments();
    const publishedNotices = await Notice.countDocuments({ status: 'Published' });
    
    const totalBookings = await AmenityBooking.countDocuments();

    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const monthName = months[i];
      const monthNumber = i + 1;

      const monthBills = await MaintenanceBill.find({
        month: monthName,
        year: currentYear
      });
      
      const collected = monthBills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + (b.amount || 0), 0);
      const total = monthBills.reduce((sum, b) => sum + (b.amount || 0), 0);
      
      monthlyData.push({
        month: monthName,
        collected: collected,
        expenses: Math.floor(total * 0.4)
      });
    }

    const complaintCategories = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);
    
    const recentActivities = [];
    
    const recentBills = await MaintenanceBill.find()
      .sort({ createdAt: -1 })
      .limit(2);
    
    recentBills.forEach(bill => {
      recentActivities.push({
        user: bill.residentName || 'Resident',
        action: `Paid maintenance bill`,
        time: getTimeAgo(bill.createdAt),
        flat: bill.flatNumber || 'N/A',
        type: 'payment'
      });
    });

    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(2);
    
    recentComplaints.forEach(complaint => {
      recentActivities.push({
        user: complaint.residentName || 'Resident',
        action: `Raised ${complaint.category?.toLowerCase() || 'new'} complaint`,
        time: getTimeAgo(complaint.createdAt),
        flat: complaint.flatNumber || 'N/A',
        type: 'complaint'
      });
    });

    const recentVisitors = await Visitor.find()
      .sort({ createdAt: -1 })
      .limit(1);
    
    recentVisitors.forEach(visitor => {
      recentActivities.push({
        user: 'Security Guard',
        action: `Logged visitor entry - ${visitor.visitorName || 'Unknown'}`,
        time: getTimeAgo(visitor.createdAt),
        flat: visitor.flatNumber || 'N/A',
        type: 'security'
      });
    });

    recentActivities.sort((a, b) => {
      const timeA = parseInt(a.time) || 0;
      const timeB = parseInt(b.time) || 0;
      return timeA - timeB;
    });
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalResidents,
          activeResidents,
          totalGuards,
          activeGuards,
          totalBills,
          totalAmount,
          collectedAmount,
          pendingAmount,
          overdueAmount,
          totalComplaints,
          pendingComplaints,
          inProgressComplaints,
          resolvedComplaints,
          visitorsToday,
          totalNotices,
          publishedNotices,
          totalBookings
        },
        monthlyData: monthlyData.slice(-6),
        recentActivities: recentActivities.slice(0, 5),
        complaintCategories: complaintCategories.length > 0 ? complaintCategories : [
          { category: 'Plumbing', count: 0 },
          { category: 'Electrical', count: 0 },
          { category: 'Security', count: 0 },
          { category: 'AC Repair', count: 0 },
          { category: 'Other', count: 0 }
        ]
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error while fetching dashboard stats' 
    });
  }
};

export const getResidentDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const flatNumber = req.user.flatNumber;

    const bills = await MaintenanceBill.find({ residentId: userId });
    const totalBills = bills.length;
    const pendingBills = bills.filter(b => b.status === 'Pending').length;
    const paidBills = bills.filter(b => b.status === 'Paid').length;
    const overdueBills = bills.filter(b => b.status === 'Overdue').length;

    const complaints = await Complaint.find({ residentId: userId });
    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'In-Progress').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

    const bookings = await AmenityBooking.find({ residentId: userId });
    const totalBookings = bookings.length;
    const upcomingBookings = bookings.filter(b => new Date(b.date) > new Date()).length;

    const visitors = await Visitor.find({ flatNumber: flatNumber });
    const totalVisitors = visitors.length;
    const activeVisitors = visitors.filter(v => v.status === 'active').length;
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalBills,
          pendingBills,
          paidBills,
          overdueBills,
          totalComplaints,
          pendingComplaints,
          inProgressComplaints,
          resolvedComplaints,
          totalBookings,
          upcomingBookings,
          totalVisitors,
          activeVisitors
        },
        recentBills: bills.slice(0, 3),
        recentComplaints: complaints.slice(0, 3),
        upcomingBookingsList: bookings.filter(b => new Date(b.date) > new Date()).slice(0, 3)
      }
    });
  } catch (error) {
    console.error('Resident dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching resident dashboard stats' 
    });
  }
};


export const getGuardDashboardStats = async (req, res) => {
  try {
    const gate = req.user.gateAssigned || 'Main Gate';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const visitorsToday = await Visitor.countDocuments({
      gate: gate,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const pendingVerifications = await Visitor.countDocuments({
      gate: gate,
      status: 'Pending'
    });

    const totalLogs = await Visitor.countDocuments({ gate: gate });

    const activeVisitors = await Visitor.countDocuments({
      gate: gate,
      status: 'active'
    });

    const recentVisitors = await Visitor.find({
      gate: gate
    })
      .sort({ createdAt: -1 })
      .limit(5);
   
    const gateStatus = 'Active';
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          visitorsToday,
          pendingVerifications,
          totalLogs,
          activeVisitors,
          gateStatus
        },
        recentVisitors: recentVisitors.map(v => ({
          name: v.visitorName,
          flat: v.flatNumber,
          time: getTimeAgo(v.createdAt),
          status: v.status,
          vehicle: v.vehicleNumber
        }))
      }
    });
  } catch (error) {
    console.error('Guard dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching guard dashboard stats' 
    });
  }
};

const getTimeAgo = (date) => {
  if (!date) return 'Just now';
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};