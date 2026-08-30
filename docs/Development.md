# Development Guide — CTP Digital Service Portal

> Stack: Vite + React + TypeScript | Node.js + Express + TypeScript | PostgreSQL 16 + Prisma

---

## 1. Prerequisites

```
Node.js    >= 20 LTS
pnpm       >= 9 (package manager)
Docker     >= 24 (untuk infrastruktur lokal)
Git        >= 2.40
```

Install pnpm jika belum ada:
```bash
npm install -g pnpm
```

---

## 2. Getting Started

```bash
# Clone project
git clone <repo-url>
cd ctp-smart-service

# Install semua dependencies (frontend + backend)
pnpm install

# Setup environment variables
cp backend/.env.example backend/.env
# Edit backend/.env sesuai konfigurasi lokal kamu

# Jalankan infrastruktur (PostgreSQL 16, Redis, MinIO)
docker-compose up -d

# Buat database dan jalankan migrasi
cd backend
npx prisma migrate dev
npx prisma generate

# Seed data awal (master data)
npx prisma db seed

# Kembali ke root dan jalankan dev server
cd ..
pnpm dev
```

Frontend berjalan di: `http://localhost:5173`
Backend berjalan di: `http://localhost:3000`
MinIO Console: `http://localhost:9001` (user: minioadmin / minioadmin)

---

## 3. Environment Variables

Buat file `backend/.env` dari `backend/.env.example`:

```env
# Database
DATABASE_URL="postgresql://ctp:secret@localhost:5432/ctp_dev"

# JWT
JWT_ACCESS_SECRET="ganti-dengan-random-string-64-char"
JWT_REFRESH_SECRET="ganti-dengan-random-string-64-char-berbeda"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption (untuk NIK dan data sensitif)
NIK_ENCRYPTION_KEY="ganti-dengan-32-byte-hex-string"

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_DOCUMENTS="ctp-documents"

# Redis
REDIS_URL="redis://localhost:6379"

# WhatsApp BSP (isi saat vendor dipilih)
WHATSAPP_BSP_URL=""
WHATSAPP_BSP_TOKEN=""

# CORS
ALLOWED_ORIGINS="http://localhost:5173"

# App
PORT=3000
NODE_ENV=development
```

---

## 4. Project Structure

```
ctp-smart-service/
├── frontend/                     <- Vite + React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               <- shadcn/ui (auto-generated, jangan edit manual)
│   │   │   ├── layout/           <- Header, Sidebar, PageWrapper
│   │   │   └── shared/           <- Komponen yang dipakai di banyak tempat
│   │   ├── pages/
│   │   │   ├── public/           <- Landing, RoomList, RoomDetail, FOKUS
│   │   │   ├── auth/             <- Login, Register
│   │   │   ├── portal/           <- Dashboard, MyBookings, Payments, dll
│   │   │   └── admin/            <- AdminDashboard, BookingMgmt, dll
│   │   ├── hooks/                <- useBooking, useAuth, usePagination
│   │   ├── store/                <- Zustand stores
│   │   ├── services/             <- Axios API calls per domain
│   │   ├── types/                <- TypeScript types (sync dgn Prisma)
│   │   └── utils/                <- Helper functions
│   └── vite.config.ts
│
├── backend/                      <- Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/               <- Express router per domain
│   │   ├── controllers/          <- Request handlers (tipis)
│   │   ├── services/             <- Business logic + BR-* enforcement
│   │   ├── middleware/
│   │   │   ├── authenticate.ts   <- Verify JWT
│   │   │   ├── rbac.ts           <- requireRole(...roles)
│   │   │   ├── validate.ts       <- validate(zodSchema)
│   │   │   ├── errorHandler.ts   <- Global error handler
│   │   │   └── rateLimiter.ts
│   │   ├── schemas/              <- Zod validation schemas
│   │   ├── jobs/                 <- Bull queue job processors
│   │   ├── integrations/         <- WADUH, PKL, WhatsApp adapters
│   │   ├── utils/
│   │   │   ├── crypto.ts         <- NIK encryption/decryption
│   │   │   ├── minio.ts          <- MinIO client + presigned URL
│   │   │   ├── errors.ts         <- Custom AppError classes
│   │   │   └── bookingNumber.ts  <- BK-YYYY-NNNN generator
│   │   └── app.ts
│   └── prisma/
│       ├── schema.prisma         <- SINGLE SOURCE OF TRUTH schema
│       ├── migrations/           <- Auto-generated, JANGAN edit manual
│       └── seed.ts               <- Seed data awal
│
├── docker-compose.yml            <- PostgreSQL 16 + Redis + MinIO
└── package.json                  <- pnpm workspace root
```

