# Architecture Decision Records — CTP Digital Service Portal

Format setiap ADR:
- **Status**: Accepted | Proposed | Deprecated | Superseded
- **Context**: Mengapa keputusan ini diperlukan
- **Decision**: Apa yang diputuskan
- **Alternatives Considered**: Opsi lain yang dievaluasi
- **Consequences**: Dampak positif dan negatif
- **Related Requirements**: FR-* atau BR-* terkait

---

### ADR-001: Full-Custom Stack (Vite+React+Express+PostgreSQL 16)
- **Status:** Accepted
- **Context:** Proyek membutuhkan platform layanan digital yang dapat dikonfigurasi dengan workflow management, document management, user management, portal publik, kalender, dan pelaporan. Awalnya dipertimbangkan Odoo 19, namun kemudian diputuskan untuk menggunakan stack full-custom.
- **Decision:** Bangun dari nol menggunakan: Frontend — Vite + React 18 + TypeScript; Backend — Node.js + Express.js + TypeScript; ORM — Prisma; Database — PostgreSQL 16; File Storage — MinIO; Queue — Bull + Redis; Auth — JWT.
- **Alternatives Considered:** Odoo 19 Community (ditolak: overkill, learning curve tinggi, mobile API sulit), Django/FastAPI (ditolak: tim lebih familiar dengan JS/TS), Laravel (ditolak: ekosistem berbeda dari frontend React), Next.js fullstack (dipertimbangkan tapi dipisah untuk fleksibilitas mobile API nanti).
- **Consequences:** (+) Full control atas arsitektur dan API design. (+) Mobile app nanti bisa consume API yang sama tanpa modifikasi. (+) TypeScript end-to-end untuk type safety. (+) Lebih mudah dikembangkan oleh developer lokal. (-) Semua fitur harus dibangun dari nol. (-) Waktu development lebih panjang dibanding platform-based. (-) Butuh infrastruktur lebih banyak (Redis, MinIO).
- **Related Requirements:** Semua FR-* dan BR-*.

---

### ADR-002: Monorepo Layout (frontend/ + backend/)
- **Status:** Accepted
- **Context:** Perlu memutuskan apakah frontend dan backend berada dalam satu repository atau terpisah.
- **Decision:** Monorepo dengan dua workspace: `/frontend` (Vite+React) dan `/backend` (Express+Prisma). Dikelola dengan pnpm workspaces. Shared types di `/backend/src/types/` yang di-import frontend.
- **Alternatives Considered:** Dua repo terpisah (harder to sync types, harder to coordinate), Nx/Turborepo (overkill untuk tim kecil), Next.js API routes (terlalu tightly coupled, sulit untuk mobile API nanti).
- **Consequences:** (+) Satu PR bisa cover perubahan frontend + backend sekaligus. (+) TypeScript types bisa disinkronkan. (+) Satu docker-compose untuk dev. (-) Repo lebih besar. (-) Build pipeline sedikit lebih kompleks.
- **Related Requirements:** Development.md conventions.

---

### ADR-003: Integration Adapter Pattern
- **Status:** Accepted
- **Context:** Portal harus terintegrasi dengan WADUH, PKL website, WhatsApp BSP, dan kemungkinan sistem lain di masa depan. Risiko: coupling langsung ke DB/API eksternal menciptakan ketergantungan yang rapuh.
- **Decision:** Semua integrasi melalui adapter pattern di `backend/src/integrations/`. Setiap sistem eksternal mendapat satu file adapter yang mengimplementasikan interface standard. Direct database coupling ke sistem eksternal DILARANG. Semua integration calls dicatat di tabel `IntegrationLog`.
- **Alternatives Considered:** Direct API calls dari controller (terlalu coupled), Microservice gateway (overkill untuk Phase 1), GraphQL federation (tidak sesuai untuk REST-first approach).
- **Consequences:** (+) Sistem eksternal bisa berubah tanpa mempengaruhi portal. (+) Integration failures terisolasi. (+) Audit trail untuk semua external calls. (+) Ganti BSP WhatsApp = ganti hanya satu file adapter. (-) Memerlukan development adapter untuk setiap sistem. (-) Menambah latency untuk availability checks real-time.
- **Related Requirements:** INT-WADUH-001, INT-PKL-001, INT-WA-001, BR-INT-001, BR-INT-002, BR-INT-003.

