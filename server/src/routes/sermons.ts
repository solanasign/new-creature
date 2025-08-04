import { Router } from 'express';
import { 
  getAllSermons,
  getSermonById,
  createSermon,
  updateSermon,
  deleteSermon,
  incrementViewCount
} from '../controllers/sermons';
import { auth, requireAdminOrPastor, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for member-specific features)
router.get('/', optionalAuth as any, getAllSermons as any);
router.get('/:id', optionalAuth as any, getSermonById as any);
router.post('/:id/view', incrementViewCount as any);

// Admin/Pastor only routes
router.post('/', auth as any, requireAdminOrPastor as any, createSermon as any);
router.put('/:id', auth as any, requireAdminOrPastor as any, updateSermon as any);
router.delete('/:id', auth as any, requireAdminOrPastor as any, deleteSermon as any);

export default router; 