import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

const ADMIN_ROLES = [Role.ADMIN, Role.KEPALA_UPTD];

// Semua user terautentikasi
router.get('/', authenticate, bookingController.getBookings);
router.get('/:id', authenticate, bookingController.getBooking);
router.post('/', authenticate, bookingController.createBooking);

// Pemohon: submit (DRAFT → SUBMITTED)
router.post('/:id/submit', authenticate, bookingController.submitBooking);

// Admin: state transitions
router.post('/:id/review', authenticate, requireRole(ADMIN_ROLES), bookingController.moveToReview);
router.post('/:id/request-revision', authenticate, requireRole(ADMIN_ROLES), bookingController.requestRevision);
router.post('/:id/approve', authenticate, requireRole(ADMIN_ROLES), bookingController.approveBooking);
router.post('/:id/reject', authenticate, requireRole(ADMIN_ROLES), bookingController.rejectBooking);
router.post('/:id/cancel', authenticate, requireRole(ADMIN_ROLES), bookingController.cancelBooking);
router.post('/:id/checkout', authenticate, requireRole(ADMIN_ROLES), bookingController.checkoutBooking);
router.post('/:id/reschedule', authenticate, requireRole(ADMIN_ROLES), bookingController.rescheduleBooking);

// PIC Assignment (Admin / Kasubag TU / Kepala UPTD)
const PIC_ROLES = [Role.ADMIN, Role.KASUBAG_TU, Role.KEPALA_UPTD];
router.post('/:id/pic', authenticate, requireRole(PIC_ROLES), bookingController.assignPic);
router.delete('/:id/pic/:assignmentId', authenticate, requireRole(PIC_ROLES), bookingController.removePic);

export default router;
