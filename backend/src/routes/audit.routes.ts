import { Router } from 'express';
import * as auditController from '../controllers/audit.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Hanya admin dan kepala UPTD yang bisa melihat log audit
router.get('/', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD]), auditController.getAuditLogs);

export default router;
