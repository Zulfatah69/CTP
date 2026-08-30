# Business Rules — CTP Digital Service Portal

## Rule Format
Each rule: ID | Title | Domain | Description | Trigger | Preconditions | System Behavior | Exceptions | State Impact | Audit | Notification | Related FRs

## Domain: BOOKING

**BR-BOOKING-001: Disposition Required for All Bookings**
- All room booking submissions require a physical disposition from Kepala Dinas before Admin can approve.
- Disposition is processed outside the system; Admin uploads the scan.
- **Trigger**: Admin clicks Approve
- **Precondition**: disposition scan must be uploaded (booking document with document type "disposition" exists and is current)
- **System**: validates disposition exists before allowing state → approved
- **Exception**: none - this is a regulatory requirement
- **Audit**: Yes - approval action logged with who, when, disposition reference
- **Notification**: WhatsApp to applicant on approval

**BR-BOOKING-002: Booking Conflict — Lock on Approval**
- Multiple bookings for the same room/date/time are allowed in pending state.
- When booking A is approved, system locks the slot.
- All other pending bookings overlapping the same room/time are auto-rejected.
- **Trigger**: Admin approves a booking
- **System (service layer)**: query semua booking dengan state != APPROVED/CANCELLED/REJECTED untuk room yang sama di mana date ranges overlap. Set state=REJECTED dengan reason='Ruangan/tanggal/waktu telah disetujui untuk permohonan lain.'
- **Exception**: bookings for different rooms are not affected
- **Audit**: Yes - each auto-rejection logged
- **Notification**: WhatsApp to each rejected applicant

**BR-BOOKING-003: Admin Priority Override**
- When multiple conflicting bookings exist, Admin may approve any one (not necessarily first-in-time).
- **Mandatory**: Admin must provide priority_reason (Text, required on approval action)
- priority_reason is internal only (not visible to applicants)
- **Audit**: Yes - priority_reason stored in audit log with submission timestamps of all competing bookings

**BR-BOOKING-004: Convention Hall Capacity**
- Convention Hall CTP: minimum 100 attendees, maximum 500
- Convention Hall BITC: maximum 77 attendees, full-day booking only
- **Trigger**: Booking submission
- **System**: validate expected_attendees against room capacity_min and capacity_max
- **Error**: clear validation message to applicant

**BR-BOOKING-005: Applicant Category Rule**
- Pemohon wajib memilih satu dari: OPD/Instansi/Lembaga, Ekonomi Kreatif (pilih 1 dari 17 subsektor), atau Lainnya
- Kategori Lainnya memerlukan dasar/arahan pimpinan sesuai ketentuan regulasi
- **KEPUTUSAN (RESOLVED)**: Kategori Lainnya **TIDAK memblokir** pengajuan. Pemohon boleh submit; Admin meninjau saat fase under_review dan diberi banner peringatan internal bahwa pemohon masuk kategori Lainnya.
- Sistem menampilkan banner peringatan di sisi Admin untuk booking dengan kategori Lainnya (bukan di sisi pemohon)

**BR-BOOKING-006: Cancellation is Admin-Only**
- Applicants cannot self-cancel via application UI
- Cancellation request: applicant contacts Admin via WhatsApp or directly
- Admin performs cancellation with mandatory reason
- H-7 rule: batas waktu pembatalan dibaca dari `SystemConfig.cancellationWindowDays` (default: 7). Nilai ini dapat dikonfigurasi Admin tanpa coding — sesuai raw.md §XVI: *"Ini harus dijadikan parameter dalam workflow."*
- **If cancellation requested after H-n:** Admin can still cancel, but system shows warning dialog: *"Pembatalan ini melewati batas H-[n]. Pastikan ada alasan yang terdokumentasi."* Reason field mandatory. No system block.
- **Audit**: Yes — cancellation reason, timestamp, whether H-n was exceeded, all logged