---

## 5. Backend Conventions

### Routes (tipis, hanya definisi)
```typescript
// backend/src/routes/booking.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createBookingSchema } from '../schemas/booking.schema';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

router.get('/', authenticate, bookingController.list);
router.post('/', authenticate, validate(createBookingSchema), bookingController.create);
router.get('/:id', authenticate, bookingController.getById);
router.patch('/:id/approve', authenticate, requireRole('ADMIN', 'KASUBAG_TU'), bookingController.approve);
router.patch('/:id/cancel', authenticate, requireRole('ADMIN', 'KASUBAG_TU'), bookingController.cancel);

export default router;
```

### Controllers (tipis, tanpa business logic)
```typescript
// backend/src/controllers/booking.controller.ts
export const approve = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingService.approve(req.params.id, req.user!.id, req.ip);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err); // Selalu forward ke global error handler
  }
};
```

### Services (semua business logic + BR-* + AuditLog)
```typescript
// backend/src/services/booking.service.ts
export const approve = async (bookingId: string, adminId: string, ip?: string) => {
  // 1. Validasi state (harus UNDER_REVIEW)
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
  if (booking.state !== 'UNDER_REVIEW') throw new ConflictError('Booking tidak dalam status UNDER_REVIEW');

  // 2. BR-BOOKING-001: Cek disposisi
  const disposition = await prisma.bookingDocument.findFirst({
    where: { bookingId, docType: 'DISPOSISI' }
  });
  if (!disposition) throw new ConflictError('Disposisi Kepala Dinas belum diupload');

  // 3. BR-BOOKING-002: Cek konflik ruangan
  if (booking.roomId) {
    const conflict = await checkRoomConflict(booking.roomId, booking.dateStart, booking.dateEnd, bookingId);
    if (conflict) throw new ConflictError(`Ruangan sudah disetujui untuk booking ${conflict.bookingNumber}`);
  }

  // 4. Update state
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { state: 'APPROVED', approvedById: adminId, approvedAt: new Date(), paymentDeadline: calcPaymentDeadline(booking.dateStart) }
  });

  // 5. Audit log (WAJIB)
  await auditService.createLog({
    model: 'Booking', recordId: bookingId, recordRef: booking.bookingNumber,
    action: 'APPROVE', performedById: adminId, ipAddress: ip
  });

  // 6. Kirim WhatsApp via Bull queue (async, tidak block response)
  await whatsappQueue.add('send-whatsapp', {
    templateKey: 'booking_approved',
    recipientUserId: booking.userId,
    variables: { bookingNumber: booking.bookingNumber }
  });

  return updated;
};
```

### Zod Schemas
```typescript
// backend/src/schemas/booking.schema.ts
import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().cuid(),
  roomId: z.string().cuid().optional(),
  activityName: z.string().min(3).max(200),
  activityDescription: z.string().optional(),
  expectedAttendees: z.number().int().positive(),
  dateStart: z.string().datetime(),
  dateEnd: z.string().datetime(),
  applicantCategoryId: z.string().cuid(),
  creativeSectorId: z.string().cuid().optional(),
  organizationName: z.string().optional(),
}).refine(data => new Date(data.dateEnd) > new Date(data.dateStart), {
  message: 'dateEnd harus setelah dateStart',
  path: ['dateEnd']
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
```

### Error Classes
```typescript
// backend/src/utils/errors.ts
export class AppError extends Error {
  constructor(public statusCode: number, message: string) { super(message); }
}
export class NotFoundError extends AppError { constructor(msg = 'Not found') { super(404, msg); } }
export class ForbiddenError extends AppError { constructor(msg = 'Akses ditolak') { super(403, msg); } }
export class UnauthorizedError extends AppError { constructor(msg = 'Unauthorized') { super(401, msg); } }
export class ValidationError extends AppError { constructor(public details: any) { super(400, 'Validation failed'); } }
export class ConflictError extends AppError { constructor(msg: string) { super(409, msg); } }
```

