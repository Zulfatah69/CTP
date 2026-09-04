import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';

export const getFokusCatalog = async (activeOnly = true) => {
  return prisma.fokusCatalog.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: { createdAt: 'desc' },
  });
};

export const createFokusItem = async (data: {
  productName: string;
  category: string;
  ownerName?: string;
  description?: string;
  imageUrl?: string;
}) => {
  if (!data.productName?.trim()) throw new ApiError(400, 'Nama produk wajib diisi');
  if (!data.category?.trim()) throw new ApiError(400, 'Kategori wajib diisi');

  return prisma.fokusCatalog.create({
    data: {
      productName: data.productName.trim(),
      category: data.category.trim(),
      ownerName: data.ownerName?.trim() || null,
      description: data.description?.trim() || null,
      // ponytail: imageUrl adalah URL eksternal sementara sampai MinIO file storage diaktifkan
      imageUrl: data.imageUrl?.trim() || null,
    },
  });
};

export const updateFokusItem = async (id: string, data: {
  productName?: string;
  category?: string;
  ownerName?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}) => {
  const existing = await prisma.fokusCatalog.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Item katalog FOKUS tidak ditemukan');

  return prisma.fokusCatalog.update({
    where: { id },
    data: {
      ...(data.productName !== undefined && { productName: data.productName.trim() }),
      ...(data.category !== undefined && { category: data.category.trim() }),
      ...(data.ownerName !== undefined && { ownerName: data.ownerName?.trim() || null }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl?.trim() || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
};

export const deleteFokusItem = async (id: string) => {
  const existing = await prisma.fokusCatalog.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Item katalog FOKUS tidak ditemukan');
  return prisma.fokusCatalog.update({
    where: { id },
    data: { isActive: false },
  });
};
