/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication. 
 * - Prevents unauthenticated users from accessing protected routes
 * - Redirects to login page with return path for seamless navigation
 * - Handles loading states during authentication checks
 * - Works for both navigation clicks and manual URL entry
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    const returnPath = location.pathname + location.search;
    return <Navigate to={`/login?from=${encodeURIComponent(returnPath)}`} replace />;
  }

  // If authenticated, render the protected component
  return children;
}



