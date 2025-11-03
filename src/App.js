import './App.css';
import './index.css';
import './designs.css';
import './booking.css';
import './schedule.css';
import './qa.css';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParseForm } from './hooks/useParseData';
import Booking from './models/Booking';
import Client from './models/Client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRouteGuard from './components/AuthRouteGuard';

function Home() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>Welcome to My Tattoo Homebase</h1>
        <p>Hello! Explore my schedule, booking information, and available tattoo designs. Inspired by Korean traditional aesthetics, each piece blends modern minimalism with timeless brushwork.</p>
      </div>
      <div className="hero-media">
        <img src="/images/sample.png" alt="Sample Tattoo" />
      </div>
    </section>
  );
}

function Designs() {
  const navigate = useNavigate();
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch designs from JSON file instead of Parse
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/data/designs.json');
        if (!response.ok) {
          throw new Error('Failed to load designs');
        }
        const json = await response.json();
        setDesigns(json.designs || []);
      } catch (err) {
        console.error('Error fetching designs:', err);
        setError(err.message || 'Failed to load designs');
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setSelectedDesign(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Available Designs</h1>
      {loading && <p>Loading designs...</p>}
      {error && <p style={{ color: 'red' }}>Failed to load: {error}</p>}
      {!loading && !error && designs && designs.length > 0 && (
        <div className="design-gallery">
          {designs.map((d, index) => (
            <div key={d.id || index} className={`design-card ${!d.available ? 'unavailable' : ''}`}>
              <img
                src={d.image || `/images/design${(index % 2) + 1}.png`}
                alt={d.name}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDesign(d)}
                onKeyDown={(e) => (e.key === 'Enter' ? setSelectedDesign(d) : null)}
              />
              <div className="design-info">
                <h3>{d.name}</h3>
                <p>{d.description}</p>
                {!d.available && <span className="unavailable-badge">Unavailable</span>}
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => navigate('/booking')}
                    className="nav-btn"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && (!designs || designs.length === 0) && (
        <p>No designs available at this time.</p>
      )}

      {selectedDesign && (
        <div
          onClick={() => setSelectedDesign(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              maxWidth: '85vw',
              maxHeight: '85vh',
              padding: 12,
              borderRadius: 10,
              boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <button
              onClick={() => setSelectedDesign(null)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                border: 'none',
                background: '#ffffff',
                padding: '6px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
              }}
            >
              ✕
            </button>
            <img
              src={selectedDesign.image || `/images/design1.png`}
              alt={selectedDesign.name}
              style={{
                display: 'block',
                maxWidth: '82vw',
                maxHeight: '78vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FAQ() {
  // For now, we'll keep using JSON data since we don't have a FAQ Parse model
  // This demonstrates the fallback approach when Parse models aren't available
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/faq.json');
        const json = await response.json();
        setFaqs(json.faqs || []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };
    
    fetchFAQs();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Q & A</h1>
      {loading && <p>Loading FAQs...</p>}
      {error && <p style={{ color: 'red' }}>Failed to load: {error}</p>}
      {!loading && !error && (
        <div className="faq-section">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <h3 className="faq-question">{faq.question}</h3>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Schedule() {
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [calendarDays, setCalendarDays] = useState([]);
  const [hoveredCity, setHoveredCity] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const citySchedule = useMemo(() => ({
    8: { // September
      'New York': { start: 1, end: 14 },
      'Los Angeles': { start: 15, end: 28 },
      'Las Vegas': { start: 29, end: 30 }
    },
    9: { 'New York': { start: 1, end: 14 }, 'Los Angeles': { start: 15, end: 28 }, 'Las Vegas': { start: 29, end: 31 } },
    10: { 'New York': { start: 1, end: 14 }, 'Los Angeles': { start: 15, end: 28 }, 'Las Vegas': { start: 29, end: 30 } },
    11: { 'New York': { start: 1, end: 14 }, 'Los Angeles': { start: 15, end: 28 }, 'Las Vegas': { start: 29, end: 31 } }
  }), []);

  const fullyBookedDays = useMemo(() => ({
    8: [2, 6, 11, 17, 21, 24, 29],
    9: [3, 7, 12, 18, 22, 25, 30],
    10: [2, 8, 15, 19, 24, 28],
    11: [5, 9, 16, 20, 26, 29]
  }), []);

  const getCityForDay = useCallback((month, day) => {
    const monthSchedule = citySchedule[month];
    if (!monthSchedule) return '';
    for (const city in monthSchedule) {
      const range = monthSchedule[city];
      if (day >= range.start && day <= range.end) return city;
    }
    return '';
  }, [citySchedule]);

  const isDayFullyBooked = useCallback((month, day) => {
    const monthBookedDays = fullyBookedDays[month];
    return monthBookedDays && monthBookedDays.includes(day);
  }, [fullyBookedDays]);

  const generateCalendar = useCallback((year, month) => {
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ dayNumber: '', currentMonth: false, available: false, fullyBooked: false, city: '' });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const city = getCityForDay(month, day);
      const fullyBooked = isDayFullyBooked(month, day);
      const available = !fullyBooked && city !== '';
      days.push({ dayNumber: day, currentMonth: true, available, fullyBooked, city });
    }
    setCalendarDays(days);
  }, [getCityForDay, isDayFullyBooked]);

  useEffect(() => {
    generateCalendar(currentYear, currentMonth);
  }, [currentYear, currentMonth, generateCalendar]);

  function previousMonth() {
    let m = currentMonth - 1;
    let y = currentYear;
    if (m < 0) { m = 11; y -= 1; }
    setCurrentMonth(m);
    setCurrentYear(y);
  }

  function nextMonth() {
    let m = currentMonth + 1;
    let y = currentYear;
    if (m > 11) { m = 0; y += 1; }
    setCurrentMonth(m);
    setCurrentYear(y);
  }

  function toggleSelectedCity(city) {
    setSelectedCity((prev) => (prev === city ? '' : city));
  }

  function goToBooking(dayNumber) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    sessionStorage.setItem('selectedDate', dateStr);
    navigate('/booking');
  }

  return (
    <div className="schedule-container">
      <h1>Schedule</h1>

      <div className="month-navigation">
        <button onClick={previousMonth} className="nav-btn">&lt;</button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <button onClick={nextMonth} className="nav-btn">&gt;</button>
      </div>

      <div className="calendar-container">
        <div className="calendar-header">
          {daysOfWeek.map((day) => (
            <div key={day} className="day-header">{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((day, idx) => {
            const isHighlighted = selectedCity ? day.city === selectedCity : (hoveredCity && day.city === hoveredCity);
            const classNames = [
              'calendar-day',
              !day.currentMonth ? 'other-month' : '',
              day.fullyBooked ? 'fully-booked' : '',
              day.available && !day.fullyBooked ? 'available' : '',
              day.city === 'New York' ? 'city-newyork' : '',
              day.city === 'Los Angeles' ? 'city-losangeles' : '',
              day.city === 'Las Vegas' ? 'city-lasvegas' : '',
              isHighlighted ? 'highlighted' : '',
              day.available && !day.fullyBooked && day.currentMonth ? 'clickable' : ''
            ].filter(Boolean).join(' ');

            return (
              <div
                key={idx}
                className={classNames}
                onClick={() => (day.available && !day.fullyBooked && day.currentMonth ? goToBooking(day.dayNumber) : null)}
              >
                <div className="day-number">{day.dayNumber}</div>
                <div className="day-info">
                  {day.city && <div className="city">{day.city}</div>}
                  {day.fullyBooked && <div className="status">✕</div>}
                  {!day.fullyBooked && day.available && <div className="status">✓</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="legend">
        <h3>Legend</h3>
        <div className="legend-items">
          <div
            className="legend-item"
            onMouseEnter={() => setHoveredCity('New York')}
            onMouseLeave={() => setHoveredCity('')}
            onClick={() => toggleSelectedCity('New York')}
            role="checkbox"
            aria-checked={selectedCity === 'New York'}
            tabIndex={0}
          >
            <div className={`legend-color city-newyork ${selectedCity === 'New York' ? 'selected' : ''}`}></div>
            <span>New York</span>
          </div>
          <div
            className="legend-item"
            onMouseEnter={() => setHoveredCity('Los Angeles')}
            onMouseLeave={() => setHoveredCity('')}
            onClick={() => toggleSelectedCity('Los Angeles')}
            role="checkbox"
            aria-checked={selectedCity === 'Los Angeles'}
            tabIndex={0}
          >
            <div className={`legend-color city-losangeles ${selectedCity === 'Los Angeles' ? 'selected' : ''}`}></div>
            <span>Los Angeles</span>
          </div>
          <div
            className="legend-item"
            onMouseEnter={() => setHoveredCity('Las Vegas')}
            onMouseLeave={() => setHoveredCity('')}
            onClick={() => toggleSelectedCity('Las Vegas')}
            role="checkbox"
            aria-checked={selectedCity === 'Las Vegas'}
            tabIndex={0}
          >
            <div className={`legend-color city-lasvegas ${selectedCity === 'Las Vegas' ? 'selected' : ''}`}></div>
            <span>Las Vegas</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol">✕</div>
            <span>Fully Booked</span>
          </div>
          <div className="legend-item">
            <div className="legend-symbol">✓</div>
            <span>Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingPage() {
  const [bookingInfo, setBookingInfo] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tattooType: 'flash-everyone',
    bodyPart: 'arm',
    preferredDate: '',
    preferredTime: '',
    customDescription: '',
    referenceImages: []
  });
  const [submitMessage, setSubmitMessage] = useState('');

  // Use Parse form hook for form submission
  const { submit, loading: submitting, reset } = useParseForm(
    async (data) => {
      // Create or update client first
      const client = await Client.createOrUpdateClient({
        name: data.name,
        email: data.email,
        phone: data.phone
      });
      
      // Create booking
      const booking = await Booking.createBooking({
        ...data,
        clientId: client.id
      });
      
      return booking;
    }
  );

  useEffect(() => {
    const fetchBookingInfo = async () => {
      try {
        const response = await fetch('/data/booking.json');
        const json = await response.json();
        setBookingInfo(json);
      } catch (e) {
        setError(String(e));
      }
    };
    
    fetchBookingInfo();
  }, []);

  // Prefill selected date from sessionStorage if present
  useEffect(() => {
    const selectedDate = sessionStorage.getItem('selectedDate');
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, preferredDate: selectedDate }));
      sessionStorage.removeItem('selectedDate');
    }
  }, []);

  if (!bookingInfo) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Booking Info</h1>
      {error && <p style={{ color: 'red' }}>Failed to load: {error}</p>}
      
      <div className="form-section">
        <div className="form-container">
          <fieldset>
            <legend>Procedure</legend>
            <ul>
              {bookingInfo.procedure?.map((item, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
              ))}
            </ul>
          </fieldset>

          <fieldset>
            <legend>Additional Information</legend>
            <ul>
              {bookingInfo.additionalInfo?.map((item, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
              ))}
            </ul>
          </fieldset>

          <fieldset>
            <legend>Tattoo Types</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {bookingInfo.tattooTypes?.map((type) => (
                <span key={type.value} style={{ padding: '0.25rem 0.75rem', background: '#f0f0f0', borderRadius: '1rem' }}>
                  {type.label}
                </span>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Body Parts</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {bookingInfo.bodyParts?.map((part) => (
                <span key={part} style={{ padding: '0.25rem 0.75rem', background: '#f0f0f0', borderRadius: '1rem' }}>
                  {part}
                </span>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Booking Form (matches original fields) */}
      <section className="form-section">
        <h2>Booking Form</h2>
        {submitMessage && (
          <div className={`submit-message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>
            {submitMessage}
          </div>
        )}
        <form
          className="form-container"
          onSubmit={async (e) => {
            e.preventDefault();
            reset();
            
            // Basic required validation
            if (!formData.name || !formData.email || !formData.tattooType || !formData.bodyPart || !formData.preferredDate) {
              setSubmitMessage('Please fill in all required fields correctly.');
              return;
            }
            
            try {
              await submit(formData);
              setSubmitMessage('Form submitted successfully. I will get back to you shortly.');
              // Reset form
              setFormData({
                name: '',
                email: '',
                phone: '',
                tattooType: 'flash-everyone',
                bodyPart: 'arm',
                preferredDate: '',
                preferredTime: '',
                customDescription: '',
                referenceImages: []
              });
            } catch (err) {
              setSubmitMessage('Failed to submit form. Please try again.');
            }
          }}
        >
          <fieldset>
            <legend>Personal Information</legend>
            <div className="form-group">
              <label htmlFor="name">Full Name: *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email: *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number:</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Tattoo Information</legend>
            <div className="form-group">
              <label htmlFor="tattooType">Tattoo Type: *</label>
              <select
                id="tattooType"
                value={formData.tattooType}
                onChange={(e) => setFormData({ ...formData, tattooType: e.target.value })}
                required
              >
                <option value="flash-everyone">Flash for Everyone</option>
                <option value="flash-one">Flash for Only One</option>
                <option value="custom">Custom Design</option>
                <option value="cover-up">Cover-up</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bodyPart">Body Part: *</label>
              <select
                id="bodyPart"
                value={formData.bodyPart}
                onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
                required
              >
                <option value="arm">Arm</option>
                <option value="leg">Leg</option>
                <option value="back">Back</option>
                <option value="chest">Chest</option>
                <option value="shoulder">Shoulder</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferredDate">Preferred Date: *</label>
              <input
                type="date"
                id="preferredDate"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredTime">Preferred Time:</label>
              <select
                id="preferredTime"
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              >
                <option value="">Select a time</option>
                <option value="morning">Morning (9AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="customDescription">Design Description:</label>
              <textarea
                id="customDescription"
                rows={4}
                placeholder="Describe your desired tattoo design..."
                value={formData.customDescription}
                onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="referenceImages">Reference Images:</label>
              <input
                type="file"
                id="referenceImages"
                accept="image/*"
                multiple
                onChange={(e) => setFormData({ ...formData, referenceImages: Array.from(e.target.files || []) })}
              />
              <small>Upload photos of the design, body area, and size reference</small>
            </div>
          </fieldset>

          <div className="form-buttons">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Booking'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmitMessage('');
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  tattooType: 'flash-everyone',
                  bodyPart: 'arm',
                  preferredDate: '',
                  preferredTime: '',
                  customDescription: '',
                  referenceImages: []
                });
              }}
            >
              Reset Form
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

// Navigation component that uses auth context
function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  return (
    <header>
      <nav className="site-nav">
        <Link className="brand" to="/">MelvInk</Link>
        <ul className="menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/schedule">Schedule</Link></li>
          <li><Link to="/booking">Booking Info</Link></li>
          <li><Link to="/designs">Available Designs</Link></li>
          <li><Link to="/faq">Q & A</Link></li>
          {isAuthenticated ? (
            <>
              <li style={{ marginLeft: 'auto' }}>
                <span style={{ color: '#666', padding: '0 1rem' }}>
                  {user?.username || 'User'}
                </span>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: loggingOut ? 'not-allowed' : 'pointer',
                    padding: '0.5rem 1rem',
                    fontSize: '1rem',
                    opacity: loggingOut ? 0.6 : 1
                  }}
                >
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </li>
            </>
          ) : (
            <li style={{ marginLeft: 'auto' }}>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/designs" element={<Designs />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/schedule" element={<Schedule />} />
      {/* Protected route - requires authentication */}
      <Route 
        path="/booking" 
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } 
      />
      {/* Auth routes - cannot be accessed if already logged in */}
      <Route 
        path="/login" 
        element={
          <AuthRouteGuard>
            <Login />
          </AuthRouteGuard>
        } 
      />
      <Route 
        path="/register" 
        element={
          <AuthRouteGuard>
            <Register />
          </AuthRouteGuard>
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <main>
          <AppRoutes />
        </main>
        <footer>
          <p>Melvin Pineda and Michael Sorenson</p>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}
