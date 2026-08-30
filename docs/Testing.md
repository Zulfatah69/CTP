# Testing Guide — CTP Digital Service Portal

> Stack: Jest + Supertest (Backend) | Vitest + React Testing Library (Frontend)

---

## 1. Testing Philosophy

- **Unit tests**: Isolasi satu fungsi/service, mock semua dependency
- **Integration tests**: Test endpoint HTTP end-to-end menggunakan database test nyata
- **Component tests**: Test React component secara terisolasi (render, interaksi)
- **E2E tests**: Tidak dalam scope Phase 1 (tambahkan Playwright di Phase 3+)

**Prioritas coverage:**
1. 🔴 Service layer — semua business logic (BR-*) wajib ada test
2. 🟡 API routes — integration test untuk happy path + error cases
3. 🟢 Frontend components — test untuk komponen kompleks (form, state)

---

## 2. Backend Testing (Jest + Supertest)

### Setup

```bash
cd backend
pnpm test              # Run semua tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report (target: >80% service layer)
```

### Struktur Folder

```
backend/src/
├── services/
│   └── __tests__/
│       ├── booking.service.test.ts    # Unit test business logic
│       ├── payment.service.test.ts
│       ├── pic.service.test.ts
│       └── auth.service.test.ts
├── routes/
│   └── __tests__/
│       ├── booking.routes.test.ts     # Integration test via Supertest
│       ├── auth.routes.test.ts
│       └── payment.routes.test.ts
└── utils/
    └── __tests__/
        ├── crypto.test.ts             # NIK encryption/decryption
        └── bookingNumber.test.ts      # BK-YYYY-NNNN generator
```

### Konfigurasi Jest

```typescript
// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './src/test/globalSetup.ts',    // Buat DB test, jalankan migrations
  globalTeardown: './src/test/globalTeardown.ts', // Hapus DB test
  setupFilesAfterFramework: ['./src/test/setup.ts'], // Reset DB setiap test file
  collectCoverageFrom: ['src/services/**/*.ts', 'src/utils/**/*.ts'],
  coverageThreshold: { global: { lines: 80 } },
};

export default config;
```

### Database Test

```typescript
// backend/src/test/globalSetup.ts
// Buat database test terpisah: ctp_test
// Jalankan: npx prisma migrate deploy --schema=prisma/schema.prisma

// backend/src/test/setup.ts (afterEach)
// Truncate semua tabel antara test untuk isolasi
// Urutan truncate: AuditLog, WhatsappLog, SkmResponse, PicAssignment,
//                  Payment, BookingHistory, BookingDocument, Booking,
//                  RefreshToken, Profile, User, ...master data
```

### Contoh: Unit Test Service

```typescript
// booking.service.test.ts
import { approveBooking } from '../booking.service';
import { prisma } from '../../prisma';
import { ConflictError } from '../../utils/errors';

describe('bookingService.approve', () => {
  it('should throw ConflictError if state is not UNDER_REVIEW', async () => {
    // Arrange
    const booking = await prisma.booking.create({
      data: { /* booking dalam state DRAFT */ state: 'DRAFT', ... }
    });

    // Act & Assert
    await expect(approveBooking(booking.id, adminUserId)).rejects.toThrow(ConflictError);
    await expect(approveBooking(booking.id, adminUserId)).rejects.toThrow('tidak dalam status UNDER_REVIEW');
  });

  it('should throw ConflictError if disposition document is missing (BR-BOOKING-001)', async () => {
    const booking = await prisma.booking.create({
      data: { state: 'UNDER_REVIEW', ... }
    });
    // Tidak ada BookingDocument dengan docType=DISPOSISI

    await expect(approveBooking(booking.id, adminUserId)).rejects.toThrow('Disposisi Kepala Dinas belum diupload');
  });

  it('should auto-reject conflicting bookings (BR-BOOKING-002)', async () => {
    // Arrange: dua booking untuk ruangan dan waktu yang sama
    const room = await prisma.room.create({ data: { ... } });
    const booking1 = await prisma.booking.create({ data: { roomId: room.id, state: 'UNDER_REVIEW', dateStart: ..., dateEnd: ... } });
    const booking2 = await prisma.booking.create({ data: { roomId: room.id, state: 'SUBMITTED', dateStart: ..., dateEnd: ... } });
    // Upload disposisi untuk booking1
    await prisma.bookingDocument.create({ data: { bookingId: booking1.id, docType: 'DISPOSISI', ... } });

    // Act
    await approveBooking(booking1.id, adminUserId);

    // Assert
    const updated2 = await prisma.booking.findUnique({ where: { id: booking2.id } });
    expect(updated2?.state).toBe('REJECTED');
    expect(updated2?.rejectedReason).toContain('telah disetujui untuk permohonan lain');
  });

  it('should create AuditLog on approval', async () => {
    // ... setup booking ...
    await approveBooking(booking.id, adminUserId);

    const auditLog = await prisma.auditLog.findFirst({
      where: { recordId: booking.id, action: 'APPROVE' }
    });
    expect(auditLog).not.toBeNull();
    expect(auditLog?.performedById).toBe(adminUserId);
  });
});
```

### Contoh: Integration Test Route

```typescript
// booking.routes.test.ts
import request from 'supertest';
import app from '../../app';
import { generateTestToken } from '../helpers/auth.helper';

describe('PATCH /api/bookings/:id/approve', () => {
  it('should return 403 if user is PEMOHON (not Admin)', async () => {
    const token = generateTestToken({ role: 'PEMOHON' });

    const res = await request(app)
      .patch('/api/bookings/some-id/approve')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Akses ditolak');
  });

  it('should return 200 and approved booking', async () => {
    const adminToken = generateTestToken({ role: 'ADMIN' });
    // Setup booking in UNDER_REVIEW with disposition
    const bookingId = await createTestBookingWithDisposition();

    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.state).toBe('APPROVED');
  });
});
```

