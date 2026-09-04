import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

// Public: Global search across rooms, buildings, announcements, and FOKUS products
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    if (q.length < 2) {
      return res.json({ results: [] });
    }

    const [rooms, buildings, announcements, fokus] = await Promise.all([
      prisma.room.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { building: { select: { name: true } } },
        take: 5,
      }),
      prisma.building.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.announcement.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.fokusCatalog.findMany({
        where: {
          isActive: true,
          OR: [
            { productName: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
    ]);

    const results = [
      ...rooms.map((r) => ({
        type: 'ROOM' as const,
        id: r.id,
        title: r.name,
        subtitle: `${r.building?.name || 'Gedung'} • Kapasitas ${r.capacity} orang`,
        href: '/portal',
      })),
      ...buildings.map((b) => ({
        type: 'BUILDING' as const,
        id: b.id,
        title: b.name,
        subtitle: b.address,
        href: '/portal',
      })),
      ...announcements.map((a) => ({
        type: 'ANNOUNCEMENT' as const,
        id: a.id,
        title: a.title,
        subtitle: 'Pengumuman Resmi',
        href: '/',
      })),
      ...fokus.map((f) => ({
        type: 'FOKUS' as const,
        id: f.id,
        title: f.productName,
        subtitle: `${f.category}${f.ownerName ? ` • ${f.ownerName}` : ''}`,
        href: '/fokus',
      })),
    ];

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

export default router;
