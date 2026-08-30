import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(3),
    nik: z.string().length(16, 'NIK must be 16 characters'),
    phone: z.string().min(10),
    address: z.string().optional(),
    institutionName: z.string().optional(),
    institutionType: z.string().optional(),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
  })
});
