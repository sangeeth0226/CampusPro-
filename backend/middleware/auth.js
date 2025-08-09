const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Authorize roles middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

// Check if user owns resource or has permission
const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }
      
      // Check ownership
      const isOwner = resource.user?.toString() === req.user._id.toString() ||
                     resource.creator?.toString() === req.user._id.toString() ||
                     resource.author?.toString() === req.user._id.toString();
      
      // Check if user is admin
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify resource ownership'
      });
    }
  };
};

// Check club membership/moderation
const checkClubPermission = (permission = 'member') => {
  return async (req, res, next) => {
    try {
      const clubId = req.params.clubId || req.body.clubId;
      
      if (!clubId) {
        return res.status(400).json({
          success: false,
          message: 'Club ID is required'
        });
      }
      
      const Club = require('../models/Club');
      const club = await Club.findById(clubId);
      
      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }
      
      const userId = req.user._id;
      let hasPermission = false;
      
      switch (permission) {
        case 'member':
          hasPermission = club.isMember(userId) || club.isModerator(userId);
          break;
        case 'moderator':
          hasPermission = club.isModerator(userId);
          break;
        case 'admin':
          hasPermission = club.admin.toString() === userId.toString() || req.user.role === 'admin';
          break;
        default:
          hasPermission = false;
      }
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${permission} permission required.`
        });
      }
      
      req.club = club;
      req.userRole = club.getUserRole(userId);
      next();
    } catch (error) {
      console.error('Club permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify club permissions'
      });
    }
  };
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get user's request history
    let userRequests = requests.get(userId) || [];
    
    // Filter out old requests
    userRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      });
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(userId, userRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [key, value] of requests.entries()) {
        const filteredRequests = value.filter(timestamp => timestamp > windowStart);
        if (filteredRequests.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, filteredRequests);
        }
      }
    }
    
    next();
  };
};

// Validate user session
const validateSession = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }
    
    // Check if user's account is still active
    const user = await User.findById(req.user._id).select('isActive isVerified');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Session invalid - account deactivated'
      });
    }
    
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Session validation failed'
    });
  }
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  checkOwnership,
  checkClubPermission,
  userRateLimit,
  validateSession,
  optionalAuth
};
