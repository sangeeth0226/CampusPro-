import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const QuickActions = () => {
  const actions = [
    {
      id: 'add-event',
      title: 'Add Event',
      description: 'Create a new calendar event',
      icon: PlusIcon,
      href: '/schedule?action=create-event',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'join-club',
      title: 'Join Club',
      description: 'Explore and join clubs',
      icon: UserGroupIcon,
      href: '/clubs',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'practice-interview',
      title: 'Practice Interview',
      description: 'Start a mock interview session',
      icon: BriefcaseIcon,
      href: '/interview-prep',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'build-resume',
      title: 'Build Resume',
      description: 'Create or update your resume',
      icon: DocumentTextIcon,
      href: '/resume-builder',
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      id: 'study-session',
      title: 'Study Session',
      description: 'Track your study time',
      icon: BookOpenIcon,
      href: '/goals?action=study-session',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      id: 'report-issue',
      title: 'Report Issue',
      description: 'Submit a mess complaint',
      icon: ExclamationTriangleIcon,
      href: '/mess-hostel?action=complaint',
      color: 'bg-red-500 hover:bg-red-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <motion.div key={action.id} variants={itemVariants}>
              <Link
                to={action.href}
                className="group flex flex-col items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 hover:shadow-md"
              >
                <div className={`p-2 rounded-lg text-white ${action.color} transition-colors duration-200 mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white text-center mb-1">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">
                  {action.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default QuickActions;
