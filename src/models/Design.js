import Parse from '../parseConfig';

/**
 * Design Model - Represents tattoo designs available for booking
 * Extends Parse.Object to leverage Parse's backend functionality
 */
class Design extends Parse.Object {
  constructor() {
    super('Design');
  }

  // Static methods for querying designs
  static async getAllDesigns() {
    try {
      const query = new Parse.Query(Design);
      query.include('category');
      query.descending('createdAt');
      const designs = await query.find();
      return designs;
    } catch (error) {
      console.error('Error fetching designs:', error);
      throw error;
    }
  }

  static async getAvailableDesigns() {
    try {
      const query = new Parse.Query(Design);
      query.equalTo('available', true);
      query.include('category');
      query.descending('createdAt');
      const designs = await query.find();
      return designs;
    } catch (error) {
      console.error('Error fetching available designs:', error);
      throw error;
    }
  }

  static async getDesignById(id) {
    try {
      const query = new Parse.Query(Design);
      query.include('category');
      const design = await query.get(id);
      return design;
    } catch (error) {
      console.error('Error fetching design by ID:', error);
      throw error;
    }
  }

  static async getDesignsByCategory(category) {
    try {
      const query = new Parse.Query(Design);
      query.equalTo('category', category);
      query.equalTo('available', true);
      query.include('category');
      query.descending('createdAt');
      const designs = await query.find();
      return designs;
    } catch (error) {
      console.error('Error fetching designs by category:', error);
      throw error;
    }
  }

  static async searchDesigns(searchTerm) {
    try {
      const query = new Parse.Query(Design);
      query.contains('name', searchTerm);
      query.include('category');
      query.descending('createdAt');
      const designs = await query.find();
      return designs;
    } catch (error) {
      console.error('Error searching designs:', error);
      throw error;
    }
  }

  // Instance methods
  getImageUrl() {
    const image = this.get('image');
    if (image && image.url) {
      return image.url();
    }
    return null;
  }

  getSizes() {
    return this.get('sizes') || [];
  }

  getPriceRange() {
    const sizes = this.getSizes();
    if (sizes.length === 0) return null;
    
    const prices = sizes.map(size => size.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  isAvailable() {
    return this.get('available') === true;
  }

  // Create a new design
  static async createDesign(designData) {
    try {
      const design = new Design();
      design.set('name', designData.name);
      design.set('description', designData.description);
      design.set('category', designData.category);
      design.set('available', designData.available !== false);
      design.set('sizes', designData.sizes || []);
      
      // Set submittedByEmail if user is provided
      if (designData.user) {
        const userEmail = designData.user.get('email');
        if (userEmail) {
          design.set('submittedByEmail', userEmail);
        }
      } else if (designData.submittedByEmail) {
        design.set('submittedByEmail', designData.submittedByEmail);
      }
      
      if (designData.image) {
        const parseFile = new Parse.File('design.jpg', designData.image);
        await parseFile.save();
        design.set('image', parseFile);
      }
      
      const savedDesign = await design.save();
      return savedDesign;
    } catch (error) {
      console.error('Error creating design:', error);
      throw error;
    }
  }

  // Update design availability
  async updateAvailability(available) {
    try {
      this.set('available', available);
      const updatedDesign = await this.save();
      return updatedDesign;
    } catch (error) {
      console.error('Error updating design availability:', error);
      throw error;
    }
  }

  // Get designs submitted by a user (by email or user ID)
  static async getUserDesigns(user) {
    try {
      const query = new Parse.Query(Design);
      // Match by email from Parse User
      const userEmail = user.get('email');
      if (userEmail) {
        // Try submittedByEmail first
        query.equalTo('submittedByEmail', userEmail);
      } else {
        // If no email, return empty array
        return [];
      }
      query.descending('createdAt');
      const designs = await query.find();
      return designs;
    } catch (error) {
      console.error('Error fetching user designs:', error);
      throw error;
    }
  }

  // Get booking count for a design
  static async getBookingCount(designId) {
    try {
      const query = new Parse.Query('Booking');
      // Get the design object first
      const designQuery = new Parse.Query('Design');
      const design = await designQuery.get(designId);
      query.equalTo('design', design);
      const count = await query.count();
      return count;
    } catch (error) {
      console.error('Error fetching booking count:', error);
      return 0;
    }
  }

  // Delete design
  async deleteDesign() {
    try {
      await this.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting design:', error);
      throw error;
    }
  }
}

// Register the subclass with Parse
Parse.Object.registerSubclass('Design', Design);

export default Design;
