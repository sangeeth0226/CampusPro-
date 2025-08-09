import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Redux actions
import { getCurrentUser } from './store/slices/authSlice';
import { 
  setTheme, 
  setIsMobile, 
  updateLastInteraction,
  setCurrentPage,
  setBreadcrumbs 
} from './store/slices/uiSlice';

// Selectors
import { selectIsAuthenticated, selectUser, selectAuthLoading } from './store/slices/authSlice';
import { selectTheme, selectSidebarOpen } from './store/slices/uiSlice';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';
import ProtectedRoute from './components/Common/ProtectedRoute';
import PublicRoute from './components/Common/PublicRoute';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Schedule = lazy(() => import('./pages/Schedule'));
const MessHostel = lazy(() => import('./pages/MessHostel'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const Clubs = lazy(() => import('./pages/Clubs'));
const ClubDetail = lazy(() => import('./pages/ClubDetail'));
const Goals = lazy(() => import('./pages/Goals'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const FacultyDashboard = lazy(() => import('./pages/Faculty/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: 20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthLoading);
  const theme = useSelector(selectTheme);
  const sidebarOpen = useSelector(selectSidebarOpen);

  // Initialize app
  useEffect(() => {
    // Apply initial theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check for existing token and get user data
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getCurrentUser());
    }

    // Handle mobile detection
    const handleResize = () => {
      dispatch(setIsMobile(window.innerWidth < 1024));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Handle system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      if (theme === 'system') {
        dispatch(setTheme(e.matches ? 'dark' : 'light'));
      }
    };

    mediaQuery.addListener(handleThemeChange);

    // Track user interaction for analytics
    const handleUserInteraction = () => {
      dispatch(updateLastInteraction());
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeListener(handleThemeChange);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [dispatch, theme, user]);

  // Update current page for analytics
  useEffect(() => {
    dispatch(setCurrentPage(location.pathname));
    
    // Generate breadcrumbs based on path
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
      current: index === pathSegments.length - 1,
    }));

    dispatch(setBreadcrumbs(breadcrumbs));
  }, [location.pathname, dispatch]);

  // Show loading spinner while checking authentication
  if (authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Login />
                    </motion.div>
                  </Suspense>
                </PublicRoute>
              }
            />
            
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Register />
                    </motion.div>
                  </Suspense>
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route
                        index
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <motion.div
                              initial="initial"
                              animate="in"
                              exit="out"
                              variants={pageVariants}
                              transition={pageTransition}
                            >
                              <Dashboard />
                            </motion.div>
                          </Suspense>
                        }
                      />
                      
                      <Route
                        path="profile"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <motion.div
                              initial="initial"
                              animate="in"
                              exit="out"
                              variants={pageVariants}
                              transition={pageTransition}
                            >
                              <Profile />
                            </motion.div>
                          </Suspense>
                        }
                      />
                      
                      <Route
                        path="schedule"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <motion.div
                              initial="initial"
                              animate="in"
                              exit="out"
                              variants={pageVariants}
                              transition={pageTransition}
                            >
                              <Schedule />
                            </motion.div>
                          </Suspense>
                        }
                      />
                      
                      <Route
                        path="mess-hostel"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <motion.div
                              initial="initial"
                              animate="in"
                              exit="out"
                              variants={pageVariants}
                              transition={pageTransition}
                            >
                              <MessHostel />
                            </motion.div>
                          </Suspense>
                        }
                      />
                      
                      <Route
                        path="interview-prep"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <motion.div
                              initial="initial"
                              animate="in"
                              exit="out"
                              variants={pageVariants}
                              transition={pageTransition}
                            >
                              <InterviewPrep />
                            </motion.div>
                          </Suspense>
                        }
                      />
                      
                      <Route
                        path="mock-interview"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <motion.div
                              initial="initial"
                              animate="in"
                              exit="out"
                              variants={pageVariants}
                              transition={pageTransition}
                            >
                              <MockInterview />
                            </motion.div>
                          </Suspense>
                        }
                      />
                      
                      <Route
                        path="resume-builder"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <motion.div
                              initial="initial"
                              animate="in"
                              exit="out"
                              variants={pageVariants}
                              transition={pageTransition}
                            >
                              <ResumeBuilder />
                            </motion.div>
                          </Suspense>
                        }
                      />
                      
                      <Route
                        path="clubs"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <motion.div
                              initial="initial"
                              animate="in"
                              exit="out"
                              variants={pageVariants}
                              transition={pageTransition}
                            >
                              <Clubs />
                            </motion.div>
                          </Suspense>
                        }
                      />
                      
                      <Route
                        path="clubs/:id"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <motion.div
                              initial="initial"
                              animate="in"
                              exit="out"
                              variants={pageVariants}
                              transition={pageTransition}
                            >
                              <ClubDetail />
                            </motion.div>
                          </Suspense>
                        }
                      />
                      
                      <Route
                        path="goals"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <motion.div
                              initial="initial"
                              animate="in"
                              exit="out"
                              variants={pageVariants}
                              transition={pageTransition}
                            >
                              <Goals />
                            </motion.div>
                          </Suspense>
                        }
                      />

                      {/* Admin Routes */}
                      {user?.role === 'admin' && (
                        <Route
                          path="admin/*"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <motion.div
                                initial="initial"
                                animate="in"
                                exit="out"
                                variants={pageVariants}
                                transition={pageTransition}
                              >
                                <AdminDashboard />
                              </motion.div>
                            </Suspense>
                          }
                        />
                      )}

                      {/* Faculty Routes */}
                      {(user?.role === 'faculty' || user?.role === 'admin') && (
                        <Route
                          path="faculty/*"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <motion.div
                                initial="initial"
                                animate="in"
                                exit="out"
                                variants={pageVariants}
                                transition={pageTransition}
                              >
                                <FacultyDashboard />
                              </motion.div>
                            </Suspense>
                          }
                        />
                      )}
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <NotFound />
                  </motion.div>
                </Suspense>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}

export default App;

