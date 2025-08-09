import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

const SchedulePreview = () => {
  // Mock schedule data for today
  const todaySchedule = [
    {
      id: 1,
      subject: 'Data Structures',
      time: '09:00 - 10:30',
      location: 'Room 101, CS Building',
      instructor: 'Dr. Smith',
      type: 'lecture',
      status: 'completed',
    },
    {
      id: 2,
      subject: 'Database Management',
      time: '11:00 - 12:30',
      location: 'Room 205, IT Building',
      instructor: 'Prof. Johnson',
      type: 'lab',
      status: 'current',
    },
    {
      id: 3,
      subject: 'Software Engineering',
      time: '14:00 - 15:30',
      location: 'Room 301, CS Building',
      instructor: 'Dr. Williams',
      type: 'lecture',
      status: 'upcoming',
    },
    {
      id: 4,
      subject: 'Web Development',
      time: '16:00 - 17:30',
      location: 'Lab 2, IT Building',
      instructor: 'Ms. Brown',
      type: 'practical',
      status: 'upcoming',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'current':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lecture':
        return '📚';
      case 'lab':
        return '🔬';
      case 'practical':
        return '💻';
      default:
        return '📖';
    }
  };

  if (todaySchedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <ClockIcon className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">No classes today</p>
        <p className="text-sm">Enjoy your free day!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todaySchedule.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-4 rounded-lg border transition-colors duration-200 ${
            item.status === 'current'
              ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
              : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getTypeIcon(item.type)}</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {item.subject}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{item.time}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{item.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">👨‍🏫</span>
                  <span>{item.instructor}</span>
                </div>
              </div>
            </div>

            {item.status === 'current' && (
              <div className="flex items-center ml-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="ml-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                  Live
                </span>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Next class indicator */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Next class in 2 hours
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Software Engineering at 2:00 PM
            </p>
          </div>
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePreview;
