import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';

export const getAnnouncements = async (activeOnly = true) => {
  const now = new Date();
  return prisma.announcement.findMany({
    where: activeOnly
      ? {
          isActive: true,
          publishedAt: { lte: now },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        }
      : {},
    orderBy: { publishedAt: 'desc' },
  });
};

export const createAnnouncement = async (adminId: string, data: {
  title: string;
  content: string;
  expiresAt?: string;
}) => {
  if (!data.title?.trim()) throw new ApiError(400, 'Judul pengumuman wajib diisi');
  if (!data.content?.trim()) throw new ApiError(400, 'Isi pengumuman wajib diisi');

  return prisma.announcement.create({
    data: {
      title: data.title.trim(),
      content: data.content.trim(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      createdById: adminId,
    },
  });
};

export const updateAnnouncement = async (id: string, data: {
  title?: string;
  content?: string;
  isActive?: boolean;
  expiresAt?: string | null;
}) => {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Pengumuman tidak ditemukan');

  return prisma.announcement.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }),
    },
  });
};

export const deleteAnnouncement = async (id: string) => {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Pengumuman tidak ditemukan');
  // Soft delete
  return prisma.announcement.update({ where: { id }, data: { isActive: false } });
};
