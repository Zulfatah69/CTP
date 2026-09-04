import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { PaymentState, AuditAction, BookingState } from '@prisma/client';
import { sendWhatsAppNotification } from '../jobs/wa.job';

const getPhone = async (userId: string) => {
  const u = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  return u?.profile?.phone ?? null;
};

// Admin: Verifikasi pembayaran manual (WAITING_PAYMENT → ACTIVE)
export const verifyPayment = async (bookingId: string, adminId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (booking.state !== BookingState.WAITING_PAYMENT) throw new ApiError(400, 'Hanya booking WAITING_PAYMENT yang bisa diverifikasi pembayarannya');
  if (!booking.payment) throw new ApiError(400, 'Data pembayaran tidak ditemukan');
  if (booking.payment.state === PaymentState.VERIFIED) throw new ApiError(400, 'Pembayaran sudah terverifikasi');

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: { state: PaymentState.VERIFIED, verifiedById: adminId, verifiedAt: new Date() }
    }),
    prisma.booking.update({ where: { id: bookingId }, data: { state: BookingState.ACTIVE } }),
    prisma.auditLog.create({
      data: { modelName: 'Payment', recordId: booking.payment.id, action: AuditAction.UPDATE, performedById: adminId, reason: 'Verifikasi pembayaran manual' }
    })
  ]);

  const phone = await getPhone(booking.userId);
  if (phone) sendWhatsAppNotification(phone, `Pembayaran Anda untuk ${booking.bookingNumber} telah dikonfirmasi. Ruangan sudah aktif untuk penggunaan.`);

  return { message: 'Pembayaran berhasil diverifikasi, booking sekarang ACTIVE' };
};

// Pemohon: Upload bukti pembayaran
export const uploadPaymentProof = async (bookingId: string, userId: string, minioKey: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (booking.userId !== userId) throw new ApiError(403, 'Forbidden');
  if (booking.state !== BookingState.WAITING_PAYMENT) throw new ApiError(400, 'Booking tidak dalam status menunggu pembayaran');
  if (!booking.payment) throw new ApiError(400, 'Data pembayaran tidak ditemukan');

  await prisma.payment.update({
    where: { bookingId },
    data: { state: PaymentState.PROOF_UPLOADED, proofMinioKey: minioKey, uploadedAt: new Date() }
  });

  return { message: 'Bukti pembayaran berhasil diunggah, menunggu verifikasi Admin' };
};

// Admin: Tolak bukti bayar (kembali ke PENDING)
export const rejectPaymentProof = async (bookingId: string, adminId: string, reason: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (!booking.payment || booking.payment.state !== PaymentState.PROOF_UPLOADED) {
    throw new ApiError(400, 'Tidak ada bukti pembayaran untuk ditolak');
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: { state: PaymentState.REJECTED, rejectionReason: reason }
    }),
    prisma.auditLog.create({
      data: { modelName: 'Payment', recordId: booking.payment.id, action: AuditAction.REJECT, performedById: adminId, reason }
    })
  ]);

  const phone = await getPhone(booking.userId);
  if (phone) sendWhatsAppNotification(phone, `Bukti pembayaran untuk ${booking.bookingNumber} DITOLAK. Alasan: ${reason}. Silakan unggah ulang.`);

  return { message: 'Bukti pembayaran ditolak' };
};

// Admin ajukan toleransi ke Kepala UPTD
export const requestPaymentTolerance = async (bookingId: string, adminId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (booking.state !== BookingState.WAITING_PAYMENT) throw new ApiError(400, 'Booking harus dalam status WAITING_PAYMENT');
  if (!booking.payment) throw new ApiError(400, 'Data pembayaran tidak ditemukan');
  if (booking.payment.toleranceRequestedAt) throw new ApiError(400, 'Permintaan toleransi sudah pernah diajukan');

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: { toleranceRequestedAt: new Date(), toleranceRequestedById: adminId }
    }),
    prisma.auditLog.create({
      data: { modelName: 'Payment', recordId: booking.payment.id, recordRef: booking.bookingNumber, action: AuditAction.UPDATE, performedById: adminId, reason: 'Admin mengajukan toleransi pembayaran H-1 ke Kepala UPTD' }
    })
  ]);
  return { message: 'Permintaan toleransi berhasil diajukan ke Kepala UPTD' };
};

// Kepala UPTD approve/reject toleransi
export const decidePaymentTolerance = async (bookingId: string, kepalaId: string, approved: boolean, reason?: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (!booking.payment?.toleranceRequestedAt) throw new ApiError(400, 'Belum ada permintaan toleransi untuk booking ini');
  if (booking.payment.toleranceApprovedAt) throw new ApiError(400, 'Toleransi sudah diputuskan sebelumnya');

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: {
        toleranceApprovedById: kepalaId,
        toleranceApprovedAt: new Date(),
        toleranceApproved: approved,
        toleranceRejectedReason: !approved ? (reason || 'Ditolak') : null,
      }
    }),
    prisma.auditLog.create({
      data: {
        modelName: 'Payment', recordId: booking.payment.id, recordRef: booking.bookingNumber,
        action: AuditAction.UPDATE, performedById: kepalaId,
        reason: approved ? 'Kepala UPTD menyetujui toleransi pembayaran' : `Kepala UPTD menolak toleransi: ${reason || ''}`
      }
    })
  ]);
  return { message: approved ? 'Toleransi disetujui. Booking tetap aktif.' : 'Toleransi ditolak.' };
};
