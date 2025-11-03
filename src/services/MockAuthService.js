/**
 * Mock Authentication Service
 * 
 * Simple authentication using localStorage - no backend required.
 * Stores user credentials locally in the browser.
 * 
 * Note: This is for development/demo purposes. In production, use a proper backend.
 */

class MockAuthService {
  constructor() {
    this.storageKey = 'melvink_users';
    this.currentUserKey = 'melvink_current_user';
    this.users = this.loadUsers();
  }

  /**
   * Load users from localStorage
   */
  loadUsers() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading users:', error);
      return {};
    }
  }

  /**
   * Save users to localStorage
   */
  saveUsers() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  /**
   * Create a simple user object
   */
  createUserObject(username, email) {
    return {
      id: `${username}_${Date.now()}`,
      username,
      email,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Log in a user
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
   */
  async login(username, password) {
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300));

      const userKey = username.toLowerCase();
      const userData = this.users[userKey];

      if (!userData) {
        return {
          success: false,
          error: 'User not found. Please register first.'
        };
      }

      if (userData.password !== password) {
        return {
          success: false,
          error: 'Invalid password. Please try again.'
        };
      }

      // Create user object (without password)
      const user = this.createUserObject(userData.username, userData.email);
      user.id = userData.id;

      // Store current user
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Register a new user
   * @param {string} username - The desired username
   * @param {string} email - The user's email address
   * @param {string} password - The user's password
   * @param {Object} additionalData - Optional additional user data
   * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
   */
  async register(username, email, password, additionalData = {}) {
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300));

      const userKey = username.toLowerCase();

      // Check if username already exists
      if (this.users[userKey]) {
        return {
          success: false,
          error: 'Username already exists. Please choose a different username.'
        };
      }

      // Check if email already exists
      const existingUser = Object.values(this.users).find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existingUser) {
        return {
          success: false,
          error: 'Email already registered. Please use a different email.'
        };
      }

      // Create new user
      const userData = {
        id: `${username}_${Date.now()}`,
        username,
        email,
        password, // In production, this should be hashed
        createdAt: new Date().toISOString(),
        ...additionalData
      };

      this.users[userKey] = userData;
      this.saveUsers();

      // Create user object (without password) for return
      const user = this.createUserObject(username, email);
      user.id = userData.id;

      // Store current user (auto-login after registration)
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Log out the current user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async logout() {
    try {
      localStorage.removeItem(this.currentUserKey);
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
   * @returns {Object|null} The current user or null if not authenticated
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(this.currentUserKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if the current user session is valid
   * @returns {Promise<Object|null>} The current user or null if session is invalid
   */
  async checkCurrentUser() {
    try {
      // Simulate async check
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getCurrentUser();
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
    return this.getCurrentUser() !== null;
  }
}

// Export a singleton instance
export default new MockAuthService();

