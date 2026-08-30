import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const REPORT_ROLES = [Role.ADMIN, Role.KEPALA_UPTD, Role.KASUBAG_TU, Role.SEKRETARIS, Role.KEPALA_DINAS];

router.get('/bookings', authenticate, requireRole(REPORT_ROLES), reportController.getBookingReport);

export default router;
