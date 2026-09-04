import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import * as fokusService from '../services/fokus.service';

const router = Router();
const ADMIN_ROLES = [Role.ADMIN, Role.KEPALA_UPTD];

// Public: ambil produk aktif
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fokusService.getFokusCatalog(true);
    res.json(data);
  } catch (error) { next(error); }
});

// Admin: ambil semua produk
router.get('/all', authenticate, requireRole(ADMIN_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fokusService.getFokusCatalog(false);
    res.json(data);
  } catch (error) { next(error); }
});

// Admin: tambah produk
router.post('/', authenticate, requireRole(ADMIN_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fokusService.createFokusItem(req.body);
    res.status(201).json(data);
  } catch (error) { next(error); }
});

// Admin: update produk
router.patch('/:id', authenticate, requireRole(ADMIN_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fokusService.updateFokusItem(req.params.id, req.body);
    res.json(data);
  } catch (error) { next(error); }
});

// Admin: soft delete
router.delete('/:id', authenticate, requireRole(ADMIN_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await fokusService.deleteFokusItem(req.params.id);
    res.json({ message: 'Produk dinonaktifkan dari katalog FOKUS' });
  } catch (error) { next(error); }
});

export default router;
