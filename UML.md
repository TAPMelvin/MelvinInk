# UML Class Diagram

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