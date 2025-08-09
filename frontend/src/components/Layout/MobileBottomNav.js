import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  BriefcaseIcon as BriefcaseIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';

import { selectUser } from '../../store/slices/authSlice';

const MobileBottomNav = () => {
  const location = useLocation();
  const user = useSelector(selectUser);

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      roles: ['student', 'faculty', 'admin', 'club_admin'],
    },
    {
      name: 'Schedule',
      href: '/schedule',
      icon: CalendarIcon,
      activeIcon: CalendarIconSolid,
      roles: ['student', 'faculty', 'admin'],
    },
    {
      name: 'Clubs',
      href: '/clubs',
      icon: UserGroupIcon,
      activeIcon: UserGroupIconSolid,
      roles: ['student', 'faculty', 'admin', 'club_admin'],
    },
    {
      name: 'Interview',
      href: '/interview-prep',
      icon: BriefcaseIcon,
      activeIcon: BriefcaseIconSolid,
      roles: ['student', 'admin'],
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserCircleIcon,
      activeIcon: UserCircleIconSolid,
      roles: ['student', 'faculty', 'admin', 'club_admin'],
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role) || item.roles.includes('all')
  );

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-40">
      <div className="flex justify-around items-center h-16 px-2">
        {filteredNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = active ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className="flex flex-col items-center justify-center flex-1 py-2 relative"
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-1 rounded-lg transition-colors duration-200 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs mt-1 transition-colors duration-200 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
