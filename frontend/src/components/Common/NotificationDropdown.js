import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

import {
  selectNotifications,
  selectUnreadNotifications,
  markNotificationAsRead,
  removeNotification,
  clearNotifications,
} from '../../store/slices/uiSlice';

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const notifications = useSelector(selectNotifications);
  const unreadNotifications = useSelector(selectUnreadNotifications);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification.id));
    }
    
    // Handle navigation if notification has a link
    if (notification.link) {
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = () => {
    unreadNotifications.forEach(notification => {
      dispatch(markNotificationAsRead(notification.id));
    });
  };

  const handleClearAll = () => {
    dispatch(clearNotifications());
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return CheckCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'error':
        return ExclamationTriangleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return time.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5" />
        
        {/* Unread count badge */}
        {unreadNotifications.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
          </motion.span>
        )}
      </button>

      {/* Notification dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              
              {notifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <BellIcon className="w-8 h-8 mb-2" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="py-1">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type);
                    
                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        className={`relative group ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        {notification.link ? (
                          <Link
                            to={notification.link}
                            onClick={() => handleNotificationClick(notification)}
                            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                          >
                            <NotificationContent
                              notification={notification}
                              Icon={Icon}
                              iconColor={iconColor}
                            />
                          </Link>
                        ) : (
                          <div
                            onClick={() => handleNotificationClick(notification)}
                            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                          >
                            <NotificationContent
                              notification={notification}
                              Icon={Icon}
                              iconColor={iconColor}
                            />
                          </div>
                        )}

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full" />
                        )}

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeNotification(notification.id));
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-all duration-200"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline py-1"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Notification content component
const NotificationContent = ({ notification, Icon, iconColor }) => {
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return time.toLocaleDateString();
  };

  return (
    <div className="flex items-start space-x-3">
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatTime(notification.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default NotificationDropdown;
