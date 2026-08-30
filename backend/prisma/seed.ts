import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cimahi.go.id' },
    update: {},
    create: {
      email: 'admin@cimahi.go.id',
      passwordHash,
      role: Role.ADMIN,
      isVerified: true,
      profile: {
        create: {
          fullName: 'Super Admin CTP',
          nikEncrypted: '1234567890123456',
          phone: '08123456789'
        }
      }
    }
  });

  const pemohon = await prisma.user.upsert({
    where: { email: 'pemohon@gmail.com' },
    update: {},
    create: {
      email: 'pemohon@gmail.com',
      passwordHash,
      role: Role.PEMOHON,
      isVerified: true,
      profile: {
        create: {
          fullName: 'Budi (Pemohon Umum)',
          nikEncrypted: '3277012345678900',
          phone: '08999999999'
        }
      }
    }
  });

  const ctpBuilding = await prisma.building.upsert({
    where: { id: 'b-ctp' },
    update: {},
    create: {
      id: 'b-ctp',
      name: 'Cimahi Techno Park',
      address: 'Jl. Baros No.78, Cimahi Tengah',
      description: 'Gedung utama Cimahi Techno Park',
      rooms: {
        create: [
          { name: 'Convention Hall', capacity: 300, floor: 1, bookingUnit: 'BOTH' },
          { name: 'Ruang Rapat 1', capacity: 20, floor: 2, bookingUnit: 'HOURLY' },
          { name: 'Studio Dubbing', capacity: 5, floor: 3, bookingUnit: 'HOURLY', requiresPic: false }
        ]
      }
    }
  });

  const bitcBuilding = await prisma.building.upsert({
    where: { id: 'b-bitc' },
    update: {},
    create: {
      id: 'b-bitc',
      name: 'Gedung BITC',
      address: 'Jl. HMS Mintareja, Baros',
      description: 'Baros Information Technology Creative',
      rooms: {
        create: [
          { name: 'Ruang Teater', capacity: 150, floor: 1, bookingUnit: 'BOTH' },
          { name: 'Working Space', capacity: 30, floor: 2, bookingUnit: 'HOURLY' }
        ]
      }
    }
  });

  console.log('Seed completed. Admin user created:', admin.email);
  console.log('Buildings created:', ctpBuilding.name, bitcBuilding.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
