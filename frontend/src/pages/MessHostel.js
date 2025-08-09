import React from 'react';
import { motion } from 'framer-motion';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

const MessHostel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mess & Hostel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View mess menu and manage hostel-related activities
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Mess & Hostel Management Coming Soon
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Menu viewing, complaint tracking, and hostel management features will be available soon.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessHostel;
