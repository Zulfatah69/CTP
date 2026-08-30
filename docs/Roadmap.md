# Implementation Roadmap — CTP Digital Service Portal

> Stack: Vite + React + TypeScript | Node.js + Express + TypeScript | PostgreSQL 16 + Prisma

## Overview
Proyek dibagi menjadi empat fase dari MVP hingga platform yang sepenuhnya dapat dikonfigurasi. Setiap fase harus production-ready sebelum lanjut ke fase berikutnya.

---

## Phase 1 — Core Operational Platform (Bulan 1-4)
**Objective**: Workflow booking ruangan lengkap operasional.

**Backend services yang dibangun:**
- `auth` — register, login, JWT, refresh token, RBAC middleware
- `booking` — state machine, conflict detection, reschedule, cancel
- `payment` — QRIS manual, upload bukti, verifikasi Admin
- `documents` — dossier per booking, versioning, MinIO integration
- `pic` — assignment, validasi overlap, substitusi Kasubag TU
- `skm` — survei kepuasan native (reminder only)
- `whatsapp` — adapter pattern, Bull queue jobs, semua trigger events
- `master` — building, room, tariff, service, category, sector, holiday, announcement

**Frontend pages yang dibangun:**
- Landing page publik (layanan, ruangan, kalender, pengumuman)
- Auth (login, register)
- Portal Pemohon (dashboard, pengajuan, dossier, pembayaran, SKM, favorit)
- Admin (dashboard, kelola booking, PIC, pembayaran, master data, kalender, laporan dasar)
- Monitoring (Kepala UPTD, Kasubag TU, Sekretaris, Kepala Dinas)

**Fitur lengkap:**
- User registration + auth (JWT)
- RBAC semua role (PEMOHON, ADMIN, KASUBAG_TU, KEPALA_UPTD, SEKRETARIS, KEPALA_DINAS)
- Master data setup (gedung, ruangan, fasilitas, tarif, kategori, subsektor ekraf, hari libur)
- Full booking flow (draft → submitted → review → disposisi → approval → payment → active → checkout → SKM)
- Booking conflict detection (multi-pending diizinkan, lock on approval, auto-reject conflicting)
- Digital dossier + document versioning (immutable, MinIO storage)
- Manual QRIS payment verification
- PIC assignment + substitution (Kasubag TU authority)
- WhatsApp notifications (semua 13 trigger events)
- Structured audit trail (AuditLog immutable di PostgreSQL)
- Cancellation (Admin-only, H-7 warning)
- Reschedule (max 3x, H-3 biasa / H-30 Convention Hall)
- SKM native (reminder only, tidak memblokir)
- Dashboard per role
- Kalender availability
- Global search + Favorit
- Laporan dasar + export
- Pengumuman di beranda publik

**Definition of Done:**
- Deploy ke staging dan lulus UAT
- Role matrix terverifikasi
- Tidak ada P1/P2 bugs
- Prisma migrations sudah di-deploy
- API terdokumentasi di Swagger

**Risks:**
- Pemilihan BSP WhatsApp belum final (OQ-014)
- WADUH source code belum tersedia untuk Phase 2

---

## Phase 2 — Service Integrations (Bulan 5-7)
**Objective**: Integrasi sistem existing, tambah layanan.

**Yang dibangun:**
- WADUH adapter untuk Working Space BITC (occupancy sync, availability display)
- PKL adapter (listing display + link ke website PKL)
- FOKUS catalog admin management
- Virtual Office service flow (paket, dokumen, verifikasi, aktivasi)
- Studio Dubbing service flow (tanggal, availability, booking)
- Working Space portal view (sync dari WADUH)
- PKL portal view (dari adapter PKL)

**Prerequisites:**
- Phase 1 stable
- WADUH API/source code tersedia (OQ-012)
- Keputusan PKL integration strategy (OQ-013)

**Risks:** Ketersediaan dan stabilitas API sistem eksternal.

---

## Phase 3 — Internal Operations (Bulan 8-9)
**Objective**: Support operasional HR dan internal.

**Yang dibangun:**
- Attendance: import data absensi dari face thermal/fingerprint device
- Rekap absensi per pegawai per bulan
- Full reporting suite dengan dynamic filters
- Export Excel/PDF/CSV
- Advanced analytics dashboard

**Prerequisites:**
- Data pegawai sudah lengkap
- Format data dari attendance device sudah diketahui (sample CSV/API dari UPTD)

---

## Phase 4 — Configurable Platform (Bulan 10-13)
**Objective**: Admin bisa membuat layanan baru tanpa developer.

**Yang dibangun:**
- Service Builder (Admin buat layanan baru dari UI)
- Form Builder (field: text, angka, tanggal, waktu, pilihan, checkbox, upload, tanda tangan)
- Workflow Builder (dengan mandatory regulatory guardrails per BR-WF-001)
- Notification Builder (event → kanal → pesan → waktu)

**Critical Constraint:** Workflow builder tidak boleh menghilangkan step wajib compliance: disposisi, approval, verifikasi pembayaran, dan audit logging.

**Risks:** Fase paling kompleks. Foundation Phase 1-3 harus absolut solid sebelum memulai.

---

## Data Yang Harus Disiapkan UPTD

| Data | Format | Prioritas |
|---|---|---|
| Daftar gedung, ruangan, fasilitas + foto | Excel + gambar | Phase 1 |
| Tarif + dasar hukum (nomor Perda/SK) | Excel / PDF | Phase 1 |
| Daftar pegawai (nama, jabatan, unit, status PIC) | Excel | Phase 1 |
| 17 subsektor ekraf | Text / Excel | Phase 1 |
| Template dokumen (surat permohonan, pernyataan, dll) | Word / PDF | Phase 1 |
| Nomor WhatsApp Business UPTD + BSP pilihan | Kredensial | Phase 1 |
| Source code WADUH + dokumentasi DB/API | Codebase | Phase 2 |
| Source code / API PKL website | Codebase / OpenAPI | Phase 2 |
| Link sistem FOKUS | URL | Phase 2 |
| Format data attendance device (sample file) | CSV / API spec | Phase 3 |
