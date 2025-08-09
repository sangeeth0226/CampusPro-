import React from 'react';
import { motion } from 'framer-motion';
import { FireIcon } from '@heroicons/react/24/solid';

const StreakCounter = ({ streak = 0 }) => {
  const getStreakColor = (days) => {
    if (days === 0) return 'text-gray-400';
    if (days < 7) return 'text-orange-500';
    if (days < 30) return 'text-red-500';
    return 'text-purple-500';
  };

  const getStreakMessage = (days) => {
    if (days === 0) return 'Start your streak!';
    if (days === 1) return 'Great start!';
    if (days < 7) return 'Keep it up!';
    if (days < 30) return 'You\'re on fire!';
    return 'Incredible streak!';
  };

  return (
    <motion.div
      className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={streak > 0 ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5, repeat: streak > 7 ? Infinity : 0, repeatDelay: 2 }}
      >
        <FireIcon className={`w-6 h-6 ${getStreakColor(streak)}`} />
      </motion.div>
      
      <div className="text-right">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {streak}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            day{streak !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {getStreakMessage(streak)}
        </p>
      </div>
    </motion.div>
  );
};

export default StreakCounter;
