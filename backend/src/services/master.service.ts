import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';

export const getAllBuildings = async () => {
  return await prisma.building.findMany({
    where: { isActive: true },
    include: { rooms: { where: { isActive: true } } }
  });
};

export const createBuilding = async (data: any) => {
  return await prisma.building.create({ data });
};

export const updateBuilding = async (id: string, data: any) => {
  return await prisma.building.update({
    where: { id },
    data
  });
};

export const deleteBuilding = async (id: string) => {
  // Soft delete
  return await prisma.building.update({
    where: { id },
    data: { isActive: false }
  });
};

export const getAllRooms = async (buildingId?: string, dateStart?: string, dateEnd?: string) => {
  const rooms = await prisma.room.findMany({
    where: { isActive: true, ...(buildingId && { buildingId }) },
    include: { building: true, tariffs: { where: { isActive: true } } }
  });

  if (!dateStart || !dateEnd) return rooms.map(r => ({ ...r, isAvailable: true }));

  const start = new Date(dateStart);
  const end = new Date(dateEnd);

  // Cek mana saja yang sudah ada booking aktif di slot yang sama
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      state: { in: ['APPROVED', 'WAITING_PAYMENT', 'ACTIVE'] as any },
      AND: [{ dateStart: { lt: end } }, { dateEnd: { gt: start } }]
    },
    select: { roomId: true }
  });

  const bookedRoomIds = new Set(conflictingBookings.map(b => b.roomId));

  return rooms.map(r => ({ ...r, isAvailable: !bookedRoomIds.has(r.id) }));
};

export const createRoom = async (data: any) => {
  const building = await prisma.building.findUnique({ where: { id: data.buildingId } });
  if (!building) throw new ApiError(404, 'Building not found');

  return await prisma.room.create({ data });
};

export const updateRoom = async (id: string, data: any) => {
  return await prisma.room.update({
    where: { id },
    data
  });
};

export const deleteRoom = async (id: string) => {
  return await prisma.room.update({
    where: { id },
    data: { isActive: false }
  });
};

export const createTariff = async (data: any) => {
  const room = await prisma.room.findUnique({ where: { id: data.roomId } });
  if (!room) throw new ApiError(404, 'Room not found');
  return await prisma.tariff.create({ data });
};

export const deleteTariff = async (id: string) => {
  return await prisma.tariff.update({
    where: { id },
    data: { isActive: false }
  });
};

export const getAllEmployees = async () => {
  // Ensure default sample staff exist if table is empty
  const count = await prisma.employee.count();
  if (count === 0) {
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (adminUser) {
      await prisma.employee.createMany({
        data: [
          {
            userId: adminUser.id,
            fullName: 'Ahmad Fauzi (Teknisi)',
            position: 'Staff IT & Multimedia',
            phoneEncrypted: Buffer.from('081234567891').toString('base64'),
            picCompetencies: ['MAIN_PIC', 'TECHNICIAN', 'VIDEOTRON_OPERATOR'],
            isPicEligible: true
          },
          {
            userId: adminUser.id,
            fullName: 'Siti Rahmawati (Koordinator Gedung)',
            position: 'Staff Pelayanan Gedung',
            phoneEncrypted: Buffer.from('081234567892').toString('base64'),
            picCompetencies: ['MAIN_PIC', 'CLEANING_STAFF'],
            isPicEligible: true
          },
          {
            userId: adminUser.id,
            fullName: 'Bambang Sudrajat (Operator Sound & Video)',
            position: 'Teknisi Audio Visual',
            phoneEncrypted: Buffer.from('081234567893').toString('base64'),
            picCompetencies: ['VIDEOTRON_OPERATOR', 'TECHNICIAN'],
            isPicEligible: true
          }
        ],
        skipDuplicates: true
      });
    }
  }

  return await prisma.employee.findMany({
    where: { isPicEligible: true },
    orderBy: { fullName: 'asc' }
  });
};
