import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import sermonRoutes from './routes/sermons';
import prayerRoutes from './routes/prayerRequests';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/sermons', sermonRoutes);
app.use('/api/prayer-requests', prayerRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'New Creature in Christ Church API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`New Creature in Christ Church API is running on port ${PORT}`);
});
