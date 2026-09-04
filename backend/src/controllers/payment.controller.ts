import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service';
import multer from 'multer';
import { minioClient, BUCKET_NAME } from '../utils/minio';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const uploadMiddleware = upload.single('file');

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await paymentService.verifyPayment(req.params.bookingId, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
};

export const uploadPaymentProof = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new Error('File tidak ada');
    const fileExt = path.extname(req.file.originalname);
    const minioKey = `payments/${req.params.bookingId}/proof-${crypto.randomBytes(4).toString('hex')}${fileExt}`;

    // Upload ke MinIO atau local
    try {
      if (process.env.MINIO_ACTIVE === 'true') {
        await minioClient.putObject(BUCKET_NAME, minioKey, req.file.buffer, req.file.size);
      } else throw new Error('MinIO Disabled');
    } catch {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, minioKey.replace(/\//g, '_')), req.file.buffer);
    }

    const result = await paymentService.uploadPaymentProof(req.params.bookingId, req.user!.id, minioKey);
    res.json(result);
  } catch (error) { next(error); }
};

export const rejectPaymentProof = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const result = await paymentService.rejectPaymentProof(req.params.bookingId, req.user!.id, reason);
    res.json(result);
  } catch (error) { next(error); }
};

export const requestTolerance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await paymentService.requestPaymentTolerance(req.params.bookingId, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
};

export const decideTolerance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { approved, reason } = req.body;
    const result = await paymentService.decidePaymentTolerance(req.params.bookingId, req.user!.id, approved, reason);
    res.json(result);
  } catch (error) { next(error); }
};
