import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { exportBookingsExcel } from '../services/report.service';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const REPORT_ROLES = [Role.ADMIN, Role.KEPALA_UPTD, Role.KASUBAG_TU, Role.SEKRETARIS, Role.KEPALA_DINAS];

router.get('/bookings', authenticate, requireRole(REPORT_ROLES), reportController.getBookingReport);

router.get('/export-excel', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD, Role.KASUBAG_TU]), async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query as any;
    const buffer = await exportBookingsExcel({ startDate, endDate, status });
    const filename = `Laporan_Booking_CTP_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) { next(error); }
});

export default router;
