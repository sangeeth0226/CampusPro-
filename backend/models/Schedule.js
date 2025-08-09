const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Class Schedule
  classes: [{
    subject: {
      type: String,
      required: true,
      trim: true
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    instructorName: {
      type: String,
      required: true
    },
    classType: {
      type: String,
      enum: ['lecture', 'lab', 'tutorial', 'seminar', 'practical'],
      default: 'lecture'
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0, // Sunday
      max: 6  // Saturday
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    location: {
      building: String,
      room: String,
      floor: Number
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    credits: {
      type: Number,
      min: 0,
      max: 10,
      default: 3
    },
    semester: {
      type: String,
      required: true
    },
    academicYear: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    color: {
      type: String,
      default: '#3B82F6' // Blue color
    },
    attendancePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  
  // Personal Events and Tasks
  events: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    type: {
      type: String,
      enum: ['assignment', 'exam', 'project', 'presentation', 'meeting', 'personal', 'deadline', 'reminder'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    startTime: String,
    endTime: String,
    isAllDay: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    location: String,
    attachments: [{
      name: String,
      url: String,
      type: String,
      size: Number
    }],
    reminders: [{
      time: {
        type: Number, // minutes before event
        required: true
      },
      sent: {
        type: Boolean,
        default: false
      }
    }],
    recurring: {
      isRecurring: {
        type: Boolean,
        default: false
      },
      pattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom']
      },
      interval: Number, // e.g., every 2 weeks
      endDate: Date,
      daysOfWeek: [Number] // for weekly recurring
    },
    color: {
      type: String,
      default: '#10B981' // Green color
    },
    googleEventId: String, // for Google Calendar sync
    tags: [String]
  }],
  
  // Exam Schedule
  exams: [{
    subject: {
      type: String,
      required: true
    },
    subjectCode: {
      type: String,
      required: true,
      uppercase: true
    },
    examType: {
      type: String,
      enum: ['mid_term', 'end_term', 'quiz', 'practical', 'viva', 'assignment'],
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    location: {
      building: String,
      room: String,
      floor: Number
    },
    syllabus: [{
      topic: String,
      weightage: Number,
      studied: {
        type: Boolean,
        default: false
      }
    }],
    totalMarks: {
      type: Number,
      min: 0
    },
    obtainedMarks: {
      type: Number,
      min: 0
    },
    grade: String,
    result: {
      type: String,
      enum: ['pass', 'fail', 'pending']
    },
    preparationStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    studyHours: {
      type: Number,
      default: 0
    },
    isImportant: {
      type: Boolean,
      default: false
    }
  }],
  
  // Study Sessions and Goals
  studySessions: [{
    subject: String,
    topic: String,
    date: {
      type: Date,
      default: Date.now
    },
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    productivityRating: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String,
    goals: [String],
    completed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Calendar Settings
  settings: {
    weekStartsOn: {
      type: Number,
      min: 0,
      max: 6,
      default: 1 // Monday
    },
    defaultView: {
      type: String,
      enum: ['day', 'week', 'month'],
      default: 'week'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    showWeekends: {
      type: Boolean,
      default: true
    },
    showHolidays: {
      type: Boolean,
      default: true
    },
    autoSyncGoogle: {
      type: Boolean,
      default: false
    },
    googleCalendarId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
scheduleSchema.index({ user: 1 });
scheduleSchema.index({ 'classes.dayOfWeek': 1, 'classes.startTime': 1 });
scheduleSchema.index({ 'events.startDate': 1 });
scheduleSchema.index({ 'exams.date': 1 });

// Virtual for upcoming events
scheduleSchema.virtual('upcomingEvents').get(function() {
  const now = new Date();
  return this.events.filter(event => 
    new Date(event.startDate) > now && 
    event.status !== 'completed' && 
    event.status !== 'cancelled'
  ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
});

// Virtual for today's classes
scheduleSchema.virtual('todaysClasses').get(function() {
  const today = new Date().getDay();
  return this.classes.filter(cls => 
    cls.dayOfWeek === today && cls.isActive
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));
});

// Virtual for upcoming exams
scheduleSchema.virtual('upcomingExams').get(function() {
  const now = new Date();
  return this.exams.filter(exam => 
    new Date(exam.date) > now
  ).sort((a, b) => new Date(a.date) - new Date(b.date));
});

// Method to add a class
scheduleSchema.methods.addClass = function(classData) {
  this.classes.push(classData);
  return this.save();
};

// Method to update class attendance
scheduleSchema.methods.updateAttendance = function(classId, attended) {
  const classItem = this.classes.id(classId);
  if (classItem) {
    // Logic to calculate attendance percentage
    // This would need to be implemented based on attendance tracking
    return this.save();
  }
  return Promise.reject(new Error('Class not found'));
};

// Method to add event
scheduleSchema.methods.addEvent = function(eventData) {
  this.events.push(eventData);
  return this.save();
};

// Method to mark event as completed
scheduleSchema.methods.completeEvent = function(eventId) {
  const event = this.events.id(eventId);
  if (event) {
    event.status = 'completed';
    return this.save();
  }
  return Promise.reject(new Error('Event not found'));
};

// Method to get schedule conflicts
scheduleSchema.methods.getConflicts = function(newEvent) {
  const conflicts = [];
  const newStart = new Date(`${newEvent.date} ${newEvent.startTime}`);
  const newEnd = new Date(`${newEvent.date} ${newEvent.endTime}`);
  
  // Check classes
  if (newEvent.dayOfWeek !== undefined) {
    this.classes.forEach(cls => {
      if (cls.dayOfWeek === newEvent.dayOfWeek) {
        const clsStart = new Date(`${newEvent.date} ${cls.startTime}`);
        const clsEnd = new Date(`${newEvent.date} ${cls.endTime}`);
        
        if ((newStart < clsEnd && newEnd > clsStart)) {
          conflicts.push({
            type: 'class',
            item: cls,
            message: `Conflicts with ${cls.subject} class`
          });
        }
      }
    });
  }
  
  // Check events
  this.events.forEach(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = event.endDate ? new Date(event.endDate) : new Date(eventStart.getTime() + 60*60*1000);
    
    if ((newStart < eventEnd && newEnd > eventStart)) {
      conflicts.push({
        type: 'event',
        item: event,
        message: `Conflicts with ${event.title}`
      });
    }
  });
  
  return conflicts;
};

// Static method to get weekly schedule
scheduleSchema.statics.getWeeklySchedule = function(userId, startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  return this.findOne({ user: userId })
    .populate('user', 'profile.firstName profile.lastName')
    .populate('classes.instructor', 'profile.firstName profile.lastName')
    .lean();
};

module.exports = mongoose.model('Schedule', scheduleSchema);
