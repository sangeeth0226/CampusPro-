const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    maxlength: [100, 'Club name cannot exceed 100 characters'],
    unique: true
  },
  
  description: {
    type: String,
    required: [true, 'Club description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  
  category: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'academic', 'social', 'entrepreneurship', 'arts', 'music', 'dance', 'drama', 'photography', 'literature', 'debate', 'volunteer', 'other'],
    required: true
  },
  
  logo: {
    public_id: String,
    url: String
  },
  
  banner: {
    public_id: String,
    url: String
  },
  
  // Club Leadership
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  moderators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['president', 'vice_president', 'secretary', 'treasurer', 'coordinator', 'moderator'],
      default: 'moderator'
    },
    appointedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Club Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    contribution: {
      type: Number,
      default: 0
    }
  }],
  
  // Club Settings
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowJoinRequests: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 500
    },
    minMembers: {
      type: Number,
      default: 5
    }
  },
  
  // Club Statistics
  stats: {
    totalMembers: {
      type: Number,
      default: 0
    },
    totalEvents: {
      type: Number,
      default: 0
    },
    totalPosts: {
      type: Number,
      default: 0
    },
    engagement: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  },
  
  // Contact Information
  contact: {
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: String,
    website: String,
    socialLinks: {
      instagram: String,
      facebook: String,
      twitter: String,
      linkedin: String,
      youtube: String
    }
  },
  
  // Club Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Club Tags and Keywords
  tags: [String],
  
  // Meeting Information
  meetingInfo: {
    regularMeetings: {
      frequency: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly', 'irregular'],
        default: 'weekly'
      },
      dayOfWeek: Number, // 0-6, Sunday to Saturday
      time: String,
      location: String
    },
    nextMeeting: {
      date: Date,
      time: String,
      location: String,
      agenda: String
    }
  },
  
  // Club Achievements
  achievements: [{
    title: String,
    description: String,
    date: Date,
    image: {
      public_id: String,
      url: String
    }
  }],
  
  // Join Requests
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewMessage: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
clubSchema.index({ name: 'text', description: 'text' });
clubSchema.index({ category: 1 });
clubSchema.index({ isActive: 1, isPublic: 1 });
clubSchema.index({ 'stats.totalMembers': -1 });
clubSchema.index({ createdAt: -1 });

// Virtual for member count
clubSchema.virtual('memberCount').get(function() {
  return this.members.filter(member => member.status === 'active').length;
});

// Virtual for moderator count
clubSchema.virtual('moderatorCount').get(function() {
  return this.moderators.length;
});

// Virtual for pending join requests
clubSchema.virtual('pendingRequests').get(function() {
  return this.joinRequests.filter(request => request.status === 'pending').length;
});

// Pre-save middleware to update member count
clubSchema.pre('save', function(next) {
  this.stats.totalMembers = this.memberCount;
  next();
});

// Method to add member
clubSchema.methods.addMember = function(userId) {
  // Check if user is already a member
  const existingMember = this.members.find(
    member => member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    if (existingMember.status === 'inactive') {
      existingMember.status = 'active';
      existingMember.joinedAt = new Date();
    }
    return this.save();
  }
  
  // Add new member
  this.members.push({
    user: userId,
    joinedAt: new Date(),
    status: 'active'
  });
  
  return this.save();
};

// Method to remove member
clubSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(
    member => member.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to add moderator
clubSchema.methods.addModerator = function(userId, role = 'moderator') {
  // First ensure user is a member
  const member = this.members.find(
    member => member.user.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User must be a member to become a moderator');
  }
  
  // Check if already a moderator
  const existingModerator = this.moderators.find(
    moderator => moderator.user.toString() === userId.toString()
  );
  
  if (existingModerator) {
    existingModerator.role = role;
  } else {
    this.moderators.push({
      user: userId,
      role: role,
      appointedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to remove moderator
clubSchema.methods.removeModerator = function(userId) {
  this.moderators = this.moderators.filter(
    moderator => moderator.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to handle join request
clubSchema.methods.handleJoinRequest = function(requestId, action, reviewerId, reviewMessage = '') {
  const request = this.joinRequests.id(requestId);
  if (!request) {
    throw new Error('Join request not found');
  }
  
  request.status = action; // 'approved' or 'rejected'
  request.reviewedBy = reviewerId;
  request.reviewedAt = new Date();
  request.reviewMessage = reviewMessage;
  
  // If approved, add user as member
  if (action === 'approved') {
    this.addMember(request.user);
  }
  
  return this.save();
};

// Method to check if user is member
clubSchema.methods.isMember = function(userId) {
  return this.members.some(
    member => member.user.toString() === userId.toString() && 
    member.status === 'active'
  );
};

// Method to check if user is moderator
clubSchema.methods.isModerator = function(userId) {
  return this.moderators.some(
    moderator => moderator.user.toString() === userId.toString()
  ) || this.admin.toString() === userId.toString();
};

// Method to get user role in club
clubSchema.methods.getUserRole = function(userId) {
  if (this.admin.toString() === userId.toString()) {
    return 'admin';
  }
  
  const moderator = this.moderators.find(
    mod => mod.user.toString() === userId.toString()
  );
  
  if (moderator) {
    return moderator.role;
  }
  
  const member = this.members.find(
    member => member.user.toString() === userId.toString() && 
    member.status === 'active'
  );
  
  return member ? 'member' : null;
};

// Static method to get popular clubs
clubSchema.statics.getPopularClubs = function(limit = 10) {
  return this.find({ isActive: true, isPublic: true })
    .sort({ 'stats.totalMembers': -1, 'stats.engagement': -1 })
    .limit(limit)
    .populate('admin', 'profile.firstName profile.lastName profile.avatar')
    .select('name shortDescription logo category stats memberCount');
};

// Static method to search clubs
clubSchema.statics.searchClubs = function(query, category = null, limit = 20) {
  const searchCriteria = {
    isActive: true,
    isPublic: true,
    $text: { $search: query }
  };
  
  if (category) {
    searchCriteria.category = category;
  }
  
  return this.find(searchCriteria, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .populate('admin', 'profile.firstName profile.lastName');
};

// Static method to get club categories with counts
clubSchema.statics.getCategoriesWithCounts = function() {
  return this.aggregate([
    { $match: { isActive: true, isPublic: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalMembers: { $sum: '$stats.totalMembers' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Club', clubSchema);
