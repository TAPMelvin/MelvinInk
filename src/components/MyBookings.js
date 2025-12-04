import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Booking from '../models/Booking';
import './mybookings.css';

/**
 * MyBookings Component
 * 
 * Displays all bookings for the logged-in user.
 * Allows users to:
 * - View booking details, status, and dates
 * - Cancel pending bookings
 * - Request modifications to pending bookings
 */
export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [modifyRequest, setModifyRequest] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Log user info
      if (user) {
        const userEmail = user.get ? user.get('email') : user.email;
        const username = user.get ? user.get('username') : user.username;
        console.log('MyBookings - User email:', userEmail);
        console.log('MyBookings - Username:', username);
      }
      
      const userBookings = await Booking.getUserBookings(user);
      console.log('MyBookings - Fetched bookings:', userBookings.length);
      setBookings(userBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      await selectedBooking.cancelBooking(cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedBooking(null);
      await fetchBookings(); // Refresh list
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModify = async () => {
    if (!selectedBooking || !modifyRequest.trim()) return;
    
    try {
      setActionLoading(true);
      await selectedBooking.requestModification(modifyRequest);
      setShowModifyModal(false);
      setModifyRequest('');
      setSelectedBooking(null);
      await fetchBookings(); // Refresh list
    } catch (err) {
      console.error('Error requesting modification:', err);
      alert('Failed to submit modification request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: '#ffa500',
      confirmed: '#28a745',
      completed: '#6c757d',
      cancelled: '#dc3545'
    };
    const color = statusColors[status] || '#6c757d';
    return (
      <span
        style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          backgroundColor: color,
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: '600',
          textTransform: 'capitalize'
        }}
      >
        {status}
      </span>
    );
  };

  const isUpcoming = (date) => {
    if (!date) return false;
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>My Bookings</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => isUpcoming(b.get('preferredDate')));
  const pastBookings = bookings.filter(b => !isUpcoming(b.get('preferredDate')));

  return (
    <div className="my-bookings-container">
      <h1>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>You don't have any bookings yet.</p>
          <a href="/booking" style={{ color: '#aa361a', textDecoration: 'underline' }}>
            Book an appointment
          </a>
        </div>
      ) : (
        <>
          {upcomingBookings.length > 0 && (
            <section className="bookings-section">
              <h2>Upcoming Bookings</h2>
              <div className="bookings-list">
                {upcomingBookings.map((booking) => {
                  const status = booking.get('status');
                  const canModify = status === 'pending' || status === 'confirmed';
                  
                  return (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <div>
                          <h3>{booking.get('tattooType') || 'Tattoo'}</h3>
                          <p className="booking-date">
                            {booking.getFormattedDate()} at {booking.get('preferredTime') || 'TBD'}
                          </p>
                        </div>
                        {getStatusBadge(status)}
                      </div>
                      
                      <div className="booking-details">
                        <p><strong>Body Part:</strong> {booking.get('bodyPart') || 'N/A'}</p>
                        {booking.get('customDescription') && (
                          <p><strong>Description:</strong> {booking.get('customDescription')}</p>
                        )}
                        {booking.get('notes') && (
                          <p><strong>Notes:</strong> {booking.get('notes')}</p>
                        )}
                      </div>
                      
                      {canModify && (
                        <div className="booking-actions">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowCancelModal(true);
                            }}
                            className="btn-cancel"
                            disabled={actionLoading}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowModifyModal(true);
                            }}
                            className="btn-modify"
                            disabled={actionLoading}
                          >
                            Request Changes
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {pastBookings.length > 0 && (
            <section className="bookings-section">
              <h2>Past Bookings</h2>
              <div className="bookings-list">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <div>
                        <h3>{booking.get('tattooType') || 'Tattoo'}</h3>
                        <p className="booking-date">
                          {booking.getFormattedDate()} at {booking.get('preferredTime') || 'TBD'}
                        </p>
                      </div>
                      {getStatusBadge(booking.get('status'))}
                    </div>
                    
                    <div className="booking-details">
                      <p><strong>Body Part:</strong> {booking.get('bodyPart') || 'N/A'}</p>
                      {booking.get('customDescription') && (
                        <p><strong>Description:</strong> {booking.get('customDescription')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Booking</h3>
            <p>Are you sure you want to cancel this booking?</p>
            <textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              style={{ width: '100%', margin: '1rem 0', padding: '0.5rem' }}
            />
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedBooking(null);
                }}
                disabled={actionLoading}
                className="btn-secondary"
              >
                No, Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="btn-cancel"
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Modal */}
      {showModifyModal && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowModifyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Request Changes</h3>
            <p>Please describe the changes you'd like to make:</p>
            <textarea
              placeholder="E.g., Change date to next week, different body part, etc."
              value={modifyRequest}
              onChange={(e) => setModifyRequest(e.target.value)}
              rows={4}
              style={{ width: '100%', margin: '1rem 0', padding: '0.5rem' }}
              required
            />
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowModifyModal(false);
                  setModifyRequest('');
                  setSelectedBooking(null);
                }}
                disabled={actionLoading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleModify}
                disabled={actionLoading || !modifyRequest.trim()}
                className="btn-modify"
              >
                {actionLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

