const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Club = require('../models/Club');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { checkClubPermission, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/clubs
// @desc    Get all clubs
// @access  Private
router.get('/', [
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { search, category, page = 1, limit = 20 } = req.query;

  let query = { isActive: true, isPublic: true };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [clubs, total] = await Promise.all([
    Club.find(query)
      .populate('admin', 'profile.firstName profile.lastName profile.avatar')
      .select('name shortDescription logo category stats memberCount createdAt')
      .sort({ 'stats.totalMembers': -1, createdAt: -1 })
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
    }
  });
}));

// @route   POST /api/clubs
// @desc    Create a new club
// @access  Private
router.post('/', [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Club name must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['technical', 'cultural', 'sports', 'academic', 'social', 'entrepreneurship', 'arts', 'music', 'dance', 'drama', 'photography', 'literature', 'debate', 'volunteer', 'other']).withMessage('Invalid category')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  // Check if club name already exists
  const existingClub = await Club.findOne({ 
    name: { $regex: `^${req.body.name}$`, $options: 'i' } 
  });

  if (existingClub) {
    throw new AppError('Club with this name already exists', 409, 'CLUB_EXISTS');
  }

  const clubData = {
    ...req.body,
    admin: req.user._id
  };

  const club = await Club.create(clubData);

  // Add creator as first member
  await club.addMember(req.user._id);

  const populatedClub = await Club.findById(club._id)
    .populate('admin', 'profile.firstName profile.lastName profile.avatar');

  res.status(201).json({
    success: true,
    message: 'Club created successfully',
    club: populatedClub
  });
}));

// @route   GET /api/clubs/:id
// @desc    Get club by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id)
    .populate('admin', 'profile.firstName profile.lastName profile.avatar')
    .populate('moderators.user', 'profile.firstName profile.lastName profile.avatar')
    .populate('members.user', 'profile.firstName profile.lastName profile.avatar academic.department academic.year');

  if (!club) {
    throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
  }

  // Check if user is a member/moderator for additional details
  const userRole = club.getUserRole(req.user._id);

  res.json({
    success: true,
    club,
    userRole
  });
}));

// @route   POST /api/clubs/:id/join
// @desc    Join a club
// @access  Private
router.post('/:id/join', [
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
], asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);

  if (!club) {
    throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
  }

  if (!club.isActive || !club.isPublic) {
    throw new AppError('Club is not available for joining', 400, 'CLUB_NOT_AVAILABLE');
  }

  // Check if already a member
  if (club.isMember(req.user._id)) {
    throw new AppError('You are already a member of this club', 400, 'ALREADY_MEMBER');
  }

  // Check if club requires approval
  if (club.settings.requireApproval) {
    // Add to join requests
    club.joinRequests.push({
      user: req.user._id,
      message: req.body.message || '',
      requestedAt: new Date(),
      status: 'pending'
    });

    await club.save();

    res.json({
      success: true,
      message: 'Join request submitted successfully. Waiting for approval.',
      status: 'pending'
    });
  } else {
    // Direct join
    await club.addMember(req.user._id);

    res.json({
      success: true,
      message: 'Successfully joined the club',
      status: 'joined'
    });
  }
}));

module.exports = router;
