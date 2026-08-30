import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { BookingState, AuditAction, ApplicantCategory } from '@prisma/client';
import { sendWhatsAppNotification } from '../jobs/wa.job';

const generateBookingNumber = () => `CTP-BKG-${Date.now()}`;

// Helper: get or create default service
const getDefaultService = async () => {
  let service = await prisma.service.findFirst({ where: { code: 'SVC-001' } });
  if (!service) {
    service = await prisma.service.create({
      data: { code: 'SVC-001', name: 'Peminjaman Ruangan' }
    });
  }
  return service;
};

// Helper: get applicant phone
const getPhone = async (userId: string): Promise<string | null> => {
  const u = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  return u?.profile?.phone ?? null;
};

// ============================================================
// CREATE — Hanya membuat DRAFT. Belum SUBMITTED. Tanpa payment.
// ============================================================
export const createBooking = async (userId: string, data: {
  roomId: string;
  dateStart: string;
  dateEnd: string;
  eventName: string;
  attendeesDescription?: string;
  activityPurpose?: string;
  activityDescription?: string;
  applicantCategory?: ApplicantCategory;
  participantCount?: number;
}) => {
  const room = await prisma.room.findUnique({ where: { id: data.roomId } });
  if (!room || !room.isActive) throw new ApiError(400, 'Ruangan tidak ditemukan atau tidak aktif');

  // BR-BOOKING-004: Kapasitas
  if (data.participantCount && data.participantCount > room.capacity) {
    throw new ApiError(400, `Jumlah peserta (${data.participantCount}) melebihi kapasitas ruangan (${room.capacity})`);
  }

  const service = await getDefaultService();

  return prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      userId,
      serviceId: service.id,
      roomId: data.roomId,
      dateStart: new Date(data.dateStart),
      dateEnd: new Date(data.dateEnd),
      eventName: data.eventName,
      attendeesDescription: data.attendeesDescription,
      activityPurpose: data.activityPurpose,
      activityDescription: data.activityDescription,
      applicantCategory: data.applicantCategory,
      participantCount: data.participantCount,
      state: BookingState.DRAFT
    }
  });
};

// ============================================================
// SUBMIT — Pemohon: DRAFT → SUBMITTED (setelah dokumen ada)
// ============================================================
export const submitBooking = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (booking.userId !== userId) throw new ApiError(403, 'Forbidden');
  if (booking.state !== BookingState.DRAFT && booking.state !== BookingState.REVISION_NEEDED) {
    throw new ApiError(400, 'Hanya DRAFT atau REVISION_NEEDED yang bisa di-submit');
  }

  // Cek: Surat Permohonan wajib ada
  const suratPermohonan = await prisma.document.findFirst({
    where: { bookingId, type: 'SURAT_PERMOHONAN' }
  });
  if (!suratPermohonan) {
    throw new ApiError(400, 'Surat permohonan wajib diunggah sebelum mengajukan');
  }

  // Payment deadline: H-1 dari tanggal mulai
  const paymentDeadline = new Date(booking.dateStart);
  paymentDeadline.setDate(paymentDeadline.getDate() - 1);

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { state: BookingState.SUBMITTED, paymentDeadline }
    }),
    prisma.auditLog.create({
      data: { modelName: 'Booking', recordId: bookingId, action: AuditAction.UPDATE, performedById: userId, reason: 'Pemohon submit permohonan' }
    })
  ]);

  // WA: konfirmasi pengajuan
  const phone = await getPhone(userId);
  if (phone) sendWhatsAppNotification(phone, `Permohonan Anda (${booking.bookingNumber}) telah berhasil diajukan dan sedang menunggu review Admin.`);

  return { message: 'Booking berhasil diajukan' };
};

// ============================================================
// MOVE TO REVIEW — Admin: SUBMITTED → UNDER_REVIEW
// ============================================================
export const moveToReview = async (bookingId: string, adminId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (booking.state !== BookingState.SUBMITTED) throw new ApiError(400, 'Hanya SUBMITTED yang bisa dibuka untuk review');

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { state: BookingState.UNDER_REVIEW } }),
    prisma.auditLog.create({
      data: { modelName: 'Booking', recordId: bookingId, action: AuditAction.UPDATE, performedById: adminId, reason: 'Admin membuka review' }
    })
  ]);
  return { message: 'Status berubah ke UNDER_REVIEW' };
};

