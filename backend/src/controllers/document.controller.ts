import { Request, Response, NextFunction } from 'express';
import * as documentService from '../services/document.service';
import { DocumentType } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new ApiError(400, 'Tidak ada file yang diunggah');
    const { type } = req.body;
    if (!Object.values(DocumentType).includes(type)) {
      throw new ApiError(400, 'Tipe dokumen tidak valid');
    }
    
    const document = await documentService.uploadDocument(req.params.bookingId, req.user!.id, req.file, type as DocumentType);
    res.status(201).json(document);
  } catch (error) { next(error); }
};

export const downloadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || '';
    const data = await documentService.getDocumentPresignedUrl(req.params.id, req.user!.id, token);
    res.json(data);
  } catch (error) { next(error); }
};

export const mockDownload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    if (!token) throw new ApiError(401, 'Unauthorized');
    
    const { verifyAccessToken } = require('../utils/jwt');
    const user = verifyAccessToken(token);

    const { prisma } = require('../utils/prisma');
    const document = await prisma.document.findUnique({ where: { id: req.params.id }, include: { booking: true } });
    if (!document) throw new ApiError(404, 'Not found');
    
    // RBAC
    if (user.role === 'PEMOHON' && document.booking.userId !== user.id) {
      throw new ApiError(403, 'Forbidden');
    }

    const path = require('path');
    const safeLocalPath = path.join(process.cwd(), 'uploads', document.minioKey.replace(/\//g, '_'));
    res.download(safeLocalPath, document.originalName);
  } catch (error) { next(error); }
};
