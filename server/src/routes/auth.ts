import { Router } from 'express';
import { 
  register, 
  login, 
  refreshToken,
  logout,
  getProfile,
  updateProfile
} from '../controllers/auth';
import { auth, authRateLimit } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', authRateLimit as any, register as any);
router.post('/login', authRateLimit as any, login as any);
router.post('/refresh', refreshToken as any);
router.post('/logout', logout as any);

// Protected routes
router.get('/profile', auth as any, getProfile as any);
router.put('/profile', auth as any, updateProfile as any);

export default router;



