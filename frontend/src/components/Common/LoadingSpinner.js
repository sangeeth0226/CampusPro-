import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  className = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    success: 'border-green-600',
    warning: 'border-yellow-600',
    danger: 'border-red-600',
    white: 'border-white',
  };

  const spinnerClasses = `
    ${sizeClasses[size]}
    ${colorClasses[color]}
    border-2 border-t-transparent
    rounded-full
    animate-spin
    ${className}
  `;

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  const spinner = (
    <motion.div
      className={spinnerClasses}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  );

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-2">
        {spinner}
        {text && (
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
