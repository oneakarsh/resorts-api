# Example API Requests

All requests should be sent to `http://localhost:5000`.

## 1. Authentication

### Register User (Guest)
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Body**:
```json
{
    "name": "Jane Guest",
    "email": "jane@example.com",
    "password": "password123",
    "role": "Guest",
    "phone": "1234567890"
}
```

### Register Resort Owner
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Body**:
```json
{
    "name": "Bob Owner",
    "email": "bob@resort.com",
    "password": "password123",
    "role": "ResortOwner",
    "phone": "0987654321"
}
```

### Login
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Body**:
```json
{
    "email": "jane@example.com",
    "password": "password123"
}
```

### Get My Profile
- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Header**: `Authorization: Bearer <token>`

---

## 2. Resort Management

### Create Resort (Owner Only)
- **Method**: `POST`
- **URL**: `/api/resorts`
- **Header**: `Authorization: Bearer <token>`
- **Body**: (Multipart/form-data)
  - `name`: "Grand Ocean Resort"
  - `description`: "Luxury resort with ocean view"
  - `location`: "Maldives"
  - `amenities`: "Pool, Spa, WiFi"
  - `images`: (Files)

### Search Resorts
- **Method**: `GET`
- **URL**: `/api/search?location=Maldives&guests=2&minPrice=100&maxPrice=500`

---

## 3. Room Management

### Add Room to Resort
- **Method**: `POST`
- **URL**: `/api/rooms`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
```json
{
    "resortId": "RESOART_ID_HERE",
    "name": "Deluxe Suite",
    "pricePerNight": 250,
    "maxGuests": 2
}
```

---

## 4. Availability System

### Check Availability
- **Method**: `GET`
- **URL**: `/api/bookings/check-availability?roomId=ROOM_ID_HERE&checkIn=2026-05-01&checkOut=2026-05-05`

### Get Booked Dates (For Calendar)
- **Method**: `GET`
- **URL**: `/api/bookings/room/ROOM_ID_HERE/dates`

---

## 5. Booking

### Create Booking
- **Method**: `POST`
- **URL**: `/api/bookings`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
```json
{
    "resortId": "RESORT_ID_HERE",
    "roomId": "ROOM_ID_HERE",
    "checkIn": "2026-05-01",
    "checkOut": "2026-05-05",
    "guests": 2
}
```

---

## 6. Reviews

### Add Review
- **Method**: `POST`
- **URL**: `/api/reviews`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
```json
{
    "resortId": "RESORT_ID_HERE",
    "rating": 5,
    "comment": "Amazing experience, highly recommended!"
}
```

---

## 7. Admin Endpoints

### Get All Users
- **Method**: `GET`
- **URL**: `/api/v1/users/users`
- **Header**: `Authorization: Bearer <admin_token>`

### Verify Resort
- **Method**: `PUT`
- **URL**: `/api/v1/users/resorts/RESORT_ID_HERE/verify`
- **Header**: `Authorization: Bearer <admin_token>`

---

## 8. Resort Manager / Admin Endpoints

### Get Manager Dashboard Stats
- **Method**: `GET`
- **URL**: `/api/v1/admin/stats`
- **Header**: `Authorization: Bearer <manager_token>`

### Get Manager's Bookings
- **Method**: `GET`
- **URL**: `/api/v1/admin/bookings`
- **Header**: `Authorization: Bearer <manager_token>`

### Update Booking Status
- **Method**: `PUT`
- **URL**: `/api/v1/admin/bookings/BOOKING_ID_HERE/status`
- **Header**: `Authorization: Bearer <manager_token>`
- **Body**:
```json
{
    "status": "Confirmed"
}
```

---

## 9. Super Admin Endpoints

### Get Super Admin Stats
- **Method**: `GET`
- **URL**: `/api/v1/superadmin/stats`
- **Header**: `Authorization: Bearer <super_admin_token>`

### Get All Resorts (For Review)
- **Method**: `GET`
- **URL**: `/api/v1/superadmin/resorts`
- **Header**: `Authorization: Bearer <super_admin_token>`

### Toggle Resort Verification
- **Method**: `PUT`
- **URL**: `/api/v1/superadmin/resorts/RESORT_ID_HERE/verify`
- **Header**: `Authorization: Bearer <super_admin_token>`
- **Body**:
```json
{
    "verified": true
}
```

### Update User Role
- **Method**: `PUT`
- **URL**: `/api/v1/superadmin/users/USER_ID_HERE/role`
- **Header**: `Authorization: Bearer <super_admin_token>`
- **Body**:
```json
{
    "role": "Admin"
}
```

