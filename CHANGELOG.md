# Change Log

## [0.3.0] - 2025-11-03

### Added
- Authentication Service with ParseAuthService and MockAuthService
- AuthContext for managing authentication state
- ProtectedRoute Component for route protection
- AuthRouteGuard Component to prevent logged-in users from accessing auth pages
- Login Component with form validation
- Register Component with form validation
- Auth styling with responsive design
- Protected booking route requiring authentication
- Navigation updates showing user status and logout
- Designs page updated to use JSON data instead of Parse

### Changed
- Refactored authentication logic to use centralized service
- Updated App.js routing to integrate authentication system
- Navigation displays user info when logged in
- Authentication methods moved to separate service module
- Designs component uses JSON data instead of Parse queries

### Fixed
- Session persistence across page refreshes
- Proper handling of authentication state
- Redirect flow after authentication
- Unauthorized errors resolved by using localStorage-based authentication
- Designs page loading errors fixed by switching to JSON data source

## [0.2.0] - 2025-10-14

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

## [0.1.0] - 2025-10-12

### Added
- Initial React app setup with Create React App
- Component structure (Home, Designs, FAQ, Schedule, Booking)
- CSS integration from original website

### Changed

### Fixed

## [0.0.1] - 2025-10-15

### Added
- UML diagrams for Parse models (Design, Client, Booking)
- CHANGELOG.md for tracking project changes

### Changed

### Fixed