// ============================================================
// REQUEST REVISION — Admin: UNDER_REVIEW → REVISION_NEEDED
// ============================================================
export const requestRevision = async (bookingId: string, adminId: string, note: string) => {
  if (!note) throw new ApiError(400, 'Catatan perbaikan wajib diisi');
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (booking.state !== BookingState.UNDER_REVIEW) throw new ApiError(400, 'Hanya UNDER_REVIEW yang bisa diminta perbaikan');

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { state: BookingState.REVISION_NEEDED, revisionNote: note } }),
    prisma.auditLog.create({
      data: { modelName: 'Booking', recordId: bookingId, action: AuditAction.UPDATE, performedById: adminId, reason: `Minta perbaikan: ${note}` }
    })
  ]);

  const phone = await getPhone(booking.userId);
  if (phone) sendWhatsAppNotification(phone, `Pengajuan Anda (${booking.bookingNumber}) memerlukan perbaikan. Catatan Admin: "${note}"`);

  return { message: 'Permintaan perbaikan dikirim' };
};

// ============================================================
// APPROVE — Admin: UNDER_REVIEW → APPROVED → WAITING_PAYMENT / ACTIVE
// ============================================================
export const approveBooking = async (bookingId: string, adminId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { room: { include: { tariffs: { where: { isActive: true } } } } } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (booking.state !== BookingState.UNDER_REVIEW) throw new ApiError(400, 'Hanya UNDER_REVIEW yang bisa di-approve');

  // BR-BOOKING-001: Cek disposisi sudah di-upload
  const disposisi = await prisma.document.findFirst({ where: { bookingId, type: 'LEMBAR_DISPOSISI' } });
  if (!disposisi) throw new ApiError(400, 'Surat disposisi wajib diunggah Admin sebelum menyetujui (BR-BOOKING-001)');

  // BR-BOOKING-002: Cek konflik & auto-reject yang bentrok
  const overlapping = await prisma.booking.findMany({
    where: {
      roomId: booking.roomId,
      state: { in: [BookingState.SUBMITTED, BookingState.UNDER_REVIEW] },
      id: { not: bookingId },
      AND: [{ dateStart: { lt: booking.dateEnd } }, { dateEnd: { gt: booking.dateStart } }]
    }
  });

  // Tentukan state berikutnya: ada tarif berbayar → WAITING_PAYMENT, gratis → ACTIVE
  const hasTariff = (booking.room?.tariffs?.length ?? 0) > 0;
  const nextState = hasTariff ? BookingState.WAITING_PAYMENT : BookingState.ACTIVE;

  const ops: any[] = [
    prisma.booking.update({ where: { id: bookingId }, data: { state: BookingState.APPROVED } }),
    prisma.auditLog.create({
      data: { modelName: 'Booking', recordId: bookingId, action: AuditAction.APPROVE, performedById: adminId }
    })
  ];

  // Buat payment record hanya jika berbayar
  if (hasTariff) {
    const tariff = booking.room!.tariffs[0];
    ops.push(
      prisma.booking.update({ where: { id: bookingId }, data: { state: nextState } }),
      prisma.payment.create({ data: { bookingId, amount: tariff.price } })
    );
  } else {
    ops.push(prisma.booking.update({ where: { id: bookingId }, data: { state: nextState } }));
  }

  // Auto-reject yang bentrok
  for (const overlap of overlapping) {
    ops.push(
      prisma.booking.update({ where: { id: overlap.id }, data: { state: BookingState.REJECTED, rejectionReason: 'Ruangan telah disetujui untuk pemohon lain (BR-BOOKING-002)' } }),
      prisma.auditLog.create({
        data: { modelName: 'Booking', recordId: overlap.id, action: AuditAction.REJECT, performedById: adminId, reason: 'Konflik otomatis (BR-BOOKING-002)' }
      })
    );
  }

  await prisma.$transaction(ops);

  // WA notifications
  const phone = await getPhone(booking.userId);
  if (phone) sendWhatsAppNotification(phone, `Selamat! Pengajuan Anda (${booking.bookingNumber}) telah DISETUJUI.${hasTariff ? ' Silakan lakukan pembayaran sebelum ' + booking.paymentDeadline?.toLocaleDateString('id-ID') + '.' : ''}`);

  for (const overlap of overlapping) {
    const overlapPhone = await getPhone(overlap.userId);
    if (overlapPhone) sendWhatsAppNotification(overlapPhone, `Mohon maaf, pengajuan Anda (${overlap.bookingNumber}) DITOLAK karena ruangan telah disetujui untuk pemohon lain.`);
  }

  return { message: `Booking disetujui (${nextState}). ${overlapping.length} konflik otomatis ditolak.`, rejectedCount: overlapping.length };
};

