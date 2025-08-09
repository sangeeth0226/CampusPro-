const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Mock interview data - in production this would be proper models
let interviewData = {
  questions: [
    {
      id: '1',
      category: 'DSA',
      subcategory: 'Arrays',
      difficulty: 'easy',
      question: 'Find the maximum element in an array',
      expectedAnswer: 'Iterate through the array and keep track of the maximum element found so far.',
      keywords: ['array', 'maximum', 'iteration', 'comparison'],
      timeLimit: 300 // 5 minutes
    },
    {
      id: '2',
      category: 'HR',
      subcategory: 'General',
      difficulty: 'medium',
      question: 'Tell me about yourself',
      expectedAnswer: 'Provide a brief professional summary highlighting relevant skills and experience.',
      keywords: ['background', 'skills', 'experience', 'goals'],
      timeLimit: 180 // 3 minutes
    }
  ],
  sessions: [],
  userProgress: {}
};

// @route   GET /api/interview/questions
// @desc    Get interview questions
// @access  Private
router.get('/questions', [
  query('category').optional().isIn(['DSA', 'HR', 'Aptitude', 'System Design']).withMessage('Invalid category'),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { category, difficulty, limit = 10 } = req.query;
  
  let questions = [...interviewData.questions];

  if (category) {
    questions = questions.filter(q => q.category === category);
  }

  if (difficulty) {
    questions = questions.filter(q => q.difficulty === difficulty);
  }

  questions = questions.slice(0, parseInt(limit));

  res.json({
    success: true,
    questions,
    total: questions.length
  });
}));

// @route   POST /api/interview/session
// @desc    Start interview session
// @access  Private
router.post('/session', [
  body('type').isIn(['practice', 'mock', 'ai']).withMessage('Invalid session type'),
  body('category').optional().isIn(['DSA', 'HR', 'Aptitude', 'System Design']).withMessage('Invalid category'),
  body('questionCount').optional().isInt({ min: 1, max: 20 }).withMessage('Question count must be between 1 and 20')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { type, category, questionCount = 5 } = req.body;
  
  const session = {
    id: Date.now().toString(),
    userId: req.user._id,
    type,
    category,
    questionCount,
    status: 'active',
    startTime: new Date(),
    questions: [],
    answers: [],
    score: 0
  };

  // Select random questions
  let availableQuestions = [...interviewData.questions];
  if (category) {
    availableQuestions = availableQuestions.filter(q => q.category === category);
  }

  session.questions = availableQuestions
    .sort(() => 0.5 - Math.random())
    .slice(0, questionCount);

  interviewData.sessions.push(session);

  res.status(201).json({
    success: true,
    message: 'Interview session started',
    session: {
      id: session.id,
      type: session.type,
      category: session.category,
      questionCount: session.questionCount,
      startTime: session.startTime,
      firstQuestion: session.questions[0]
    }
  });
}));

// @route   POST /api/interview/answer
// @desc    Submit answer for evaluation
// @access  Private
router.post('/answer', [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('questionId').notEmpty().withMessage('Question ID is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a positive number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { sessionId, questionId, answer, timeSpent = 0 } = req.body;

  const session = interviewData.sessions.find(s => s.id === sessionId && s.userId.toString() === req.user._id.toString());
  if (!session) {
    throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
  }

  const question = session.questions.find(q => q.id === questionId);
  if (!question) {
    throw new AppError('Question not found', 404, 'QUESTION_NOT_FOUND');
  }

  // Simple scoring logic - in production, this would use AI
  const answerWords = answer.toLowerCase().split(' ');
  const keywordMatches = question.keywords.filter(keyword => 
    answerWords.some(word => word.includes(keyword.toLowerCase()))
  );
  
  const score = Math.min(100, (keywordMatches.length / question.keywords.length) * 100);

  const answerData = {
    questionId,
    answer,
    score,
    timeSpent,
    feedback: `Score: ${score.toFixed(1)}%. Matched keywords: ${keywordMatches.join(', ')}`,
    submittedAt: new Date()
  };

  session.answers.push(answerData);

  res.json({
    success: true,
    message: 'Answer submitted successfully',
    result: answerData
  });
}));

module.exports = router;
