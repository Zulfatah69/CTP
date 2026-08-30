# Security — CTP Digital Service Portal

## 1. Authentication

### JWT Strategy
- **Access Token**: expires in 15 menit, dikirim di Authorization: Bearer <token> header
- **Refresh Token**: expires dalam 7 hari, disimpan di httpOnly; Secure; SameSite=Strict cookie
- **Rotation**: setiap kali refresh token digunakan, token baru diterbitkan dan token lama di-invalidate
- **Storage**: refresh token di-hash (SHA-256) sebelum disimpan di tabel RefreshToken

### Endpoints Auth
`
POST /api/auth/register     → public
POST /api/auth/login        → public
POST /api/auth/refresh      → public (baca cookie)
POST /api/auth/logout       → authenticated
GET  /api/auth/me           → authenticated
`

### Password Policy
- Minimum 8 karakter
- Hash menggunakan bcrypt (cost factor 12)
- **TIDAK PERNAH** menyimpan atau mengirimkan password plaintext

---

## 2. Authorization (RBAC)

### Role Hierarchy

| Role | Kode | Level Akses |
|---|---|---|
| Pemohon | PEMOHON | Public applicant — akses ke booking sendiri saja |
| Admin UPTD | ADMIN | Operator utama — akses ke semua booking + master data |
| Kasubag TU | KASUBAG_TU | Supervisor TU — akses Admin + ganti PIC + absensi |
| Kepala UPTD | KEPALA_UPTD | Monitoring — read-only dashboard + laporan |
| Sekretaris | SEKRETARIS | Agenda sederhana — read-only kegiatan |
| Kepala Dinas | KEPALA_DINAS | Agenda sederhana — read-only kegiatan |

### RBAC Middleware Pattern

`	ypescript
// backend/src/middleware/rbac.ts
export const requireRole = (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      throw new ForbiddenError('Akses ditolak');
    }
    next();
  };

// Penggunaan di route:
router.post('/bookings/:id/cancel',
  authenticate,
  requireRole('ADMIN', 'KASUBAG_TU'),
  bookingController.cancel
);
`

### Permission Matrix per Endpoint (Key Rules)

| Aksi | PEMOHON | ADMIN | KASUBAG_TU | KEPALA_UPTD | SEKRETARIS | KEPALA_DINAS |
|---|---|---|---|---|---|---|
| Lihat booking sendiri | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Buat booking baru | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve/Reject booking | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Batalkan booking | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Verifikasi pembayaran | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign PIC | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ganti PIC | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Lihat semua booking | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Kelola master data | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Lihat laporan | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Lihat absensi | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Lihat dashboard ringkas | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Lihat statistik SKM | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Record-Level Ownership
- **PEMOHON** hanya bisa mengakses data booking miliknya sendiri
- Backend harus selalu filter: WHERE userId = req.user.id untuk query Pemohon
- **JANGAN** mengandalkan ID di URL saja — selalu validasi ownership di service layer

---

## 3. Data Protection

### NIK (Nomor Induk Kependudukan)
- Disimpan **terenkripsi** di database menggunakan AES-256-GCM
- Encryption key disimpan di environment variable (NIK_ENCRYPTION_KEY), TIDAK di kode
- NIK **tidak pernah** muncul di:
  - URL/query string
  - Log aplikasi
  - Response API publik
  - Error messages

`	ypescript
// backend/src/utils/crypto.ts
export const encryptNIK = (nik: string): string => { /* AES-256-GCM */ };
export const decryptNIK = (encrypted: string): string => { /* decrypt */ };
`

### Nomor HP Pegawai (PIC)
- Disimpan terenkripsi di kolom phoneEncrypted di tabel Employee
- **TIDAK PERNAH** dikirimkan ke Pemohon dalam response apapun
- Hanya digunakan internal untuk pengiriman notifikasi WhatsApp ke PIC

