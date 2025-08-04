import { Router } from 'express';
import { 
  getAllPrayerRequests,
  getPrayerRequestById,
  createPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest,
  markAsPrayedFor,
  markAsAnswered,
  getMyPrayerRequests
} from '../controllers/prayerRequests';
import { auth, requireAdminOrPastor } from '../middleware/auth';

const router = Router();

// Protected routes (members only)
router.get('/', auth as any, getAllPrayerRequests as any);
router.get('/my', auth as any, getMyPrayerRequests as any);
router.get('/:id', auth as any, getPrayerRequestById as any);
router.post('/', auth as any, createPrayerRequest as any);
router.put('/:id', auth as any, updatePrayerRequest as any);
router.delete('/:id', auth as any, deletePrayerRequest as any);
router.post('/:id/pray', auth as any, markAsPrayedFor as any);

// Admin/Pastor only routes
router.post('/:id/answer', auth as any, requireAdminOrPastor as any, markAsAnswered as any);

export default router; 