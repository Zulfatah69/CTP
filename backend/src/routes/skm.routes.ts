import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import * as skmService from '../services/skm.service';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// MUST be before /:bookingId to avoid Express matching 'stats' as bookingId
router.get('/stats', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await skmService.getSkmStats();
    res.json(stats);
  } catch (error) { next(error); }
});

router.post('/:bookingId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await skmService.submitSkm(req.params.bookingId, req.user!.id, req.body);
    res.json(result);
  } catch (error) { next(error); }
});

export default router;
