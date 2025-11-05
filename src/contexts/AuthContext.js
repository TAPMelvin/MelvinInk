import React, { createContext, useContext, useState, useEffect } from 'react';
// Use ParseAuthService for Back4App authentication
import ParseAuthService from '../services/ParseAuthService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * 
 * Provides authentication state and methods to all child components.
 * Uses ParseAuthService (Back4App) to handle all authentication operations.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkCurrentUser();
  }, []);

  /**
   * Check if there is a current authenticated user
   */
  const checkCurrentUser = async () => {
    const currentUser = await ParseAuthService.checkCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  /**
   * Log in a user
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   * @returns {Promise<{success: boolean, user?: Parse.User, error?: string}>}
   */
  const login = async (username, password) => {
    const result = await ParseAuthService.login(username, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  /**
   * Register a new user
   * @param {string} username - The desired username
   * @param {string} email - The user's email address
   * @param {string} password - The user's password
   * @param {Object} additionalData - Optional additional user data
   * @returns {Promise<{success: boolean, user?: Parse.User, error?: string}>}
   */
  const register = async (username, email, password, additionalData = {}) => {
    const result = await ParseAuthService.register(username, email, password, additionalData);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  /**
   * Log out the current user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const logout = async () => {
    const result = await ParseAuthService.logout();
    if (result.success) {
      setUser(null);
    }
    return result;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



