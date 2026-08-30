import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

// Dummy encryption for NIK/Phone (In real app, use crypto module)
const encrypt = (text: string) => Buffer.from(text).toString('base64');

export const registerUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new ApiError(400, 'Email already registered');

  const passwordHash = await bcrypt.hash(data.password, 10);
  
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      profile: {
        create: {
          fullName: data.fullName,
          nikEncrypted: encrypt(data.nik),
          phone: encrypt(data.phone),
          address: data.address,
          institutionName: data.institutionName,
          institutionType: data.institutionType
        }
      }
    },
    select: { id: true, email: true, role: true }
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials or inactive user');

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const payload = { id: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
};

export const refreshUserToken = async (token: string) => {
  if (!token) throw new ApiError(401, 'No refresh token provided');
  
  const payload = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || !user.isActive) throw new ApiError(401, 'User inactive');

  const newAccessToken = generateAccessToken({ id: user.id, role: user.role });
  return { accessToken: newAccessToken };
};
