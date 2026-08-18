import Visitor from '../../models/Visitor.js';
import Gate from '../../models/Gate.js';
import User from '../../models/User.js';

export const generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;

    let start = new Date();
    let end = new Date();

    switch(reportType) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        if (startDate && endDate) {
          start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
        }
        break;
      default:
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }

    const visitors = await Visitor.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });

    const gates = await Gate.find();
    const activeGates = gates.filter(g => g.status === 'Active');

    const totalVisitors = visitors.length;
    const verified = visitors.filter(v => v.status === 'Verified' || v.status === 'approved').length;
    const flagged = visitors.filter(v => v.status === 'Flagged' || v.status === 'rejected').length;
    const resident = visitors.filter(v => v.status === 'Resident').length;
    const pending = visitors.filter(v => v.status === 'pending').length;

    const hourCounts = {};
    visitors.forEach(v => {
      if (v.createdAt) {
        const hour = new Date(v.createdAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    let peakHour = 'N/A';
    let maxCount = 0;
    for (const [hour, count] of Object.entries(hourCounts)) {
      if (count > maxCount) {
        maxCount = count;
        peakHour = `${hour}:00`;
      }
    }

    let totalStayTime = 0;
    let stayCount = 0;
    visitors.forEach(v => {
      if (v.entryTime && v.exitTime && v.exitTime !== 'N/A') {
        try {
          const entry = new Date(v.entryTime);
          const exit = new Date(v.exitTime);
          if (!isNaN(entry.getTime()) && !isNaN(exit.getTime())) {
            const diff = (exit - entry) / (1000 * 60);
            if (diff > 0 && diff < 1440) { 
              totalStayTime += diff;
              stayCount++;
            }
          }
        } catch (e) {
        }
      }
    });
    const avgStayTime = stayCount > 0 ? Math.round(totalStayTime / stayCount) : 0;

    const gateUsage = gates.length > 0 ? Math.round((activeGates.length / gates.length) * 100) : 0;

    const recentVisitors = visitors.slice(0, 5).map(v => ({
      name: v.name || v.visitorName || 'Unknown',
      flat: v.flatNumber || 'N/A',
      status: v.status || 'pending',
      time: v.createdAt ? new Date(v.createdAt).toLocaleTimeString() : 'N/A'
    }));

    const dailyTrend = {};
    visitors.forEach(v => {
      if (v.createdAt) {
        const date = new Date(v.createdAt).toISOString().split('T')[0];
        dailyTrend[date] = (dailyTrend[date] || 0) + 1;
      }
    });
    const trendData = Object.entries(dailyTrend).map(([date, count]) => ({ date, count }));

    const reportData = {
      reportType,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      },
      summary: {
        totalVisitors,
        verified,
        flagged,
        resident,
        pending,
        peakHour,
        avgStayTime: avgStayTime > 0 ? `${avgStayTime} min` : 'N/A',
        gateUsage: `${gateUsage}%`,
        totalGates: gates.length,
        activeGates: activeGates.length
      },
      recentVisitors,
      trendData,
      generatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ success: false, message: 'Server error while generating report' });
  }
};

export const exportReport = async (req, res) => {
  try {
    const { format, startDate, endDate } = req.query;

    let start = new Date();
    let end = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    const visitors = await Visitor.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });

    const headers = ['Visitor Name', 'Flat Number', 'Phone', 'Vehicle Number', 'Type', 'Status', 'Gate', 'Entry Time', 'Exit Time', 'Date'];
    let csvData = headers.join(',') + '\n';

    visitors.forEach(v => {
      const row = [
        `"${v.name || v.visitorName || 'Unknown'}"`,
        `"${v.flatNumber || 'N/A'}"`,
        `"${v.phone || 'N/A'}"`,
        `"${v.vehicleNumber || 'N/A'}"`,
        `"${v.type || 'visitor'}"`,
        `"${v.status || 'pending'}"`,
        `"${v.gate || 'Main Gate'}"`,
        `"${v.entryTime || 'N/A'}"`,
        `"${v.exitTime || 'N/A'}"`,
        `"${v.date || new Date(v.createdAt).toISOString().split('T')[0]}"`
      ];
      csvData += row.join(',') + '\n';
    });

    const filename = `report-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csvData);

  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ success: false, message: 'Server error while exporting report' });
  }
};

export const getReportStats = async (req, res) => {
  try {
    const totalVisitors = await Visitor.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitors = await Visitor.countDocuments({ createdAt: { $gte: today } });
    
    const verified = await Visitor.countDocuments({ 
      status: { $in: ['Verified', 'approved'] } 
    });
    const flagged = await Visitor.countDocuments({ 
      status: { $in: ['Flagged', 'rejected'] } 
    });

    const gates = await Gate.find();
    const activeGates = gates.filter(g => g.status === 'Active');

    res.status(200).json({
      success: true,
      data: {
        totalVisitors,
        todayVisitors,
        verified,
        flagged,
        totalGates: gates.length,
        activeGates: activeGates.length
      }
    });

  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};