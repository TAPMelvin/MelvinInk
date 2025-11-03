# Change Log

## [0.3.0] - 2025-10-31

### Added
- **Authentication Service** - Centralized authentication service (`src/services/ParseAuthService.js` and `src/services/MockAuthService.js`)
  - Login, register, and logout methods
  - Current user session checking and validation
  - Authentication state checking methods
  - MockAuthService implementation using localStorage (no backend required)
- **AuthContext** - React context for managing authentication state
  - Uses authentication service for all authentication operations
  - Provides authentication state and methods to all components
  - Handles session persistence across page refreshes
- **ProtectedRoute Component** - Route protection for authenticated routes (Student A)
  - Prevents access to protected routes without authentication
  - Redirects unauthenticated users to login with return path
  - Handles loading states during authentication checks
  - Supports manual URL navigation protection
  - All protected routes cannot be navigated to without authentication
  - Protected routes redirect to auth component
  - User manually typing in URL to protected route will redirect if unauthenticated
- **AuthRouteGuard Component** - Route guard for authentication pages
  - Prevents authenticated users from accessing login/register pages
  - User cannot route to auth (login/signup) if already logged in
  - Redirects authenticated users to home page
- **Routing Updates** - Complete routing integration (Student A)
  - Protected routes correctly utilized in application
  - All routes properly configured with authentication guards
  - Seamless navigation flow between protected and public routes
- **Login Component** - User login page (Student B)
  - Form validation and error handling
  - Uses authentication service through AuthContext
  - Redirects to original destination after successful login
  - Responsive design with modern UI
- **Register Component** - User registration page (Student B)
  - Form validation (email format, password strength, password confirmation)
  - Uses authentication service through AuthContext
  - Error handling and user feedback
  - Responsive design with modern UI
- **Auth Module** - Complete authentication module (Student B)
  - Login/Register components that utilize authentication methods from service
  - Place authentication methods in separate service
  - Parse Service with authentication methods (ParseAuthService)
  - Mock authentication service for local development (MockAuthService)
- **Auth Styling** - Complete CSS styling for authentication pages
  - Modern gradient backgrounds
  - Responsive design for mobile and desktop
  - Smooth animations and transitions
- **Protected Routes** - Booking route now requires authentication
- **Navigation Updates** - Shows user status and logout functionality
  - Displays username when logged in
  - Login link when logged out
  - Logout button with loading state
- **Designs Page Update** - Updated to use JSON data instead of Parse
  - Removed Parse dependency for designs loading
  - Uses static JSON file for design data

### Changed
- Refactored authentication logic to use centralized service
- Updated App.js routing to integrate authentication system
- Navigation now displays user info when logged in
- All authentication methods moved to separate service module
- Designs component now uses JSON data instead of Parse queries

### Fixed
- Session persistence across page refreshes
- Proper handling of authentication state
- Redirect flow after authentication
- "Unauthorized" errors resolved by using localStorage-based authentication
- Designs page loading errors fixed by switching to JSON data source

## [Unreleased] - 2025-10-15

### Added
- UML diagrams for Parse models (Design, Client, Booking)
- CHANGELOG.md for tracking project changes

### Changed

### Fixed

## [1.0.0] - 2025-10-14

### Added
- Complete React migration from AngularJS
- Interactive design gallery with lightbox modal
- Calendar scheduling system with city-based availability
- Booking form with file upload functionality
- FAQ section with expandable questions

### Changed
- Migrated from static HTML/CSS to React components
- Updated navigation to use React Router
- Converted AngularJS calendar to React state management

### Fixed
- Removed "Book Now" button from design modal
- Fixed calendar to default to current month
- Added September data to calendar schedule

## [0.8.0] - 2025-10-12

### Added
- Initial React app setup with Create React App
- Component structure (Home, Designs, FAQ, Schedule, Booking)
- CSS integration from original website

### Changed

### Fixed
