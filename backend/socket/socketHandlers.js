const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return next(new Error('Invalid user or account deactivated'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

// Main socket handler
const socketHandlers = (socket, io) => {
  console.log(`🔌 User connected: ${socket.user?.profile?.firstName} ${socket.user?.profile?.lastName} (${socket.id})`);

  // Join user to their personal room
  socket.join(`user_${socket.user._id}`);

  // Join user to their department room if they're a student
  if (socket.user.role === 'student' && socket.user.academic?.department) {
    socket.join(`dept_${socket.user.academic.department}`);
    socket.join(`year_${socket.user.academic.department}_${socket.user.academic.year}`);
  }

  // Join user to their clubs
  if (socket.user.joinedClubs && socket.user.joinedClubs.length > 0) {
    socket.user.joinedClubs.forEach(clubMembership => {
      socket.join(`club_${clubMembership.club}`);
    });
  }

  // Handle joining specific rooms
  socket.on('join_room', (data) => {
    const { roomType, roomId } = data;
    
    // Validate room joining permissions
    if (roomType === 'club' && socket.user.joinedClubs.some(club => club.club.toString() === roomId)) {
      socket.join(`club_${roomId}`);
      socket.emit('joined_room', { roomType, roomId, success: true });
    } else if (roomType === 'chat' && roomId) {
      // For private chats, validate user permissions
      socket.join(`chat_${roomId}`);
      socket.emit('joined_room', { roomType, roomId, success: true });
    } else {
      socket.emit('joined_room', { roomType, roomId, success: false, message: 'Permission denied' });
    }
  });

  // Handle leaving rooms
  socket.on('leave_room', (data) => {
    const { roomType, roomId } = data;
    socket.leave(`${roomType}_${roomId}`);
    socket.emit('left_room', { roomType, roomId });
  });

  // Real-time messaging
  socket.on('send_message', async (data) => {
    try {
      const { roomId, message, messageType = 'text', replyTo = null } = data;
      
      // Validate message
      if (!message || message.trim().length === 0) {
        return socket.emit('message_error', { error: 'Message cannot be empty' });
      }

      // Create message object
      const messageData = {
        id: generateMessageId(),
        senderId: socket.user._id,
        senderName: socket.user.fullName,
        senderAvatar: socket.user.profile.avatar?.url || null,
        message: message.trim(),
        messageType,
        timestamp: new Date(),
        replyTo,
        reactions: [],
        edited: false,
        delivered: true
      };

      // Emit message to room
      io.to(`club_${roomId}`).emit('new_message', {
        roomId,
        message: messageData
      });

      // Emit delivery confirmation to sender
      socket.emit('message_delivered', {
        tempId: data.tempId,
        messageId: messageData.id,
        timestamp: messageData.timestamp
      });

    } catch (error) {
      console.error('Message sending error:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle message reactions
  socket.on('toggle_reaction', (data) => {
    const { messageId, reaction, roomId } = data;
    
    // Broadcast reaction toggle to room
    socket.to(`club_${roomId}`).emit('reaction_toggled', {
      messageId,
      reaction,
      userId: socket.user._id,
      userName: socket.user.fullName,
      action: 'toggle' // could be 'add' or 'remove'
    });
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { roomId } = data;
    socket.to(`club_${roomId}`).emit('user_typing', {
      userId: socket.user._id,
      userName: socket.user.profile.firstName,
      roomId
    });
  });

  socket.on('typing_stop', (data) => {
    const { roomId } = data;
    socket.to(`club_${roomId}`).emit('user_stopped_typing', {
      userId: socket.user._id,
      roomId
    });
  });

  // Handle live events and notifications
  socket.on('subscribe_notifications', () => {
    // User is now actively listening for notifications
    socket.emit('notification_subscription', { status: 'subscribed' });
  });

  // Handle interview session events
  socket.on('start_interview_session', (data) => {
    const { sessionId, interviewType } = data;
    
    socket.join(`interview_${sessionId}`);
    socket.emit('interview_session_started', {
      sessionId,
      interviewType,
      startTime: new Date()
    });
  });

  socket.on('interview_answer', (data) => {
    const { sessionId, questionId, answer, timeSpent } = data;
    
    // Broadcast to interview room (for peer interviews)
    socket.to(`interview_${sessionId}`).emit('peer_answered', {
      questionId,
      timeSpent,
      answeredBy: socket.user.profile.firstName
    });
  });

  socket.on('end_interview_session', (data) => {
    const { sessionId } = data;
    
    socket.to(`interview_${sessionId}`).emit('interview_session_ended', {
      sessionId,
      endTime: new Date()
    });
    
    socket.leave(`interview_${sessionId}`);
  });

  // Handle study group events
  socket.on('join_study_group', (data) => {
    const { groupId } = data;
    socket.join(`study_${groupId}`);
    
    socket.to(`study_${groupId}`).emit('user_joined_study', {
      userId: socket.user._id,
      userName: socket.user.fullName,
      joinTime: new Date()
    });
  });

  socket.on('study_progress_update', (data) => {
    const { groupId, progress } = data;
    
    socket.to(`study_${groupId}`).emit('study_progress_updated', {
      userId: socket.user._id,
      userName: socket.user.profile.firstName,
      progress,
      timestamp: new Date()
    });
  });

  // Handle calendar events
  socket.on('schedule_update', (data) => {
    const { updateType, eventData } = data;
    
    // Notify classmates about schedule changes
    if (socket.user.academic?.department && socket.user.academic?.year) {
      socket.to(`year_${socket.user.academic.department}_${socket.user.academic.year}`)
        .emit('peer_schedule_update', {
          userId: socket.user._id,
          userName: socket.user.profile.firstName,
          updateType,
          eventData,
          timestamp: new Date()
        });
    }
  });

  // Handle live collaboration events
  socket.on('collaborate_resume', (data) => {
    const { resumeId, action, content } = data;
    
    socket.to(`resume_${resumeId}`).emit('resume_collaboration', {
      userId: socket.user._id,
      userName: socket.user.profile.firstName,
      action,
      content,
      timestamp: new Date()
    });
  });

  // Handle admin/faculty announcements
  socket.on('admin_announcement', (data) => {
    // Only allow admin/faculty to send announcements
    if (socket.user.role === 'admin' || socket.user.role === 'faculty') {
      const { target, message, priority = 'normal' } = data;
      
      let targetRoom;
      switch (target.type) {
        case 'all':
          io.emit('announcement', {
            from: socket.user.fullName,
            message,
            priority,
            timestamp: new Date(),
            type: 'global'
          });
          break;
        case 'department':
          targetRoom = `dept_${target.department}`;
          io.to(targetRoom).emit('announcement', {
            from: socket.user.fullName,
            message,
            priority,
            timestamp: new Date(),
            type: 'department',
            department: target.department
          });
          break;
        case 'year':
          targetRoom = `year_${target.department}_${target.year}`;
          io.to(targetRoom).emit('announcement', {
            from: socket.user.fullName,
            message,
            priority,
            timestamp: new Date(),
            type: 'year',
            department: target.department,
            year: target.year
          });
          break;
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User disconnected: ${socket.user?.profile?.firstName} ${socket.user?.profile?.lastName} (${socket.id}) - Reason: ${reason}`);
    
    // Notify rooms about user going offline
    if (socket.user.joinedClubs) {
      socket.user.joinedClubs.forEach(clubMembership => {
        socket.to(`club_${clubMembership.club}`).emit('user_offline', {
          userId: socket.user._id,
          userName: socket.user.profile.firstName,
          timestamp: new Date()
        });
      });
    }
  });
};

// Utility function to generate message IDs
const generateMessageId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Utility functions for broadcasting
const broadcastToRoom = (io, roomId, eventName, data) => {
  io.to(roomId).emit(eventName, data);
};

const broadcastToUser = (io, userId, eventName, data) => {
  io.to(`user_${userId}`).emit(eventName, data);
};

const broadcastToDepartment = (io, department, eventName, data) => {
  io.to(`dept_${department}`).emit(eventName, data);
};

const broadcastToYear = (io, department, year, eventName, data) => {
  io.to(`year_${department}_${year}`).emit(eventName, data);
};

// Apply authentication middleware
const authenticatedSocketHandlers = (socket, io) => {
  return authenticateSocket(socket, (error) => {
    if (error) {
      console.error('Socket authentication failed:', error.message);
      socket.emit('auth_error', { message: error.message });
      socket.disconnect();
      return;
    }
    
    socketHandlers(socket, io);
  });
};

module.exports = authenticatedSocketHandlers;
module.exports.broadcastToRoom = broadcastToRoom;
module.exports.broadcastToUser = broadcastToUser;
module.exports.broadcastToDepartment = broadcastToDepartment;
module.exports.broadcastToYear = broadcastToYear;