---

### ADR-004: Source of Truth Strategy
- **Status:** Accepted
- **Context:** Beberapa sistem mengelola data yang tumpang tindih (occupansi WS di WADUH dan Portal, pendaftaran PKL di website PKL dan Portal). Dua sumber kebenaran menyebabkan konflik.
- **Decision:** Tetapkan SoT eksplisit per domain data: Working Space BITC occupancy → WADUH; PKL registration → PKL website; Room bookings CTP/BITC → Portal (DB kita); Employee/tariff/service catalog → Portal (DB kita). Tidak boleh ada record paralel yang saling bertentangan.
- **Alternatives Considered:** Bidirectional sync (kompleks, rawan konflik), Portal sebagai master semua data (butuh migrasi sistem eksternal).
- **Consequences:** (+) Kepemilikan data jelas, tidak ada konflik. (+) Integritas data sistem eksternal terjaga. (-) Portal harus selalu call WADUH untuk WS availability (ada latency). (-) Portal tidak bisa offline untuk data WS.
- **Related Requirements:** docs/Source-of-Truth.md, BR-INT-001, BR-INT-002.

---

### ADR-005: Booking Conflict Resolution Strategy
- **Status:** Accepted
- **Context:** Beberapa pemohon mungkin meminta ruangan/tanggal/waktu yang sama. Perlu strategi untuk menangani konflik.
- **Decision:** Izinkan multiple pending booking untuk slot yang sama. Saat satu booking diapprove: (1) Lock slot di DB, (2) Auto-reject semua pending booking lain yang overlap dengan alasan standar. Admin boleh mengoverride prioritas (BR-BOOKING-003) tapi WAJIB memberikan alasan. Alasan prioritas bersifat internal dan masuk audit trail.
- **Alternatives Considered:** First-come-first-served otomatis (tidak ada diskresi Admin), Queue system (lebih kompleks), Bidding/auction (terlalu kompleks).
- **Consequences:** (+) Admin punya diskresi untuk alasan operasional. (+) Audit trail jelas untuk keputusan prioritas. (+) Konteks pemerintah memang memerlukan pertimbangan administratif. (-) Beban Admin untuk conflict resolution. (-) Risiko bias jika alasan prioritas tidak diaudit dengan ketat.
- **Related Requirements:** BR-BOOKING-002, BR-BOOKING-003.

---

### ADR-006: Audit Trail Strategy
- **Status:** Accepted
- **Context:** Aplikasi pemerintah memerlukan audit trail lengkap untuk semua perubahan signifikan.
- **Decision:** Single audit mechanism: tabel `AuditLog` di PostgreSQL (via Prisma). Setiap aksi signifikan membuat satu record AuditLog dengan field: model, recordId, recordRef, action, fieldName, oldValue, newValue, performedById, performedAt, reason, ipAddress. Record AuditLog bersifat IMMUTABLE — tidak ada update atau delete setelah dibuat (enforced di service layer, bukan DB constraint).
- **Alternatives Considered:** Odoo chatter/mail.thread (tidak relevan — tidak pakai Odoo), External ELK stack (terlalu kompleks), Full event sourcing (overkill), Winston logger file only (tidak queryable).
- **Consequences:** (+) Audit data ada di PostgreSQL, bisa di-query dan di-join dengan data lain. (+) Alasan wajib tercapture untuk aksi kritikal. (+) Immutability dijamin di service layer. (-) Satu tabel audit untuk semua model (lebih besar tapi lebih sederhana). (-) Service layer harus disiplin membuat AuditLog — tidak ada enforcement otomatis.
- **Related Requirements:** BR-AUDIT-001, BR-AUDIT-002, BR-AUDIT-003.

---

