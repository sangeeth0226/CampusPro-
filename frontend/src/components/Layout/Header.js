import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

// Redux
import { 
  toggleSidebar, 
  toggleSidebarCollapsed,
  toggleTheme,
  selectSidebarCollapsed,
  selectIsMobile,
  selectTheme,
  selectNotifications,
  selectUnreadNotifications,
} from '../../store/slices/uiSlice';
import { selectUser, logout } from '../../store/slices/authSlice';

// Components
import SearchModal from '../Common/SearchModal';
import NotificationDropdown from '../Common/NotificationDropdown';

const Header = () => {
  const dispatch = useDispatch();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Selectors
  const user = useSelector(selectUser);
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const isMobile = useSelector(selectIsMobile);
  const theme = useSelector(selectTheme);
  const notifications = useSelector(selectNotifications);
  const unreadNotifications = useSelector(selectUnreadNotifications);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
  };

  const handleToggleSidebar = () => {
    if (isMobile) {
      dispatch(toggleSidebar());
    } else {
      dispatch(toggleSidebarCollapsed());
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
        <div className={`flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 transition-all duration-200 ${
          isMobile ? '' : sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Sidebar toggle */}
            <button
              onClick={handleToggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              {isMobile ? (
                <Bars3Icon className="w-5 h-5" />
              ) : sidebarCollapsed ? (
                <ChevronRightIcon className="w-5 h-5" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5" />
              )}
            </button>

            {/* Greeting */}
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getGreeting()}, {user?.profile?.firstName || 'there'}!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                aria-label="User menu"
              >
                {user?.profile?.avatar?.url ? (
                  <img
                    src={user.profile.avatar.url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8" />
                )}
              </button>

              {/* Profile dropdown menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.fullName || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <a
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <UserCircleIcon className="w-4 h-4 mr-3" />
                        Profile
                      </a>
                      <a
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-3" />
                        Settings
                      </a>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200 dark:border-gray-600 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Search modal */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
    </>
  );
};

export default Header;
