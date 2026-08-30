# Workflows and State Machines — CTP Digital Service Portal

> Cross-checked against aw.md sections VI–XXXI, XL on 2026-08-25.
> Source document: raw.md (original Indonesian requirements)

---

## 1. Booking State Machine (Prisma: Booking)

States yang disebutkan di aw.md section V (Dashboard Pemohon):
Draft → Diproses → Perlu Perbaikan → Disetujui → Menunggu Pembayaran → Selesai → Ditolak → Dibatalkan

`mermaid
stateDiagram-v2
    [*] --> draft : Pemohon membuka form
    draft --> submitted : Pemohon submit (surat permohonan wajib ada)
    submitted --> under_review : Admin membuka untuk review
    under_review --> revision_needed : Admin minta perbaikan (alasan wajib)
    revision_needed --> submitted : Pemohon resubmit
    under_review --> rejected : Admin tolak (alasan wajib)
    under_review --> approved : Admin approve\n[disposisi sudah di-upload + BR-BOOKING-001 + BR-BOOKING-002]
    approved --> waiting_payment : Layanan berbayar
    approved --> active : Layanan gratis (langsung aktif)
    waiting_payment --> active : Admin verifikasi pembayaran
    active --> completed : Admin lakukan checkout
    completed --> [*] : SKM selesai / timeout

    draft --> cancelled : Admin only, alasan wajib
    submitted --> cancelled : Admin only, alasan wajib
    under_review --> cancelled : Admin only, alasan wajib
    revision_needed --> cancelled : Admin only, alasan wajib
    approved --> cancelled : Admin only, alasan wajib
    waiting_payment --> cancelled : Admin only, alasan wajib
    active --> cancelled : Admin only, alasan wajib
`

### Tabel Transisi Lengkap

| Dari | Ke | Aktor | Trigger | Validasi | Side Effects | Notifikasi WA |
|---|---|---|---|---|---|---|
| draft | submitted | Pemohon | Submit form | Surat permohonan ter-upload | state=submitted, dossier dibuat | ✅ Konfirmasi pengajuan ke pemohon |
| submitted | under_review | Admin | Buka permohonan | - | state=under_review | - |
| under_review | revision_needed | Admin | Minta perbaikan | Alasan wajib diisi | state=revision_needed | ✅ WA ke pemohon: perbaikan diperlukan |
| revision_needed | submitted | Pemohon | Resubmit | Dokumen/data diperbarui | state=submitted | ✅ WA konfirmasi resubmit |
| under_review | rejected | Admin | Tolak | Alasan wajib diisi | state=rejected | ✅ WA ke pemohon: ditolak + alasan |
| under_review | approved | Admin | Approve | Disposisi ter-upload (BR-BOOKING-001), cek konflik (BR-BOOKING-002) | state=approved, slot terkunci, booking bentrok → auto-rejected | ✅ WA ke pemohon: disetujui; ✅ WA ke pemohon bentrok: ditolak |
| approved | waiting_payment | Sistem | Trigger payment | Layanan berbayar | state=waiting_payment, QRIS/kode bayar disiapkan | ✅ WA QRIS/kode bayar ke pemohon |
| approved | active | Sistem | Skip payment | Layanan gratis | state=active | - |
| waiting_payment | active | Admin | Verifikasi pembayaran | Bukti pembayaran valid | state=active, payment.state=verified | ✅ WA pembayaran terkonfirmasi |
| active | completed | Admin | Checkout | Event selesai | state=completed, skm_done=False | ✅ WA undangan SKM ke pemohon |
| completed | completed | Pemohon | Submit SKM | Form SKM diisi | skm_done=True | - |
| * | cancelled | Admin | Batalkan | Alasan wajib, H-7 rule (BR-BOOKING-006) | state=cancelled; jika belum bayar: slot bebas (BR-BOOKING-007); jika sudah bayar: non-refund (BR-BOOKING-008) | ✅ WA konfirmasi pembatalan |

---

## 2. Flow Lengkap Peminjaman Ruangan (raw.md section VI)

Flow tepat sesuai aw.md:

