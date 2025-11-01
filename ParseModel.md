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



