import Parse from '../parseConfig';

/**
 * Booking Model - Represents tattoo booking requests and appointments
 * Extends Parse.Object to leverage Parse's backend functionality
 */
class Booking extends Parse.Object {
  constructor() {
    super('Booking');
  }

  // Static methods for querying bookings
  static async getAllBookings() {
    try {
      const query = new Parse.Query(Booking);
      query.include(['design', 'client']);
      query.descending('createdAt');
      const bookings = await query.find();
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  static async getBookingById(id) {
    try {
      const query = new Parse.Query(Booking);
      query.include(['design', 'client']);
      const booking = await query.get(id);
      return booking;
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      throw error;
    }
  }

  static async getBookingsByDate(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const query = new Parse.Query(Booking);
      query.greaterThanOrEqualTo('preferredDate', startOfDay);
      query.lessThanOrEqualTo('preferredDate', endOfDay);
      query.include(['design', 'client']);
      query.ascending('preferredTime');
      const bookings = await query.find();
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings by date:', error);
      throw error;
    }
  }

  static async getBookingsByStatus(status) {
    try {
      const query = new Parse.Query(Booking);
      query.equalTo('status', status);
      query.include(['design', 'client']);
      query.descending('createdAt');
      const bookings = await query.find();
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
      throw error;
    }
  }

  static async getBookingsByClient(clientEmail) {
    try {
      const query = new Parse.Query(Booking);
      query.equalTo('clientEmail', clientEmail);
      query.include(['design', 'client']);
      query.descending('createdAt');
      const bookings = await query.find();
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings by client:', error);
      throw error;
    }
  }

  // Get bookings by Parse User (by email)
  static async getUserBookings(user) {
    try {
      const query = new Parse.Query(Booking);
      // Try multiple ways to get user email
      const userEmail = user.get ? user.get('email') : (user.email || null);
      const username = user.get ? user.get('username') : (user.username || null);
      
      console.log('getUserBookings - User email:', userEmail);
      console.log('getUserBookings - Username:', username);
      
      if (!userEmail && !username) {
        console.warn('getUserBookings - No email or username found for user');
        return [];
      }
      
      // Try exact email match first
      if (userEmail) {
        query.equalTo('clientEmail', userEmail);
      }
      
      // If no email or no results with email, try username
      if (!userEmail && username) {
        query.equalTo('clientEmail', username);
      }
      
      query.include(['design', 'client']);
      query.descending('createdAt');
      const bookings = await query.find();
      
      console.log('getUserBookings - Found bookings:', bookings.length);
      if (bookings.length > 0) {
        console.log('getUserBookings - First booking email:', bookings[0].get('clientEmail'));
        console.log('getUserBookings - First booking status:', bookings[0].get('status'));
      } else {
        // If no bookings found with exact match, try case-insensitive search
        console.log('getUserBookings - No bookings found with exact match, trying case-insensitive...');
        const allBookings = await new Parse.Query(Booking)
          .include(['design', 'client'])
          .descending('createdAt')
          .find();
        
        const matchedBookings = allBookings.filter(b => {
          const bookingEmail = b.get('clientEmail') || '';
          return bookingEmail.toLowerCase() === (userEmail || username || '').toLowerCase();
        });
        
        console.log('getUserBookings - Found bookings (case-insensitive):', matchedBookings.length);
        return matchedBookings;
      }
      
      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  static async getUpcomingBookings() {
    try {
      const now = new Date();
      const query = new Parse.Query(Booking);
      query.greaterThanOrEqualTo('preferredDate', now);
      query.include(['design', 'client']);
      query.ascending('preferredDate');
      const bookings = await query.find();
      return bookings;
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }
  }

  static async getAvailableTimeSlots(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const query = new Parse.Query(Booking);
      query.greaterThanOrEqualTo('preferredDate', startOfDay);
      query.lessThanOrEqualTo('preferredDate', endOfDay);
      query.equalTo('status', 'confirmed');
      const bookings = await query.find();
      
      // Generate available time slots (9 AM to 6 PM, 1-hour slots)
      const availableSlots = [];
      const bookedTimes = bookings.map(booking => booking.get('preferredTime'));
      
      for (let hour = 9; hour < 18; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        if (!bookedTimes.includes(timeSlot)) {
          availableSlots.push(timeSlot);
        }
      }
      
      return availableSlots;
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw error;
    }
  }

  // Create a new booking
  static async createBooking(bookingData) {
    try {
      console.log('createBooking - bookingData.email:', bookingData.email);
      const booking = new Booking();
      booking.set('clientName', bookingData.name);
      booking.set('clientEmail', bookingData.email);
      console.log('createBooking - Setting clientEmail to:', bookingData.email);
      booking.set('clientPhone', bookingData.phone);
      booking.set('tattooType', bookingData.tattooType);
      booking.set('bodyPart', bookingData.bodyPart);
      booking.set('preferredDate', new Date(bookingData.preferredDate));
      booking.set('preferredTime', bookingData.preferredTime);
      booking.set('customDescription', bookingData.customDescription);
      booking.set('status', 'pending');
      booking.set('notes', '');
      
      // Link to design if provided
      if (bookingData.designId) {
        const designQuery = new Parse.Query('Design');
        const design = await designQuery.get(bookingData.designId);
        booking.set('design', design);
      }
      
      // Handle reference images if provided
      if (bookingData.referenceImages && bookingData.referenceImages.length > 0) {
        const imageFiles = [];
        for (const image of bookingData.referenceImages) {
          const parseFile = new Parse.File(image.name, image);
          await parseFile.save();
          imageFiles.push(parseFile);
        }
        booking.set('referenceImages', imageFiles);
      }
      
      const savedBooking = await booking.save();
      console.log('createBooking - Saved booking with clientEmail:', savedBooking.get('clientEmail'));
      return savedBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Instance methods
  getFormattedDate() {
    const date = this.get('preferredDate');
    if (!date) return null;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFormattedTime() {
    const time = this.get('preferredTime');
    if (!time) return null;
    return time;
  }

  getStatusColor() {
    const status = this.get('status');
    switch (status) {
      case 'pending': return '#ffa500';
      case 'confirmed': return '#28a745';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  }

  // Update booking status
  async updateStatus(status, notes = '') {
    try {
      this.set('status', status);
      if (notes) {
        this.set('notes', notes);
      }
      const updatedBooking = await this.save();
      return updatedBooking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(reason = '') {
    try {
      this.set('status', 'cancelled');
      if (reason) {
        const existingNotes = this.get('notes') || '';
        this.set('notes', existingNotes ? `${existingNotes}\nCancellation: ${reason}` : `Cancellation: ${reason}`);
      }
      const updatedBooking = await this.save();
      return updatedBooking;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Request modification (adds a modification request note)
  async requestModification(requestText) {
    try {
      const existingNotes = this.get('notes') || '';
      this.set('notes', existingNotes ? `${existingNotes}\nModification Request: ${requestText}` : `Modification Request: ${requestText}`);
      this.set('status', 'pending'); // Reset to pending for review
      const updatedBooking = await this.save();
      return updatedBooking;
    } catch (error) {
      console.error('Error requesting modification:', error);
      throw error;
    }
  }

  // Confirm booking
  async confirmBooking(notes = '') {
    try {
      this.set('status', 'confirmed');
      if (notes) {
        this.set('notes', notes);
      }
      const updatedBooking = await this.save();
      return updatedBooking;
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  }
}

// Register the subclass with Parse
Parse.Object.registerSubclass('Booking', Booking);

export default Booking;
