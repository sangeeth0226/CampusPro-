import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const DashboardWidget = ({ 
  title, 
  icon: Icon, 
  children, 
  link, 
  linkText = "View More",
  className = "",
  headerActions,
  loading = false,
  error = null,
}) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {headerActions}
          {link && (
            <Link
              to={link}
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              {linkText}
              <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner" />
            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-red-500 dark:text-red-400">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-center">{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
};

export default DashboardWidget;
