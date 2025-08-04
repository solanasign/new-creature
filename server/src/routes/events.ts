import { Router } from 'express';
import { 
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getMyEvents
} from '../controllers/events';
import { auth, requireAdminOrPastor, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for member-specific features)
router.get('/', optionalAuth as any, getAllEvents as any);
router.get('/:id', optionalAuth as any, getEventById as any);

// Protected routes
router.get('/my/events', auth as any, getMyEvents as any);
router.post('/:id/join', auth as any, joinEvent as any);
router.post('/:id/leave', auth as any, leaveEvent as any);

// Admin/Pastor only routes
router.post('/', auth as any, requireAdminOrPastor as any, createEvent as any);
router.put('/:id', auth as any, requireAdminOrPastor as any, updateEvent as any);
router.delete('/:id', auth as any, requireAdminOrPastor as any, deleteEvent as any);

export default router; 