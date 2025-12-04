import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Design from '../models/Design';
import Booking from '../models/Booking';
import './mydesigns.css';

/**
 * MyDesigns Component
 * 
 * Displays all designs submitted by the logged-in user.
 * Shows:
 * - Each design they've submitted
 * - How many people have chosen their design (booking count)
 */
export default function MyDesigns() {
  const { user } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingCounts, setBookingCounts] = useState({});

  useEffect(() => {
    if (user) {
      fetchDesigns();
    }
  }, [user]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch designs from Design model
      const userDesigns = await Design.getUserDesigns(user);
      
      // Also fetch bookings to get reference images as "submitted designs"
      const userBookings = await Booking.getUserBookings(user);
      
      // Create design-like objects from booking reference images
      const bookingDesigns = [];
      userBookings.forEach((booking, bookingIdx) => {
        const referenceImages = booking.get('referenceImages');
        if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
          referenceImages.forEach((image, imgIdx) => {
            if (image && image.url) {
              bookingDesigns.push({
                id: `booking-${booking.id}-img-${imgIdx}`,
                type: 'booking-reference',
                bookingId: booking.id,
                name: `Reference Image from Booking - ${booking.getFormattedDate()}`,
                description: booking.get('customDescription') || 'Reference image from booking submission',
                image: image,
                createdAt: booking.get('createdAt'),
                category: 'Booking Reference',
                available: true,
                sizes: []
              });
            }
          });
        }
      });
      
      // Combine both types of designs
      const allDesigns = [...userDesigns, ...bookingDesigns];
      setDesigns(allDesigns);

      // Fetch booking counts for each design (only for actual Design objects)
      const counts = {};
      for (const design of userDesigns) {
        try {
          const count = await Design.getBookingCount(design.id);
          counts[design.id] = count;
        } catch (err) {
          console.error(`Error fetching booking count for design ${design.id}:`, err);
          counts[design.id] = 0;
        }
      }
      // Booking reference images don't have booking counts
      bookingDesigns.forEach(bd => {
        counts[bd.id] = 0;
      });
      setBookingCounts(counts);
    } catch (err) {
      console.error('Error fetching designs:', err);
      setError('Failed to load designs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (design) => {
    const image = design.get('image');
    if (image) {
      // Handle Parse File object
      if (image.url) {
        return image.url();
      }
      // Handle if it's already a URL string
      if (typeof image === 'string') {
        return image;
      }
    }
    return null; // No fallback - show placeholder instead
  };

  const getImageUrls = (design) => {
    const urls = [];
    
    // Handle booking reference images (plain object)
    if (design.type === 'booking-reference' && design.image) {
      if (design.image.url) {
        urls.push(design.image.url());
      } else if (typeof design.image === 'string') {
        urls.push(design.image);
      }
      return urls;
    }
    
    // Handle Parse Design objects
    const image = design.get ? design.get('image') : design.image;
    
    // Single image field
    if (image) {
      if (image.url) {
        urls.push(image.url());
      } else if (typeof image === 'string') {
        urls.push(image);
      }
    }
    
    // Check for additional images array
    const additionalImages = design.get ? design.get('images') : design.images;
    if (additionalImages && Array.isArray(additionalImages)) {
      additionalImages.forEach(img => {
        if (img && img.url) {
          urls.push(img.url());
        } else if (typeof img === 'string') {
          urls.push(img);
        }
      });
    }
    
    return urls;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading your designs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>My Designs</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="my-designs-container">
      <h1>My Designs</h1>
      <p className="designs-subtitle">View all designs you've submitted</p>

      {designs.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>You haven't submitted any designs yet.</p>
        </div>
      ) : (
        <div className="designs-list">
          {designs.map((design) => {
            const bookingCount = bookingCounts[design.id] || 0;
            const isAvailable = design.get ? design.get('available') !== false : (design.available !== false);
            const designName = design.get ? design.get('name') : design.name;
            const designDescription = design.get ? design.get('description') : design.description;
            const designCategory = design.get ? design.get('category') : design.category;
            const designCreatedAt = design.get ? design.get('createdAt') : design.createdAt;
            const designSizes = design.get ? design.get('sizes') : design.sizes;

            const imageUrls = getImageUrls(design);
            const mainImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

            return (
              <div key={design.id} className="design-card">
                {mainImageUrl ? (
                  <div className="design-image-container">
                    <a
                      href={mainImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="design-image-link"
                    >
                      <img
                        src={mainImageUrl}
                        alt={designName || 'Design'}
                        className="design-image"
                      />
                    </a>
                    {!isAvailable && (
                      <div className="unavailable-badge">Unavailable</div>
                    )}
                    {imageUrls.length > 1 && (
                      <div className="multiple-images-badge">
                        +{imageUrls.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="design-image-container no-image">
                    <div className="no-image-placeholder">
                      <span>No Image</span>
                    </div>
                    {!isAvailable && (
                      <div className="unavailable-badge">Unavailable</div>
                    )}
                  </div>
                )}

                <div className="design-info">
                  <div className="design-header">
                    <h3>{designName || 'Untitled Design'}</h3>
                    {design.type === 'booking-reference' ? (
                      <span className="booking-reference-badge">From Booking</span>
                    ) : (
                      <span className="booking-count-badge">
                        {bookingCount} {bookingCount === 1 ? 'booking' : 'bookings'}
                      </span>
                    )}
                  </div>

                  <p className="design-description">
                    {designDescription || 'No description provided.'}
                  </p>

                  <div className="design-meta">
                    <div className="meta-item">
                      <strong>Category:</strong> {designCategory || 'Uncategorized'}
                    </div>
                    <div className="meta-item">
                      <strong>Submitted:</strong> {formatDate(designCreatedAt)}
                    </div>
                    {design.type !== 'booking-reference' && (
                      <div className="meta-item">
                        <strong>Status:</strong>{' '}
                        <span className={isAvailable ? 'status-available' : 'status-unavailable'}>
                          {isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    )}
                  </div>

                  {designSizes && designSizes.length > 0 && (
                    <div className="design-sizes">
                      <strong>Available Sizes:</strong>
                      <div className="sizes-list">
                        {designSizes.map((size, idx) => (
                          <span key={idx} className="size-tag">
                            {size.name || `Size ${idx + 1}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {imageUrls.length > 1 && (
                    <div className="design-additional-images">
                      <strong>Additional Images:</strong>
                      <div className="additional-images-grid">
                        {imageUrls.slice(1).map((imageUrl, idx) => (
                          <a
                            key={idx}
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="additional-image-link"
                          >
                            <img
                              src={imageUrl}
                              alt={`${designName || 'Design'} - Image ${idx + 2}`}
                              className="additional-image-thumbnail"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

