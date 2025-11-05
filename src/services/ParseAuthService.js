/**
 * Parse Authentication Service
 * 
 * This service handles all Parse authentication operations including:
 * - User login
 * - User registration
 * - User logout
 * - Current user session checking
 * 
 * All authentication methods are centralized here to maintain separation of concerns.
 */

import Parse from '../parseConfig';

class ParseAuthService {
  /**
   * Log in a user with username and password
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   * @returns {Promise<{success: boolean, user?: Parse.User, error?: string}>}
   */
  async login(username, password) {
    try {
      const loggedInUser = await Parse.User.logIn(username, password);
      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error('Parse login error:', error);
      return { 
        success: false, 
        error: error.message || error.error || 'Login failed. Please check your credentials.' 
      };
    }
  }

  /**
   * Register a new user
   * @param {string} username - The desired username
   * @param {string} email - The user's email address
   * @param {string} password - The user's password
   * @param {Object} additionalData - Optional additional user data
   * @returns {Promise<{success: boolean, user?: Parse.User, error?: string}>}
   */
  async register(username, email, password, additionalData = {}) {
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
      console.log('User registered successfully:', createdUser.id, createdUser.get('username'));
      return { success: true, user: createdUser };
    } catch (error) {
      console.error('Parse register error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return { 
        success: false, 
        error: error.message || error.error || 'Registration failed. Please try again.' 
      };
    }
  }

  /**
   * Log out the current user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async logout() {
    try {
      await Parse.User.logOut();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Logout failed.' 
      };
    }
  }

  /**
   * Get the current authenticated user
   * @returns {Parse.User|null} The current user or null if not authenticated
   */
  getCurrentUser() {
    return Parse.User.current();
  }

  /**
   * Check if the current user session is valid
   * @returns {Promise<Parse.User|null>} The current user or null if session is invalid
   */
  async checkCurrentUser() {
    try {
      const currentUser = Parse.User.current();
      if (currentUser) {
        // Verify session is still valid by fetching user data
        await currentUser.fetch();
        return currentUser;
      }
      return null;
    } catch (error) {
      console.error('Error checking current user:', error);
      return null;
    }
  }

  /**
   * Check if a user is currently authenticated
   * @returns {boolean} True if user is authenticated, false otherwise
   */
  isAuthenticated() {
    return Parse.User.current() !== null;
  }
}

// Export a singleton instance
export default new ParseAuthService();

