import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';

const Schedule = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Schedule
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your classes, events, and study sessions
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Schedule Coming Soon
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Calendar and schedule management features will be available soon.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Schedule;