`
Pilih Gedung → Pilih Tanggal → Lihat Semua Ruangan → Lihat Detail Ruangan
→ Pilih Waktu → Isi Data → Upload Surat Permohonan → Ajukan
→ Verifikasi Admin → Disposisi Kepala Dinas (offline)
→ Admin Upload Disposisi → Admin Approve → Ruangan Terkunci
→ Pembayaran (jika berbayar) → Pelaksanaan → Check-out → SKM → Selesai
`

`mermaid
sequenceDiagram
    participant Pemohon
    participant Portal
    participant Admin
    participant Sistem
    participant WhatsApp
    participant KepalaUPTD

    Pemohon->>Portal: 1. Pilih Gedung (CTP/BITC)
    Pemohon->>Portal: 2. Pilih Tanggal
    Portal->>Pemohon: 3. Tampilkan semua ruangan (Tersedia / Tidak tersedia)
    Pemohon->>Portal: 4. Lihat detail ruangan (foto, kapasitas, fasilitas, tarif, aturan, status)
    Pemohon->>Portal: 5. Pilih waktu
    Pemohon->>Portal: 6. Isi Data (nama kegiatan, peserta, tujuan, jumlah peserta, deskripsi)
    Pemohon->>Portal: 7. Upload Surat Permohonan (WAJIB) + Proposal (opsional)
    Pemohon->>Portal: 8. Ajukan → state: draft → submitted
    Portal->>Sistem: Simpan booking, buat dossier
    Sistem->>WhatsApp: 9. WA konfirmasi pengajuan → Pemohon

    Admin->>Sistem: 10. Verifikasi Admin → state: under_review
    Note over KepalaUPTD,Admin: 11. Disposisi Kepala Dinas diproses di LUAR aplikasi\n(mekanisme internal pemerintah)
    Admin->>Sistem: 12. Upload scan disposisi ke dossier (doc_type=disposisi)

    alt Perlu Perbaikan
        Admin->>Sistem: Request perbaikan → state: revision_needed
        Sistem->>WhatsApp: WA ke Pemohon: perbaikan diperlukan
        Pemohon->>Portal: Perbaiki dan resubmit → state: submitted
    end

    Admin->>Sistem: 13. Approve\n[cek disposisi BR-BOOKING-001 + cek konflik BR-BOOKING-002]
    Sistem->>Sistem: 14. Slot terkunci (state: approved)
    Sistem->>Sistem: 15. Booking bentrok → auto-rejected

    alt Ada bentrok
        Sistem->>WhatsApp: WA ke pemohon bentrok: "Ruangan/tanggal/waktu telah disetujui untuk permohonan lain"
    end

    Sistem->>WhatsApp: 16. WA approval ke Pemohon

    alt Layanan Berbayar
        Sistem->>Sistem: state: waiting_payment
        Sistem->>WhatsApp: 17. WA QRIS/kode bayar ke Pemohon
        Pemohon->>Portal: 18. Bayar + Upload bukti pembayaran
        Note over Admin,Pemohon: ATAU pemohon kirim bukti via WA → Admin upload dengan catatan source=whatsapp
        Admin->>Sistem: 19. Verifikasi pembayaran → state: active
        Sistem->>WhatsApp: WA pembayaran terkonfirmasi
    else Layanan Gratis
        Sistem->>Sistem: state: active (langsung)
    end

    Admin->>Sistem: 20. Assign PIC
    Sistem->>WhatsApp: WA ke PIC baru (briefing tugas)
    Sistem->>WhatsApp: WA ke Pemohon (PIC ditugaskan, tanpa nomor pribadi PIC)

    Note over Pemohon,Admin: 21. Pelaksanaan kegiatan

    Admin->>Sistem: 22. Check-out → state: completed
    Sistem->>WhatsApp: 23. WA undangan SKM ke Pemohon

    Pemohon->>Portal: 24. Isi dan submit SKM
    Sistem->>Sistem: 25. skm_done=True → Booking selesai
`

---

## 3. Pemilihan Ruangan (raw.md section VII)

