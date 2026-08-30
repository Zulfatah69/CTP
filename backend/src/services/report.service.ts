import { prisma } from '../utils/prisma';
import { BookingState } from '@prisma/client';

export const getBookingReport = async (filters: {
  startDate?: string;
  endDate?: string;
  buildingId?: string;
  status?: string;
}) => {
  const whereClause: any = {};

  if (filters.status) {
    whereClause.state = filters.status as BookingState;
  }

  if (filters.startDate || filters.endDate) {
    whereClause.dateStart = {};
    if (filters.startDate) whereClause.dateStart.gte = new Date(filters.startDate);
    if (filters.endDate) whereClause.dateStart.lte = new Date(filters.endDate);
  }

  if (filters.buildingId) {
    whereClause.room = { buildingId: filters.buildingId };
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      user: { select: { email: true, profile: true } },
      room: { include: { building: true } },
      payment: true,
      picAssignments: { include: { employee: true } },
      skmResponse: true
    },
    orderBy: { dateStart: 'desc' }
  });

  // Calculate metrics
  const total = bookings.length;
  const byState: Record<string, number> = {};
  let totalRevenue = 0;

  for (const b of bookings) {
    byState[b.state] = (byState[b.state] || 0) + 1;
    if (b.payment?.state === 'VERIFIED') {
      totalRevenue += Number(b.payment.amount || 0);
    }
  }

  return {
    metrics: {
      total,
      active: byState[BookingState.ACTIVE] || 0,
      completed: byState[BookingState.COMPLETED] || 0,
      approved: byState[BookingState.APPROVED] || 0,
      waitingPayment: byState[BookingState.WAITING_PAYMENT] || 0,
      cancelled: byState[BookingState.CANCELLED] || 0,
      rejected: byState[BookingState.REJECTED] || 0,
      totalRevenue
    },
    bookings: bookings.map(b => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      applicantEmail: b.user.email,
      applicantName: b.user.profile?.fullName || b.user.email,
      applicantPhone: b.user.profile?.phone || '-',
      eventName: b.eventName,
      participantCount: b.participantCount,
      roomName: b.room?.name || '-',
      buildingName: b.room?.building?.name || '-',
      dateStart: b.dateStart,
      dateEnd: b.dateEnd,
      state: b.state,
      paymentAmount: b.payment?.amount ? Number(b.payment.amount) : 0,
      paymentState: b.payment?.state || 'NONE',
      rescheduleCount: b.rescheduleCount,
      isCancelledAfterH7: b.isCancelledAfterH7,
      skmRating: b.skmResponse?.rating || null
    }))
  };
};
