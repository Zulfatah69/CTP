import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import * as announcementService from '../services/announcement.service';

const router = Router();

const ADMIN_ROLES = [Role.ADMIN, Role.KEPALA_UPTD];

// Public: ambil pengumuman aktif (tidak perlu auth)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await announcementService.getAnnouncements(true);
    res.json(data);
  } catch (error) { next(error); }
});

// Admin: ambil semua pengumuman (termasuk nonaktif)
router.get('/all', authenticate, requireRole(ADMIN_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await announcementService.getAnnouncements(false);
    res.json(data);
  } catch (error) { next(error); }
});

// Admin: buat pengumuman baru
router.post('/', authenticate, requireRole(ADMIN_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await announcementService.createAnnouncement(req.user!.id, req.body);
    res.status(201).json(data);
  } catch (error) { next(error); }
});

// Admin: update pengumuman
router.patch('/:id', authenticate, requireRole(ADMIN_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await announcementService.updateAnnouncement(req.params.id, req.body);
    res.json(data);
  } catch (error) { next(error); }
});

// Admin: nonaktifkan pengumuman (soft delete)
router.delete('/:id', authenticate, requireRole(ADMIN_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await announcementService.deleteAnnouncement(req.params.id);
    res.json({ message: 'Pengumuman dinonaktifkan' });
  } catch (error) { next(error); }
});

export default router;