**Urutan pilihan pemohon:**
1. Pilih **Gedung** (CTP atau BITC)
2. Pilih **Tanggal**
3. Lihat **semua ruangan** yang tersedia — sistem menampilkan status: Tersedia / Tidak tersedia
4. Lihat **detail ruangan**: foto, kapasitas, fasilitas, tarif, aturan, status

> **Catatan implementasi:** Ruangan yang tidak tersedia TETAP ditampilkan (dengan label "Tidak tersedia"), bukan disembunyikan. Ini penting agar pemohon bisa melihat alternatif.

---

## 4. Aturan Kapasitas (raw.md section VIII)

| Ruangan | Minimum | Maksimum | Catatan |
|---|---|---|---|
| Ruangan biasa | Tidak ada minimum | Sesuai kapasitas | - |
| Convention Hall CTP | 100 peserta | 500 peserta | Wajib min 100 |
| Convention Hall BITC | Tidak ada minimum | 77 peserta | Full day only |

**Validasi sistem:** Saat pemohon submit, sistem cek expected_attendees terhadap capacity_min dan capacity_max.

---

## 5. Kategori Pemohon (raw.md section IX)

Pemohon **wajib** memilih satu kategori:
- **OPD/Instansi/Lembaga**
- **Ekonomi Kreatif** → wajib pilih 1 dari 17 subsektor
- **Lainnya** → diperlukan dasar/arahan pimpinan sesuai ketentuan (lihat OQ-004)

---

## 6. Form Kegiatan (raw.md section X)

Field **minimal** yang wajib ada di form booking:

| Field | Status | Catatan |
|---|---|---|
| Nama kegiatan | Wajib | activity_name |
| Peserta (siapa) | Wajib | attendees_description |
| Tujuan kegiatan | Wajib | activity_purpose |
| Jumlah peserta | Wajib | expected_attendees (perkiraan) |
| Deskripsi kegiatan | Wajib | activity_description |
| Proposal | Opsional | upload PDF/doc |
| Surat permohonan | **WAJIB** | wajib sebelum bisa submit |

---

## 7. Mekanisme Disposisi Kepala Dinas (raw.md section XI)

**Prinsip penting:**
- Disposisi diproses **di luar aplikasi** sesuai mekanisme internal pemerintah
- Admin menerima disposisi fisik, lalu **upload** scan ke dossier booking
- Sistem **tidak bisa approve** booking sampai disposisi di-upload
- Ini adalah regulatory requirement yang TIDAK bisa di-bypass

`
[Offline] Kepala Dinas beri disposisi pada surat fisik
                    ↓
Admin menerima surat dengan disposisi
                    ↓
Admin upload scan disposisi ke dossier (doc_type = disposisi)
                    ↓
Admin klik Approve (sistem validasi disposisi ada)
                    ↓
Booking → state: approved
`

---

## 8. Mekanisme Benturan Booking (raw.md section XII)

**Sistem mendukung beberapa permohonan untuk slot yang sama** — semua boleh masuk.

`
Pemohon A ─┐
Pemohon B ─┼── Slot yang sama → semua state: submitted / under_review
Pemohon C ─┘

Admin approve Pemohon A
        ↓
Slot terkunci untuk A (state: approved)
        ↓
Pemohon B & C → state: rejected otomatis
Alasan: "Ruangan/tanggal/waktu telah disetujui untuk permohonan lain."
        ↓
WA dikirim ke B dan C
`

---

## 9. Prioritas Booking (raw.md section XIII)

Jika ada beberapa permohonan bentrok, Admin **boleh memilih** mana yang diprioritaskan (bukan harus FCFS).

**Kewajiban saat memilih prioritas:**
- Alasan prioritas **wajib diisi** (bukan opsional)
- Alasan bersifat **internal** (tidak terlihat oleh pemohon)
- Alasan **masuk audit trail**
- Waktu pengajuan dan waktu persetujuan masing-masing dicatat

---

## 10. Flow Pembayaran (raw.md section XIV–XV)

**Sistem yang digunakan:** QRIS/kode bayar yang disiapkan Admin (Phase 1, tanpa payment gateway)

