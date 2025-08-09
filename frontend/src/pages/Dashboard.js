import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  BellIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

// Redux
import { selectUser } from '../store/slices/authSlice';
import { 
  selectDashboardWidgets, 
  selectVisibleWidgets,
  addNotification 
} from '../store/slices/uiSlice';

// Components
import DashboardWidget from '../components/Dashboard/DashboardWidget';
import QuickActions from '../components/Dashboard/QuickActions';
import UpcomingEvents from '../components/Dashboard/UpcomingEvents';
import SchedulePreview from '../components/Dashboard/SchedulePreview';
import ClubsPreview from '../components/Dashboard/ClubsPreview';
import ProgressTracker from '../components/Dashboard/ProgressTracker';
import MessPreview from '../components/Dashboard/MessPreview';
import NotificationsPreview from '../components/Dashboard/NotificationsPreview';
import WeatherWidget from '../components/Dashboard/WeatherWidget';
import StreakCounter from '../components/Dashboard/StreakCounter';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const visibleWidgets = useSelector(selectVisibleWidgets);

  // Sample data for demo purposes
  const stats = {
    todayClasses: 4,
    upcomingEvents: 2,
    clubMemberships: 3,
    currentStreak: user?.activity?.streakDays || 0,
    totalPoints: user?.activity?.points || 0,
    completedTasks: 8,
    pendingTasks: 3,
  };

  useEffect(() => {
    // Simulate welcome notification for new users
    if (user?.activity?.loginCount === 1) {
      setTimeout(() => {
        dispatch(addNotification({
          type: 'success',
          title: 'Welcome to CampusPro+!',
          message: 'Explore all the features to enhance your college experience.',
          link: '/profile',
        }));
      }, 2000);
    }
  }, [user, dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.profile?.firstName || 'there';
    
    if (hour < 12) return `Good morning, ${firstName}!`;
    if (hour < 17) return `Good afternoon, ${firstName}!`;
    return `Good evening, ${firstName}!`;
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {getGreeting()}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {getTodayDate()}
            </p>
          </div>
          
          {/* Streak Counter */}
          <div className="mt-4 sm:mt-0">
            <StreakCounter streak={stats.currentStreak} />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CalendarDaysIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Today's Classes
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.todayClasses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <ClockIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Upcoming Events
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.upcomingEvents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Club Memberships
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.clubMemberships}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrophyIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Total Points
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.totalPoints}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <QuickActions />
      </motion.div>

      {/* Main Dashboard Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Preview */}
          <DashboardWidget
            title="Today's Schedule"
            icon={CalendarDaysIcon}
            link="/schedule"
            linkText="View Full Schedule"
          >
            <SchedulePreview />
          </DashboardWidget>

          {/* Upcoming Events */}
          <DashboardWidget
            title="Upcoming Events"
            icon={ClockIcon}
            link="/schedule?tab=events"
            linkText="View All Events"
          >
            <UpcomingEvents />
          </DashboardWidget>

          {/* Progress Tracker */}
          <DashboardWidget
            title="Progress Tracker"
            icon={TrophyIcon}
            link="/goals"
            linkText="View Goals"
          >
            <ProgressTracker />
          </DashboardWidget>
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <DashboardWidget
            title="Weather"
            icon={ClockIcon}
          >
            <WeatherWidget />
          </DashboardWidget>

          {/* Notifications Preview */}
          <DashboardWidget
            title="Recent Notifications"
            icon={BellIcon}
            link="/notifications"
            linkText="View All"
          >
            <NotificationsPreview />
          </DashboardWidget>

          {/* Clubs Preview */}
          <DashboardWidget
            title="My Clubs"
            icon={UserGroupIcon}
            link="/clubs"
            linkText="Explore Clubs"
          >
            <ClubsPreview />
          </DashboardWidget>

          {/* Mess Preview */}
          <DashboardWidget
            title="Mess Menu"
            icon={BuildingOfficeIcon}
            link="/mess-hostel"
            linkText="View Full Menu"
          >
            <MessPreview />
          </DashboardWidget>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <DashboardWidget
          title="Recent Activity"
          icon={BookOpenIcon}
          className="mt-6"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">
                Completed "Data Structures Assignment 3"
              </span>
              <span className="text-gray-400 dark:text-gray-500">2h ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">
                Joined "Tech Innovation Club"
              </span>
              <span className="text-gray-400 dark:text-gray-500">1d ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">
                Practiced mock interview (Score: 85%)
              </span>
              <span className="text-gray-400 dark:text-gray-500">2d ago</span>
            </div>
          </div>
        </DashboardWidget>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
