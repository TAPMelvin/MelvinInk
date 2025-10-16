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

  // Create a new design (admin function)
  static async createDesign(designData) {
    try {
      const design = new Design();
      design.set('name', designData.name);
      design.set('description', designData.description);
      design.set('category', designData.category);
      design.set('available', designData.available !== false);
      design.set('sizes', designData.sizes || []);
      
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
}

// Register the subclass with Parse
Parse.Object.registerSubclass('Design', Design);

export default Design;
