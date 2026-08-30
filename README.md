# CTP Smart Service — Portal Layanan Digital UPTD Cimahi Techno Park

Portal layanan digital satu pintu untuk UPTD CTP dan Gedung BITC, Kota Cimahi.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Vite + React 18 + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express.js + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh) + bcrypt |
| File Storage | MinIO |
| Task Queue | Bull + Redis |
| WhatsApp | Abstract BSP adapter (vendor TBD) |

## Struktur Folder

```
/
├── docs/           <- Dokumentasi teknis lengkap
├── frontend/       <- Vite + React + TypeScript
└── backend/        <- Node.js + Express + TypeScript + Prisma
```

## Dokumentasi

| File | Isi |
|---|---|
| [AGENTS.md](./AGENTS.md) | Panduan untuk AI agents & developer |
| [docs/Architecture.md](./docs/Architecture.md) | Arsitektur sistem lengkap |
| [docs/PRD.md](./docs/PRD.md) | Product requirements |
| [docs/Schema.md](./docs/Schema.md) | Prisma schema documentation |
| [docs/Rules.md](./docs/Rules.md) | Business rules (BR-*) |
| [docs/Workflows.md](./docs/Workflows.md) | State machines & workflows |
| [docs/Security.md](./docs/Security.md) | Auth, RBAC, data protection |
| [docs/API.md](./docs/API.md) | REST API endpoints |
| [docs/Development.md](./docs/Development.md) | Panduan development |
| [docs/Integrations.md](./docs/Integrations.md) | WADUH, PKL, WhatsApp |
| [docs/Roadmap.md](./docs/Roadmap.md) | Roadmap 4 fase |

## Quick Start (Development)

```bash
# 1. Clone dan install dependencies
pnpm install

# 2. Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env sesuai kebutuhan

# 3. Jalankan infrastruktur (PostgreSQL 16, Redis, MinIO)
docker-compose up -d

# 4. Database migration dan generate Prisma client
cd backend
npx prisma migrate dev
npx prisma generate

# 5. Jalankan dev servers
pnpm dev    # Menjalankan frontend + backend bersamaan
```

## Layanan

1. Peminjaman Ruangan CTP
2. Peminjaman Ruangan BITC
3. PKL / Magang / Penelitian
4. Foto Produk (FOKUS)
5. Working Space BITC
6. Virtual Office
7. Studio Dubbing

## Roles

| Role | Deskripsi |
|---|---|
| Pemohon | Publik — pengaju layanan |
| Admin UPTD | Operator utama sistem |
| Kasubag TU | Supervisor TU + ganti PIC + absensi |
| Kepala UPTD | Monitoring dashboard |
| Sekretaris | Agenda ringkas |
| Kepala Dinas | Agenda ringkas |
