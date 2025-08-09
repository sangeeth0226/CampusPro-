import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  UserGroupIcon,
  TrophyIcon,
  CogIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// Redux
import { 
  selectSidebarOpen, 
  selectSidebarCollapsed, 
  selectIsMobile 
} from '../../store/slices/uiSlice';
import { selectUser } from '../../store/slices/authSlice';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon,
    roles: ['student', 'faculty', 'admin', 'club_admin'],
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: CalendarIcon,
    roles: ['student', 'faculty', 'admin'],
  },
  {
    name: 'Mess & Hostel',
    href: '/mess-hostel',
    icon: BuildingOfficeIcon,
    roles: ['student', 'admin'],
  },
  {
    name: 'Interview Prep',
    href: '/interview-prep',
    icon: BriefcaseIcon,
    roles: ['student', 'admin'],
  },
  {
    name: 'Mock Interview',
    href: '/mock-interview',
    icon: MicrophoneIcon,
    roles: ['student', 'admin'],
  },
  {
    name: 'Resume Builder',
    href: '/resume-builder',
    icon: DocumentTextIcon,
    roles: ['student', 'admin'],
  },
  {
    name: 'Clubs',
    href: '/clubs',
    icon: UserGroupIcon,
    roles: ['student', 'faculty', 'admin', 'club_admin'],
  },
  {
    name: 'Goals & Progress',
    href: '/goals',
    icon: TrophyIcon,
    roles: ['student', 'admin'],
  },
];

const adminNavItems = [
  {
    name: 'Admin Panel',
    href: '/admin',
    icon: CogIcon,
    roles: ['admin'],
  },
];

const facultyNavItems = [
  {
    name: 'Faculty Panel',
    href: '/faculty',
    icon: CogIcon,
    roles: ['faculty', 'admin'],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const isMobile = useSelector(selectIsMobile);
  const user = useSelector(selectUser);

  // Filter navigation items based on user role
  const getFilteredNavItems = (items) => {
    return items.filter(item => 
      item.roles.includes(user?.role) || item.roles.includes('all')
    );
  };

  const filteredNavItems = getFilteredNavItems(navigationItems);
  const filteredAdminItems = getFilteredNavItems(adminNavItems);
  const filteredFacultyItems = getFilteredNavItems(facultyNavItems);

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const itemVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        x: { stiffness: 1000, velocity: -100 },
      },
    },
    closed: {
      x: -20,
      opacity: 0,
      transition: {
        x: { stiffness: 1000 },
      },
    },
  };

  const listVariants = {
    open: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 ${
          isMobile ? 'hidden' : 'block'
        } ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200`}
        initial={false}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    CampusPro+
                  </h1>
                </motion.div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      active
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <Icon
                      className={`flex-shrink-0 w-5 h-5 ${
                        sidebarCollapsed ? 'mx-auto' : 'mr-3'
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Faculty Panel */}
            {filteredFacultyItems.length > 0 && (
              <div className="pt-4">
                {!sidebarCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide"
                  >
                    Faculty
                  </motion.h3>
                )}
                <div className="mt-2 space-y-1">
                  {filteredFacultyItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          active
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        title={sidebarCollapsed ? item.name : ''}
                      >
                        <Icon
                          className={`flex-shrink-0 w-5 h-5 ${
                            sidebarCollapsed ? 'mx-auto' : 'mr-3'
                          }`}
                        />
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin Panel */}
            {filteredAdminItems.length > 0 && (
              <div className="pt-4">
                {!sidebarCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide"
                  >
                    Administration
                  </motion.h3>
                )}
                <div className="mt-2 space-y-1">
                  {filteredAdminItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          active
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        title={sidebarCollapsed ? item.name : ''}
                      >
                        <Icon
                          className={`flex-shrink-0 w-5 h-5 ${
                            sidebarCollapsed ? 'mx-auto' : 'mr-3'
                          }`}
                        />
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <Link
              to="/profile"
              className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              title={sidebarCollapsed ? 'Profile' : ''}
            >
              {user?.profile?.avatar?.url ? (
                <img
                  src={user.profile.avatar.url}
                  alt="Profile"
                  className={`flex-shrink-0 w-5 h-5 rounded-full ${
                    sidebarCollapsed ? 'mx-auto' : 'mr-3'
                  }`}
                />
              ) : (
                <UserCircleIcon
                  className={`flex-shrink-0 w-5 h-5 ${
                    sidebarCollapsed ? 'mx-auto' : 'mr-3'
                  }`}
                />
              )}
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </p>
                </motion.div>
              )}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && (
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:hidden"
            variants={sidebarVariants}
            initial="closed"
            animate={sidebarOpen ? "open" : "closed"}
            exit="closed"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    CampusPro+
                  </h1>
                </div>
              </div>

              {/* Navigation */}
              <motion.nav
                className="flex-1 px-2 py-4 space-y-1 overflow-y-auto"
                variants={listVariants}
              >
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <motion.div key={item.name} variants={itemVariants}>
                      <Link
                        to={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          active
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="flex-shrink-0 w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.nav>

              {/* User Profile */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <Link
                  to="/profile"
                  className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  {user?.profile?.avatar?.url ? (
                    <img
                      src={user.profile.avatar.url}
                      alt="Profile"
                      className="flex-shrink-0 w-5 h-5 rounded-full mr-3"
                    />
                  ) : (
                    <UserCircleIcon className="flex-shrink-0 w-5 h-5 mr-3" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