```
Admin siapkan QRIS/kode bayar
        ↓
Pemohon menerima via WA / portal
        ↓
Pemohon bayar
        ↓
Pemohon upload bukti (via portal ATAU kirim ke WA resmi UPTD)
        ↓
[Jika via WA] Admin upload bukti ke dossier (source=whatsapp, timestamp tercatat)
        ↓
Admin verifikasi
        ↓
Lunas → state: active
```

**Batas pembayaran (H-1):**
- Pembayaran harus dilakukan paling lambat **1×24 jam sebelum kegiatan**
- Jika belum bayar saat H-1: **dashboard Admin menampilkan warning**
- Booking **TIDAK** otomatis dibatalkan — Admin yang menentukan tindak lanjut

**Alur Toleransi H-1 (sesuai raw.md §XV: "perlu persetujuan Kepala UPTD"):**
```
H-1 terlewat, pemohon belum bayar
        ↓
Admin memutuskan perlu toleransi
        ↓
Admin klik "Ajukan Toleransi" → sistem catat + kirim WA ke Kepala UPTD
        ↓
Kepala UPTD buka portal → Approve / Reject (dengan alasan)
        ↓
[Jika Approve] booking tetap aktif, toleranceApproved = true → AuditLog
[Jika Reject]  Admin menentukan tindak lanjut (cancel atau tunggu)
        ↓
WA konfirmasi keputusan dikirim ke Admin
```

---

## 11. Flow Pembatalan (raw.md section XVI)

**Aturan yang harus jadi parameter di workflow (sesuai raw.md §XVI):**
- Batas waktu pembatalan dibaca dari **`SystemConfig.cancellationWindowDays`** (default: 7) — bukan hard-coded
- Pemohon **TIDAK** bisa self-cancel via tombol di aplikasi
- Pemohon menghubungi Admin via **WhatsApp resmi** atau langsung ke Admin
- Admin yang melakukan pembatalan di sistem

```
Pemohon hubungi Admin via WA/langsung
        ↓
Admin buka booking di sistem
        ↓
Admin cek H-[n] dari SystemConfig.cancellationWindowDays
(apakah masih dalam batas waktu?)
        ↓
Admin isi alasan pembatalan (WAJIB)
        ↓
Admin klik Batalkan
        ↓
Jika BELUM bayar → ruangan langsung tersedia kembali
Jika SUDAH bayar → pembatalan tanpa refund (non-refundable)
        ↓
WA konfirmasi pembatalan ke Pemohon
```

---

## 12. Flow Reschedule (raw.md section XVII)

| Parameter | Ruangan Biasa | Convention Hall |
|---|---|---|
| Maksimal reschedule | 3 kali | 3 kali |
| Batas waktu | H-3 (`SystemConfig.rescheduleWindowDaysRegular`) | H-30 (`SystemConfig.rescheduleWindowDaysConvHall`) |
| Tahun kalender | Bebas | Tahun kalender yang sama |
| Tanggal baru | Harus tersedia (cek konflik) | Harus tersedia (cek konflik) |
| Refund | Tidak ada | Tidak ada |
| Nomor booking | Tetap sama | Tetap sama |

> **Admin-Initiated Only (BR-RESCHEDULE-005):** Pemohon tidak dapat self-reschedule via portal.
> Pemohon menghubungi Admin via WhatsApp resmi atau langsung. Admin yang melakukan perubahan di sistem.

```
Pemohon hubungi Admin via WA/langsung (minta reschedule)
        ↓
Admin buka booking di sistem
        ↓
Sistem cek: reschedule_count < 3?
        ↓
Sistem cek: (jadwal lama - hari ini) >= H-n dari SystemConfig?
        ↓
Sistem cek: tanggal baru tersedia? (cek konflik booking lain)
        ↓
[Jika Convention Hall] Sistem cek: tahun kalender sama?
        ↓
Admin isi alasan reschedule (WAJIB)
        ↓
Buat record BookingHistory (oldDateStart, newDateStart, alasan)
        ↓
Update booking: tanggal baru, reschedule_count += 1
Nomor booking TIDAK berubah
        ↓
WA ke Pemohon: jadwal baru dikonfirmasi
        ↓
Audit trail dicatat
```

