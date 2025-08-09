const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin', 'club_admin'],
    default: 'student',
    required: true
  },
  
  // Profile Information
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
      public_id: String,
      url: String
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    }
  },
  
  // Academic Information (for students)
  academic: {
    studentId: {
      type: String,
      sparse: true,
      unique: true
    },
    department: {
      type: String,
      trim: true
    },
    year: {
      type: Number,
      min: 1,
      max: 6
    },
    semester: {
      type: Number,
      min: 1,
      max: 12
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    batch: String,
    section: String
  },
  
  // Hostel Information (for students)
  hostel: {
    hostelName: String,
    roomNumber: String,
    floor: Number,
    roommates: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Faculty Information
  faculty: {
    employeeId: {
      type: String,
      sparse: true,
      unique: true
    },
    designation: String,
    department: String,
    experience: Number,
    subjects: [String],
    qualification: String
  },
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      academicUpdates: {
        type: Boolean,
        default: true
      },
      clubUpdates: {
        type: Boolean,
        default: true
      },
      eventReminders: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends'
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showPhone: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Activity Tracking
  activity: {
    lastLogin: {
      type: Date,
      default: Date.now
    },
    loginCount: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastStreakDate: Date,
    points: {
      type: Number,
      default: 0
    },
    achievements: [{
      title: String,
      description: String,
      icon: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Social Links
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    twitter: String
  },
  
  // Joined Clubs
  joinedClubs: [{
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'moderator'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'academic.studentId': 1 });
userSchema.index({ 'faculty.employeeId': 1 });
userSchema.index({ 'academic.department': 1, 'academic.year': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to update login activity
userSchema.methods.updateLoginActivity = function() {
  const now = new Date();
  const lastLogin = this.activity.lastLogin;
  
  // Update login count
  this.activity.loginCount += 1;
  this.activity.lastLogin = now;
  
  // Calculate streak
  if (lastLogin) {
    const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.activity.streakDays += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      this.activity.streakDays = 1;
    }
    // If daysDiff === 0, it's the same day, don't change streak
  } else {
    // First login
    this.activity.streakDays = 1;
  }
  
  this.activity.lastStreakDate = now;
  return this.save();
};

// Method to add achievement
userSchema.methods.addAchievement = function(title, description, icon) {
  // Check if achievement already exists
  const existingAchievement = this.activity.achievements.find(
    achievement => achievement.title === title
  );
  
  if (!existingAchievement) {
    this.activity.achievements.push({
      title,
      description,
      icon,
      earnedAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Static method to find users by department and year
userSchema.statics.findByDepartmentAndYear = function(department, year) {
  return this.find({
    'academic.department': department,
    'academic.year': year,
    role: 'student',
    isActive: true
  });
};

// Static method to get user stats
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
};

module.exports = mongoose.model('User', userSchema);
