import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Design from '../models/Design';
import './admindesignsdashboard.css';

/**
 * AdminDesignsDashboard Component
 * 
 * Admin-only dashboard for managing all submitted designs.
 * Features:
 * - View all designs from Parse
 * - Monitor designs for appropriateness and feasibility
 * - Delete/remove designs
 */
export default function AdminDesignsDashboard() {
  const { user } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [bookingCounts, setBookingCounts] = useState({});
  const [filterAvailable, setFilterAvailable] = useState('all');

  // Check if user is admin
  const isAdmin = user && (
    user.get('isAdmin') === true ||
    user.get('email') === 'admin@melvink.com' ||
    user.get('username') === 'admin'
  );

  useEffect(() => {
    if (user && isAdmin) {
      fetchDesigns();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (designs.length > 0) {
      fetchBookingCounts();
    }
  }, [designs]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const allDesigns = await Design.getAllDesigns();
      setDesigns(allDesigns);
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

  const handleDelete = async () => {
    if (!selectedDesign) return;

    try {
      setActionLoading(true);
      await selectedDesign.deleteDesign();
      setShowDeleteModal(false);
      setSelectedDesign(null);
      await fetchDesigns(); // Refresh list
    } catch (err) {
      console.error('Error deleting design:', err);
      alert('Failed to delete design. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (design) => {
    const image = design.get('image');
    if (image && image.url) {
      return image.url();
    }
    return '/images/design1.png'; // Fallback image
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredDesigns = designs.filter(design => {
    if (filterAvailable === 'all') return true;
    if (filterAvailable === 'available') return design.get('available') !== false;
    if (filterAvailable === 'unavailable') return design.get('available') === false;
    return true;
  });

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
        <p>Loading designs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Admin Designs Dashboard</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-designs-dashboard-container">
      <h1>Admin Designs Dashboard</h1>
      <p className="dashboard-subtitle">Monitor and manage all submitted designs</p>

      {/* Filters */}
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

        <div className="designs-summary">
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
            const isAvailable = design.get('available') !== false;
            const submittedBy = design.get('submittedByEmail') || 'Unknown';

            return (
              <div key={design.id} className="admin-design-card">
                <div className="admin-design-image-container">
                  <img
                    src={getImageUrl(design)}
                    alt={design.get('name') || 'Design'}
                    className="admin-design-image"
                  />
                  {!isAvailable && (
                    <div className="unavailable-badge">Unavailable</div>
                  )}
                </div>

                <div className="admin-design-info">
                  <div className="admin-design-header">
                    <div>
                      <h3>{design.get('name') || 'Untitled Design'}</h3>
                      <p className="design-submitter">Submitted by: {submittedBy}</p>
                    </div>
                    <div className="admin-design-badges">
                      <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <span className="booking-count-badge">
                        {bookingCount} {bookingCount === 1 ? 'booking' : 'bookings'}
                      </span>
                    </div>
                  </div>

                  <p className="admin-design-description">
                    {design.get('description') || 'No description provided.'}
                  </p>

                  <div className="admin-design-meta">
                    <div className="meta-item">
                      <strong>Category:</strong> {design.get('category') || 'Uncategorized'}
                    </div>
                    <div className="meta-item">
                      <strong>Submitted:</strong> {formatDate(design.get('createdAt'))}
                    </div>
                    <div className="meta-item">
                      <strong>Last Updated:</strong> {formatDate(design.get('updatedAt'))}
                    </div>
                  </div>

                  {design.get('sizes') && design.get('sizes').length > 0 && (
                    <div className="admin-design-sizes">
                      <strong>Available Sizes:</strong>
                      <div className="sizes-list">
                        {design.get('sizes').map((size, idx) => (
                          <span key={idx} className="size-tag">
                            {size.name || `Size ${idx + 1}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="admin-design-actions">
                    <button
                      onClick={() => {
                        setSelectedDesign(design);
                        setShowDeleteModal(true);
                      }}
                      className="btn-delete"
                    >
                      Delete Design
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDesign && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Design</h3>
            <p><strong>Design Name:</strong> {selectedDesign.get('name') || 'Untitled Design'}</p>
            <p style={{ color: '#dc3545', fontWeight: '600' }}>
              Are you sure you want to delete this design? This action cannot be undone.
            </p>
            {bookingCounts[selectedDesign.id] > 0 && (
              <p style={{ color: '#ffa500', fontWeight: '600' }}>
              Warning: This design has {bookingCounts[selectedDesign.id]} associated booking(s).
              </p>
            )}
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDesign(null);
                }}
                disabled={actionLoading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="btn-delete"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Design'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

