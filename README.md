# New Creature in Christ Church Website

A modern church website with authentication, event management, sermon archives, and prayer request features.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd New-Creature
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/new-creature-church
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   NODE_ENV=development
   ```

5. **Start the servers**

   In one terminal (backend):
   ```bash
   cd server
   npm run dev
   ```

   In another terminal (frontend):
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Test Page: Open `test-api.html` in your browser

## 🔐 Authentication System

### User Roles
- **Member**: Regular church member with basic access
- **Admin**: Administrative access to all features
- **Pastor**: Pastoral access to manage sermons and prayer requests

### Registration & Login

#### Using the React App
1. Navigate to `/register` to create a new account
2. Fill in all required fields:
   - First Name & Last Name
   - Email Address
   - Phone Number (optional)
   - Password (minimum 8 characters with letters and numbers)
   - Role selection
3. Navigate to `/login` to sign in with your credentials

#### Using the API Test Page
1. Open `test-api.html` in your browser
2. Use the test forms to register and login
3. Test all API endpoints directly

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Church Features
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin/pastor only)
- `GET /api/sermons` - Get all sermons
- `POST /api/sermons` - Create sermon (admin/pastor only)
- `GET /api/prayer-requests` - Get prayer requests
- `POST /api/prayer-requests` - Create prayer request

## 🏗️ Project Structure

```
New-Creature/
├── src/                    # Frontend React app
│   ├── pages/             # Page components
│   │   ├── Login.tsx      # Login page
│   │   ├── Register.tsx   # Registration page
│   │   └── ...
│   ├── features/          # Feature modules
│   │   └── auth/          # Authentication feature
│   │       ├── context/   # Auth context
│   │       ├── components/ # Auth components
│   │       └── hooks/     # Auth hooks
│   ├── services/          # API services
│   │   └── api.ts         # API service class
│   └── utils/             # Utilities
│       └── jwt.ts         # JWT utilities
├── server/                # Backend Express app
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── utils/         # Server utilities
│   └── README.md          # Server documentation
├── test-api.html          # API testing page
└── README.md              # This file
```

## 🎨 Features

### Frontend
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Animations**: Smooth animations with Framer Motion
- **Responsive Design**: Works on all device sizes
- **Form Validation**: Client-side validation with error handling
- **Authentication**: JWT-based auth with refresh tokens

### Backend
- **RESTful API**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh token rotation
- **Validation**: Input validation middleware
- **Error Handling**: Structured error responses
- **Security**: Password hashing, CORS, rate limiting

### Church-Specific Features
- **Event Management**: Create and manage church events
- **Sermon Archives**: Upload and organize sermons
- **Prayer Requests**: Submit and track prayer requests
- **Member Profiles**: Comprehensive member information
- **Role-Based Access**: Different permissions for different roles

## 🧪 Testing

### API Testing
1. Open `test-api.html` in your browser
2. Test the health check first
3. Register a new user
4. Login with the credentials
5. Test protected endpoints
6. Test logout functionality

### Manual Testing
1. Start both servers
2. Navigate to http://localhost:5173
3. Go to `/register` to create an account
4. Go to `/login` to sign in
5. Test the authentication flow

## 🔧 Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

**Backend:**
```bash
cd server
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript
npm start            # Start production server
```

### Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/new-creature-church
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
NODE_ENV=development
```

## 🚨 Troubleshooting

### Common Issues

1. **Server not starting**
   - Check if MongoDB is running
   - Verify environment variables are set
   - Check port 5000 is not in use

2. **Frontend not connecting to API**
   - Ensure backend server is running on port 5000
   - Check CORS settings
   - Verify API_BASE_URL in services/api.ts

3. **Authentication issues**
   - Clear browser localStorage
   - Check JWT secrets are set correctly
   - Verify token expiration times

4. **Database connection issues**
   - Ensure MongoDB is running
   - Check MONGODB_URI format
   - Verify database permissions

### Getting Help

1. Check the server logs for error messages
2. Use the API test page to isolate issues
3. Check browser console for frontend errors
4. Verify all dependencies are installed

## 📝 API Documentation

For detailed API documentation, see `server/README.md`

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## 📄 License

This project is licensed under the MIT License.
