import Visitor from '../../models/Visitor.js';
import Gate from '../../models/Gate.js';
import Guard from '../../models/Guard.js';

export const getGuardDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('🔍 Fetching guard dashboard for userId:', userId);
    
    let guardProfile = null;
    let assignedGate = 'Not Assigned';
    let shiftTiming = 'Not Assigned';
    
    try {
      guardProfile = await Guard.findOne({ userId: userId });
      if (guardProfile) {
        assignedGate = guardProfile.gateAssigned || 'Main Gate';
        shiftTiming = guardProfile.shiftTiming || 'Not Assigned';
      }
    } catch (profileError) {
      console.log('⚠️ Error fetching guard profile:', profileError.message);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let allVisitors = [];
    try {
      allVisitors = await Visitor.find() || [];
      console.log(`📊 Found ${allVisitors.length} total visitors in database`);
    } catch (visitorError) {
      console.log('⚠️ Error fetching visitors:', visitorError.message);
    }
    
    const totalVisitors = allVisitors.length;
    
    const visitorsToday = allVisitors.filter(v => {
      if (!v.createdAt) return false;
      const visitorDate = new Date(v.createdAt);
      visitorDate.setHours(0, 0, 0, 0);
      return visitorDate.getTime() === today.getTime();
    }).length;

    const pendingVisitors = allVisitors.filter(v => v.status === 'pending').length;
    const verifiedVisitors = allVisitors.filter(v => v.status === 'Verified' || v.status === 'approved').length;
    const flaggedVisitors = allVisitors.filter(v => v.status === 'Flagged' || v.status === 'rejected').length;
    const residentVisitors = allVisitors.filter(v => v.status === 'Resident').length;
    
    console.log('📊 Visitor Stats:', {
      totalVisitors,
      visitorsToday,
      pendingVisitors,
      verifiedVisitors,
      flaggedVisitors,
      residentVisitors
    });
    
    let totalGates = 0;
    let activeGates = 0;
    let inactiveGates = 0;
    let gates = [];
    
    try {
      console.log('🚪 Fetching gates from database...');

      gates = await Gate.find();
      console.log(`🚪 Found ${gates.length} gates in database`);
      
      if (gates.length > 0) {
        gates.forEach((gate, index) => {
          console.log(`  Gate ${index + 1}: ${gate.name} - Status: ${gate.status} - Guard: ${gate.guardName}`);
        });
      } else {
        console.log('⚠️ No gates found in database!');
        try {
          console.log('📝 Inserting sample gates...');
          await Gate.insertMany([
            {
              name: "Main Gate",
              status: "Active",
              location: "Front Entrance",
              guardName: "N/A",
              shift: "N/A",
              isActive: true
            },
            {
              name: "Side Gate",
              status: "Active",
              location: "Side Street",
              guardName: "N/A",
              shift: "N/A",
              isActive: true
            },
            {
              name: "Back Gate",
              status: "Inactive",
              location: "Back Alley",
              guardName: "N/A",
              shift: "N/A",
              isActive: false
            }
          ]);
          console.log('Sample gates inserted!');
          gates = await Gate.find();
          console.log(` Now found ${gates.length} gates`);
        } catch (insertError) {
          console.log(' Could not insert sample gates:', insertError.message);
        }
      }
      
      totalGates = gates.length;
      activeGates = gates.filter(g => g.status === 'Active').length;
      inactiveGates = gates.filter(g => g.status === 'Inactive' || g.status === 'Maintenance').length;
      
      console.log('🚪 Gate Stats:', { totalGates, activeGates, inactiveGates });
      
    } catch (gateError) {
      console.error('❌ Error fetching gates:', gateError.message);
      gates = [];
      totalGates = 0;
      activeGates = 0;
      inactiveGates = 0;
    }

    let recentVisitors = [];
    try {
      recentVisitors = await Visitor.find()
        .sort({ createdAt: -1 })
        .limit(5) || [];
    } catch (recentError) {
      console.log('⚠️ Error fetching recent visitors:', recentError.message);
    }
    
    let trendData = [];
    try {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const count = allVisitors.filter(v => {
          if (!v.createdAt) return false;
          const visitorDate = new Date(v.createdAt);
          visitorDate.setHours(0, 0, 0, 0);
          return visitorDate.getTime() >= date.getTime() && visitorDate.getTime() < nextDate.getTime();
        }).length;
        
        trendData.push({
          date: date.toISOString().split('T')[0],
          count
        });
      }
    } catch (trendError) {
      console.log('⚠️ Error fetching trend data:', trendError.message);
    }

    let hourlyData = [];
    try {
      for (let i = 0; i < 24; i++) {
        const count = allVisitors.filter(v => {
          if (!v.createdAt) return false;
          const hour = new Date(v.createdAt).getHours();
          return hour === i && new Date(v.createdAt).toDateString() === new Date().toDateString();
        }).length;
        
        hourlyData.push({
          hour: i,
          count
        });
      }
    } catch (hourlyError) {
      console.log('⚠️ Error fetching hourly data:', hourlyError.message);
    }

    const statusDistribution = {
      pending: pendingVisitors || 0,
      verified: verifiedVisitors || 0,
      flagged: flaggedVisitors || 0,
      resident: residentVisitors || 0
    };
    
    console.log('📊 Status Distribution:', statusDistribution);

    const formattedGates = gates.map(gate => ({
      id: gate._id,
      name: gate.name || 'Unknown Gate',
      status: gate.status || 'Inactive',
      guard: gate.guardName || 'N/A',
      guardId: gate.guardId || null,
      shift: gate.shift || 'N/A',
      location: gate.location || '',
      lastUpdated: gate.updatedAt ? new Date(gate.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()
    }));
    
    console.log('✅ Formatted Gates:', formattedGates.length);

    const formattedRecentVisitors = recentVisitors.map(v => ({
      id: v._id,
      name: v.name || v.visitorName || 'Unknown',
      visitorName: v.visitorName || v.name || 'Unknown',
      flatNumber: v.flatNumber || 'N/A',
      phone: v.phone || 'N/A',
      vehicleNumber: v.vehicleNumber || 'N/A',
      status: v.status || 'pending',
      purpose: v.purpose || 'N/A',
      createdAt: v.createdAt,
      entryTime: v.entryTime || 'N/A',
      exitTime: v.exitTime || 'N/A'
    }));
    
    console.log('✅ Final Stats being sent:', {
      totalVisitors,
      visitorsToday,
      pendingVisitors,
      verifiedVisitors,
      flaggedVisitors,
      residentVisitors,
      totalGates,
      activeGates,
      inactiveGates,
      gatesCount: gates.length
    });
    
    const responseData = {
      stats: {
        totalVisitors: totalVisitors || 0,
        todayVisitors: visitorsToday || 0,
        pending: pendingVisitors || 0,
        verified: verifiedVisitors || 0,
        flagged: flaggedVisitors || 0,
        resident: residentVisitors || 0,
        totalGates: totalGates || 0,
        activeGates: activeGates || 0,
        inactiveGates: inactiveGates || 0,
        assignedGate: assignedGate || 'Not Assigned',
        shift: shiftTiming || 'Not Assigned'
      },
      gates: formattedGates || [],
      recentVisitors: formattedRecentVisitors || [],
      trendData: trendData || [],
      hourlyData: hourlyData || [],
      statusDistribution: statusDistribution || {}
    };
    
    res.status(200).json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('❌ Guard dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching guard dashboard stats: ' + error.message 
    });
  }
};