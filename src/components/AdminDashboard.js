import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Booking from '../models/Booking';
import './admindashboard.css';

/**
 * AdminDashboard Component
 * 
 * Admin-only dashboard for managing all bookings.
 * Features:
 * - View all bookings
 * - Filter by status and date
 * - Update booking statuses (pending → confirmed/cancelled)
 * - Add notes to bookings
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Check if user is admin (you can customize this logic)
  const isAdmin = user && (
    user.get('isAdmin') === true ||
    user.get('email') === 'admin@melvink.com' ||
    user.get('username') === 'admin'
  );

  useEffect(() => {
    if (user && isAdmin) {
      fetchBookings();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const allBookings = await Booking.getAllBookings();
      setBookings(allBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.get('status') === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      const filterDateEnd = new Date(dateFilter);
      filterDateEnd.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.get('preferredDate'));
        return bookingDate >= filterDate && bookingDate <= filterDateEnd;
      });
    }

    setFilteredBookings(filtered);
  };

  const handleStatusUpdate = async () => {
    if (!selectedBooking) return;

    try {
      setActionLoading(true);
      await selectedBooking.updateStatus(newStatus, adminNotes);
      setShowStatusModal(false);
      setNewStatus('pending');
      setAdminNotes('');
      setSelectedBooking(null);
      await fetchBookings(); // Refresh list
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status. Please try again.');
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

  const getReferenceImageUrls = (booking) => {
    const referenceImages = booking.get('referenceImages');
    if (!referenceImages || !Array.isArray(referenceImages) || referenceImages.length === 0) {
      return [];
    }
    return referenceImages.map(img => {
      if (img && img.url) {
        return img.url();
      }
      return null;
    }).filter(url => url !== null);
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      <p className="dashboard-subtitle">Manage all bookings and appointments</p>

      {/* Filters */}
      <div className="dashboard-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="dateFilter">Filter by Date:</label>
          <input
            type="date"
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-input"
          />
        </div>

        <button
          onClick={() => {
            setStatusFilter('all');
            setDateFilter('');
          }}
          className="btn-clear-filters"
        >
          Clear Filters
        </button>
      </div>

      {/* Bookings List */}
      <div className="bookings-summary">
        <p>
          Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
        </p>
      </div>

      {filteredBookings.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No bookings found matching your filters.</p>
        </div>
      ) : (
        <div className="admin-bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="admin-booking-card">
              <div className="admin-booking-header">
                <div>
                  <h3>{booking.get('clientName') || 'Unknown Client'}</h3>
                  <p className="booking-email">{booking.get('clientEmail')}</p>
                  <p className="booking-phone">{booking.get('clientPhone') || 'No phone'}</p>
                </div>
                {getStatusBadge(booking.get('status'))}
              </div>

              <div className="admin-booking-details">
                <div className="detail-row">
                  <strong>Tattoo Type:</strong> {booking.get('tattooType') || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Body Part:</strong> {booking.get('bodyPart') || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Date:</strong> {booking.getFormattedDate()}
                </div>
                <div className="detail-row">
                  <strong>Time:</strong> {booking.get('preferredTime') || 'TBD'}
                </div>
                {booking.get('customDescription') && (
                  <div className="detail-row">
                    <strong>Description:</strong> {booking.get('customDescription')}
                  </div>
                )}
                {booking.get('notes') && (
                  <div className="detail-row notes">
                    <strong>Notes:</strong> {booking.get('notes')}
                  </div>
                )}
                {getReferenceImageUrls(booking).length > 0 && (
                  <div className="detail-row reference-images">
                    <strong>Reference Images:</strong>
                    <div className="reference-images-grid">
                      {getReferenceImageUrls(booking).map((imageUrl, idx) => (
                        <a
                          key={idx}
                          href={imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="reference-image-link"
                        >
                          <img
                            src={imageUrl}
                            alt={`Reference ${idx + 1}`}
                            className="reference-image-thumbnail"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-booking-actions">
                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                    setNewStatus(booking.get('status'));
                    setAdminNotes(booking.get('notes') || '');
                    setShowStatusModal(true);
                  }}
                  className="btn-update-status"
                >
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Update Booking Status</h3>
            <p><strong>Client:</strong> {selectedBooking.get('clientName')}</p>
            <p><strong>Date:</strong> {selectedBooking.getFormattedDate()}</p>

            <div className="modal-form-group">
              <label htmlFor="newStatus">New Status:</label>
              <select
                id="newStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="modal-select"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label htmlFor="adminNotes">Admin Notes:</label>
              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="modal-textarea"
                placeholder="Add any notes about this booking..."
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedBooking(null);
                  setNewStatus('pending');
                  setAdminNotes('');
                }}
                disabled={actionLoading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className="btn-update"
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

