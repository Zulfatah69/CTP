import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { AuditAction, SkmState } from '@prisma/client';

export const submitSkm = async (bookingId: string, userId: string, data: {
  rating: number;
  comment?: string;
}) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (booking.userId !== userId) throw new ApiError(403, 'Forbidden');
  if (booking.state !== 'COMPLETED') throw new ApiError(400, 'SKM hanya bisa diisi setelah kegiatan selesai (COMPLETED)');
  if (booking.skmDone) throw new ApiError(400, 'SKM sudah diisi sebelumnya');
  if (data.rating < 1 || data.rating > 5) throw new ApiError(400, 'Rating harus antara 1-5');

  await prisma.$transaction([
    prisma.skmResponse.upsert({
      where: { bookingId },
      update: {
        rating: data.rating,
        feedback: data.comment,
        state: SkmState.COMPLETED,
        submittedAt: new Date()
      },
      create: {
        bookingId,
        rating: data.rating,
        feedback: data.comment,
        state: SkmState.COMPLETED,
        submittedAt: new Date()
      }
    }),
    prisma.booking.update({ where: { id: bookingId }, data: { skmDone: true } }),
    prisma.auditLog.create({
      data: {
        modelName: 'SkmResponse',
        recordId: bookingId,
        action: AuditAction.CREATE,
        performedById: userId,
        reason: `Pengisian SKM bintang ${data.rating}`
      }
    })
  ]);

  return { message: 'Terima kasih, survei kepuasan berhasil dikirim!' };
};

export const getSkmStats = async () => {
  const responses = await prisma.skmResponse.findMany({
    where: { state: SkmState.COMPLETED },
    include: { booking: { include: { room: true } } }
  });
  const total = responses.length;
  const avg = total > 0 ? responses.reduce((sum, r) => sum + (r.rating || 0), 0) / total : 0;

  return { total, averageRating: Math.round(avg * 100) / 100, responses };
};
