# Parse Models UML Diagram

## Design Model
```
┌─────────────────┐
│     Design      │
├─────────────────┤
│ objectId (auto) │
│ createdAt (auto)│
│ updatedAt (auto)│
├─────────────────┤
│ name: String    │
│ description: Str│
│ image: String   │
│ category: String│
│ available: Bool │
│ sizes: Array    │
└─────────────────┘
```

## Client Model
```
┌─────────────────┐
│     Client      │
├─────────────────┤
│ objectId (auto) │
│ createdAt (auto)│
│ updatedAt (auto)│
├─────────────────┤
│ name: String    │
│ email: String   │
│ phone: String   │
└─────────────────┘
```

## Booking Model
```
┌─────────────────┐
│     Booking     │
├─────────────────┤
│ objectId (auto) │
│ createdAt (auto)│
│ updatedAt (auto)│
├─────────────────┤
│ clientId: Ptr   │ ──→ Client
│ tattooType: Str │
│ bodyPart: String│
│ preferredDate: D│
│ preferredTime: S│
│ description: Str│
│ referenceImages │
└─────────────────┘
```

## User/Developer Stories

### Story 1: User Booking History

The logged-in user should be able to view all past and upcoming bookings in a "My Bookings" page, so they can see booking details, status, and dates. The page should fetch bookings from Parse using the authenticated user's email or user ID and display them with status indicators.

### Story 2: User Booking Modifications

The logged-in user should be able to cancel or request changes to pending bookings from the "My Bookings" page, so they can manage appointments without contacting support. The system should allow users to cancel bookings by updating the status to "cancelled" in Parse and provide a form to request modifications.

### Story 3: Admin Booking Dashboard

The admin/artist should be able to view all bookings in an admin dashboard, filter by status/date, and update booking statuses (pending → confirmed/cancelled), so they can manage the appointment schedule. The dashboard should query all bookings from Parse and allow admins to update statuses and add notes that are saved back to Parse.

