import Notice from '../../models/Notice.js';

export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    console.error('Get all notices error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching notices' });
  }
};

export const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid notice ID' });
    }

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Get notice error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching notice' });
  }
};

export const createNotice = async (req, res) => {
  try {
    const {
      title, content, category, priority,
      status, author, date
    } = req.body;

    const errors = {};
    if (!title) errors.title = 'Title is required';
    if (!content) errors.content = 'Content is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const notice = new Notice({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      status: status || 'Draft',
      author: author || 'Admin',
      date: date || new Date().toISOString().split('T')[0],
      createdBy: req.user._id
    });

    await notice.save();

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice
    });
  } catch (error) {
    console.error('Create notice error:', error);
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: 'Server error while creating notice' });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid notice ID' });
    }

    const {
      title, content, category, priority,
      status, author, date
    } = req.body;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (title) notice.title = title;
    if (content) notice.content = content;
    if (category) notice.category = category;
    if (priority) notice.priority = priority;
    if (status) notice.status = status;
    if (author) notice.author = author;
    if (date) notice.date = date;

    await notice.save();

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: notice
    });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating notice' });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid notice ID' });
    }

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting notice' });
  }
};

export const updateNoticeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid notice ID' });
    }

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    notice.status = status;
    await notice.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: notice
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating status' });
  }
};

export const shareNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notice shared with all residents successfully'
    });
  } catch (error) {
    console.error('Share notice error:', error);
    res.status(500).json({ success: false, message: 'Server error while sharing notice' });
  }
};