const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Mock resume data
let resumeData = {};

// @route   GET /api/resume
// @desc    Get user's resume data
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const userResume = resumeData[req.user._id] || {
    personalInfo: {},
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    template: 'modern'
  };

  res.json({
    success: true,
    resume: userResume
  });
}));

// @route   PUT /api/resume
// @desc    Update resume data
// @access  Private
router.put('/', [
  body('personalInfo').optional().isObject().withMessage('Personal info must be an object'),
  body('template').optional().isIn(['modern', 'classic', 'creative', 'minimal']).withMessage('Invalid template')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  resumeData[req.user._id] = {
    ...resumeData[req.user._id],
    ...req.body,
    lastUpdated: new Date()
  };

  res.json({
    success: true,
    message: 'Resume updated successfully',
    resume: resumeData[req.user._id]
  });
}));

module.exports = router;