// ============================================================
// REJECT — Admin: UNDER_REVIEW → REJECTED
// ============================================================
export const rejectBooking = async (bookingId: string, adminId: string, reason: string) => {
  if (!reason) throw new ApiError(400, 'Alasan penolakan wajib diisi');
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (booking.state !== BookingState.UNDER_REVIEW) throw new ApiError(400, 'Hanya UNDER_REVIEW yang bisa ditolak');

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { state: BookingState.REJECTED, rejectionReason: reason } }),
    prisma.auditLog.create({ data: { modelName: 'Booking', recordId: bookingId, action: AuditAction.REJECT, performedById: adminId, reason } })
  ]);

  const phone = await getPhone(booking.userId);
  if (phone) sendWhatsAppNotification(phone, `Mohon maaf, pengajuan Anda (${booking.bookingNumber}) DITOLAK. Alasan: ${reason}`);

  return { message: 'Booking ditolak' };
};

// ============================================================
// CANCEL — Admin-only, semua state yang belum selesai
// ============================================================
export const cancelBooking = async (bookingId: string, adminId: string, reason: string) => {
  if (!reason) throw new ApiError(400, 'Alasan pembatalan wajib diisi');
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');

  const nonCancellable = [BookingState.COMPLETED, BookingState.CANCELLED, BookingState.REJECTED];
  if (nonCancellable.includes(booking.state)) throw new ApiError(400, 'Booking ini tidak dapat dibatalkan');

  // BR-BOOKING-006: H-7 warning flag
  const daysToEvent = Math.ceil((booking.dateStart.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isCancelledAfterH7 = daysToEvent < 7;

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { state: BookingState.CANCELLED, cancellationReason: reason, isCancelledAfterH7 } }),
    prisma.auditLog.create({ data: { modelName: 'Booking', recordId: bookingId, action: AuditAction.CANCEL, performedById: adminId, reason } })
  ]);

  const phone = await getPhone(booking.userId);
  if (phone) sendWhatsAppNotification(phone, `Pengajuan Anda (${booking.bookingNumber}) telah DIBATALKAN oleh Admin. Alasan: ${reason}`);

  return { message: 'Booking dibatalkan' };
};

// ============================================================
// CHECKOUT — Admin: ACTIVE → COMPLETED
// ============================================================
export const checkoutBooking = async (bookingId: string, adminId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { picAssignments: true }
  });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');
  if (booking.state !== BookingState.ACTIVE) throw new ApiError(400, 'Hanya ACTIVE yang bisa di-checkout');

  // BR-PIC-002: Minimal 1 PIC harus ditugaskan
  if (booking.picAssignments.length === 0) {
    throw new ApiError(400, 'Wajib tugaskan minimal 1 PIC sebelum checkout (BR-PIC-002)');
  }


  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { state: BookingState.COMPLETED } }),
    prisma.auditLog.create({ data: { modelName: 'Booking', recordId: bookingId, action: AuditAction.UPDATE, performedById: adminId, reason: 'Admin checkout' } })
  ]);

  // WA: undangan SKM
  const phone = await getPhone(booking.userId);
  if (phone) sendWhatsAppNotification(phone, `Kegiatan Anda (${booking.bookingNumber}) telah selesai. Mohon isi survei kepuasan (SKM) melalui portal kami. Terima kasih!`);

  return { message: 'Checkout berhasil, pemohon diminta isi SKM' };
};

