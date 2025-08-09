import React from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const Clubs = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Student Clubs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and join clubs that match your interests
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Club Management Coming Soon
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Club discovery, forums, and event management will be available soon.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Clubs;
