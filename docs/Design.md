# Design System — CTP Smart Service Portal

> Panduan desain UI/UX untuk portal layanan digital UPTD Cimahi Techno Park.
> Dokumen ini menjadi **single source of truth** untuk semua keputusan visual dan interaksi.

---

## Daftar Isi

- [1. Filosofi Desain](#1-filosofi-desain)
- [2. Referensi Desain](#2-referensi-desain)
- [3. Sistem Warna](#3-sistem-warna)
- [4. Tipografi](#4-tipografi)
- [5. Spacing & Grid](#5-spacing--grid)
- [6. Komponen Dasar (shadcn/ui Mapping)](#6-komponen-dasar-shadcnui-mapping)
- [7. Sistem Status & Tag](#7-sistem-status--tag)
- [8. Pola Form & Multi-Step](#8-pola-form--multi-step)
- [9. Pola Booking & Kalender (Cal.com Style)](#9-pola-booking--kalender-calcom-style)
- [10. Layout per Halaman](#10-layout-per-halaman)
- [11. Strategi Responsif](#11-strategi-responsif)
- [12. Anti-Pattern (DILARANG)](#12-anti-pattern-dilarang)

---

## 1. Filosofi Desain

Portal CTP adalah layanan pemerintah. Desain harus menyampaikan **kepercayaan, kejelasan, dan efisiensi** — bukan kreativitas visual.

### Prinsip Utama

| # | Prinsip | Penjelasan |
|---|---------|------------|
| 1 | **Kejelasan di atas segalanya** | User harus tahu persis apa yang harus dilakukan di setiap halaman. Tidak ada ambiguitas. |
| 2 | **Satu hal per layar** | Setiap step form berisi satu pertanyaan atau satu keputusan. Tidak ada form panjang yang scroll tanpa akhir. |
| 3 | **Formal tapi tidak kaku** | Tone visual pemerintahan yang bersih dan modern, bukan template WordPress tahun 2010. |
| 4 | **Aksesibel tanpa kompromi** | WCAG 2.1 AA minimum. Warna bukan satu-satunya pembawa makna. Contrast ratio ≥ 4.5:1 untuk teks. |
| 5 | **Data-driven, bukan dekoratif** | Setiap elemen visual punya fungsi. Tidak ada ilustrasi atau ornamen tanpa tujuan informasional. |
| 6 | **Konsisten, bukan seragam** | Pattern yang sama untuk masalah yang sama. Variasi hanya jika konteks user benar-benar berbeda. |

### Dua Mode Visual

Portal ini punya dua surface dengan karakter berbeda yang harus **tetap terasa satu produk**:

```
┌─────────────────────────────────────────────────────────────┐
│  PORTAL PUBLIK (Pemohon)                                    │
│  Karakter: GOV.UK — bersih, step-by-step, banyak white space│
│  Fokus: Menuntun user menyelesaikan pengajuan tanpa bingung  │
├─────────────────────────────────────────────────────────────┤
│  PANEL ADMIN (Admin, Kasubag TU, Kepala UPTD)               │
│  Karakter: Dense dashboard — tabel, filter, action toolbar   │
│  Fokus: Efisiensi operasional, quick actions, status overview│
└─────────────────────────────────────────────────────────────┘
```

Keduanya berbagi: color palette, tipografi, spacing scale, dan komponen dasar yang sama.

---

## 2. Referensi Desain

| Aspek | Referensi | Apa yang Diambil |
|-------|-----------|------------------|
| Form & alur layanan | [GOV.UK Design System](https://design-system.service.gov.uk/) | "One thing per page", task list, summary list, error pattern, two-thirds layout |
| Booking tanggal & waktu | [Cal.com](https://cal.com) | Split-pane calendar, constraint-based time slots, two-step confirm interaction |
| Dashboard admin | [Linear](https://linear.app) | Tabel dengan faceted filter, status badge, keyboard shortcuts, dense-but-clean layout |
| Komponen UI | [shadcn/ui](https://ui.shadcn.com) | Semua primitif (Button, Dialog, Table, Form, Card, dll) — ini library yang dipakai |
| Konfirmasi & panel | GOV.UK Panel component | Layar konfirmasi hijau dengan nomor referensi besar |

> **Bukan** referensi: Dribbble shots, template admin Bootstrap, landing page startup dengan gradient dan 3D.

---

## 3. Sistem Warna

### 3.1 Palette Utama

Karena belum ada branding guideline resmi CTP/Pemkot Cimahi, palette ini dirancang untuk:
- Menyampaikan otoritas pemerintah (navy/biru gelap)
- Membedakan dari portal pemerintah generik (accent teal sebagai sentuhan "techno park")
- Memastikan contrast ratio WCAG AA di semua kombinasi

```
TAILWIND CONFIG — extend colors
```

| Token | Hex | Tailwind Class | Penggunaan |
|-------|-----|----------------|------------|
| **Primary 900** | `#0C1D3A` | `primary-900` | Header utama, nav background, teks heading |
| **Primary 700** | `#1A3A6B` | `primary-700` | Tombol primary, link default |
| **Primary 500** | `#2E5EA8` | `primary-500` | Link hover, icon aktif |
| **Primary 100** | `#E8EEF7` | `primary-100` | Background highlight ringan, selected row |
| **Accent 600** | `#0D7377` | `accent-600` | Badge "Techno Park", elemen pembeda |
| **Accent 400** | `#2AA5A9` | `accent-400` | Icon secondary, tag info |
| **Accent 50** | `#E6F5F5` | `accent-50` | Background panel info |

### 3.2 Warna Semantik (Status & Feedback)

| Token | Hex | Penggunaan |
|-------|-----|------------|
| **Success 700** | `#15803D` | Konfirmasi panel, tag APPROVED/ACTIVE/COMPLETED, ikon sukses |
| **Success 50** | `#F0FDF4` | Background notifikasi sukses |
| **Warning 600** | `#CA8A04` | Tag WAITING_PAYMENT, badge H-1 overdue, ikon peringatan |
| **Warning 50** | `#FEFCE8` | Background banner peringatan |
| **Error 600** | `#DC2626` | Error summary, inline error, tag REJECTED/CANCELLED |
| **Error 50** | `#FEF2F2` | Background error summary |
| **Info 600** | `#2563EB` | Tag SUBMITTED/UNDER_REVIEW, notifikasi informasional |
| **Info 50** | `#EFF6FF` | Background info banner |

### 3.3 Warna Netral

| Token | Hex | Penggunaan |
|-------|-----|------------|
| **Neutral 950** | `#0A0A0A` | Teks utama (body text, heading) |
| **Neutral 700** | `#404040` | Teks sekunder (label, caption, hint) |
| **Neutral 400** | `#A3A3A3` | Teks disabled, placeholder |
| **Neutral 200** | `#E5E5E5` | Border input, divider tabel |
| **Neutral 100** | `#F5F5F5` | Background page (di belakang card), stripe tabel |
| **Neutral 0** | `#FFFFFF` | Background card, form, modal |

### 3.4 Warna Fungsional Khusus

| Token | Hex | Penggunaan |
|-------|-----|------------|
| **Focus** | `#FACC15` (yellow-400) | Focus ring — border 3px kuning + outline 3px hitam. Wajib ada di semua elemen interaktif untuk aksesibilitas keyboard. |
| **Link Default** | `#1A3A6B` (primary-700) | Teks link — selalu underlined. |
| **Link Visited** | `#6B21A8` (purple-800) | Link yang sudah dikunjungi. |
| **Link Hover** | `#0C1D3A` (primary-900) | Link saat hover. |

### 3.5 Aturan Warna

1. **Warna TIDAK PERNAH menjadi satu-satunya pembawa makna.** Selalu disertai label teks atau ikon.
2. **Tidak ada gradient dekoratif.** Warna solid saja.
3. **Background page** selalu `neutral-100`. Card/panel di atasnya `neutral-0` (putih).
4. **Dark mode**: Tidak diimplementasikan di Phase 1. Portal pemerintah harus konsisten tampilannya.

---

## 4. Tipografi

### 4.1 Font Stack

```css
/* Primary — untuk semua teks */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Inter** dipilih karena:
- Dirancang khusus untuk layar (legibility tinggi di semua ukuran)
- Mendukung `font-variant-numeric: tabular-nums` (penting untuk tabel angka & kalender)
- Gratis, open-source, sudah ada di Google Fonts
- Tidak terasa "startup-y" seperti yang lain — netral dan profesional

> **Tidak menggunakan** font kedua untuk heading. Satu font, variasi weight. Lebih konsisten, lebih sedikit HTTP request.

### 4.2 Skala Tipografi

Mengikuti pola GOV.UK — ukuran berubah di breakpoint `640px`:

| Level | Desktop | Mobile (<640px) | Weight | Penggunaan |
|-------|---------|-----------------|--------|------------|
| **Display** | 36px / 2.25rem | 28px / 1.75rem | 700 (Bold) | Judul halaman utama (H1) |
| **Heading L** | 28px / 1.75rem | 22px / 1.375rem | 600 (Semibold) | Section heading (H2) |
| **Heading M** | 22px / 1.375rem | 18px / 1.125rem | 600 (Semibold) | Sub-section heading (H3) |
| **Heading S** | 18px / 1.125rem | 16px / 1rem | 600 (Semibold) | Card title, group label (H4) |
| **Body** | 16px / 1rem | 16px / 1rem | 400 (Regular) | Paragraf, deskripsi, form label |
| **Body Small** | 14px / 0.875rem | 14px / 0.875rem | 400 (Regular) | Hint text, caption, metadata, tabel |
| **Caption** | 12px / 0.75rem | 12px / 0.75rem | 500 (Medium) | Tag text, badge, overline |

### 4.3 Aturan Tipografi

1. **Line height**: 1.5 untuk body text, 1.3 untuk heading.
2. **Alignment**: Selalu **left-aligned**. Centered hanya di: panel konfirmasi dan empty state. Justified dan right-aligned **dilarang**.
3. **Max line length**: ~75 karakter (dicapai lewat two-thirds layout, bukan `max-width` pada teks).
4. **Tidak ada teks ALL CAPS** kecuali di dalam tag/badge status (dan itupun pakai `font-variant: small-caps` atau explicit uppercase di Tailwind).
5. **Tabular numbers**: Wajib untuk kolom angka di tabel, kalender, dan harga. Gunakan `tabular-nums` di Tailwind.

---

## 5. Spacing & Grid

### 5.1 Spacing Scale (8px Base)

Mengikuti pola GOV.UK dengan base unit 4px/8px:

| Token | Value | Penggunaan Tipikal |
|-------|-------|-------------------|
| `space-1` | 4px | Padding ikon, gap sangat kecil |
| `space-2` | 8px | Gap antar elemen inline, padding badge |
| `space-3` | 12px | Padding internal button, gap form label-to-input |
| `space-4` | 16px | Padding card internal, gap antar form field |
| `space-5` | 20px | Margin antar komponen kecil |
| `space-6` | 24px | Padding section, margin antar card |
| `space-8` | 32px | Margin antar section besar |
| `space-10` | 40px | Margin antar major section |
| `space-12` | 48px | Top/bottom padding halaman |
| `space-16` | 64px | Separator antar major layout block |

### 5.2 Grid System

```
┌──────────────────── max-width: 1120px ────────────────────┐
│  Gutter: 16px (mobile) / 24px (desktop)                   │
│                                                            │
│  ┌─────────────────────────────┐  ┌──────────────────┐     │
│  │     Two-Thirds (66.6%)      │  │  One-Third (33%) │     │
│  │     Form content, text      │  │  Sidebar, help   │     │
│  └─────────────────────────────┘  └──────────────────┘     │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Full Width (100%)                       │   │
│  │              Dashboard, tabel, kalender               │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

| Layout | Penggunaan |
|--------|------------|
| **Two-Thirds + One-Third** | Halaman form portal publik (form di kiri, help/info di kanan) |
| **Full Width** | Dashboard admin, tabel booking, kalender operasional |
| **Centered Narrow (max 560px)** | Login, register, konfirmasi, SKM survey |
| **Split Pane (Cal.com style)** | Booking wizard step pemilihan tanggal & waktu |

### 5.3 Breakpoints

| Nama | Value | Target |
|------|-------|--------|
| `sm` | 640px | Ponsel landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / laptop kecil |
| `xl` | 1280px | Desktop |

---

## 6. Komponen Dasar (shadcn/ui Mapping)

Semua komponen menggunakan **shadcn/ui** sebagai base, di-customize sesuai design system ini.

### 6.1 Button

| Variant | Visual | Penggunaan |
|---------|--------|------------|
| **Primary** | `bg-primary-700 text-white` — solid, no gradient | Aksi utama: "Kirim Pengajuan", "Approve", "Verifikasi" |
| **Secondary** | `bg-white border-neutral-200 text-neutral-950` — outlined | Aksi sekunder: "Simpan Draft", "Filter" |
| **Destructive** | `bg-error-600 text-white` | Aksi bahaya: "Batalkan Booking", "Tolak" |
| **Ghost** | `text-primary-700 underline` — tampil sebagai link | Navigasi: "Kembali", "Ubah", "Lihat Detail" |
| **Icon-only** | `border-neutral-200` — outlined square | Chevron navigasi kalender, toggle view |

**Aturan tombol:**
- Tombol primary hanya **satu per halaman/modal**. Tidak boleh ada dua tombol primary berjejer.
- Tombol aksi ditempatkan **left-aligned** (mengikuti pola GOV.UK), bukan centered.
- Tombol destructive selalu di dalam **dialog konfirmasi**, tidak pernah standalone.
- Loading state: teks diganti spinner + "Memproses...", tombol disabled.

### 6.2 Input & Form Field

```
┌─ Label (Body, font-weight 500) ─────────────────────────┐
│  Nama Kegiatan                                            │
├───────────────────────────────────────────────────────────┤
│  Hint text (Body Small, neutral-700)                      │
│  Contoh: Seminar Teknologi Digital 2026                   │
├───────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐    │
│  │  Input field                                       │    │
│  │  border: 2px solid neutral-950                     │    │
│  │  height: 44px (touch target minimum)               │    │
│  │  padding: 12px 16px                                │    │
│  │  font: Body (16px) — TIDAK BOLEH < 16px            │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  Error state:                                             │
│  border-left: 4px solid error-600                         │
│  + "Error: Nama kegiatan wajib diisi" (error-600)         │
└───────────────────────────────────────────────────────────┘
```

**Aturan input:**
- **Border input harus tebal** (`2px solid neutral-950`). Mengikuti GOV.UK — input harus jelas terlihat, bukan subtle.
- **Tidak ada placeholder sebagai pengganti label.** Placeholder hilang saat user mengetik.
- **Hint text** ditempatkan antara label dan input, bukan di dalam input.
- **Field opsional** ditandai dengan "(opsional)" di label. Tidak pakai asterisk merah `*`.
- **Input height minimum 44px** — touch target WCAG.
- **Font size input minimum 16px** — mencegah auto-zoom di iOS Safari.

### 6.3 Card

| Variant | Visual | Penggunaan |
|---------|--------|------------|
| **Default** | `bg-white border border-neutral-200 rounded-lg shadow-sm` | Card ruangan, card layanan, card pengajuan |
| **Interactive** | Default + `hover:border-primary-500 hover:shadow-md cursor-pointer` | Card yang bisa diklik (pilih ruangan) |
| **Status Card** | Default + colored left-border 4px | Card di dashboard (overdue, pending, dll) |

**Aturan card:**
- Border radius: `rounded-lg` (8px). Tidak lebih besar. Bukan `rounded-2xl`.
- Shadow: `shadow-sm` saja. Tidak ada shadow besar/dramatis.
- Card **tidak boleh nested** di dalam card lain.

### 6.4 Table (Admin)

```
┌────────────────────────────────────────────────────────────┐
│ Filter Bar                                                  │
│ [Gedung ▼] [Status ▼] [Tanggal: __ s/d __] [🔍 Cari...]   │
├──────┬──────────┬────────────┬──────────┬─────────┬────────┤
│  No  │  Booking │  Pemohon   │  Ruangan │ Status  │ Aksi   │
├──────┼──────────┼────────────┼──────────┼─────────┼────────┤
│  1   │ BK-24-01 │ Dinas Kes  │ Hall A   │ ● AKTIF │ Detail │
│  2   │ BK-24-02 │ UKM Kreatf │ R. Rapat │ ◌ DRAFT │ Detail │
│      │          │            │          │         │        │
│      │   ... zebra stripe rows ...                │        │
├──────┴──────────┴────────────┴──────────┴─────────┴────────┤
│ Menampilkan 1-10 dari 47 data          [◀ 1 2 3 4 5 ... ▶]│
└────────────────────────────────────────────────────────────┘
```

**Aturan tabel:**
- Header tabel: `bg-neutral-100`, teks `font-weight: 600`, ukuran `Body Small`.
- Zebra striping: baris genap `bg-neutral-50`.
- Row height: 48px minimum (touch-friendly).
- Kolom status menggunakan **Tag** component (lihat bagian 7).
- Kolom aksi: link "Detail" (ghost button), bukan icon-only.
- Pagination di bawah tabel, left-aligned info + right-aligned page numbers.

### 6.5 Dialog / Modal

- **Ukuran**: Max width 560px untuk form dialog, 800px untuk preview dokumen.
- **Overlay**: `bg-black/50` (50% opacity hitam).
- **Tidak ada close button "X" tersembunyi di pojok.** Selalu ada tombol eksplisit "Batal" dan aksi utama.
- **Destructive action dialog**: Judul merah, deskripsi jelas konsekuensi, tombol destructive + tombol "Batal".
- **Tidak ada nested modal.** Jika perlu alur panjang, gunakan halaman baru.

### 6.6 Notification Banner

Mengikuti pola GOV.UK:

| Tipe | Visual | Penggunaan |
|------|--------|------------|
| **Info** | Border-left 4px `info-600`, bg `info-50`, header "Informasi" | Status update, perubahan jadwal |
| **Success** | Border-left 4px `success-700`, bg `success-50`, header "Berhasil" | Pengajuan berhasil, pembayaran terverifikasi |
| **Warning** | Border-left 4px `warning-600`, bg `warning-50`, header "Perhatian" | H-1 deadline, kategori "Lainnya" |
| **Error** | Border-left 4px `error-600`, bg `error-50`, header "Error" | Validasi gagal, upload error |

Ditempatkan di **bagian atas konten halaman**, bukan sebagai floating toast. Toast hanya untuk feedback sesaat (3 detik max).

---

## 7. Sistem Status & Tag

### 7.1 Booking Status Tags

Setiap status booking ditampilkan sebagai **tag/badge** dengan warna konsisten di seluruh aplikasi:

| Status | Warna Background | Warna Teks | Dot |
|--------|-------------------|------------|-----|
| `DRAFT` | `neutral-100` | `neutral-700` | `●` abu |
| `SUBMITTED` | `info-50` | `info-600` | `●` biru |
| `UNDER_REVIEW` | `info-50` | `info-600` | `●` biru |
| `REVISION_NEEDED` | `warning-50` | `warning-600` | `●` kuning |
| `APPROVED` | `accent-50` | `accent-600` | `●` teal |
| `WAITING_PAYMENT` | `warning-50` | `warning-600` | `●` kuning |
| `ACTIVE` | `success-50` | `success-700` | `●` hijau |
| `COMPLETED` | `success-50` | `success-700` | `●` hijau |
| `REJECTED` | `error-50` | `error-600` | `●` merah |
| `CANCELLED` | `error-50` | `error-600` | `●` merah |

### 7.2 Payment Status Tags

| Status | Warna | Label |
|--------|-------|-------|
| `PENDING` | Warning | "Menunggu Pembayaran" |
| `PROOF_UPLOADED` | Info | "Bukti Diunggah" |
| `VERIFIED` | Success | "Terverifikasi" |
| `REJECTED` | Error | "Bukti Ditolak" |
| `OVERDUE` | Error (bold, pulsing dot) | "Melewati Batas H-1" |

### 7.3 Aturan Tag

- Tag selalu mengandung **teks label** — tidak pernah hanya warna/ikon.
- Dot indicator (`●`) di kiri label untuk penguatan visual (tapi bukan satu-satunya pembeda).
- Ukuran: `Caption` (12px), `font-weight: 500`, `padding: 2px 8px`, `rounded-md`.
- Tag tidak interaktif (bukan button). Jika perlu filter by status, gunakan dropdown/tab filter.

---

## 8. Pola Form & Multi-Step

### 8.1 Prinsip "Satu Hal Per Halaman" (GOV.UK)

Semua form pengajuan (booking, PKL, virtual office, studio dubbing) dipecah menjadi langkah-langkah terpisah:

```
[Step 1: Pilih Gedung & Ruangan]
        ↓
[Step 2: Pilih Tanggal & Waktu]      ← Cal.com style
        ↓
[Step 3: Detail Kegiatan]
        ↓
[Step 4: Kategori Pemohon]
        ↓
[Step 5: Upload Dokumen]
        ↓
[Step 6: Periksa & Kirim]            ← GOV.UK Summary List
        ↓
[Konfirmasi — Nomor Booking]         ← GOV.UK Panel
```

### 8.2 Navigasi Step

```
┌─────────────────────────────────────────────────────────────┐
│  ← Kembali                                                  │
│                                                              │
│  Langkah 2 dari 6                                            │
│                                                              │
│  ┌───────────────────────────────────────────────────┐       │
│  │                                                    │       │
│  │   [H1] Pilih tanggal kegiatan                      │       │
│  │                                                    │       │
│  │   [Kalender + Time Slot — Cal.com style]           │       │
│  │                                                    │       │
│  │   [Lanjutkan →]                                    │       │
│  │                                                    │       │
│  └───────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

**Aturan navigasi step:**
- **"← Kembali"** link di atas H1 (bukan di navbar). Selalu ada kecuali di step pertama.
- **Progress indicator**: teks sederhana "Langkah 2 dari 6" — bukan progress bar persentase (karena ada branching logic).
- **Tombol utama**: "Lanjutkan" (bukan "Next" atau "Submit" sampai step terakhir).
- **Data tersimpan di setiap step** — jika user klik Kembali, data step sebelumnya tidak hilang. Gunakan Zustand store.
- **Tidak ada stepper horizontal** dengan banyak label. Terlalu ramai di mobile.

### 8.3 Halaman "Periksa & Kirim" (Summary List — GOV.UK)

Sebelum submit, tampilkan **semua data yang sudah diisi** dalam format Summary List:

```
┌─────────────────────────────────────────────────────────────┐
│  [H1] Periksa data pengajuan Anda                           │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Gedung           Cimahi Techno Park          [Ubah]  │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  Ruangan          Convention Hall CTP          [Ubah]  │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  Tanggal          12 Oktober 2026              [Ubah]  │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  Waktu            08:00 - 17:00 WIB            [Ubah]  │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  Nama Kegiatan    Seminar Ekonomi Digital      [Ubah]  │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  Jumlah Peserta   150 orang                    [Ubah]  │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  Kategori         Ekonomi Kreatif — Aplikasi   [Ubah]  │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  Surat Permohonan surat_permohonan.pdf (2.1MB) [Ubah]  │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  Proposal         proposal_seminar.pdf (5MB)   [Ubah]  │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ☐ Saya menyatakan data yang diisi adalah benar.             │
│                                                              │
│  [Kirim Pengajuan]                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

- Setiap baris punya link **"Ubah"** yang kembali ke step terkait.
- Setelah ubah, user langsung kembali ke halaman summary (bukan mengulang semua step).
- Link "Ubah" harus punya accessible label: `Ubah ruangan` (bukan hanya "Ubah").

### 8.4 Halaman Konfirmasi (Panel — GOV.UK)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              bg: success-700                         │    │
│  │              text: white, centered                   │    │
│  │                                                      │    │
│  │         Pengajuan berhasil dikirim                    │    │
│  │                                                      │    │
│  │         Nomor Booking Anda                            │    │
│  │         BK-2026-0147                                  │    │
│  │         (font: Display, bold)                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Apa yang terjadi selanjutnya                                │
│                                                              │
│  1. Admin akan mereview pengajuan Anda dalam 2 hari kerja.   │
│  2. Anda akan menerima notifikasi WhatsApp jika ada          │
│     permintaan perbaikan atau persetujuan.                   │
│  3. Setelah disposisi dari Kepala Dinas, pengajuan akan      │
│     diproses lebih lanjut.                                   │
│                                                              │
│  Simpan nomor booking ini. Anda bisa mengecek status         │
│  pengajuan kapan saja di halaman Pengajuan Saya.             │
│                                                              │
│  [Lihat Pengajuan Saya]    Kembali ke beranda                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.5 Error Handling di Form

Mengikuti pola GOV.UK **Error Summary**:

1. Jika ada validasi error saat submit, **Error Summary box** muncul di bagian atas halaman.
2. Focus otomatis berpindah ke Error Summary.
3. Setiap error ditampilkan sebagai link yang bisa diklik → scroll ke field bermasalah.
4. Field yang error mendapat: `border-left: 4px solid error-600` + pesan error inline di bawah label.

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─── bg: error-50, border: 2px error-600 ──────────────┐   │
│  │  Ada masalah pada data Anda                            │   │
│  │                                                        │   │
│  │  • Nama kegiatan — wajib diisi                         │   │
│  │  • Jumlah peserta — minimal 100 untuk Convention Hall  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ...form fields with inline errors...                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Pola Booking & Kalender (Cal.com Style)

### 9.1 Split-Pane Booking View

Untuk step pemilihan tanggal & waktu, mengadopsi layout Cal.com:

```
Desktop (≥1024px):
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌──────────────┐ ┌────────────────────┐ ┌────────────────────┐  │
│  │  INFO PANEL   │ │   DATE PICKER      │ │   TIME SLOTS       │  │
│  │               │ │                    │ │                    │  │
│  │  🏛 Conv Hall │ │   ◀ Oktober 2026 ▶ │ │  Rabu, 12 Oktober  │  │
│  │  CTP         │ │                    │ │                    │  │
│  │               │ │  SEN SEL RAB ...   │ │  ┌──────────────┐  │  │
│  │  👥 100-500   │ │      1   2   3     │ │  │   08:00      │  │  │
│  │  📍 Jl. Baros │ │   4  [5]  6   7    │ │  └──────────────┘  │  │
│  │               │ │   8   9  10  11    │ │  ┌──────────────┐  │  │
│  │  💰 Rp 2.5jt  │ │  12  13  14  15    │ │  │   09:00      │  │  │
│  │  /hari        │ │  ...               │ │  └──────────────┘  │  │
│  │               │ │                    │ │  ┌──────────────┐  │  │
│  │  Fasilitas:   │ │  ● = tersedia      │ │  │   10:00      │  │  │
│  │  • Proyektor  │ │  (tanggal tanpa    │ │  └──────────────┘  │  │
│  │  • Sound      │ │   dot = penuh)     │ │                    │  │
│  │  • AC Central │ │                    │ │  ...               │  │
│  │               │ │                    │ │                    │  │
│  └──────────────┘ └────────────────────┘ └────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

Mobile (<1024px): stacked vertically
┌──────────────────────┐
│  Info (collapsible)   │
├──────────────────────┤
│  Date Picker          │
├──────────────────────┤
│  Time Slots           │
└──────────────────────┘
```

### 9.2 Calendar Date Picker

**Visual states untuk tanggal:**

| State | Visual |
|-------|--------|
| **Tersedia** | Teks `neutral-950`, hover `bg-primary-100`, ada dot kecil `●` di bawah angka |
| **Dipilih (selected)** | `bg-primary-700 text-white rounded-md` — kontras tinggi, langsung terlihat |
| **Tidak tersedia / penuh** | Teks `neutral-400`, `cursor-not-allowed`, tidak ada dot, tidak ada hover effect |
| **Hari ini** | Ring outline `border-primary-500` (jika belum dipilih) |
| **Di luar bulan** | Teks `neutral-300`, tidak interaktif |
| **Hari libur** | Teks `neutral-400` + tooltip "Hari Libur Nasional" |

**Navigasi bulan:**
- Chevron `◀ ▶` di kiri-kanan nama bulan.
- Nama bulan dalam Bahasa Indonesia: "Oktober 2026".
- Tidak bisa navigasi ke bulan lampau (disabled).

### 9.3 Time Slot Selection

Mengikuti pola Cal.com — **hanya tampilkan slot yang tersedia** (constraint-based):

```
┌────────────────────────────┐
│  Rabu, 12 Oktober 2026     │
│                             │
│  ┌──────────────────────┐  │
│  │      08:00 - 09:00   │  │  ← pill button, hover bg-primary-100
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │      09:00 - 10:00   │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │      10:00 - 11:00   │  │
│  └──────────────────────┘  │
│  ┌──────────────────────────────────────┐
│  │  13:00 - 14:00     │  Konfirmasi →  │  ← two-step: selected + confirm
│  └──────────────────────────────────────┘
│  ┌──────────────────────┐  │
│  │      14:00 - 15:00   │  │
│  └──────────────────────┘  │
│                             │
│  Jam ditampilkan dalam WIB  │
└────────────────────────────┘
```

**Two-step confirm** (pola Cal.com):
1. Klik slot → slot melebar, separuh kanan muncul tombol "Konfirmasi →".
2. Klik "Konfirmasi" → lanjut ke step berikutnya.
3. Mencegah salah klik, terutama di mobile.

**Untuk booking `FULL_DAY`:**
- Time slot panel diganti dengan tombol tunggal: "Booking Satu Hari Penuh (08:00 - 17:00 WIB)".

**Untuk booking `BOTH`:**
- Toggle di atas slot panel: `[Per Jam] [Satu Hari Penuh]` — segmented control.

### 9.4 Kalender Admin (Operasional)

Untuk halaman `/admin/kalender`, menggunakan kalender interaktif penuh:

| View | Penggunaan |
|------|------------|
| **Month** | Overview bulanan. Event ditampilkan sebagai bar berwarna di cell tanggal. |
| **Week** | Timeline horizontal 7 hari. Event block berwarna sesuai status. |
| **Day** | Timeline vertikal jam-per-jam. Detail booking terlihat langsung. |

**Event block styling:**
- Background: warna pastel sesuai status (lihat bagian 7).
- Border-left 3px solid warna status penuh.
- Teks: nama kegiatan + ruangan (truncated jika panjang).
- Klik → sliding drawer dari kanan dengan detail booking + link ke dossier.

**Filter bar (sticky di atas kalender):**
```
[Gedung: Semua ▼] [Ruangan: Semua ▼] [Status: Semua ▼] [PIC: Semua ▼]
```

---

## 10. Layout per Halaman

### 10.1 Navigasi & Header

#### Header Publik

```
┌─────────────────────────────────────────────────────────────┐
│  🏛 UPTD Cimahi Techno Park          [Masuk] [Daftar]       │
│  ─────────────────────────────────────────────────────────── │
│  Beranda  Layanan  Ruangan  FOKUS  PKL  Pengumuman          │
└─────────────────────────────────────────────────────────────┘
```

- Background: `primary-900` (navy gelap), teks putih.
- Logo CTP di kiri (placeholder sampai branding resmi ada).
- Navigasi horizontal, teks biasa (bukan tab), underline aktif.
- Mobile: hamburger menu → full-screen drawer dari kiri.
- **Tidak ada mega-menu dropdown.** Flat navigation.

#### Sidebar Admin

```
┌──────────────────┬───────────────────────────────────────────┐
│  🏛 CTP Admin     │  [Search...🔍]        🔔 3    👤 Admin   │
│  ─────────────── │  ──────────────────────────────────────── │
│                   │                                           │
│  📊 Dashboard     │         ┌─────────────────────────┐      │
│  📋 Booking       │         │                         │      │
│  💰 Pembayaran    │         │    MAIN CONTENT AREA    │      │
│  👤 PIC           │         │                         │      │
│  📅 Kalender      │         │                         │      │
│  📊 SKM           │         │                         │      │
│  📄 Laporan       │         │                         │      │
│  📁 Audit Trail   │         │                         │      │
│  ─────────────── │         │                         │      │
│  ⚙ Master Data ▼ │         │                         │      │
│    Gedung         │         │                         │      │
│    Ruangan        │         │                         │      │
│    Tarif          │         │                         │      │
│    ...            │         └─────────────────────────┘      │
│                   │                                           │
└──────────────────┴───────────────────────────────────────────┘
```

- Sidebar width: 256px, collapsible ke 64px (icon-only).
- Background: `neutral-0` (putih), border-right `neutral-200`.
- Active item: `bg-primary-100 text-primary-700 font-semibold`, left-border 3px `primary-700`.
- Section divider dengan label kecil uppercase (`DATA MASTER`, `LAPORAN`).
- Mobile: sidebar menjadi overlay drawer.

### 10.2 Landing Page Publik

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER + NAV                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [H1] Portal Layanan Cimahi Techno Park                      │
│  [subtitle] Ajukan peminjaman ruangan, daftar PKL, dan       │
│  layanan lainnya secara online.                              │
│                                                              │
│  [🔍 Cari ruangan, layanan, atau informasi...]               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [H2] Layanan Kami                                           │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 🏛       │ │ 🏢       │ │ 📸       │ │ 🎓       │       │
│  │ Booking   │ │ Booking   │ │ FOKUS    │ │ PKL &    │       │
│  │ Ruang CTP │ │ Ruang BITC│ │ Katalog  │ │ Magang   │       │
│  │           │ │           │ │ Produk   │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ 💻       │ │ 🏢       │ │ 🎙       │                     │
│  │ Working   │ │ Virtual   │ │ Studio   │                     │
│  │ Space     │ │ Office    │ │ Dubbing  │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [H2] Pengumuman                                             │
│  ┌────────────────────────────────────────────────────┐      │
│  │ [PENTING] Tarif baru berlaku mulai 1 Jan 2027      │      │
│  │ [INFO] Jadwal libur nasional telah diperbarui      │      │
│  └────────────────────────────────────────────────────┘      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  FOOTER — Alamat, kontak WhatsApp resmi, jam operasional     │
└─────────────────────────────────────────────────────────────┘
```

**Aturan landing page:**
- **TIDAK ADA**: Hero image full-width dengan gradient overlay, 3D illustration, animasi parallax, "trusted by" logo carousel.
- **ADA**: Headline jelas, search bar, grid layanan dengan ikon sederhana, pengumuman.
- Ikon layanan: menggunakan [Lucide Icons](https://lucide.dev) (sudah bundled di shadcn/ui) — line icons, konsisten, tidak berwarna-warni.
- Card layanan: judul + deskripsi 1 baris + link "Selengkapnya →".

### 10.3 Halaman Daftar Ruangan

```
┌─────────────────────────────────────────────────────────────┐
│  [H1] Ruangan & Fasilitas                                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Filter: [Gedung ▼] [Tanggal: ___] [Kapasitas ▼]     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  [Foto]       │  │  [Foto]       │  │  [Foto]       │   │
│  │  Conv Hall CTP│  │  R. Rapat 1   │  │  R. Workshop  │   │
│  │  100-500 orang│  │  20-40 orang  │  │  30-60 orang  │   │
│  │               │  │               │  │               │   │
│  │  ● Tersedia   │  │  ● Tersedia   │  │  ○ Tidak      │   │
│  │               │  │               │  │    Tersedia   │   │
│  │  [Lihat →]    │  │  [Lihat →]    │  │  [Lihat →]    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

- Ruangan yang **tidak tersedia tetap ditampilkan** dengan badge abu-abu "Tidak Tersedia" (sesuai requirement FR-BOOKING).
- Card yang tersedia: border hover `primary-500`.
- Card yang tidak tersedia: opacity 70%, no hover effect, tapi masih bisa diklik untuk lihat detail.

### 10.4 Dashboard Pemohon

```
┌─────────────────────────────────────────────────────────────┐
│  [H1] Dashboard Saya                                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ⚠️ Anda memiliki 1 survei kepuasan belum diisi.     │    │
│  │    Isi sekarang →                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Ringkasan Pengajuan                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │ 2      │ │ 1      │ │ 1      │ │ 3      │               │
│  │ Diproses│ │ Perbaiki│ │ Aktif  │ │ Selesai│               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
│                                                              │
│  Kegiatan Mendatang                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📅 Seminar Digital — Conv Hall CTP                  │    │
│  │     12 Okt 2026, 08:00-17:00 WIB                    │    │
│  │     ● AKTIF — 8 hari lagi                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  [+ Buat Pengajuan Baru]                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.5 Dashboard Admin

```
┌─────────────────────────────────────────────────────────────┐
│  [H1] Dashboard Operasional                                  │
│                                                              │
│  ┌─── URGENT (merah, border-left error) ─────────────────┐  │
│  │ 🔴 2 booking melewati batas pembayaran H-1             │  │
│  │    BK-2026-0142 — Dinas Pendidikan — H-1 terlewat 3j   │  │
│  │    BK-2026-0145 — UKM Kreatif — H-1 terlewat 1j        │  │
│  │    [Lihat semua →]                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Perlu Tindakan                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 5        │ │ 2        │ │ 3        │ │ 1        │       │
│  │ Review   │ │ Revisi   │ │ Verif.   │ │ PIC belum│       │
│  │ Pengajuan│ │ Masuk    │ │ Bayar    │ │ Ditugasi │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  Agenda Hari Ini                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 08:00  Conv Hall CTP  — Workshop IoT                   │  │
│  │ 09:00  R. Rapat 1     — Rapat Koordinasi Dinas         │  │
│  │ 13:00  Studio Dubbing — Recording Podcast Pemkot       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Metrik Bulan Ini                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 47       │ │ 78%      │ │ Rp 24.5jt│ │ 4.2/5    │       │
│  │ Booking  │ │ Okupansi │ │ Revenue  │ │ SKM      │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  Kalender 7 Hari ────────────────────────                    │
│  [Mini calendar widget]                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Strategi Responsif

### 11.1 Pendekatan

| Surface | Strategi |
|---------|----------|
| **Portal Publik** | **Mobile-first**. Pemohon kemungkinan besar akses dari HP. Form, booking wizard, dan tracking harus excellent di 360px+. |
| **Panel Admin** | **Desktop-first**. Admin bekerja di laptop/PC. Tabel dan kalender dioptimalkan untuk 1024px+. Di mobile, tabel menjadi card list. |

### 11.2 Adaptasi Komponen

| Komponen | Desktop (≥1024px) | Mobile (<768px) |
|----------|-------------------|-----------------|
| **Booking split-pane** | 3 kolom sejajar (info + kalender + slot) | Stacked vertikal (info collapsible → kalender → slot) |
| **Admin sidebar** | Fixed sidebar 256px | Overlay drawer dari hamburger |
| **Tabel admin** | Full table dengan semua kolom | Card list — setiap row menjadi card dengan key-value |
| **Kalender admin** | Month/week view | Day view only (swipe untuk ganti hari) |
| **Summary List** | 3 kolom (key-value-action) | 2 kolom (key stacked di atas value, action di bawah) |
| **Filter bar** | Inline horizontal | Collapsed dalam "Filter" button → bottom sheet |
| **Dialog** | Center modal 560px | Full-screen bottom sheet |

### 11.3 Touch Targets

- Semua elemen interaktif minimal **44x44px** (WCAG).
- Jarak antar elemen interaktif minimal **8px**.
- Tidak ada hover-only interactions — semua hover state harus juga terjadi on tap.

---

## 12. Anti-Pattern (DILARANG)

Daftar hal yang **tidak boleh** ada di UI CTP:

### Visual

| ❌ Dilarang | ✅ Gantinya |
|-------------|-------------|
| Gradient background di header/hero | Solid color `primary-900` |
| Ilustrasi 3D / isometric generic | Ikon line (Lucide) + foto nyata gedung CTP/BITC |
| Parallax scroll effect | Static layout |
| Animasi masuk (fade-in on scroll) | Konten langsung tampil |
| Card dengan shadow besar (`shadow-xl`) | `shadow-sm` + `border-neutral-200` |
| Border radius besar (`rounded-2xl`, `rounded-3xl`) | `rounded-lg` (8px) max, kecuali Cal.com booking pane |
| Warna-warni tanpa sistem (rainbow tags) | Palette semantik dari bagian 3 |
| Dark mode | Tidak ada di Phase 1 |
| Background image pattern/texture | Solid `neutral-100` |

### Interaksi

| ❌ Dilarang | ✅ Gantinya |
|-------------|-------------|
| Progress bar persentase di form wizard | "Langkah 2 dari 6" |
| Stepper horizontal penuh label | Teks step indicator sederhana |
| Infinite scroll di tabel admin | Pagination eksplisit |
| Floating action button (FAB) | Tombol eksplisit di dalam konten |
| Toast notification untuk info penting | Notification Banner di atas konten |
| Auto-dismiss toast untuk error | Error Summary persisten sampai diperbaiki |
| Placeholder sebagai label | Label terpisah + hint text |
| Asterisk merah `*` untuk required | Tandai field opsional dengan "(opsional)" |
| Confirm dialog dengan "Yes/No" | Deskriptif: "Batalkan Booking" / "Kembali" |
| Icon-only button tanpa label | Icon + teks, atau aria-label wajib |

### Konten

| ❌ Dilarang | ✅ Gantinya |
|-------------|-------------|
| Bahasa Inggris di UI | Bahasa Indonesia (kecuali istilah teknis: email, password, draft) |
| Lorem ipsum | Konten nyata atau placeholder realistis |
| "Click here" sebagai link text | Deskriptif: "Lihat detail ruangan" |
| Emoji sebagai pengganti ikon formal | Lucide icons |

---

## Lampiran

### A. Tailwind Config Override (Ringkasan)

```typescript
// tailwind.config.ts — colors extend
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#F0F4FA',
          100: '#E8EEF7',
          200: '#C5D5EC',
          300: '#94B3DA',
          500: '#2E5EA8',
          700: '#1A3A6B',
          900: '#0C1D3A',
        },
        accent: {
          50:  '#E6F5F5',
          100: '#CCE9E9',
          400: '#2AA5A9',
          600: '#0D7377',
        },
        // success, warning, error, info menggunakan
        // Tailwind default green, yellow, red, blue
        // dengan alias di CSS variables jika perlu
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        container: '1120px',
        'form-narrow': '560px',
      },
      fontSize: {
        display:   ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-l': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-m': ['1.375rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-s': ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
    },
  },
}
```

### B. Ikon yang Dipakai

Semua ikon dari **Lucide React** (`lucide-react`), sudah menjadi dependency shadcn/ui:

| Konteks | Ikon |
|---------|------|
| Gedung/Ruangan | `Building2`, `DoorOpen` |
| Kalender/Tanggal | `Calendar`, `CalendarDays`, `Clock` |
| Status | `CheckCircle2`, `XCircle`, `AlertTriangle`, `Clock`, `Loader2` |
| Dokumen | `FileText`, `Upload`, `Download`, `Eye` |
| Navigasi | `ChevronLeft`, `ChevronRight`, `Menu`, `X` |
| User/PIC | `User`, `Users`, `UserCog` |
| Pembayaran | `CreditCard`, `Receipt`, `Banknote` |
| Pencarian | `Search` |
| Notifikasi | `Bell` |
| Layanan | `Briefcase`, `Camera`, `GraduationCap`, `Laptop`, `Mic` |

### C. Checklist Implementasi per Halaman

Sebelum mengimplementasikan halaman baru, developer/AI harus memastikan:

- [ ] Layout sesuai panduan (two-thirds / full-width / split-pane)?
- [ ] Warna menggunakan token dari bagian 3 (bukan hex hardcoded)?
- [ ] Tipografi mengikuti skala dari bagian 4?
- [ ] Spacing menggunakan scale dari bagian 5?
- [ ] Status tag konsisten dengan bagian 7?
- [ ] Form mengikuti pola bagian 8 (one-thing-per-page, error summary)?
- [ ] Komponen shadcn/ui yang di-customize sesuai bagian 6?
- [ ] Responsif sesuai strategi bagian 11?
- [ ] Tidak melanggar anti-pattern bagian 12?
- [ ] Semua teks dalam Bahasa Indonesia?
- [ ] Focus state visible di semua elemen interaktif?
- [ ] Touch target ≥ 44px?