---

## 6. Frontend Conventions

### Komponen
```typescript
// PascalCase untuk nama komponen
// Default export untuk page components, named export untuk shared components
export function BookingCard({ booking }: { booking: Booking }) {
  return <div>...</div>;
}
```

### API Service Layer
```typescript
// Semua API calls melalui services/, TIDAK langsung dari komponen
// frontend/src/services/booking.service.ts
import api from './api'; // Axios instance dengan JWT interceptor

export const bookingService = {
  list: () => api.get<ApiResponse<Booking[]>>('/bookings'),
  getById: (id: string) => api.get<ApiResponse<Booking>>(`/bookings/${id}`),
  create: (data: CreateBookingInput) => api.post<ApiResponse<Booking>>('/bookings', data),
  approve: (id: string) => api.patch<ApiResponse<Booking>>(`/bookings/${id}/approve`),
};
```

### Hooks
```typescript
// camelCase, prefix "use"
// Gunakan React Query untuk server state
export function useBooking(id: string) {
  return useQuery({ queryKey: ['booking', id], queryFn: () => bookingService.getById(id) });
}
```

### Form Handling
```typescript
// Selalu React Hook Form + Zod resolver
const form = useForm<CreateBookingInput>({
  resolver: zodResolver(createBookingSchema),
  defaultValues: { expectedAttendees: 1 }
});
```

---

## 7. Database Workflow

```bash
# 1. Tambah/ubah model di schema.prisma
# 2. Buat migration
npx prisma migrate dev --name tambah_field_skm_timeout

# 3. Generate Prisma client (otomatis setelah migrate dev)
npx prisma generate

# 4. Update Schema.md jika ada perubahan signifikan

# Reset database (DEV ONLY)
npx prisma migrate reset

# Lihat database via Prisma Studio
npx prisma studio
```

---

## 8. Testing

```bash
# Backend (Jest + Supertest)
cd backend
pnpm test                    # Semua tests
pnpm test:watch              # Watch mode
pnpm test:coverage           # Coverage report

# Frontend (Vitest + React Testing Library)
cd frontend
pnpm test
```

### Struktur Test Backend
```
backend/src/
├── services/__tests__/
│   ├── booking.service.test.ts   <- Unit test untuk business logic
│   └── payment.service.test.ts
└── routes/__tests__/
    ├── booking.routes.test.ts    <- Integration test via Supertest
    └── auth.routes.test.ts
```

---

## 9. Git Conventions

```bash
# Branch naming
git checkout -b feature/booking-conflict-detection
git checkout -b bugfix/skm-reminder-not-sent
git checkout -b hotfix/payment-deadline-calculation

# Commit message (Conventional Commits)
git commit -m "feat: tambah conflict detection saat approve booking"
git commit -m "fix: perbaiki kalkulasi paymentDeadline untuk H-1"
git commit -m "docs: update Schema.md dengan model Favorite"
git commit -m "refactor: pindahkan business logic dari controller ke service"
git commit -m "test: tambah unit test untuk booking.service.approve"

# PR ke main wajib ada code review
```

---

## 10. Common Pitfalls (Jangan Sampai)

1. **Jangan simpan NIK atau nomor HP sebagai plaintext** — selalu encrypt dulu
2. **Jangan return `passwordHash` dalam response JSON** — filter field sensitif di service layer
3. **Jangan taruh business logic di controller** — semua di service layer
4. **Jangan hardcode role check di controller** — gunakan `requireRole()` middleware
5. **Jangan upload file ke filesystem server** — selalu ke MinIO
6. **Jangan akses dokumen dengan URL langsung** — selalu generate presigned URL
7. **Jangan lupa `await` di Prisma queries** — Prisma selalu returns Promise
8. **Jangan skip AuditLog** — semua state change booking wajib dicatat
9. **Jangan edit file di `prisma/migrations/`** secara manual
10. **Jangan commit `.env` ke git** — pastikan `.env` ada di `.gitignore`
11. **Jangan kirim nomor HP PIC ke Pemohon** dalam response API apapun
12. **Jangan gunakan `any` di TypeScript** — selalu definisikan type yang tepat