**BR-BOOKING-007: Room Freed on Cancellation (Unpaid)**
- If booking cancelled and payment not yet verified, room slot becomes available again immediately
- **State**: cancelled, slot available for new bookings

**BR-BOOKING-008: Non-Refundable Policy**
- If payment has been verified and booking is subsequently cancelled, no refund is issued
- System records cancellation but does not reverse payment
- **Audit**: Yes

**BR-BOOKING-009: Booking Number Preserved on Reschedule**
- Rescheduled bookings retain their original booking number
  - History semua reschedule ditambahkan sebagai record `BookingHistory`

**BR-BOOKING-010: Room Availability Check on Room Change**
- When Admin edits room on an existing booking, system must check conflicts for the new room
- Applies same conflict logic as BR-BOOKING-002

**BR-BOOKING-011: Tariff Differential on Room Change**
- If Admin changes room and new tariff is higher, applicant must pay the difference
- If new tariff is lower, no refund issued
- **Notification**: WhatsApp to applicant with new amount due

**BR-BOOKING-012: Admin Data Correction — Notification Required**
- When Admin edits any booking data (date, time, room, attendees, description, applicant data, documents), applicant must be notified automatically
- No re-confirmation required from applicant

## Domain: PAYMENT

**BR-PAYMENT-001: Payment Deadline H-1**
- Payment must be completed by H-1 (1×24 hours before event start)
- **System**: computed field `payment_deadline = date_start - 24h`
- **Warning**: Admin dashboard shows warning list when `payment_deadline` is passed and payment not yet verified
- **Action**: booking is NOT auto-cancelled; Admin decides action manually
- **No formal approval flow** needed from Kepala UPTD — Admin handles tolerance discretionally

**BR-PAYMENT-002: H-1 Overdue — Toleransi Butuh Persetujuan Kepala UPTD**
- Jika pembayaran belum masuk saat H-1 terlewat, Admin dapat mengajukan toleransi kepada Kepala UPTD
- **Flow toleransi**: Admin klik "Ajukan Toleransi" → sistem buat record toleransi + kirim notifikasi WhatsApp ke Kepala UPTD → Kepala UPTD approve/reject via sistem
- Computed field `isPaymentOverdue = true` ketika `now() > paymentDeadline` dan `payment.state != VERIFIED`
- Admin dashboard menampilkan warning untuk semua booking yang overdue H-1
- Jika Kepala UPTD **approve** toleransi: booking tetap aktif, `toleranceApproved = true` dicatat di Payment
- Jika Kepala UPTD **reject** atau tidak merespons: Admin menentukan tindak lanjut (cancel booking)
- Booking **TIDAK** otomatis dibatalkan dalam kondisi apapun — keputusan akhir tetap di Admin
- **Audit**: Yes — request toleransi, keputusan approval/rejection, dan alasan dicatat di AuditLog
- **Notifikasi**: WA ke Kepala UPTD saat ada request toleransi; WA ke Admin saat diputuskan
- **Referensi raw.md §XV**: "Jika perlu toleransi: perlu persetujuan Kepala UPTD."

**BR-PAYMENT-003: Manual Payment Verification**
- Phase 1: No payment gateway
- QRIS/payment code prepared by Admin, shared with applicant
- Applicant uploads proof (portal or WhatsApp via Admin)
- Admin verifies manually: state pending → verified
- **Audit**: Yes — who verified, when

**BR-PAYMENT-004: Admin Upload for WhatsApp Proof**
- When payment proof received via WhatsApp, Admin uploads it to the dossier
- **System records**: source=whatsapp, uploaded_by=Admin, for_applicant=partner_id, timestamp
- This is important for audit trail integrity

## Domain: RESCHEDULE

**BR-RESCHEDULE-001: Maximum Reschedule Count**
- Regular rooms: maximum 3 reschedules, each at most H-3 before the (currently scheduled) date
- Convention Hall: maximum 3 reschedules, each at most H-30 before the date, within same calendar year
- **System**: validate reschedule_count < 3 and date difference constraint before allowing

