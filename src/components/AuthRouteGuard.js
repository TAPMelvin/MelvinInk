import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * AuthRouteGuard Component
 * 
 * Prevents authenticated users from accessing authentication pages (login/register).
 * If a user is already logged in and tries to access /login or /register,
 * they will be redirected to the home page.
 * 
 * This is the inverse of ProtectedRoute - it protects auth routes from authenticated users.
 */
export default function AuthRouteGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();

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

  // If authenticated, redirect to home page
  // Users should not be able to access login/register when already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, allow access to auth pages
  return children;
}

