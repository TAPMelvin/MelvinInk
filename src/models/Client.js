import Parse from '../parseConfig';

/**
 * Client Model - Represents tattoo clients and their information
 * Extends Parse.Object to leverage Parse's backend functionality
 */
class Client extends Parse.Object {
  constructor() {
    super('Client');
  }

  // Static methods for querying clients
  static async getAllClients() {
    try {
      const query = new Parse.Query(Client);
      query.descending('createdAt');
      const clients = await query.find();
      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  static async getClientById(id) {
    try {
      const query = new Parse.Query(Client);
      const client = await query.get(id);
      return client;
    } catch (error) {
      console.error('Error fetching client by ID:', error);
      throw error;
    }
  }

  static async getClientByEmail(email) {
    try {
      const query = new Parse.Query(Client);
      query.equalTo('email', email);
      const client = await query.first();
      return client;
    } catch (error) {
      console.error('Error fetching client by email:', error);
      throw error;
    }
  }

  static async getClientBookings(clientId) {
    try {
      const client = await Client.getClientById(clientId);
      const query = new Parse.Query('Booking');
      query.equalTo('client', client);
      query.include('design');
      query.descending('createdAt');
      const bookings = await query.find();
      return bookings;
    } catch (error) {
      console.error('Error fetching client bookings:', error);
      throw error;
    }
  }

  static async searchClients(searchTerm) {
    try {
      const query = new Parse.Query(Client);
      query.contains('name', searchTerm);
      query.descending('createdAt');
      const clients = await query.find();
      return clients;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  }

  // Create or update client
  static async createOrUpdateClient(clientData) {
    try {
      // Check if client already exists
      let client = await Client.getClientByEmail(clientData.email);
      
      if (!client) {
        client = new Client();
      }
      
      client.set('name', clientData.name);
      client.set('email', clientData.email);
      client.set('phone', clientData.phone);
      client.set('preferredContact', clientData.preferredContact || 'email');
      
      if (clientData.allergies) {
        client.set('allergies', clientData.allergies);
      }
      
      if (clientData.medicalConditions) {
        client.set('medicalConditions', clientData.medicalConditions);
      }
      
      if (clientData.previousTattoos) {
        client.set('previousTattoos', clientData.previousTattoos);
      }
      
      const savedClient = await client.save();
      return savedClient;
    } catch (error) {
      console.error('Error creating/updating client:', error);
      throw error;
    }
  }

  // Instance methods
  getFullName() {
    return this.get('name') || 'Unknown Client';
  }

  getContactInfo() {
    return {
      email: this.get('email'),
      phone: this.get('phone'),
      preferred: this.get('preferredContact') || 'email'
    };
  }

  getBookingHistory() {
    return this.get('bookingHistory') || [];
  }

  // Add booking to client history
  async addBookingToHistory(bookingId) {
    try {
      const history = this.get('bookingHistory') || [];
      if (!history.includes(bookingId)) {
        history.push(bookingId);
        this.set('bookingHistory', history);
        await this.save();
      }
    } catch (error) {
      console.error('Error adding booking to history:', error);
      throw error;
    }
  }

  // Update client preferences
  async updatePreferences(preferences) {
    try {
      this.set('preferences', preferences);
      const updatedClient = await this.save();
      return updatedClient;
    } catch (error) {
      console.error('Error updating client preferences:', error);
      throw error;
    }
  }
}

// Register the subclass with Parse
Parse.Object.registerSubclass('Client', Client);

export default Client;
