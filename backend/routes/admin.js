const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Club = require('../models/Club');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Apply admin authorization to all routes
router.use(authorizeRoles('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalStudents,
    totalFaculty,
    totalClubs,
    activeUsersToday,
    newUsersThisWeek
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'faculty', isActive: true }),
    Club.countDocuments({ isActive: true }),
    User.countDocuments({
      'activity.lastLogin': { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      isActive: true
    }),
    User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      isActive: true
    })
  ]);

  // Get department-wise statistics
  const departmentStats = await User.aggregate([
    { $match: { role: 'student', isActive: true } },
    {
      $group: {
        _id: '$academic.department',
        count: { $sum: 1 },
        avgCGPA: { $avg: '$academic.cgpa' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get popular clubs
  const popularClubs = await Club.find({ isActive: true })
    .select('name stats.totalMembers')
    .sort({ 'stats.totalMembers': -1 })
    .limit(5)
    .lean();

  res.json({
    success: true,
    dashboard: {
      overview: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalClubs,
        activeUsersToday,
        newUsersThisWeek
      },
      departmentStats,
      popularClubs,
      lastUpdated: new Date()
    }
  });
}));

// @route   GET /api/admin/users
// @desc    Get all users with filtering
// @access  Private (Admin)
router.get('/users', [
  query('role').optional().isIn(['student', 'faculty', 'admin', 'club_admin']).withMessage('Invalid role'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  query('department').optional().trim(),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const {
    role,
    isActive,
    department,
    search,
    page = 1,
    limit = 20
  } = req.query;

  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (department) {
    query.$or = [
      { 'academic.department': department },
      { 'faculty.department': department }
    ];
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

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -resetPasswordToken -verificationToken')
      .sort({ createdAt: -1 })
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
    },
    filters: { role, isActive, department, search }
  });
}));

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin)
router.put('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { id } = req.params;
  const { isActive, reason } = req.body;

  if (req.user._id.toString() === id) {
    throw new AppError('Cannot modify your own account status', 400, 'SELF_MODIFICATION_DENIED');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  user.isActive = isActive;
  if (!isActive) {
    user.deactivatedAt = new Date();
    user.deactivationReason = reason;
  }

  await user.save();

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    user: {
      id: user._id,
      name: user.fullName,
      email: user.email,
      isActive: user.isActive,
      reason
    }
  });
}));

// @route   GET /api/admin/clubs
// @desc    Get all clubs for admin
// @access  Private (Admin)
router.get('/clubs', [
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const {
    isActive,
    category,
    search,
    page = 1,
    limit = 20
  } = req.query;

  const query = {};

  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (category) query.category = category;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [clubs, total] = await Promise.all([
    Club.find(query)
      .populate('admin', 'profile.firstName profile.lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Club.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    clubs,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalClubs: total,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    },
    filters: { isActive, category, search }
  });
}));

module.exports = router;
