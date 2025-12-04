import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Booking from '../models/Booking';
import Design from '../models/Design';
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
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'designs'
  
  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');
  
  // Designs state
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showDeleteDesignModal, setShowDeleteDesignModal] = useState(false);
  const [bookingCounts, setBookingCounts] = useState({});
  
  // Shared state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if user is admin (you can customize this logic)
  const isAdmin = user && (
    user.get('isAdmin') === true ||
    user.get('email') === 'admin@melvink.com' ||
    user.get('username') === 'admin'
  );

  useEffect(() => {
    if (user && isAdmin) {
      if (activeTab === 'bookings') {
        fetchBookings();
      } else if (activeTab === 'designs') {
        fetchDesigns();
      }
    }
  }, [user, isAdmin, activeTab]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      applyFilters();
    }
  }, [bookings, statusFilter, dateFilter, activeTab]);

  useEffect(() => {
    if (activeTab === 'designs') {
      applyDesignFilters();
    }
  }, [designs, filterAvailable, activeTab]);

  useEffect(() => {
    if (designs.length > 0 && activeTab === 'designs') {
      fetchBookingCounts();
    }
  }, [designs, activeTab]);

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

  // Designs functions
  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all Design objects from Parse
      const allDesigns = await Design.getAllDesigns();
      
      // Also fetch all bookings to get reference images (these show up in "My Designs")
      const allBookings = await Booking.getAllBookings();
      
      // Create design-like objects from booking reference images
      const bookingDesigns = [];
      allBookings.forEach((booking) => {
        const referenceImages = booking.get('referenceImages');
        if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
          referenceImages.forEach((image, imgIdx) => {
            if (image && image.url) {
              bookingDesigns.push({
                id: `booking-${booking.id}-img-${imgIdx}`,
                type: 'booking-reference',
                bookingId: booking.id,
                imageIndex: imgIdx, // Store the index for easy removal
                name: `Reference Image - ${booking.get('clientName') || 'Unknown'} (${booking.getFormattedDate()})`,
                description: booking.get('customDescription') || 'Reference image from booking submission',
                image: image,
                createdAt: booking.get('createdAt'),
                category: 'Booking Reference',
                available: true,
                sizes: [],
                submittedByEmail: booking.get('clientEmail')
              });
            }
          });
        }
      });
      
      // Combine both types of designs
      const combinedDesigns = [...allDesigns, ...bookingDesigns];
      setDesigns(combinedDesigns);
    } catch (err) {
      console.error('Error fetching designs:', err);
      setError('Failed to load designs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingCounts = async () => {
    const counts = {};
    for (const design of designs) {
      // Only count bookings for actual Design objects, not booking references
      if (design.type === 'booking-reference') {
        counts[design.id] = 0;
        continue;
      }
      try {
        const count = await Design.getBookingCount(design.id);
        counts[design.id] = count;
      } catch (err) {
        console.error(`Error fetching booking count for design ${design.id}:`, err);
        counts[design.id] = 0;
      }
    }
    setBookingCounts(counts);
  };

  const applyDesignFilters = () => {
    let filtered = [...designs];
    if (filterAvailable !== 'all') {
      if (filterAvailable === 'available') {
        filtered = filtered.filter(d => {
          if (d.type === 'booking-reference') return true; // Always show booking references
          return d.get('available') !== false;
        });
      } else if (filterAvailable === 'unavailable') {
        filtered = filtered.filter(d => {
          if (d.type === 'booking-reference') return false; // Hide booking references in unavailable filter
          return d.get('available') === false;
        });
      }
    }
    setFilteredDesigns(filtered);
  };

  const handleDeleteDesign = async () => {
    if (!selectedDesign) return;

    try {
      setActionLoading(true);
      
      // If it's a booking reference image, remove it from the booking
      if (selectedDesign.type === 'booking-reference') {
        try {
          // Fetch the booking
          const booking = await Booking.getBookingById(selectedDesign.bookingId);
          const referenceImages = booking.get('referenceImages') || [];
          
          // Remove the image at the stored index
          if (selectedDesign.imageIndex !== undefined && referenceImages[selectedDesign.imageIndex]) {
            referenceImages.splice(selectedDesign.imageIndex, 1);
            booking.set('referenceImages', referenceImages);
            
            // Add note about deletion
            const existingNotes = booking.get('notes') || '';
            const deletionNote = 'Reference image deleted because inappropriate.';
            const updatedNotes = existingNotes 
              ? `${existingNotes}\n${deletionNote}`
              : deletionNote;
            booking.set('notes', updatedNotes);
            
            await booking.save();
            console.log('Removed reference image from booking');
          } else {
            // Fallback: try to find by URL if index is not available
            const imageIndex = referenceImages.findIndex((img) => {
              if (img && img.url && selectedDesign.image && selectedDesign.image.url) {
                return img.url() === selectedDesign.image.url();
              }
              return false;
            });
            
            if (imageIndex !== -1) {
              referenceImages.splice(imageIndex, 1);
              booking.set('referenceImages', referenceImages);
              
              // Add note about deletion
              const existingNotes = booking.get('notes') || '';
              const deletionNote = 'Reference image deleted because inappropriate.';
              const updatedNotes = existingNotes 
                ? `${existingNotes}\n${deletionNote}`
                : deletionNote;
              booking.set('notes', updatedNotes);
              
              await booking.save();
              console.log('Removed reference image from booking (by URL match)');
            } else {
              throw new Error('Could not find image to remove');
            }
          }
        } catch (err) {
          console.error('Error removing reference image from booking:', err);
          alert('Failed to delete reference image. Please try again.');
          return;
        }
      } else {
        // Delete actual Design object
        await selectedDesign.deleteDesign();
      }
      
      setShowDeleteDesignModal(false);
      setSelectedDesign(null);
      await fetchDesigns(); // Refresh list
    } catch (err) {
      console.error('Error deleting design:', err);
      alert('Failed to delete design. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getDesignImageUrl = (design) => {
    // Handle booking reference images
    if (design.type === 'booking-reference' && design.image) {
      if (design.image.url) {
        return design.image.url();
      } else if (typeof design.image === 'string') {
        return design.image;
      }
    }
    
    // Handle Parse Design objects
    const image = design.get ? design.get('image') : design.image;
    if (image) {
      if (image.url) {
        return image.url();
      } else if (typeof image === 'string') {
        return image;
      }
    }
    return '/images/design1.png';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  if (error && !loading) {
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
      <p className="dashboard-subtitle">Manage all bookings and user-submitted designs</p>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button
          className={`admin-tab ${activeTab === 'designs' ? 'active' : ''}`}
          onClick={() => setActiveTab('designs')}
        >
          User Designs
        </button>
      </div>

      {loading && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading {activeTab === 'bookings' ? 'bookings' : 'designs'}...</p>
        </div>
      )}

      {/* Bookings Tab Content */}
      {!loading && activeTab === 'bookings' && (
        <>
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
        </>
      )}

      {/* Designs Tab Content */}
      {!loading && activeTab === 'designs' && (
        <>
          {/* Design Filters */}
          <div className="dashboard-filters">
            <div className="filter-group">
              <label htmlFor="filterAvailable">Filter by Availability:</label>
              <select
                id="filterAvailable"
                value={filterAvailable}
                onChange={(e) => setFilterAvailable(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Designs</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>

            <div className="bookings-summary">
              <p>
                Showing <strong>{filteredDesigns.length}</strong> of <strong>{designs.length}</strong> designs
              </p>
            </div>
          </div>

          {/* Designs List */}
          {filteredDesigns.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>No designs found matching your filters.</p>
            </div>
          ) : (
            <div className="admin-designs-list">
              {filteredDesigns.map((design) => {
                const bookingCount = bookingCounts[design.id] || 0;
                const isAvailable = design.get ? design.get('available') !== false : (design.available !== false);
                const submittedBy = design.get ? design.get('submittedByEmail') : (design.submittedByEmail || 'Unknown');
                const designName = design.get ? design.get('name') : design.name;
                const designDescription = design.get ? design.get('description') : design.description;
                const designCategory = design.get ? design.get('category') : design.category;
                const designCreatedAt = design.get ? design.get('createdAt') : design.createdAt;

                return (
                  <div key={design.id} className="admin-design-card">
                    <div className="admin-design-image-container">
                      <img
                        src={getDesignImageUrl(design)}
                        alt={designName || 'Design'}
                        className="admin-design-image"
                      />
                      {!isAvailable && (
                        <div className="unavailable-badge">Unavailable</div>
                      )}
                    </div>

                    <div className="admin-design-info">
                      <div className="admin-design-header">
                        <div>
                          <h3>{designName || 'Untitled Design'}</h3>
                          <p className="design-submitter">Submitted by: {submittedBy}</p>
                          {design.type === 'booking-reference' && (
                            <p className="design-submitter" style={{ color: '#17a2b8', fontStyle: 'italic' }}>
                              (From Booking)
                            </p>
                          )}
                        </div>
                        <div className="admin-design-badges">
                          {design.type !== 'booking-reference' && (
                            <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                              {isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          )}
                          {design.type === 'booking-reference' ? (
                            <span className="booking-reference-badge">Booking Reference</span>
                          ) : (
                            <span className="booking-count-badge">
                              {bookingCount} {bookingCount === 1 ? 'booking' : 'bookings'}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="admin-design-description">
                        {designDescription || 'No description provided.'}
                      </p>

                      <div className="admin-design-meta">
                        <div className="meta-item">
                          <strong>Category:</strong> {designCategory || 'Uncategorized'}
                        </div>
                        <div className="meta-item">
                          <strong>Submitted:</strong> {formatDate(designCreatedAt)}
                        </div>
                      </div>

                      <div className="admin-design-actions">
                        <button
                          onClick={() => {
                            setSelectedDesign(design);
                            setShowDeleteDesignModal(true);
                          }}
                          className="btn-delete"
                        >
                          {design.type === 'booking-reference' ? 'Delete Image' : 'Delete Design'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delete Design Modal */}
          {showDeleteDesignModal && selectedDesign && (
            <div className="modal-overlay" onClick={() => !actionLoading && setShowDeleteDesignModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{selectedDesign.type === 'booking-reference' ? 'Delete Reference Image' : 'Delete Design'}</h3>
                <p><strong>{selectedDesign.type === 'booking-reference' ? 'Image' : 'Design Name'}:</strong> {(selectedDesign.get ? selectedDesign.get('name') : selectedDesign.name) || 'Untitled Design'}</p>
                <p style={{ color: '#dc3545', fontWeight: '600' }}>
                  Are you sure you want to delete this {selectedDesign.type === 'booking-reference' ? 'image' : 'design'}? This action cannot be undone.
                </p>
                {selectedDesign.type !== 'booking-reference' && bookingCounts[selectedDesign.id] > 0 && (
                  <p style={{ color: '#ffa500', fontWeight: '600' }}>
                    Warning: This design has {bookingCounts[selectedDesign.id]} associated booking(s).
                  </p>
                )}
                {selectedDesign.type === 'booking-reference' && (
                  <p style={{ color: '#17a2b8', fontWeight: '600' }}>
                    This will remove the image from the booking record. The booking itself will remain.
                  </p>
                )}
                <div className="modal-actions">
                  <button
                    onClick={() => {
                      setShowDeleteDesignModal(false);
                      setSelectedDesign(null);
                    }}
                    disabled={actionLoading}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteDesign}
                    disabled={actionLoading}
                    className="btn-delete"
                  >
                    {actionLoading ? 'Deleting...' : 'Yes, Delete Design'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

