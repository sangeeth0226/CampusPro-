const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Schedule = require('../models/Schedule');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/schedule
// @desc    Get user's schedule
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  let schedule = await Schedule.findOne({ user: req.user._id })
    .populate('classes.instructor', 'profile.firstName profile.lastName');
  
  if (!schedule) {
    schedule = await Schedule.create({ user: req.user._id });
  }

  res.json({
    success: true,
    schedule
  });
}));

// @route   POST /api/schedule/class
// @desc    Add a class to schedule
// @access  Private
router.post('/class', [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('subjectCode').trim().notEmpty().withMessage('Subject code is required'),
  body('instructorName').trim().notEmpty().withMessage('Instructor name is required'),
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
  body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  let schedule = await Schedule.findOne({ user: req.user._id });
  if (!schedule) {
    schedule = await Schedule.create({ user: req.user._id });
  }

  const classData = req.body;
  classData.semester = req.user.academic?.semester || 'current';
  classData.academicYear = new Date().getFullYear().toString();

  await schedule.addClass(classData);

  res.status(201).json({
    success: true,
    message: 'Class added successfully',
    schedule
  });
}));

// @route   POST /api/schedule/event
// @desc    Add an event to schedule
// @access  Private
router.post('/event', [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('type').isIn(['assignment', 'exam', 'project', 'presentation', 'meeting', 'personal', 'deadline', 'reminder']).withMessage('Invalid event type'),
  body('startDate').isISO8601().withMessage('Invalid start date')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  let schedule = await Schedule.findOne({ user: req.user._id });
  if (!schedule) {
    schedule = await Schedule.create({ user: req.user._id });
  }

  await schedule.addEvent(req.body);

  res.status(201).json({
    success: true,
    message: 'Event added successfully',
    schedule
  });
}));

module.exports = router;
