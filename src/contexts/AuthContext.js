import React, { createContext, useContext, useState, useEffect } from 'react';
import Parse from '../parseConfig';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const currentUser = Parse.User.current();
      if (currentUser) {
        // Verify session is still valid
        await currentUser.fetch();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error checking current user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const loggedInUser = await Parse.User.logIn(username, password);
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (username, email, password, additionalData = {}) => {
    try {
      const user = new Parse.User();
      user.set('username', username);
      user.set('email', email);
      user.set('password', password);
      
      // Set any additional user data
      Object.keys(additionalData).forEach(key => {
        user.set(key, additionalData[key]);
      });

      const createdUser = await user.signUp();
      setUser(createdUser);
      return { success: true, user: createdUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await Parse.User.logOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Logout failed.' 
      };
    }
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