### Dokumen & File
- Semua file disimpan di **MinIO**, BUKAN di filesystem server
- Akses file menggunakan **presigned URL** dengan expiry 15 menit
- URL dokumen tidak bisa ditebak (MinIO key adalah UUID/CUID)
- Endpoint download dokumen wajib validasi kepemilikan sebelum generate presigned URL:

`	ypescript
// Contoh:
GET /api/documents/:id/download
→ Cek apakah user adalah pemilik booking atau Admin
→ Jika authorized, generate MinIO presigned URL (15 menit)
→ Redirect atau return URL
`

---

## 4. API Security

### CORS
`	ypescript
// Hanya allow origin yang terdaftar
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,  // untuk httpOnly cookie refresh token
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
};
`

### Rate Limiting
- Login endpoint: max 10 request/menit per IP
- Register: max 5 request/menit per IP
- API umum: max 100 request/menit per user

`	ypescript
import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({ windowMs: 60_000, max: 10 });
`

### Input Validation (Zod)
- Semua request body divalidasi dengan Zod schema sebelum masuk ke controller
- Middleware alidate(schema) digunakan di setiap route yang menerima input

`	ypescript
// backend/src/middleware/validate.ts
export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(result.error.flatten());
    }
    req.body = result.data;
    next();
  };
`

### SQL Injection Prevention
- Prisma ORM menggunakan parameterized queries secara default
- Raw SQL (prisma.) hanya boleh digunakan untuk performa-kritis dengan Prisma.sql template literal

### Helmet.js
- Semua security headers dikonfigurasi via Helmet.js (Content-Security-Policy, X-Frame-Options, dll)

---

## 5. Audit Trail

### AuditLog Model
Semua aksi signifikan dicatat di tabel AuditLog:

| Field | Keterangan |
|---|---|
| model | Nama tabel yang diubah |
| recordId | ID record yang diubah |
| recordRef | Display string record (misal: "BK-2024-0001") |
| action | Jenis aksi (STATE_CHANGE, UPDATE, dll) |
| fieldName | Field yang berubah (opsional) |
| oldValue | Nilai sebelum |
| newValue | Nilai sesudah |
| performedById | User yang melakukan aksi |
| performedAt | Timestamp (auto) |
| reason | Alasan perubahan (wajib untuk aksi kritikal) |

### Immutability
- Tabel AuditLog tidak boleh di-UPDATE atau di-DELETE setelah dibuat
- Enforced di service layer: tidak ada fungsi update/delete untuk AuditLog

### Aksi Wajib Dicatat
- Semua state change booking
- Approval/rejection
- Verifikasi pembayaran
- Assign/ganti PIC
- Upload disposisi
- Pembatalan booking (termasuk apakah lewat H-7)
- Reschedule
- Perubahan master data (tarif, ruangan)
- Login gagal berulang (security log)

---

## 6. Session Security

- **Logout**: hapus refresh token dari database (invalidate)
- **Session expiry**: access token 15 menit, tidak bisa di-extend tanpa refresh token valid
- **Concurrent sessions**: diizinkan (multiple devices). Setiap device punya refresh token sendiri.
- **Force logout**: Admin dapat menghapus semua RefreshToken milik user tertentu

---

## 7. Environment Variables

Semua kredensial dan konfigurasi sensitif disimpan di .env:

`env
DATABASE_URL=postgresql://user:pass@localhost:5432/ctp_db
JWT_ACCESS_SECRET=<random 64 char>
JWT_REFRESH_SECRET=<random 64 char>
NIK_ENCRYPTION_KEY=<AES-256 key, 32 bytes hex>
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=<key>
MINIO_SECRET_KEY=<secret>
MINIO_BUCKET_DOCUMENTS=ctp-documents
REDIS_URL=redis://localhost:6379
WHATSAPP_BSP_URL=<TBD>
WHATSAPP_BSP_TOKEN=<TBD>
ALLOWED_ORIGINS=http://localhost:5173,https://layanan.cimahitechnopark.id
`

**JANGAN pernah commit .env ke git.** Gunakan .env.example sebagai template.