### ADR-007: Payment Architecture (Phase 1)
- **Status:** Accepted
- **Context:** Sistem memerlukan penanganan pembayaran. Opsi: integrasi payment gateway, verifikasi manual saja.
- **Decision:** Phase 1: Verifikasi QRIS manual. Admin menyiapkan QRIS/kode bayar. Pemohon bayar dan upload bukti (portal atau WhatsApp via Admin). Admin verifikasi manual. Tidak ada payment gateway di Phase 1. State payment: PENDING → PROOF_UPLOADED → VERIFIED/REJECTED. Jika payment overdue H-1, Admin dapat mengajukan toleransi ke Kepala UPTD — Kepala UPTD approve/reject via sistem (sesuai raw.md §XV).
- **Alternatives Considered:** Payment gateway (Midtrans/Xendit) sejak hari pertama (butuh compliance pemerintah, lebih lambat), Transfer bank manual (kurang terstruktur dibanding QRIS).
- **Consequences:** (+) Lebih cepat diimplementasi. (+) Tidak ada dependency ke payment gateway. (+) QRIS sudah familiar di kalangan pengguna pemerintah. (+) Kepala UPTD memiliki kontrol formal atas toleransi H-1. (-) Beban Admin untuk verifikasi. (-) Tidak ada konfirmasi pembayaran otomatis. (-) Alur toleransi menambah langkah approval. Future: payment gateway bisa ditambahkan di Phase 2+.
- **Related Requirements:** BR-PAYMENT-001, BR-PAYMENT-002, BR-PAYMENT-003.

---

### ADR-008: Cancellation Policy (Admin-Only)
- **Status:** Accepted
- **Context:** Perlu memutuskan apakah pemohon bisa self-cancel booking.
- **Decision:** Pemohon TIDAK BISA self-cancel via UI. Semua pembatalan melalui Admin (pemohon menghubungi via WhatsApp resmi atau langsung). Admin lakukan pembatalan dengan alasan wajib. Batas waktu pembatalan (`cancellationWindowDays`, default H-7) disimpan sebagai parameter di `SystemConfig` dan dapat diubah Admin tanpa coding — sesuai raw.md §XVI: *"Ini harus dijadikan parameter dalam workflow."* Jika batas dilewati: warning dialog, Admin tetap bisa batalkan. Alasan wajib dicatat di AuditLog bersama flag `isCancelledAfterH7`.
- **Alternatives Considered:** Self-service cancellation bebas (potensi abuse), Self-service dengan constraint H-7 di UI (tetap dipilih Admin-only untuk kontrol lebih ketat), Hard-coded H-7 (ditolak — raw.md mensyaratkan parameter).
- **Consequences:** (+) Admin mengontrol pembatalan, mencegah abuse. (+) Nilai H-7 dapat disesuaikan tanpa deploy ulang. (+) Alasan wajib memastikan akuntabilitas. (-) Menambah beban kerja Admin. (-) Pemohon harus menunggu respon Admin.
- **Related Requirements:** BR-BOOKING-006, BR-BOOKING-007, BR-BOOKING-008.

---

### ADR-009: WhatsApp Integration Architecture
- **Status:** Proposed
- **Context:** Sistem memerlukan WhatsApp untuk notifikasi. Perlu memutuskan pendekatan integrasi.
- **Decision:** Gunakan WhatsApp Business API resmi via BSP (Business Solution Provider). Satu nomor WhatsApp resmi UPTD. Outbound via sistem (Bull queue job); inbound ditangani manual oleh Admin. Nomor HP PIC tidak pernah dibagikan. Implementasi menggunakan interface `WhatsAppAdapter` agar BSP bisa diganti tanpa mengubah business logic.
- **Alternatives Considered:** WhatsApp Web automation (tidak resmi, melanggar ToS, tidak stabil), Email saja (jangkauan kurang di Indonesia), Direct Meta API (tanpa BSP, lebih kompleks setup).
- **Consequences:** (+) API resmi, compliant. (+) Template pesan pra-disetujui Meta. (+) Delivery tracking tersedia. (+) Ganti BSP = ganti satu file adapter saja. (-) Biaya BSP per bulan. (-) Proses approval template. (-) BSP belum dipilih (OQ-014).
- **Related Requirements:** INT-WA-001, BR-NOTIF-001, BR-NOTIF-002.

