import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const PublicRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Get the intended destination from location state
  const from = location.state?.from || '/';

  // If user is already authenticated, redirect to dashboard or intended page
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Render the public page if not authenticated
  return children;
};

export default PublicRoute;
