import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { performedAt: 'desc' },
      take: 100, // Ambil 100 log terakhir saja untuk Phase 1
      include: { user: { select: { email: true } } }
    });
    res.json(logs);
  } catch (error) { next(error); }
};