**History reschedule tampil di dossier:**
- Reschedule 1: [tanggal lama] → [tanggal baru 1]
- Reschedule 2: [tanggal baru 1] → [tanggal baru 2]
- Reschedule 3: [tanggal baru 2] → [tanggal baru 3]

---

## 13. Admin Edit Data (raw.md section XVIII)

Admin dapat mengubah **tanpa perlu konfirmasi ulang dari Pemohon**:

| Field yang bisa diubah | Konsekuensi khusus |
|---|---|
| Tanggal | Cek konflik jika ruangan sama |
| Waktu | Cek konflik |
| Ruangan | **Wajib cek benturan** pada ruangan baru |
| Peserta | Notifikasi ke pemohon |
| Deskripsi | Notifikasi ke pemohon |
| Data pemohon | Notifikasi ke pemohon |
| Dokumen | Notifikasi ke pemohon |

**Aturan tarif saat ruangan berubah:**
- Tarif baru **lebih tinggi** → Pemohon wajib bayar selisih
- Tarif baru **lebih rendah** → Tidak ada refund

**Setelah setiap perubahan:** Pemohon **wajib diberi notifikasi** (WA + sistem).

---

## 14. Audit Trail (raw.md section XIX)

**Format minimal audit trail:**
`
[Tanggal] [Waktu]
[Nama Admin]
[Aksi: misal "Mengubah ruangan"]

Sebelum: [Ruang A]
Sesudah: [Ruang B]

Alasan: [Penyesuaian operasional]
`

**Berlaku untuk:**
- Approval
- Pembayaran
- Dokumen
- Tarif
- PIC
- Pembatalan
- Reschedule
- Perubahan master data
- Perubahan workflow

---

## 15. Payment State Machine (Prisma: Payment)

`mermaid
stateDiagram-v2
    [*] --> pending : Payment record dibuat saat booking approved
    pending --> proof_uploaded : Pemohon upload via portal\nATAU Admin upload bukti WA
    proof_uploaded --> verified : Admin verifikasi → booking state: active
    proof_uploaded --> rejected : Admin tolak bukti (alasan wajib) → kembali pending
    rejected --> pending : Pemohon upload ulang
    pending --> warning : Melewati H-1 (computed, tidak otomatis cancel)
`

---

## 16. Document State Machine (Prisma: BookingDocument + DocumentVersion)

- uploaded → ctive : Versi pertama atau versi baru
- ctive → superseded : Versi baru di-upload, versi lama jadi histori
- ❌ **Tidak ada state deleted** — dokumen tidak boleh dihapus (BR-DOC-002)

**Dokumen yang ada di setiap dossier booking** (raw.md section XX):
1. Surat permohonan (WAJIB)
2. Proposal (opsional)
3. Surat pernyataan (opsional)
4. TTD / tanda tangan
5. e-Meterai (jika digunakan)
6. Disposisi Kepala Dinas (WAJIB sebelum approve)
7. Bukti pembayaran
8. Bukti booking
9. Histori booking
10. Info PIC
11. Catatan admin
12. SKM

---

## 17. PIC Assignment Workflow (raw.md section XXI–XXII)

### PIC untuk Convention Hall CTP (WAJIB semua 4 peran):
1. PIC Utama
2. Operator Videotron
3. Petugas Kebersihan
4. Teknisi

### PIC untuk Ruangan Lainnya:
- Tidak ada Operator Videotron
- Persyaratan lain sesuai konfigurasi ruangan (lihat OQ-007)

### Aturan PIC:
- PIC **wajib pegawai internal** UPTD Cimahi Techno Park
- **Tidak boleh double assignment** pada waktu yang sama (BR-PIC-003)

### Flow Assignment PIC:
`
Admin buka booking (state: approved / active)
        ↓
Admin pilih karyawan untuk setiap peran PIC
        ↓
Sistem cek: pegawai tidak double-assigned pada slot yang sama?
        ↓
Simpan assignment
        ↓
WA ke PIC baru: informasi tugas/briefing
WA ke Pemohon: PIC sudah ditugaskan
[TANPA nomor HP pribadi PIC]
`

