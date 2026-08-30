import { prisma } from '../utils/prisma';
import { minioClient, BUCKET_NAME } from '../utils/minio';
import { ApiError } from '../utils/ApiError';
import { DocumentType, AuditAction } from '@prisma/client';
import crypto from 'crypto';

export const uploadDocument = async (bookingId: string, userId: string, file: Express.Multer.File, type: DocumentType) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, 'Booking not found');
  
  // Basic ACL check: only admin or the applicant themselves can upload
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role === 'PEMOHON' && booking.userId !== userId) {
    throw new ApiError(403, 'Forbidden to upload document for this booking');
  }

  const fileExt = file.originalname.split('.').pop();
  const minioKey = `bookings/${bookingId}/${type}-${crypto.randomBytes(4).toString('hex')}.${fileExt}`;

  // Upload to MinIO or Local FS Fallback
  try {
    if (process.env.MINIO_ACTIVE === 'true') {
      await minioClient.putObject(BUCKET_NAME, minioKey, file.buffer, file.size, { 'Content-Type': file.mimetype });
    } else {
      throw new Error('MinIO Disabled');
    }
  } catch (error) {
    console.warn('[Mock MinIO] MinIO tidak aktif atau gagal. Menyimpan ke local disk (uploads/).');
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
    // Replace slash in minioKey so it fits flat in local dir
    const safeLocalPath = path.join(uploadDir, minioKey.replace(/\//g, '_'));
    fs.writeFileSync(safeLocalPath, file.buffer);
  }

  // Record in DB
  const document = await prisma.document.create({
    data: {
      bookingId,
      type,
      minioKey,
      originalName: file.originalname,
      uploadedById: userId
    }
  });

  // BR-AUDIT-001
  await prisma.auditLog.create({
    data: {
      modelName: 'Document',
      recordId: document.id,
      action: AuditAction.CREATE,
      performedById: userId,
      reason: `Uploaded ${type}`
    }
  });

  return document;
};

// BR-DOC-003: Document Access Control
export const getDocumentPresignedUrl = async (documentId: string, userId: string, accessToken: string = '') => {
  const document = await prisma.document.findUnique({ where: { id: documentId }, include: { booking: true } });
  if (!document) throw new ApiError(404, 'Document not found');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role === 'PEMOHON' && document.booking.userId !== userId) {
    throw new ApiError(403, 'Forbidden to access this document');
  }

  // 15 mins expiry (MinIO) or Mock Local Download
  try {
    if (process.env.MINIO_ACTIVE === 'true') {
      const presignedUrl = await minioClient.presignedGetObject(BUCKET_NAME, document.minioKey, 15 * 60);
      return { url: presignedUrl, originalName: document.originalName };
    } else {
      throw new Error('MinIO Disabled');
    }
  } catch(error) {
    // Return Local Mock URL
    const url = `http://localhost:4000/api/documents/mock-download/${document.id}?token=${accessToken}`;
    return { url, originalName: document.originalName };
  }
};
