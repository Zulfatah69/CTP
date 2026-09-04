import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const ADMIN_ROLES = [Role.ADMIN, Role.KEPALA_UPTD];

// Pemohon: upload bukti bayar
router.post('/:bookingId/upload-proof', authenticate, paymentController.uploadMiddleware, paymentController.uploadPaymentProof);

// Admin: verifikasi dan tolak
router.post('/:bookingId/verify', authenticate, requireRole(ADMIN_ROLES), paymentController.verifyPayment);
router.post('/:bookingId/reject-proof', authenticate, requireRole(ADMIN_ROLES), paymentController.rejectPaymentProof);

// Toleransi pembayaran
router.post('/:bookingId/request-tolerance', authenticate, requireRole([Role.ADMIN, Role.KASUBAG_TU]), paymentController.requestTolerance);
router.post('/:bookingId/decide-tolerance', authenticate, requireRole([Role.KEPALA_UPTD]), paymentController.decideTolerance);

export default router;