### Flow Pergantian PIC (raw.md section XXII):
`
Kasubag TU buka booking
        ↓
Kasubag TU pilih PIC pengganti
[TANPA perlu approval Kepala UPTD — termasuk hari-H]
        ↓
Sistem nonaktifkan assignment PIC lama
Sistem buat assignment PIC baru
        ↓
WA ke PIC baru: informasi tugas
WA ke Pemohon: PIC diganti
[TANPA nomor HP pribadi PIC]
        ↓
Audit trail: PIC lama, PIC baru, alasan, timestamp
`

**Jika Pemohon ingin menghubungi PIC:**
`
Pemohon → (WA/telpon) → Admin → Admin → PIC
`
Nomor pribadi PIC **TIDAK PERNAH** diberikan ke Pemohon.

---

## 18. WhatsApp Flow (raw.md section XXIII)

**Satu nomor resmi UPTD** untuk semua komunikasi.

### Outbound (Sistem → Pemohon/PIC):
| Event | Penerima |
|---|---|
| Konfirmasi pengajuan | Pemohon |
| Approval | Pemohon |
| Penolakan | Pemohon |
| Revisi diperlukan | Pemohon |
| Tagihan pembayaran (QRIS/kode bayar) | Pemohon |
| Pembayaran terkonfirmasi | Pemohon |
| Reminder H-3 | Pemohon |
| Perubahan data booking | Pemohon |
| Reschedule dikonfirmasi | Pemohon |
| PIC ditugaskan (tanpa nomor pribadi) | Pemohon |
| PIC ditugaskan (briefing tugas) | PIC baru |
| Pembatalan | Pemohon |
| Penolakan karena bentrok | Pemohon bentrok |
| Undangan SKM | Pemohon |

### Inbound (Pemohon → Admin via WA):
Admin menerima dan memproses secara manual:
- Pertanyaan
- Dokumen
- Bukti pembayaran
- Permintaan pembatalan
- Informasi lainnya

**Pencatatan inbound document upload:**
Ketika Admin upload dokumen yang diterima via WA ke dossier, sistem mencatat:
- Uploaded oleh: Admin (nama)
- Atas permintaan: Pemohon (nama/ID)
- Media: WhatsApp
- Timestamp

---

## 19. SKM Flow (raw.md section XXIV)

```
Kegiatan selesai
        ↓
Admin lakukan Check-out → state: completed
        ↓
Sistem otomatis buat SkmResponse (state=PENDING) + kirim notifikasi SKM
(WA ke Pemohon + notifikasi di portal)
        ↓
Pemohon isi form SKM di portal
        ↓
Pemohon submit
        ↓
Data SKM tersimpan (linked ke nomor booking)
SkmResponse.state = COMPLETED
        ↓
Booking selesai (skm_done = true) ← fully closed
```

**Jika SKM tidak diisi (timeout):**
```
Sistem cron job harian cek SkmResponse.state = PENDING
        ↓
Jika (now - checkoutAt) > SystemConfig.skmTimeoutDays
        ↓
SkmResponse.state = TIMEOUT, skm_done = true (auto-close)
AuditLog dicatat
```

> **Catatan:** SKM **wajib** untuk menutup booking (sesuai raw.md §XXIV). SKM **tidak memblokir** pembuatan booking baru oleh pemohon yang sama.

**Admin dapat melihat statistik SKM agregat.**

---

## 20. PKL/Magang/Penelitian Flow (raw.md section XXV)

### Admin membuat kebutuhan PKL:
Field yang bisa diisi Admin:
- Jenis (PKL / Magang / Penelitian)
- Judul
- Judul penelitian spesifik
- Deskripsi
- Kuota
- Persyaratan
- Periode
- Batas pendaftaran

