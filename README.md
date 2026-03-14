# Resort Booking Platform - Backend API

A production-ready, modular, and scalable backend for an Airbnb-style Resort Booking Platform.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcrypt
- **Security**: Helmet, express-rate-limit, CORS
- **File Uploads**: Multer (Local storage)
- **Email**: Nodemailer

## Project Structure

```text
backend/
src/
  controllers/      # Request handlers
  models/           # Mongoose schemas
  routes/           # API endpoints
  middleware/       # Auth, error, and upload logic
  services/         # External services (Email, Payment)
  utils/            # Helper functions and JWT tools
  config/           # Database and env setup
app.js              # Express app configuration
server.js           # Entry point
.env                # Environment variables
```

## Local Development Setup

### Prerequisites
- Node.js installed
- MongoDB installed and running locally (`mongodb://127.0.0.1:27017/resort-booking`)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Open `.env` and update the values if necessary.
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/resort-booking
   JWT_SECRET=your_secret_key
   ```

3. **Run for Development**
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (`Guest`, `ResortOwner`, `Admin`)
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user profile (Requires JWT)

### Resorts (`/api/resorts`)
- `GET /api/resorts` - Get all resorts (Supports pagination, sorting, filtering)
- `GET /api/resorts/:id` - Get resort by ID
- `POST /api/resorts` - Create resort (Required: `ResortOwner` or `Admin`)
- `PUT /api/resorts/:id` - Update resort
- `DELETE /api/resorts/:id` - Delete resort

### Rooms (`/api/rooms`)
- `POST /api/rooms` - Create room for a resort
- `GET /api/resorts/:id/rooms` - Get all rooms for a resort
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Bookings (`/api/bookings`)
- `POST /api/bookings` - Create a new booking (Prevents double bookings)
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get specific booking details
- `DELETE /api/bookings/:id` - Cancel booking

### Reviews (`/api/reviews`)
- `POST /api/reviews` - Leave a review for a resort
- `GET /api/resorts/:id/reviews` - Get all reviews for a resort

### Search (`/api/search`)
- `GET /api/search` - Search resorts by location, guests, price, amenities, rating.

### Admin (`/api/admin`)
- `GET /api/admin/users` - List all users
- `GET /api/admin/resorts` - List all resorts with owner details
- `GET /api/admin/bookings` - List all bookings in the system
- `PUT /api/admin/resorts/:id/verify` - Approve/Verify a resort
- `DELETE /api/admin/users/:id` - Ban/Delete a user

## Security Implementation
- **Helmet**: Secures Express apps by setting various HTTP headers.
- **Rate Limiting**: Prevents brute-force attacks and abuse.
- **Password Hashing**: Uses bcrypt for secure storage.
- **JWT Protection**: Secure stateless authentication.
- **Role-Based Access**: Middleware to restrict endpoints based on user roles.

## Design Decisions
- **Async Handler**: Centralized try-catch wrapper for cleaner controllers.
- **Consistent Response Format**: All APIs return `{ success: true/false, data/message: ... }`.
- **Atomic Rating Updates**: Resort rating is automatically recalculated on review submission/deletion.
- **Modular Routes**: Clear separation of concerns for easy extension.