---

### ADR-010: JWT Authentication Strategy
- **Status:** Accepted
- **Context:** Perlu memutuskan mekanisme autentikasi untuk REST API yang juga akan digunakan mobile app nanti.
- **Decision:** JWT dengan dua token: Access Token (15 menit, dikirim di Authorization header) + Refresh Token (7 hari, disimpan di httpOnly Secure cookie). Refresh token di-hash (SHA-256) sebelum disimpan di DB tabel `RefreshToken`. Setiap kali refresh: token baru diterbitkan, token lama di-invalidate (rotation).
- **Alternatives Considered:** Session-based auth (tidak mobile-compatible, memerlukan sticky session), Single long-lived JWT (tidak bisa di-revoke), OAuth2/SSO (overkill untuk Phase 1).
- **Consequences:** (+) Stateless, scalable, mobile-compatible. (+) Refresh token rotation mencegah token theft reuse. (+) httpOnly cookie melindungi refresh token dari XSS. (-) Access token tidak bisa di-revoke sebelum expired (mitigasi: TTL pendek 15 menit). (-) Implementasi rotation lebih kompleks dari single token.
- **Related Requirements:** Security.md, semua endpoint auth.

---

### ADR-011: SKM Implementation Strategy
- **Status:** Accepted
- **Context:** Perlu survei kepuasan (SKM) native di aplikasi. Keputusan awal masih open, tapi sudah dikonfirmasi.
- **Decision:** Custom model `SkmResponse` di Prisma. SKM diimplementasikan sebagai form sederhana native di portal. Triggered otomatis setelah Admin melakukan checkout. SKM **wajib diisi** untuk menutup booking (sesuai raw.md §XXIV: flow berakhir setelah SKM di-submit). SKM **tidak memblokir** pembuatan booking baru. Auto-close setelah timeout (`SystemConfig.skmTimeoutDays`, nilai TBD). Terhubung unique ke satu booking (`bookingId @unique`).
- **Alternatives Considered:** Reminder-only (ditolak — tidak sesuai raw.md §XXIV), Google Forms link (tidak terintegrasi), SurveyMonkey (external, tidak ada data di DB kita).
- **Consequences:** (+) Full control atas SKM form dan data. (+) Data SKM ada di PostgreSQL, bisa dianalisis. (+) SKM wajib memastikan data feedback terkumpul secara sistematis. (-) Harus bangun form dan analytics sendiri. (-) Bull job auto-close perlu dijaga agar tidak salah close.
- **Related Requirements:** BR-SKM-001, BR-SKM-002, FR-SKM-*.

---

### ADR-012: File Storage — MinIO (Self-Hosted S3)
- **Status:** Accepted
- **Context:** Sistem menyimpan banyak file: surat permohonan, disposisi, bukti bayar, foto ruangan, template dokumen, foto FOKUS. File tidak boleh disimpan di filesystem server Express.
- **Decision:** Semua file disimpan di MinIO (self-hosted, S3-compatible). Akses file menggunakan presigned URL dengan expiry pendek (15 menit). Path file (minioKey) disimpan di DB, bukan URL langsung. Bucket terpisah per kategori dokumen.
- **Alternatives Considered:** Filesystem server Express (tidak scalable, tidak aman, hilang saat deploy), AWS S3 (biaya, privasi data pemerintah), Google Cloud Storage (biaya), Cloudflare R2 (privacy ok, tapi tetap external).
- **Consequences:** (+) Self-hosted, data tidak keluar ke cloud asing. (+) S3-compatible API, bisa migrasi ke AWS/GCS tanpa code change. (+) Presigned URL mencegah akses langsung tanpa auth. (+) MinIO mendukung bucket versioning dan replication. (-) Perlu maintenance MinIO server. (-) Setup lebih kompleks dari simpan di filesystem.
- **Related Requirements:** Security.md NFR-SEC-002, semua fitur dokumen.
