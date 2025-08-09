const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authorizeRoles, userRateLimit } = require('../middleware/auth');

const router = express.Router();

// Apply rate limiting to user routes
router.use(userRateLimit(50, 15 * 60 * 1000)); // 50 requests per 15 minutes

// @route   GET /api/users
// @desc    Get all users (admin/faculty only) or search users
// @access  Private
router.get('/', [
  query('search').optional().trim().isLength({ min: 2 }).withMessage('Search term must be at least 2 characters'),
  query('role').optional().isIn(['student', 'faculty', 'admin', 'club_admin']).withMessage('Invalid role'),
  query('department').optional().trim(),
  query('year').optional().isInt({ min: 1, max: 6 }).withMessage('Year must be between 1 and 6'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const {
    search,
    role,
    department,
    year,
    page = 1,
    limit = 20
  } = req.query;

  // Only admin and faculty can access user list
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  // Build query
  const query = { isActive: true };

  if (role) {
    query.role = role;
  }

  if (department) {
    if (role === 'student') {
      query['academic.department'] = department;
    } else if (role === 'faculty') {
      query['faculty.department'] = department;
    }
  }

  if (year && role === 'student') {
    query['academic.year'] = parseInt(year);
  }

  if (search) {
    query.$or = [
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'academic.studentId': { $regex: search, $options: 'i' } },
      { 'faculty.employeeId': { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -resetPasswordToken -verificationToken')
      .sort({ 'profile.firstName': 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalUsers: total,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    }
  });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Users can only view their own profile unless they're admin/faculty
  if (req.user._id.toString() !== id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'faculty') {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  const user = await User.findById(id)
    .select('-password -resetPasswordToken -verificationToken')
    .populate('joinedClubs.club', 'name logo category description')
    .populate('hostel.roommates', 'profile.firstName profile.lastName profile.avatar');

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    success: true,
    user
  });
}));

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private (Admin)
router.put('/:id', authorizeRoles('admin'), [
  body('role').optional().isIn(['student', 'faculty', 'admin', 'club_admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { id } = req.params;
  const updates = req.body;

  // Prevent admin from modifying their own account
  if (req.user._id.toString() === id) {
    throw new AppError('Cannot modify your own account', 400, 'SELF_MODIFICATION_DENIED');
  }

  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Update allowed fields
  const allowedUpdates = ['role', 'isActive', 'isVerified'];
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      user[field] = updates[field];
    }
  });

  await user.save();

  res.json({
    success: true,
    message: 'User updated successfully',
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified
    }
  });
}));

// @route   GET /api/users/department/:department
// @desc    Get users by department
// @access  Private
router.get('/department/:department', [
  query('year').optional().isInt({ min: 1, max: 6 }).withMessage('Year must be between 1 and 6'),
  query('role').optional().isIn(['student', 'faculty']).withMessage('Role must be student or faculty')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { department } = req.params;
  const { year, role = 'student' } = req.query;

  let query = {
    isActive: true
  };

  if (role === 'student') {
    query['academic.department'] = department;
    if (year) {
      query['academic.year'] = parseInt(year);
    }
  } else if (role === 'faculty') {
    query['faculty.department'] = department;
    query.role = 'faculty';
  }

  const users = await User.find(query)
    .select('profile.firstName profile.lastName profile.avatar academic.year academic.semester email')
    .sort({ 'academic.year': 1, 'profile.firstName': 1 })
    .lean();

  res.json({
    success: true,
    users,
    department,
    year: year ? parseInt(year) : null,
    role,
    count: users.length
  });
}));

// @route   GET /api/users/classmates/:userId
// @desc    Get classmates of a user
// @access  Private
router.get('/classmates/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Users can only get their own classmates unless they're admin/faculty
  if (req.user._id.toString() !== userId && 
      req.user.role !== 'admin' && 
      req.user.role !== 'faculty') {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  const user = await User.findById(userId);

  if (!user || !user.academic.department || !user.academic.year) {
    throw new AppError('User not found or missing academic information', 404, 'USER_NOT_FOUND');
  }

  const classmates = await User.findByDepartmentAndYear(
    user.academic.department,
    user.academic.year
  ).select('profile.firstName profile.lastName profile.avatar academic.section email')
    .sort({ 'profile.firstName': 1 });

  // Remove the user themselves from the list
  const filteredClassmates = classmates.filter(
    classmate => classmate._id.toString() !== userId
  );

  res.json({
    success: true,
    classmates: filteredClassmates,
    department: user.academic.department,
    year: user.academic.year,
    count: filteredClassmates.length
  });
}));

// @route   PUT /api/users/:id/points
// @desc    Update user points (admin only)
// @access  Private (Admin)
router.put('/:id/points', authorizeRoles('admin'), [
  body('points').isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
  body('reason').optional().trim().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { id } = req.params;
  const { points, reason } = req.body;

  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const oldPoints = user.activity.points;
  user.activity.points = points;

  // Log the points change (could be stored in a separate model for audit)
  const pointsChange = points - oldPoints;

  await user.save();

  res.json({
    success: true,
    message: 'User points updated successfully',
    user: {
      id: user._id,
      name: user.fullName,
      oldPoints,
      newPoints: points,
      change: pointsChange,
      reason
    }
  });
}));

// @route   POST /api/users/:id/achievement
// @desc    Add achievement to user (admin only)
// @access  Private (Admin)
router.post('/:id/achievement', authorizeRoles('admin'), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('icon').optional().trim().isLength({ max: 50 }).withMessage('Icon cannot exceed 50 characters')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { id } = req.params;
  const { title, description, icon = '🏆' } = req.body;

  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await user.addAchievement(title, description, icon);

  res.json({
    success: true,
    message: 'Achievement added successfully',
    achievement: {
      title,
      description,
      icon,
      earnedAt: new Date()
    }
  });
}));

// @route   GET /api/users/leaderboard/points
// @desc    Get points leaderboard
// @access  Private
router.get('/leaderboard/points', [
  query('department').optional().trim(),
  query('year').optional().isInt({ min: 1, max: 6 }).withMessage('Year must be between 1 and 6'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { department, year, limit = 20 } = req.query;

  let matchQuery = {
    isActive: true,
    role: 'student',
    'activity.points': { $gt: 0 }
  };

  if (department) {
    matchQuery['academic.department'] = department;
  }

  if (year) {
    matchQuery['academic.year'] = parseInt(year);
  }

  const leaderboard = await User.find(matchQuery)
    .select('profile.firstName profile.lastName profile.avatar academic.department academic.year activity.points activity.streakDays')
    .sort({ 'activity.points': -1, 'activity.streakDays': -1 })
    .limit(parseInt(limit))
    .lean();

  // Add rank to each user
  const rankedLeaderboard = leaderboard.map((user, index) => ({
    ...user,
    rank: index + 1
  }));

  // Find current user's position if they're not in top results
  let currentUserRank = null;
  if (req.user.role === 'student') {
    const currentUserPosition = await User.countDocuments({
      ...matchQuery,
      'activity.points': { $gt: req.user.activity.points }
    });
    currentUserRank = currentUserPosition + 1;
  }

  res.json({
    success: true,
    leaderboard: rankedLeaderboard,
    currentUserRank,
    filters: {
      department,
      year: year ? parseInt(year) : null
    },
    total: leaderboard.length
  });
}));

module.exports = router;
