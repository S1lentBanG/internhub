import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

// Add allowedRoles prop
export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is provided, check if currentUser's role is in the array
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to an unauthorized page or home page
    console.warn(`User role "${currentUser.role}" not authorized for this page. Allowed: ${allowedRoles.join(', ')}`);
    return <Navigate to="/" state={{ unauthorized: true }} replace />; // Or to a specific /unauthorized page
  }

  return children;
}