### Alur Pelamar:
`
Pelamar lihat daftar kebutuhan PKL di portal
        ↓
Pelamar klik Lamar (isi form, upload dokumen)
        ↓
Admin review
        ↓
Setelah disetujui:
Sistem sediakan surat pengantar TTE ke Bakesbangpol (template PDF, siap cetak)
        ↓
[Integrasi dengan website PKL existing — tidak duplikasi database]
`

**Catatan:** Strategi integrasi website PKL existing masih pending (OQ-013). Interim: Admin kelola listing PKL secara manual di portal.

---

## 21. FOKUS — Katalog Foto Produk (raw.md section XXVI)

**Bukan sistem booking.** Hanya katalog tampilan.

`
Admin isi/update katalog foto produk (ctp.fokus.catalog)
  Field: foto, nama produk, kategori, pemilik, deskripsi, tanggal, hasil foto
        ↓
Portal menampilkan katalog kepada pengunjung/pemohon
        ↓
Tombol "Daftar FOKUS" → link ke sistem FOKUS existing
[Portal tidak mengambil alih pendaftaran FOKUS]
`

---

## 22. Working Space BITC (raw.md section XXVII)

**Menggunakan sistem WADUH existing.** Portal hanya sebagai pintu masuk.

Pilihan paket:
- Per jam
- Per hari
- Per bulan

**Prinsip kritis:**
> Portal TIDAK BOLEH menampilkan "Tersedia" jika WADUH mengatakan "Penuh".

WADUH adalah **sumber kebenaran tunggal** untuk okupansi Working Space.

**Status saat ini:** WADUH source code belum diterima (OQ-012).
**Interim:** Halaman Working Space menampilkan info paket + tombol "Hubungi Admin untuk ketersediaan".

---

## 23. Virtual Office Flow (raw.md section XXVIII)

`
Pemohon pilih Paket Virtual Office
        ↓
Lihat fasilitas yang disediakan
        ↓
Lihat Tarif
        ↓
Isi Data (form pendaftaran)
        ↓
Upload dokumen persyaratan
        ↓
Admin verifikasi dokumen
        ↓
Pembayaran (QRIS/kode bayar)
        ↓
Layanan Aktif
`

State machine: draft → submitted → under_review → approved → waiting_payment → active

---

## 24. Studio Dubbing Flow (raw.md section XXIX)

```
Pemohon pilih tanggal
        ↓
Lihat availability (slot yang tersedia)
        ↓
Pilih waktu
        ↓
Isi kebutuhan (deskripsi kebutuhan dubbing)
        ↓
Ajukan
        ↓
Admin Approval
        ↓
Booking dikonfirmasi → state: active
```

State machine: `draft → submitted → approved → active → completed`

> **Catatan Disposisi:** raw.md §XXIX tidak menyebutkan disposisi Kepala Dinas untuk Studio Dubbing. Pending konfirmasi klien (OQ-020). Sementara: `Service.requiresDisposition = true` sesuai default raw.md §XI.
>
> **Catatan Pembayaran:** raw.md §XXIX tidak menyebutkan langkah pembayaran untuk Studio Dubbing. Pending konfirmasi klien. State machine di atas tidak menyertakan `waiting_payment`. Jika Studio Dubbing berbayar, state machine akan menjadi: `draft → submitted → approved → waiting_payment → active → completed`.

---

## 25. Absensi Flow (raw.md section XXX)

`
Perangkat Face Thermal / Fingerprint merekam kehadiran
        ↓
Admin / Kasubag TU export data dari perangkat
        ↓
Upload/import ke sistem (format CSV/Excel)
        ↓
Sistem generate rekap per pegawai per bulan
        ↓
Kasubag TU / Kepala UPTD dapat melihat rekap dan histori
`

Akses terbatas: **Kasubag TU** dan **Kepala UPTD** saja.

---

## 26. Kalender (raw.md section XXXI)

**View yang tersedia:**
- Bulanan
- Mingguan
- Harian

**Filter yang tersedia:**
- Gedung (CTP/BITC)
- Ruangan
- Status booking
- Pemohon
- PIC
- Layanan
- Periode

**Interaksi:** Klik kegiatan di kalender → tampil detail lengkap booking.
