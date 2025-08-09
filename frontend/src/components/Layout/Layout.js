import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';

// Redux
import { 
  selectSidebarOpen, 
  selectSidebarCollapsed, 
  selectIsMobile,
  setSidebarOpen 
} from '../../store/slices/uiSlice';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const isMobile = useSelector(selectIsMobile);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      dispatch(setSidebarOpen(false));
    }
  }, [window.location.pathname, isMobile, sidebarOpen, dispatch]);

  // Handle sidebar overlay click on mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Alt + S to toggle sidebar
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        dispatch(setSidebarOpen(!sidebarOpen));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          isMobile
            ? 'lg:ml-0'
            : sidebarCollapsed
            ? 'lg:ml-16'
            : 'lg:ml-64'
        }`}
      >
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="min-h-screen pt-16 pb-20 lg:pb-6">
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile bottom navigation */}
        {isMobile && <MobileBottomNav />}
      </div>
    </div>
  );
};

export default Layout;