**BR-RESCHEDULE-002: New Date Must Be Available**
- New date/time for reschedule must not conflict with existing approved bookings for same room
- Same conflict check as BR-BOOKING-002

**BR-RESCHEDULE-003: No Refund on Reschedule**
- Rescheduling does not trigger any refund regardless of payment status

**BR-RESCHEDULE-004: History Preserved**
- Setiap reschedule membuat record `BookingHistory` dengan `oldDateStart`, `newDateStart`, dan `reason`

**BR-RESCHEDULE-005: Reschedule is Admin-Initiated**
- Pemohon **tidak dapat** self-reschedule melalui UI portal
- Pemohon menghubungi Admin via WhatsApp resmi atau langsung
- Admin yang melakukan perubahan jadwal di sistem atas permintaan Pemohon
- Alasan wajib diisi
- Konsisten dengan mekanisme pembatalan (BR-BOOKING-006) — semua modifikasi jadwal melalui Admin

## Domain: PIC

**BR-PIC-001: Convention Hall CTP PIC Requirements**
- Peran wajib: PIC Utama, Operator Videotron, Petugas Kebersihan, Teknisi
- Semua harus pegawai internal UPTD (`Employee` model, `canBePic=true`)
- Booking Convention Hall CTP tidak bisa transisi ke `ACTIVE` tanpa 4 peran tersebut terisi

**BR-PIC-002: All Rooms Require Minimum 1 PIC**
- **Semua ruangan** (bukan hanya Convention Hall) wajib minimal 1 PIC Utama sebelum event
- `Room.requiresPic = true` secara default untuk semua ruangan
- Sistem enforce: booking tidak bisa transisi ke `ACTIVE` tanpa minimal 1 `PicAssignment` aktif

**BR-PIC-003: No Double Assignment**
- Same employee cannot be assigned as PIC for two overlapping bookings at the same time
- **System validates** before saving pic.assignment
- **Error**: 'Pegawai [name] sudah ditugaskan pada waktu yang sama untuk booking [ref]'

**BR-PIC-004: Kasubag TU PIC Substitution Authority**
- Kasubag TU can replace any PIC without approval from Kepala UPTD
- This applies even on the day of the event (H-0)
- **Audit**: Yes - old PIC, new PIC, reason, timestamp

**BR-PIC-005: PIC Notification on Assignment/Change**
- When PIC is assigned or changed, WhatsApp sent to: new PIC, applicant
- Applicant WhatsApp: PIC is assigned but private contact NOT shared
- If applicant wants to contact PIC: must go through Admin

## Domain: DOCUMENT

**BR-DOC-001: Mandatory Documents**
- Surat permohonan is mandatory for room booking submission
- Proposal is optional
- Disposition must be uploaded before Admin can approve

**BR-DOC-002: Document Immutability**
- Documents are never deleted from the system
- When corrected: new version becomes active, old version retained in history
- Deletion button must not exist in any document-related UI

**BR-DOC-003: Document Access Control**
- Dokumen hanya dapat diakses oleh: pemohon pemilik booking (via portal, setelah auth), Admin, dan role internal yang berwenang
- Tidak ada dokumen yang bisa diakses dengan menebak URL atau tanpa autentikasi
- Akses file via endpoint Express yang terautentikasi (`GET /api/documents/:id/download`), backend validasi kepemilikan, lalu kembalikan MinIO presigned URL (expiry 15 menit)
- MinIO key tidak pernah dikembalikan langsung ke client — selalu presigned URL

## Domain: AUDIT

**BR-AUDIT-001: Mandatory Audit Trail**
- Semua aksi signifikan harus membuat record di tabel `AuditLog` (Prisma model)
- Aksi signifikan: approval, rejection, cancellation, reschedule, PIC change, payment verification, document upload, room change, tariff change, master data change, workflow change
- Field wajib: performedById, performedAt, model, recordId, recordRef, action, fieldName (optional), oldValue, newValue, reason (jika applicable)

