import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    roomId: z.string().cuid(),
    dateStart: z.string().datetime(),
    dateEnd: z.string().datetime(),
    expectedAttendees: z.number().int().positive(),
    description: z.string().optional()
  })
});

export const approveBookingSchema = z.object({
  body: z.object({
    priorityReason: z.string().optional() // BR-BOOKING-003
  })
});
