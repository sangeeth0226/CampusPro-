const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Mock mess data for now - in production this would be a proper model
let messData = {
  menu: {
    Monday: {
      breakfast: ['Poha', 'Tea/Coffee', 'Banana'],
      lunch: ['Rice', 'Dal', 'Sabzi', 'Roti', 'Pickle'],
      dinner: ['Roti', 'Rice', 'Dal', 'Sabzi', 'Curd']
    },
    Tuesday: {
      breakfast: ['Upma', 'Tea/Coffee', 'Boiled Eggs'],
      lunch: ['Rice', 'Sambar', 'Dry Sabzi', 'Roti', 'Papad'],
      dinner: ['Roti', 'Rice', 'Dal', 'Paneer Sabzi', 'Salad']
    }
    // Add more days...
  },
  complaints: [],
  announcements: []
};

// @route   GET /api/mess/menu
// @desc    Get mess menu
// @access  Private
router.get('/menu', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    menu: messData.menu
  });
}));

// @route   POST /api/mess/complaint
// @desc    Submit mess complaint
// @access  Private
router.post('/complaint', [
  body('title').trim().notEmpty().withMessage('Complaint title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['food_quality', 'service', 'hygiene', 'other']).withMessage('Invalid complaint type')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const complaint = {
    id: Date.now().toString(),
    userId: req.user._id,
    userName: req.user.fullName,
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    status: 'pending',
    createdAt: new Date(),
    resolvedAt: null,
    response: null
  };

  messData.complaints.push(complaint);

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    complaint
  });
}));

// @route   GET /api/mess/complaints
// @desc    Get user's complaints
// @access  Private
router.get('/complaints', asyncHandler(async (req, res) => {
  const userComplaints = messData.complaints.filter(
    complaint => complaint.userId.toString() === req.user._id.toString()
  );

  res.json({
    success: true,
    complaints: userComplaints
  });
}));

module.exports = router;