---

## 3. Frontend Testing (Vitest + React Testing Library)

### Setup

```bash
cd frontend
pnpm test              # Run semua tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

### Konfigurasi Vitest

```typescript
// frontend/vite.config.ts (atau vitest.config.ts)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

### Setup File

```typescript
// frontend/src/test/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server'; // MSW mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Mock API dengan MSW (Mock Service Worker)

```typescript
// frontend/src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/bookings', () => {
    return HttpResponse.json({ success: true, data: mockBookings });
  }),
  http.post('/api/bookings', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: 'new-id', ...body } }, { status: 201 });
  }),
];
```

### Contoh: Component Test

```typescript
// BookingCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BookingCard } from '../BookingCard';

describe('BookingCard', () => {
  it('should display booking number', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText('BK-2024-0001')).toBeInTheDocument();
  });

  it('should show APPROVED badge for approved bookings', () => {
    render(<BookingCard booking={{ ...mockBooking, state: 'APPROVED' }} />);
    expect(screen.getByText('Disetujui')).toBeInTheDocument();
  });
});
```

---

## 4. Business Rule Test Coverage (Wajib)

Setiap BR-* yang kritis **wajib** ada minimal satu test. Berikut daftar prioritas:

| Business Rule | Test File | Priority |
|---|---|---|
| BR-BOOKING-001: Disposisi wajib sebelum approve | `booking.service.test.ts` | 🔴 Wajib |
| BR-BOOKING-002: Conflict detection + auto-reject | `booking.service.test.ts` | 🔴 Wajib |
| BR-BOOKING-003: Priority override + audit log | `booking.service.test.ts` | 🔴 Wajib |
| BR-BOOKING-004: Kapasitas Convention Hall | `booking.service.test.ts` | 🔴 Wajib |
| BR-BOOKING-005: Lainnya tidak blokir submit | `booking.service.test.ts` | 🟡 Penting |
| BR-BOOKING-006: Cancel Admin-only + H-7 flag | `booking.service.test.ts` | 🔴 Wajib |
| BR-RESCHEDULE-001: Max 3x, H-3/H-30 | `booking.service.test.ts` | 🔴 Wajib |
| BR-PAYMENT-001: H-1 warning saja, tidak blokir | `payment.service.test.ts` | 🟡 Penting |
| BR-PIC-003: Tidak double assignment | `pic.service.test.ts` | 🔴 Wajib |
| BR-DOC-002: Dokumen tidak boleh dihapus | `document.service.test.ts` | 🔴 Wajib |
| BR-AUDIT-001: AuditLog dibuat untuk aksi signifikan | Semua service tests | 🔴 Wajib |
| BR-AUDIT-002: AuditLog immutable | `audit.service.test.ts` | 🔴 Wajib |
| BR-SKM-001: SKM reminder tidak blokir | `skm.service.test.ts` | 🟡 Penting |
| BR-INT-001: WADUH SoT | `waduh.adapter.test.ts` | 🟡 Penting |
| BR-INT-002: PKL no duplikasi | `pkl.adapter.test.ts` | 🟢 Dianjurkan |

---

## 5. Test Helpers

```typescript
// backend/src/test/helpers/auth.helper.ts
import jwt from 'jsonwebtoken';
export const generateTestToken = (payload: Partial<JwtPayload>) =>
  jwt.sign({ id: 'test-user-id', role: 'ADMIN', ...payload }, process.env.JWT_ACCESS_SECRET!);

// backend/src/test/helpers/factory.helper.ts
// Fungsi untuk membuat test data dengan minimal setup
export const createTestUser = async (role: Role = 'PEMOHON') => { ... };
export const createTestRoom = async () => { ... };
export const createTestBookingInState = async (state: BookingState, options = {}) => { ... };
export const createTestBookingWithDisposition = async () => { ... };
```

---

## 6. CI/CD Integration

```yaml
# .github/workflows/test.yml (atau GitLab CI / pipeline lokal)
test-backend:
  steps:
    - name: Setup test DB
      run: docker-compose -f docker-compose.test.yml up -d postgres
    - name: Run migrations
      run: cd backend && npx prisma migrate deploy
    - name: Run tests
      run: cd backend && pnpm test:coverage
    - name: Check coverage threshold
      run: # Fail jika coverage < 80% untuk service layer

test-frontend:
  steps:
    - name: Run tests
      run: cd frontend && pnpm test:coverage
```

---

## 7. Test Environment Variables

```env
# backend/.env.test
DATABASE_URL="postgresql://ctp:secret@localhost:5432/ctp_test"
JWT_ACCESS_SECRET="test-secret-access"
JWT_REFRESH_SECRET="test-secret-refresh"
NIK_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef"
MINIO_ENDPOINT="localhost"
REDIS_URL="redis://localhost:6379/1"  # DB 1 untuk test, bukan DB 0
NODE_ENV="test"
```

---

## 8. Common Testing Pitfalls

1. **Jangan test Prisma client langsung** — test melalui service layer
2. **Selalu reset DB antara test file** — gunakan `afterEach` truncate atau `beforeEach` transaction rollback
3. **Mock WhatsApp dan MinIO** — jangan panggil API eksternal nyata dalam test
4. **Gunakan factory helper** — jangan duplikasi setup data di setiap test
5. **Test error cases** — setiap happy path wajib ada minimal satu error test
6. **Jangan test framework** — test behavior, bukan implementasi Prisma/Express
7. **Isolasi unit test** — mock Prisma di unit test service, gunakan DB nyata hanya di integration test
