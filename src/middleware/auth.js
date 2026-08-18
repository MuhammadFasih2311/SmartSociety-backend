import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided. Please login first.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact admin.' 
      });
    }

    req.user = {
      _id: user._id,
      id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,  
      isActive: user.isActive,
      status: user.status
    };
    req.userId = user._id;
    
    console.log('✅ Auth - User:', user.email, 'Role:', user.role);
    
    next();
  } catch (error) {
    console.error('❌ Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const userRole = req.user.role;
    
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'User role not found'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      console.error(`❌ Access denied: ${userRole} not in [${allowedRoles.join(', ')}]`);
      return res.status(403).json({
        success: false,
        message: `Access denied. '${userRole}' role is not authorized. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    console.log(`✅ Authorized: ${userRole}`);
    next();
  };
};

export const isGuard = (req, res, next) => {
  return authorize('guard')(req, res, next);
};

export const isAdmin = (req, res, next) => {
  return authorize('admin')(req, res, next);
};

export const isResident = (req, res, next) => {
  return authorize('resident')(req, res, next);
};

export const isGuardOrAdmin = (req, res, next) => {
  return authorize('guard', 'admin')(req, res, next);
};

export const isResidentOrAdmin = (req, res, next) => {
  return authorize('resident', 'admin')(req, res, next);
};