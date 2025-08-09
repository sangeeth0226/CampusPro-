import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser, selectAuthLoading } from '../../store/slices/authSlice';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthLoading);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return <LoadingSpinner fullScreen text="Verifying authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check if user account is active
  if (!user.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Account Deactivated
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your account has been deactivated. Please contact support for assistance.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check required role
  if (requiredRole && user.role !== requiredRole) {
    // Allow admin to access all roles
    if (user.role !== 'admin') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-5a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You don't have permission to access this page. Required role: {requiredRole}
              </p>
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check required permission (for more granular access control)
  if (requiredPermission && !checkUserPermission(user, requiredPermission)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Insufficient Permissions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have the required permissions to access this feature.
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return children;
};

// Helper function to check user permissions
const checkUserPermission = (user, permission) => {
  // Admin has all permissions
  if (user.role === 'admin') {
    return true;
  }

  // Define role-based permissions
  const rolePermissions = {
    student: [
      'view_dashboard',
      'view_schedule',
      'edit_schedule',
      'view_clubs',
      'join_clubs',
      'view_mess',
      'submit_complaints',
      'use_interview_prep',
      'build_resume',
      'view_profile',
      'edit_profile',
    ],
    faculty: [
      'view_dashboard',
      'view_schedule',
      'edit_schedule',
      'view_clubs',
      'moderate_clubs',
      'view_mess',
      'manage_mess',
      'view_students',
      'grade_assignments',
      'create_announcements',
      'view_profile',
      'edit_profile',
    ],
    club_admin: [
      'view_dashboard',
      'view_schedule',
      'edit_schedule',
      'view_clubs',
      'manage_clubs',
      'moderate_clubs',
      'view_mess',
      'submit_complaints',
      'use_interview_prep',
      'build_resume',
      'view_profile',
      'edit_profile',
    ],
  };

  const userPermissions = rolePermissions[user.role] || [];
  return userPermissions.includes(permission);
};

export default ProtectedRoute;