// ============================================================
// RESCHEDULE — Admin-only (FR-RESCHEDULE / BR-BOOKING-005)
// ============================================================
export const rescheduleBooking = async (
  bookingId: string,
  adminId: string,
  data: { newDateStart: string; newDateEnd: string; reason: string }
) => {
  if (!data.reason) throw new ApiError(400, 'Alasan reschedule wajib diisi');
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { room: true }
  });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');

  const allowedStates = [BookingState.APPROVED, BookingState.WAITING_PAYMENT, BookingState.ACTIVE, BookingState.SUBMITTED, BookingState.UNDER_REVIEW];
  if (!allowedStates.includes(booking.state)) {
    throw new ApiError(400, `Booking dalam status ${booking.state} tidak dapat di-reschedule`);
  }

  // Max 3x reschedule
  if (booking.rescheduleCount >= 3) {
    throw new ApiError(400, 'Batas maksimal reschedule (3x) telah tercapai');
  }

  const newStart = new Date(data.newDateStart);
  const newEnd = new Date(data.newDateEnd);
  if (newEnd <= newStart) throw new ApiError(400, 'Waktu selesai harus setelah waktu mulai');

  // Must be in the same calendar year
  if (newStart.getFullYear() !== booking.dateStart.getFullYear()) {
    throw new ApiError(400, 'Reschedule harus dalam tahun kalender yang sama');
  }

  // Notice window checking (H-30 for Convention Hall, H-3 for regular rooms)
  const isConventionHall = booking.room?.name.toLowerCase().includes('convention') || (booking.room?.capacity || 0) >= 200;
  const minNoticeDays = isConventionHall ? 30 : 3;
  const daysNotice = (booking.dateStart.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

  if (daysNotice < minNoticeDays) {
    // We allow Admin to override with warning in audit log
    console.warn(`[Reschedule Warning] Reschedule requested with ${daysNotice.toFixed(1)} days notice (Standard: H-${minNoticeDays})`);
  }

  // Conflict check for new slot
  if (booking.roomId) {
    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: bookingId },
        roomId: booking.roomId,
        state: { in: [BookingState.APPROVED, BookingState.WAITING_PAYMENT, BookingState.ACTIVE] },
        AND: [{ dateStart: { lt: newEnd } }, { dateEnd: { gt: newStart } }]
      }
    });
    if (conflict) {
      throw new ApiError(400, `Ruangan sudah terisi untuk jadwal tersebut (${conflict.bookingNumber})`);
    }
  }

  await prisma.$transaction([
    prisma.bookingHistory.create({
      data: {
        bookingId,
        oldDateStart: booking.dateStart,
        newDateStart: newStart,
        reason: data.reason
      }
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        dateStart: newStart,
        dateEnd: newEnd,
        rescheduleCount: { increment: 1 }
      }
    }),
    prisma.auditLog.create({
      data: {
        modelName: 'Booking',
        recordId: bookingId,
        action: AuditAction.UPDATE,
        performedById: adminId,
        reason: `Reschedule ke-${booking.rescheduleCount + 1}: ${data.reason}`
      }
    })
  ]);

  const phone = await getPhone(booking.userId);
  if (phone) {
    sendWhatsAppNotification(
      phone,
      `Jadwal kegiatan Anda (${booking.bookingNumber}) telah DIUBAH menjadi: ${newStart.toLocaleDateString('id-ID')} ${newStart.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}. Alasan: ${data.reason}`
    );
  }

  return { message: 'Jadwal booking berhasil di-reschedule' };
};

// ============================================================
// PIC ASSIGNMENT — Admin / Kasubag TU (FR-PIC)
// ============================================================
export const assignPic = async (
  bookingId: string,
  adminId: string,
  data: { employeeId: string; role: any }
) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, 'Booking tidak ditemukan');

  const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
  if (!employee) throw new ApiError(404, 'Pegawai tidak ditemukan');

  // Conflict checking: employee cannot be assigned to overlapping active booking
  const overlapAssignment = await prisma.picAssignment.findFirst({
    where: {
      employeeId: data.employeeId,
      bookingId: { not: bookingId },
      booking: {
        state: { in: [BookingState.APPROVED, BookingState.WAITING_PAYMENT, BookingState.ACTIVE] },
        AND: [{ dateStart: { lt: booking.dateEnd } }, { dateEnd: { gt: booking.dateStart } }]
      }
    },
    include: { booking: true }
  });

  if (overlapAssignment) {
    throw new ApiError(
      400,
      `Pegawai ${employee.fullName} sudah bertugas pada kegiatan lain (${overlapAssignment.booking.bookingNumber}) di jam yang sama`
    );
  }

  const assignment = await prisma.picAssignment.upsert({
    where: {
      bookingId_role: {
        bookingId,
        role: data.role
      }
    },
    update: {
      employeeId: data.employeeId,
      assignedById: adminId,
      assignedAt: new Date()
    },
    create: {
      bookingId,
      employeeId: data.employeeId,
      role: data.role,
      assignedById: adminId
    }
  });

  await prisma.auditLog.create({
    data: {
      modelName: 'PicAssignment',
      recordId: assignment.id,
      action: AuditAction.CREATE,
      performedById: adminId,
      reason: `Penugasan PIC: ${employee.fullName} sebagai ${data.role}`
    }
  });

  return { message: `PIC ${employee.fullName} berhasil ditugaskan sebagai ${data.role}` };
};

export const removePic = async (bookingId: string, assignmentId: string, adminId: string) => {
  const assignment = await prisma.picAssignment.findUnique({
    where: { id: assignmentId },
    include: { employee: true }
  });
  if (!assignment) throw new ApiError(404, 'Penugasan PIC tidak ditemukan');

  await prisma.picAssignment.delete({ where: { id: assignmentId } });

  await prisma.auditLog.create({
    data: {
      modelName: 'PicAssignment',
      recordId: assignmentId,
      action: AuditAction.DELETE,
      performedById: adminId,
      reason: `Membatalkan penugasan PIC ${assignment.employee.fullName}`
    }
  });

  return { message: 'Penugasan PIC berhasil dihapus' };
};

