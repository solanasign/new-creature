# New Creature in Christ Church API

A comprehensive REST API for managing church operations, events, sermons, and prayer requests.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Event Management**: Create, manage, and join church events
- **Sermon Management**: Upload and manage sermons with video/audio support
- **Prayer Requests**: Submit and manage prayer requests with community support
- **Member Profiles**: Comprehensive member profiles with ministry involvement tracking
- **Admin Dashboard**: Administrative tools for pastors and church leaders

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Validation**: Custom validation middleware
- **Security**: bcrypt for password hashing, CORS enabled

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
   cd server
npm install
```

3. Create a `.env` file in the server directory:
   ```env
PORT=5000
   MONGODB_URI=mongodb://localhost:27017/new-creature-church
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   NODE_ENV=development
   ```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new church member.

**Request Body:**
```json
{
  "email": "member@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "(555) 123-4567",
  "role": "member"
}
```

**Response:**
```json
{
  "message": "Registration successful. Welcome to New Creature in Christ Church!",
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "email": "member@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "member",
    "phone": "(555) 123-4567",
    "joinDate": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "member@example.com",
  "password": "securePassword123"
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST `/api/auth/logout`
Logout and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### GET `/api/auth/profile`
Get current user's profile (requires authentication).

#### PUT `/api/auth/profile`
Update current user's profile (requires authentication).

### Events

#### GET `/api/events`
Get all events (public events for non-authenticated users).

**Query Parameters:**
- `type`: Filter by event type (service, bible-study, prayer-meeting, youth-group, outreach, special-event)
- `limit`: Number of events per page (default: 20)
- `page`: Page number (default: 1)

#### GET `/api/events/:id`
Get specific event by ID.

#### POST `/api/events`
Create new event (requires admin or pastor role).

**Request Body:**
```json
{
  "title": "Sunday Service",
  "description": "Join us for worship and fellowship",
  "date": "2024-01-07",
  "startTime": "10:00",
  "endTime": "12:00",
  "location": "Main Sanctuary",
  "type": "service",
  "isPublic": true,
  "maxAttendees": 100
}
```

#### PUT `/api/events/:id`
Update event (requires admin, pastor, or organizer role).

#### DELETE `/api/events/:id`
Delete event (requires admin, pastor, or organizer role).

#### POST `/api/events/:id/join`
Join an event (requires authentication).

#### POST `/api/events/:id/leave`
Leave an event (requires authentication).

#### GET `/api/events/my/events`
Get user's events (requires authentication).

### Sermons

#### GET `/api/sermons`
Get all sermons (public sermons for non-authenticated users).

**Query Parameters:**
- `series`: Filter by sermon series
- `preacher`: Filter by preacher ID
- `tags`: Filter by tags
- `limit`: Number of sermons per page (default: 20)
- `page`: Page number (default: 1)

#### GET `/api/sermons/:id`
Get specific sermon by ID.

#### POST `/api/sermons`
Create new sermon (requires admin or pastor role).

**Request Body:**
```json
{
  "title": "Walking in Faith",
  "scripture": "Hebrews 11:1-6",
  "date": "2024-01-07",
  "description": "A message about living by faith",
  "videoUrl": "https://example.com/video.mp4",
  "audioUrl": "https://example.com/audio.mp3",
  "duration": 45,
  "tags": ["faith", "trust", "obedience"]
}
```

#### PUT `/api/sermons/:id`
Update sermon (requires admin, pastor, or preacher role).

#### DELETE `/api/sermons/:id`
Delete sermon (requires admin, pastor, or preacher role).

#### POST `/api/sermons/:id/view`
Increment sermon view count.

### Prayer Requests

#### GET `/api/prayer-requests`
Get all prayer requests (requires authentication).

**Query Parameters:**
- `category`: Filter by category (personal, family, church, community, world)
- `isUrgent`: Filter by urgency (true/false)
- `isAnswered`: Filter by answered status (true/false)
- `limit`: Number of requests per page (default: 20)
- `page`: Page number (default: 1)

#### GET `/api/prayer-requests/my`
Get user's prayer requests (requires authentication).

#### GET `/api/prayer-requests/:id`
Get specific prayer request by ID (requires authentication).

#### POST `/api/prayer-requests`
Create new prayer request (requires authentication).

**Request Body:**
```json
{
  "title": "Prayer for Healing",
  "description": "Please pray for my recovery from surgery",
  "category": "personal",
  "isAnonymous": false,
  "isUrgent": true,
  "isPublic": true
}
```

#### PUT `/api/prayer-requests/:id`
Update prayer request (requires authentication, admin, pastor, or requester role).

#### DELETE `/api/prayer-requests/:id`
Delete prayer request (requires authentication, admin, pastor, or requester role).

#### POST `/api/prayer-requests/:id/pray`
Mark prayer request as prayed for (requires authentication).

#### POST `/api/prayer-requests/:id/answer`
Mark prayer request as answered (requires admin or pastor role).

**Request Body:**
```json
{
  "answerNotes": "God answered this prayer in amazing ways!"
}
```

## User Roles

- **member**: Regular church member with basic access
- **admin**: Administrative access to all features
- **pastor**: Pastoral access to manage sermons and prayer requests

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

Common error codes:
- `AUTH_REQUIRED`: Authentication required
- `ACCESS_DENIED`: Insufficient permissions
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS enabled for frontend integration
- Rate limiting on authentication endpoints

## Database Models

### User
- Basic profile information
- Role-based permissions
- Ministry involvement tracking
- Family members and prayer requests

### Event
- Church events and activities
- Attendee management
- Recurring event support
- Public/private visibility

### Sermon
- Sermon content and metadata
- Video/audio file support
- View tracking
- Series organization

### PrayerRequest
- Prayer request management
- Community prayer tracking
- Anonymous request support
- Answer tracking

### RefreshToken
- Secure token storage
- Automatic expiration
- Token revocation

## Development

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm start`: Start production server

### Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: JWT refresh token secret
- `NODE_ENV`: Environment (development/production)

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## License

This project is licensed under the MIT License. 