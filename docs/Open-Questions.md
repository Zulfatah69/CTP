# Open Questions & Decision Log — CTP Digital Service Portal

> Dokumen ini mencatat semua pertanyaan yang terbuka (belum dijawab) dan keputusan yang sudah diambil.
> Update dokumen ini setiap kali ada keputusan baru.

---

## OPEN QUESTIONS (Belum Dijawab)

### OQ-012: WADUH API Availability
- **Question:** Apakah WADUH memiliki REST API? Jika tidak, bagaimana cara integrasi?
- **Status:** ⏳ PENDING — menunggu source code / dokumentasi dari UPTD
- **Impact:** Menentukan cara implementasi `WaduhAdapter` di Phase 2
- **Options:**
  - (A) WADUH sudah punya REST API → buat adapter yang consume API tersebut
  - (B) WADUH tidak punya API → buat API layer di source code WADUH, atau baca DB WADUH (sangat tidak disarankan)
- **Decision Needed From:** Stakeholder / maintainer WADUH

### OQ-013: PKL Integration Strategy
- **Question:** Bagaimana integrasi dengan website PKL yang sudah ada?
- **Status:** ⏳ PENDING
- **Options:**
  - (A) PKL website expose REST API → portal fetch dan tampilkan
  - (B) Portal hanya link ke website PKL (tidak ada integrasi teknis di Phase 1)
  - (C) Admin input PKL listing manual di portal Phase 1, integrasi di Phase 2
- **Phase 1 Fallback:** Option (C) — Admin input manual sementara

### OQ-014: WhatsApp BSP Vendor
- **Question:** BSP (Business Solution Provider) WhatsApp mana yang akan digunakan?
- **Status:** ⏳ PENDING — nomor WA resmi UPTD sudah ada, BSP belum dipilih
- **Options:** Wati, Qiscus, Vonage, Twilio, dll
- **Impact:** Menentukan implementasi konkret `WhatsAppAdapter`. Adapter pattern sudah dibangun, ganti BSP = ganti satu file saja.
- **Decision Needed From:** UPTD / anggaran

### OQ-015: Payment Gateway (Phase 2+)
- **Question:** Payment gateway mana yang akan digunakan di Phase 2?
- **Status:** ⏳ PENDING — Phase 1 manual QRIS
- **Options:** Midtrans, Xendit, sistem pembayaran pemerintah
- **Impact:** Phase 2+ only, tidak mempengaruhi Phase 1

### OQ-018: SKM Timeout Period
- **Question:** Berapa lama timeout SKM sebelum auto-close?
- **Status:** ⏳ PENDING — nilai TBD, dikonfigurasi oleh Admin
- **Impact:** Konfigurasi di app config (env variable atau database config table)
- **Note:** SKM bersifat reminder only, tidak memblokir

### OQ-019: Attendance Device Format
- **Question:** Format data export dari fingerprint/face thermal device UPTD?
- **Status:** ⏳ PENDING — butuh sample file dari UPTD
- **Impact:** Phase 3 import attendance feature

### OQ-020: Disposisi untuk Layanan Non-Ruangan
- **Question:** Apakah kewajiban disposisi Kepala Dinas (raw.md §XI: "semua pengajuan") berlaku juga untuk Studio Dubbing, Virtual Office, dan Working Space?
- **Status:** ⏳ PENDING — perlu konfirmasi klien
- **Options:**
  - (A) Semua layanan wajib disposisi (interpretasi literal raw.md)
  - (B) Hanya room booking yang wajib disposisi; layanan lain dikecualikan
- **Impact:** Menentukan nilai `Service.requiresDisposition` per layanan dan state machine setiap modul
- **Sementara:** `requiresDisposition = true` untuk semua layanan (default sesuai raw.md); dikecualikan setelah ada konfirmasi tertulis

### OQ-021: Virtual Office — Siklus Perpanjangan & Kadaluarsa
- **Question:** Bagaimana sistem menangani masa berlaku Virtual Office, perpanjangan langganan, dan notifikasi kadaluarsa?
- **Status:** ⏳ PENDING — raw.md §XXVIII hanya mendefinisikan alur pendaftaran awal
- **Impact:** Phase 2 — perlu field `dateEnd` di booking VO, Bull job untuk reminder kadaluarsa, dan alur perpanjangan
- **Decision Needed From:** Stakeholder UPTD

### OQ-022: Inbound WhatsApp — Inbox di Dashboard Admin (Phase 2+)?
- **Question:** Apakah Phase 2+ akan menyediakan inbox inbound WhatsApp di dalam dashboard Admin?
- **Status:** ⏳ PENDING
- **Phase 1 Fallback:** Admin terima pesan inbound di WhatsApp Business secara manual, lalu aksi di portal terpisah
- **Impact:** Phase 2+ feature — perlu webhook inbound WA dan UI inbox di Admin dashboard

---

## DECISION LOG (Sudah Diputuskan)

