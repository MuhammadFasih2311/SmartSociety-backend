import Notice from '../../models/Notice.js';

export const getResidentNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ status: 'Published' })
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    console.error('Get resident notices error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getResidentNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findOne({ _id: id, status: 'Published' })
      .populate('createdBy', 'fullName email');
    
    if (!notice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notice not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Get notice by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid notice ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getResidentNoticeStats = async (req, res) => {
  try {
    const notices = await Notice.find({ status: 'Published' });

    const stats = {
      total: notices.length,
      byCategory: {}
    };

    notices.forEach(n => {
      if (!stats.byCategory[n.category]) {
        stats.byCategory[n.category] = 0;
      }
      stats.byCategory[n.category]++;
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get notice stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};