**BR-AUDIT-002: Audit Records Immutable**
- Record `AuditLog` tidak boleh di-update atau di-delete setelah dibuat
- Enforced di service layer: tidak ada fungsi `updateAuditLog()` atau `deleteAuditLog()`. Bukan DB constraint.

**BR-AUDIT-003: Priority Reason Audited**
- Saat Admin menggunakan priority override (BR-BOOKING-003), reason wajib disimpan di AuditLog

## Domain: WORKFLOW

**BR-WF-001: Mandatory Workflow Steps Protection**
- Workflow builder (Phase 4) TIDAK BOLEH mengizinkan Admin menghapus: step disposisi, step approval, payment tracking, audit logging
- Ini adalah persyaratan regulasi dan harus selalu dieksekusi terlepas dari konfigurasi layanan

**BR-WF-002: State Transitions Logged**
- Setiap transisi state booking harus dicatat di `AuditLog` dengan action=STATE_CHANGE, oldValue=state_lama, newValue=state_baru

## Domain: NOTIFICATION

**BR-NOTIF-001: WhatsApp Outbound via Official Number Only**
- Semua pesan WhatsApp outbound dikirim melalui satu nomor resmi UPTD
- Nomor HP PIC TIDAK PERNAH dikirimkan ke pemohon

**BR-NOTIF-002: PIC Contact Privacy**
- Jika pemohon ingin menghubungi PIC: jalur komunikasi adalah Pemohon → Admin → PIC
- Sistem tidak boleh mengekspose nomor HP PIC manapun di tampilan pemohon
- `Employee.phoneEncrypted` tidak pernah muncul di response API yang bisa diakses pemohon

**BR-NOTIF-003: Inbound WhatsApp Metadata**
- Saat Admin meng-upload dokumen yang diterima via WhatsApp, sistem mencatat: source=WHATSAPP, uploadedById=Admin, timestamp

## Domain: SKM

**BR-SKM-001: SKM Wajib untuk Menutup Booking**
- Setelah Admin melakukan checkout, notifikasi SKM dikirim otomatis ke pemohon (via Bull job queue)
- SKM **wajib diisi** agar booking dapat dinyatakan fully closed (`skmDone = true`)
- SKM **tidak memblokir** pembuatan booking baru oleh pemohon yang sama — hanya booking lama yang belum fully closed
- `SkmResponse` dibuat otomatis dengan state=PENDING saat checkout
- Timeout: jika SKM tidak diisi dalam periode timeout (`SystemConfig.skmTimeoutDays`, nilai TBD), booking auto-close dengan `skmDone = true` dan `SkmResponse.state = TIMEOUT`
- **Audit**: Yes — SKM submission dan auto-close dicatat
- **Referensi raw.md §XXIV**: Flow berakhir "Booking selesai" hanya setelah SKM di-submit

**BR-SKM-002: SKM Linked to Booking**
- Setiap response SKM uniquely linked ke satu booking (`bookingId @unique` di Prisma)
- Admin dapat melihat statistik aggregate SKM

## Domain: INTEGRATION

**BR-INT-001: WADUH Source of Truth**
- Working Space BITC occupancy adalah milik sistem WADUH
- Portal TIDAK BOLEH menampilkan "Tersedia" jika tidak bisa konfirmasi ke WADUH
- Cache Redis TTL 5 menit; setelah habis re-fetch; jangan sajikan stale data sebagai konfirmasi

**BR-INT-002: PKL No Duplicate Database**
- Database pendaftaran PKL adalah milik website PKL existing
- Portal hanya menampilkan listing PKL dan link; tidak menduplikasi data pendaftaran

**BR-INT-003: API Adapter Pattern**
- Semua integrasi dengan sistem eksternal melalui adapter di `backend/src/integrations/`
- Direct database queries ke DB sistem eksternal dilarang keras