### ADR-001: Stack Teknologi
- **Decision:** Full-custom stack: Vite + React + TypeScript (frontend) | Node.js + Express + TypeScript (backend) | PostgreSQL 16 | Prisma ORM
- **Date:** 2026-08-27
- **Rationale:** Fleksibilitas penuh, mobile API compatible dari awal, tim lebih familiar dengan JS/TS

### OQ-001 → RESOLVED: Platform
- **Question:** Odoo 19 atau full-custom?
- **Decision:** Full-custom (Vite + React + Node.js + Express + PostgreSQL 16 + Prisma)
- **Date:** 2026-08-27

### OQ-002 → RESOLVED: Authentication
- **Question:** Bagaimana session management?
- **Decision:** JWT dengan dua token: Access Token (15 menit, Authorization header) + Refresh Token (7 hari, httpOnly cookie). Rotation wajib pada setiap refresh.
- **Date:** 2026-08-27

### OQ-003 → RESOLVED: Authorization
- **Question:** Bagaimana implementasi RBAC?
- **Decision:** RBAC middleware `requireRole(...roles)` di Express. Role disimpan di JWT payload. Tidak ada hardcode role di controller.
- **Date:** 2026-08-27

### OQ-004 → RESOLVED: Kategori Lainnya
- **Question:** Apakah kategori "Lainnya" memblokir submission?
- **Decision:** TIDAK memblokir. Pemohon boleh submit. Admin mendapat banner peringatan internal saat review.
- **Date:** 2026-08-25

### OQ-005 → RESOLVED: Pembatalan H-7
- **Question:** Apakah pembatalan setelah H-7 diblokir sistem?
- **Decision:** TIDAK diblokir. Admin tetap bisa batalkan, tapi sistem tampilkan warning dialog dan alasan wajib diisi. Flag `isCancelledAfterH7=true` dicatat di DB dan AuditLog.
- **Date:** 2026-08-25

### OQ-006 → RE-OPENED → RESOLVED (revisi): Toleransi H-1
- **Question:** Apakah ada formal approval flow untuk toleransi H-1?
- **Decision (revisi 2026-08-27):** YA — ada formal flow. Sesuai raw.md §XV: "Jika perlu toleransi: perlu persetujuan Kepala UPTD." Admin mengajukan request toleransi, Kepala UPTD approve/reject via sistem. Keputusan sebelumnya (diskresional Admin) DIBATALKAN.
- **Date:** 2026-08-27

### OQ-007 → RESOLVED: PIC per Ruangan
- **Question:** Apakah semua ruangan butuh PIC atau hanya Convention Hall?
- **Decision:** SEMUA ruangan membutuhkan minimal 1 PIC Utama. `Room.requiresPic = true` secara default.
- **Date:** 2026-08-25

### OQ-008 → RE-OPENED → RESOLVED (revisi): SKM Mandatory?
- **Question:** Apakah SKM wajib (memblokir booking baru) atau hanya reminder?
- **Decision (revisi 2026-08-27):** SKM **wajib** untuk menutup booking (sesuai raw.md §XXIV). Tapi TIDAK memblokir booking baru — hanya booking lama yang belum fully closed. Auto-close setelah timeout (`SystemConfig.skmTimeoutDays`). Keputusan sebelumnya (reminder-only) DIBATALKAN.
- **Date:** 2026-08-27

### OQ-016 → RESOLVED: SKM Implementation
- **Question:** Custom model atau pakai tool eksternal?
- **Decision:** Custom `SkmResponse` model di Prisma. Form sederhana native di portal. Tidak ada dependency eksternal.
- **Date:** 2026-08-27

### OQ-017 → RESOLVED: Booking Unit Convention Hall
- **Question:** Convention Hall CTP booking harus full-day atau bisa per jam?
- **Decision:** Dinamis. Admin konfigurasi `Room.bookingUnit` per ruangan: HOURLY, FULL_DAY, atau BOTH. UI form booking menyesuaikan pilihan waktu berdasarkan nilai ini.
- **Date:** 2026-08-25

---

## KEPUTUSAN YANG SUDAH MASUK KODE

| ID | Domain | Keputusan |
|---|---|---|
| ADR-001 | Stack | Full-custom React+Express+PostgreSQL 16 |
| ADR-002 | Layout | Monorepo frontend/ + backend/ dengan pnpm workspaces |
| ADR-003 | Integration | Adapter pattern di backend/src/integrations/ |
| ADR-004 | SoT | WADUH=WS occupancy, PKL website=PKL registration, Portal=room booking |
| ADR-005 | Conflict | Multi-pending OK, lock on approval, auto-reject bentrok |
| ADR-006 | Audit | Single AuditLog table di PostgreSQL, immutable di service layer |
| ADR-007 | Payment | Phase 1: manual QRIS saja |
| ADR-008 | Cancel | Admin-only, H-7 warning tidak blokir |
| ADR-009 | WhatsApp | Adapter pattern, BSP TBD (OQ-014) |
| ADR-010 | Auth | JWT access (15m) + refresh (7d httpOnly cookie) dengan rotation |
| ADR-011 | SKM | Custom SkmResponse, reminder only |
| ADR-012 | Files | MinIO self-hosted, presigned URL 15 menit |
