import { z } from 'zod';

export const createBuildingSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    address: z.string().min(5),
    description: z.string().optional()
  })
});

export const createRoomSchema = z.object({
  body: z.object({
    buildingId: z.string().cuid(),
    name: z.string().min(2),
    capacity: z.number().int().positive(),
    floor: z.number().int().optional(),
    description: z.string().optional(),
    facilities: z.array(z.string()).default([]),
    requiresPic: z.boolean().default(true),
    bookingUnit: z.enum(['HOURLY', 'FULL_DAY', 'BOTH']).default('HOURLY')
  })
});

export const createTariffSchema = z.object({
  body: z.object({
    roomId: z.string().cuid(),
    name: z.string().min(3),
    price: z.number().min(0),
    unit: z.enum(['HOURLY', 'HALF_DAY', 'FULL_DAY', 'MONTHLY', 'YEARLY', 'FLAT']),
    category: z.enum(['PEMERINTAH_PUSAT', 'PEMERINTAH_DAERAH', 'PEMERINTAH_CIMAHI', 'SWASTA', 'PENDIDIKAN', 'KOMUNITAS', 'PERSONAL']).optional()
  })
});
