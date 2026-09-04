import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OperationalCalendar, type CalendarEventItem } from '@/components/calendar/OperationalCalendar';
import {
  Building2,
  CalendarDays,
  Camera,
  GraduationCap,
  Laptop,
  Mic,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Bell,
  Search,
  Users,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';

const SERVICES = [
  {
    code: 'SVC-001',
    title: 'Peminjaman Ruangan CTP',
    category: 'Fasilitas & Gedung',
    description: 'Convention Hall, Ruang Rapat, dan Ruang Workshop representatif di kawasan Cimahi Techno Park.',
    icon: Building2,
    href: '/portal',
  },
  {
    code: 'SVC-002',
    title: 'Peminjaman Fasilitas BITC',
    category: 'Fasilitas & Gedung',
    description: 'Convention Hall dan fasilitas pertemuan di Gedung Baros Information Technology Creative.',
    icon: Building2,
    href: '/portal',
  },
  {
    code: 'SVC-003',
    title: 'Praktik Kerja Lapangan (PKL)',
    category: 'Edukasi & Riset',
    description: 'Penerimaan dan registrasi magang serta penelitian mahasiswa/siswa berbasis kuota terpadu.',
    icon: GraduationCap,
    href: '/portal',
  },
  {
    code: 'SVC-004',
    title: 'Katalog FOKUS Produk UMKM',
    category: 'Pemberdayaan Usaha',
    description: 'Layanan pemotretan profesional dan etalase digital produk industri kreatif UMKM Cimahi.',
    icon: Camera,
    href: '#fokus',
  },
  {
    code: 'SVC-005',
    title: 'Working Space BITC',
    category: 'Ruang Kerja Bersama',
    description: 'Pemanfaatan ruang kerja kolaboratif dengan konektivitas cepat dan fasilitas terintegrasi.',
    icon: Laptop,
    href: '/portal',
  },
  {
    code: 'SVC-006',
    title: 'Virtual Office',
    category: 'Legalitas Usaha',
    description: 'Fasilitas alamat domisili usaha dan penanganan korespondensi bisnis bagi startup dan UMKM.',
    icon: FileCheck2,
    href: '/portal',
  },
  {
    code: 'SVC-007',
    title: 'Studio Dubbing & Audio',
    category: 'Multimedia & Seni',
    description: 'Studio kedap suara dengan perangkat rekaman profesional untuk voice-over dan podcast.',
    icon: Mic,
    href: '/portal',
  },
];

export default function Landing() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load public announcements
    api.get('/announcements').then((res) => setAnnouncements(res.data)).catch(() => {});

    // Load public buildings
    api.get('/master/buildings').then((res) => setBuildings(res.data)).catch(() => {});

    // Load public calendar
    api
      .get('/bookings/public-calendar')
      .then((res) => {
        setEvents(
          res.data.map((b: any) => ({
            id: b.id,
            title: `${b.room?.name || 'Ruangan'} - ${b.eventName}`,
            eventName: b.eventName,
            roomName: b.room?.name || 'Ruangan',
            buildingName: b.room?.building?.name || '',
            start: new Date(b.dateStart),
            end: new Date(b.dateEnd),
            state: b.state,
            participantCount: b.participantCount,
            applicantName: b.user?.fullName || b.user?.email || 'Pemohon Terdaftar',
          }))
        );
      })
      .catch(() => {});
  }, []);

  const filteredServices = SERVICES.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950 flex flex-col font-sans">
      {/* 1. Formal Top Header */}
      <header className="bg-primary-900 text-white sticky top-0 z-40 border-b border-primary-700/50 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent-600 text-white rounded-lg flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base leading-none block text-white">
                UPTD Cimahi Techno Park
              </span>
              <span className="text-[11px] text-neutral-300 block font-normal mt-0.5">
                Pemerintah Kota Cimahi &bull; Layanan Publik
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-neutral-200">
            <a href="#layanan" className="hover:text-white transition-colors">Katalog Layanan</a>
            <a href="#sop" className="hover:text-white transition-colors">Alur SOP</a>
            <a href="#fasilitas" className="hover:text-white transition-colors">Fasilitas Ruangan</a>
            <a href="#kalender" className="hover:text-white transition-colors">Kalender Publik</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-primary-500 text-white hover:bg-primary-800 hover:text-white text-xs h-9 px-3.5"
              >
                Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="sm"
                className="bg-primary-700 hover:bg-primary-500 text-white font-semibold text-xs h-9 px-3.5 shadow-xs"
              >
                Daftar Akun
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Authoritative Hero (No decorative gradients per Design.md Section 12) */}
      <section className="bg-primary-900 text-white py-14 sm:py-18 px-4 sm:px-6 border-b border-primary-800">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-800/90 border border-primary-700 rounded-full text-xs font-semibold text-neutral-200">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-400" />
            Portal Pelayanan Publik Resmi UPTD CTP & Gedung BITC
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Portal Layanan Cimahi Techno Park
          </h1>

          <p className="text-base sm:text-lg text-neutral-200 max-w-2xl mx-auto leading-relaxed">
            Penyelenggaraan reservasi fasilitas gedung pemerintah, perizinan pemanfaatan, pendaftaran PKL, dan ruang kreatif secara transparan dan akuntabel.
          </p>

          {/* Quick Search Bar */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Cari ruangan, layanan, atau ketentuan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm text-neutral-900 bg-white rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/portal">
              <Button size="lg" className="bg-white text-primary-900 hover:bg-neutral-100 font-bold px-6 text-sm">
                Ajukan Peminjaman Ruangan
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a href="#kalender">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-600 text-white hover:bg-primary-800 font-medium px-5 text-sm"
              >
                Cek Ketersediaan Jadwal
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Official Announcements Banner (Amber alert per Design.md Section 6.6) */}
      {announcements.length > 0 && (
        <section className="bg-amber-50 border-b border-amber-300 py-4 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider mb-2">
              <Bell className="w-4 h-4 text-amber-700" />
              <span>Pengumuman Resmi UPTD</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-l-4 border-l-amber-600 border border-neutral-200 rounded-r-lg p-3.5 shadow-2xs"
                >
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide block">
                    {item.priority === 'URGENT' ? 'Penting' : 'Informasi'}
                  </span>
                  <h4 className="font-bold text-neutral-900 text-xs mt-0.5">{item.title}</h4>
                  <p className="text-xs text-neutral-600 line-clamp-2 mt-1 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Services Catalog Grid (Section 10.2) */}
      <section id="layanan" className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
            Katalog Pelayanan
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950">
            Layanan Terpadu Satu Pintu
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Pilih jenis fasilitas atau program layanan UPTD Cimahi Techno Park sesuai kebutuhan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <Card
                key={svc.code}
                className="border-neutral-200 rounded-lg shadow-xs hover:border-primary-500 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-900 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary-700" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {svc.category}
                  </span>
                  <CardTitle className="text-base font-bold text-neutral-900 mt-1">
                    {svc.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs text-neutral-600 leading-relaxed">
                  <p>{svc.description}</p>
                  <Link
                    to={svc.href}
                    className="inline-flex items-center gap-1 font-bold text-primary-700 hover:text-primary-900 pt-2 border-t border-neutral-100 w-full"
                  >
                    <span>Ajukan Layanan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. SOP & Alur Pelayanan (GOV.UK Clean Step Process) */}
      <section id="sop" className="py-12 sm:py-16 px-4 sm:px-6 bg-white border-y border-neutral-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-1 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
              Standar Operasional Prosedur
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950">
              Alur Pengajuan & Pemanfaatan Fasilitas
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              4 langkah mudah pemanfaatan sarana gedung UPTD CTP dan BITC secara akuntabel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary-900 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-sm text-neutral-900">Pilih Ruangan & Jadwal</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Tentukan gedung CTP atau BITC, pilih tanggal kalender, dan tentukan slot jam ketersediaan.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary-900 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-sm text-neutral-900">Upload Surat Permohonan</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Lengkapi rincian kegiatan dan unggah dokumen surat permohonan resmi berstempel basah/TTE.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary-900 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-sm text-neutral-900">Disposisi & Approval</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Admin memproses lembar disposisi pimpinan dinas dan mengunci slot ruangan resmi dari bentrok jadwal.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary-900 text-white font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-sm text-neutral-900">Pelaksanaan & SKM</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                PIC UPTD mendampingi kegiatan di lapangan. Setelah selesai, pemohon mengisi survei kepuasan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Fasilitas Ruangan Section */}
      <section id="fasilitas" className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
            Daftar Sarana
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950">
            Fasilitas Ruangan Representatif
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Fasilitas pertemuan, aula konvensi, dan ruang rapat di Cimahi Techno Park & BITC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {buildings.flatMap((b) =>
            b.rooms?.map((r: any) => (
              <Card key={r.id} className="border-neutral-200 rounded-lg shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-36 bg-primary-900 text-white flex flex-col items-center justify-center relative p-4 text-center">
                    <Building2 className="w-10 h-10 text-neutral-300 mb-1" />
                    <span className="text-xs font-semibold text-neutral-200">{b.name}</span>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-base font-bold text-neutral-900">{r.name}</CardTitle>
                        <CardDescription className="text-xs text-neutral-500">Lantai {r.floor || 1}</CardDescription>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded border border-neutral-300 shrink-0">
                        {r.capacity} org
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-neutral-600 leading-relaxed">
                    <p>{r.description || 'Fasilitas pertemuan representatif dilengkapi pendingin ruangan (AC), sound system, dan proyektor.'}</p>
                  </CardContent>
                </div>

                <div className="p-4 pt-2 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wide block">Tarif Retribusi:</span>
                    <span className="text-sm font-bold text-neutral-900 tabular-nums">
                      {r.tariffs?.[0]
                        ? `Rp ${Number(r.tariffs[0].price).toLocaleString('id-ID')} / ${r.tariffs[0].unit}`
                        : 'Sesuai Perda'}
                    </span>
                  </div>
                  <Link to="/portal">
                    <Button size="sm" className="bg-primary-700 hover:bg-primary-900 text-white text-xs h-8 font-semibold">
                      Reservasi
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* 7. Public Calendar Section */}
      <section id="kalender" className="py-12 sm:py-16 px-4 sm:px-6 bg-white border-t border-neutral-200">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
              Transparansi Jadwal
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950">
              Kalender Agenda Kegiatan Publik
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Pantau jadwal kegiatan yang telah terkonfirmasi resmi sebelum mengajukan tanggal reservasi Anda.
            </p>
          </div>

          <OperationalCalendar events={events} buildings={buildings} height={580} />
        </div>
      </section>

      {/* 8. Formal Government Footer (Section 10.2) */}
      <footer className="bg-primary-900 text-white py-12 px-4 sm:px-6 mt-auto border-t border-primary-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-accent-600 text-white rounded flex items-center justify-center font-bold text-xs">
                CTP
              </div>
              <h4 className="font-bold text-sm text-white">UPTD Cimahi Techno Park</h4>
            </div>
            <p className="text-neutral-300">
              Dinas Perdagangan, Koperasi, UKM dan Perindustrian Pemerintah Daerah Kota Cimahi
            </p>
            <p className="text-neutral-400">
              Jl. Baros No. 78, Kel. Utama, Kec. Cimahi Selatan, Kota Cimahi, Jawa Barat 40533
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white">Layanan Terpadu</h4>
            <ul className="space-y-1.5 text-neutral-300">
              <li>&bull; Reservasi Fasilitas Ruangan & Aula Gedung</li>
              <li>&bull; Coworking Space & Inkubasi Bisnis WADUH</li>
              <li>&bull; Pendaftaran Magang / PKL Siswa & Mahasiswa</li>
              <li>&bull; Layanan Studio Dubbing & Multimedia BITC</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white">Kontak Layanan Resmi</h4>
            <p className="text-neutral-300">Email: technopark@cimahikota.go.id</p>
            <p className="text-neutral-300">WhatsApp Resmi UPTD: 0812-3456-7890</p>
            <p className="text-neutral-300">Jam Operasional: Senin - Jumat (08:00 - 16:00 WIB)</p>
            <p className="pt-2 text-neutral-400 border-t border-primary-800">
              © 2026 UPTD Cimahi Techno Park. Hak Cipta Dilindungi Regulasi Daerah.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
