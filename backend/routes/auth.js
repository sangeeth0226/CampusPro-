const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper function to format user response
const formatUserResponse = (user) => {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    profile: user.profile,
    academic: user.academic,
    hostel: user.hostel,
    faculty: user.faculty,
    preferences: user.preferences,
    activity: {
      lastLogin: user.activity.lastLogin,
      streakDays: user.activity.streakDays,
      points: user.activity.points,
      achievements: user.activity.achievements
    },
    socialLinks: user.socialLinks,
    joinedClubs: user.joinedClubs,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    fullName: user.fullName
  };
};

// Register validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .isIn(['student', 'faculty'])
    .withMessage('Role must be either student or faculty'),
  // Conditional validation for students
  body('studentId')
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('Student ID is required for students'),
  body('department')
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('Department is required for students'),
  body('year')
    .if(body('role').equals('student'))
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6'),
  // Conditional validation for faculty
  body('employeeId')
    .if(body('role').equals('faculty'))
    .notEmpty()
    .withMessage('Employee ID is required for faculty'),
  body('designation')
    .if(body('role').equals('faculty'))
    .notEmpty()
    .withMessage('Designation is required for faculty')
];

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, registerValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const {
    email,
    password,
    firstName,
    lastName,
    role,
    studentId,
    department,
    year,
    semester,
    employeeId,
    designation,
    phone,
    dateOfBirth,
    gender
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists with this email', 409, 'USER_EXISTS');
  }

  // Check for duplicate student/employee ID
  if (role === 'student' && studentId) {
    const existingStudent = await User.findOne({ 'academic.studentId': studentId });
    if (existingStudent) {
      throw new AppError('Student ID already exists', 409, 'STUDENT_ID_EXISTS');
    }
  }

  if (role === 'faculty' && employeeId) {
    const existingFaculty = await User.findOne({ 'faculty.employeeId': employeeId });
    if (existingFaculty) {
      throw new AppError('Employee ID already exists', 409, 'EMPLOYEE_ID_EXISTS');
    }
  }

  // Create user object
  const userData = {
    email,
    password,
    role,
    profile: {
      firstName,
      lastName,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender
    }
  };

  // Add role-specific data
  if (role === 'student') {
    userData.academic = {
      studentId,
      department,
      year,
      semester: semester || 1
    };
  }

  if (role === 'faculty') {
    userData.faculty = {
      employeeId,
      designation,
      department
    };
  }

  // Create user
  const user = await User.create(userData);

  // Update login activity
  await user.updateLoginActivity();

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: formatUserResponse(user)
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, loginValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError('Account has been deactivated', 401, 'ACCOUNT_DEACTIVATED');
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Update login activity
  await user.updateLoginActivity();

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: formatUserResponse(user)
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('joinedClubs.club', 'name logo category')
    .populate('hostel.roommates', 'profile.firstName profile.lastName profile.avatar');

  res.json({
    success: true,
    user: formatUserResponse(user)
  });
}));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please enter a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender value')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const {
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    socialLinks,
    preferences
  } = req.body;

  const user = await User.findById(req.user._id);

  // Update profile fields
  if (firstName) user.profile.firstName = firstName;
  if (lastName) user.profile.lastName = lastName;
  if (phone) user.profile.phone = phone;
  if (dateOfBirth) user.profile.dateOfBirth = new Date(dateOfBirth);
  if (gender) user.profile.gender = gender;
  if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: formatUserResponse(user)
  });
}));

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // In a JWT implementation, logout is typically handled client-side
  // Here we can optionally blacklist the token or update last activity
  
  const user = await User.findById(req.user._id);
  user.activity.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @route   DELETE /api/auth/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', authenticateToken, [
  body('password')
    .notEmpty()
    .withMessage('Password confirmation is required'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { password, reason } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AppError('Password is incorrect', 400, 'INVALID_PASSWORD');
  }

  // Deactivate account instead of deleting
  user.isActive = false;
  user.deactivatedAt = new Date();
  user.deactivationReason = reason;
  await user.save();

  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

// @route   GET /api/auth/stats
// @desc    Get authentication statistics (admin only)
// @access  Private (Admin)
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  const stats = await User.getUserStats();
  
  const totalUsers = await User.countDocuments({ isActive: true });
  const newUsersToday = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    isActive: true
  });
  const activeUsersToday = await User.countDocuments({
    'activity.lastLogin': { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    isActive: true
  });

  res.json({
    success: true,
    stats: {
      totalUsers,
      newUsersToday,
      activeUsersToday,
      byRole: stats,
      timestamp: new Date()
    }
  });
}));

module.exports = router;
