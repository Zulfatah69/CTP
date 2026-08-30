import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function Landing() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    // Load public announcements
    api.get('/announcements').then(res => setAnnouncements(res.data)).catch(() => {});

    // Load public buildings
    api.get('/master/buildings').then(res => setBuildings(res.data)).catch(() => {});
    
    // Load public calendar
    api.get('/bookings').then(res => {
      const approved = res.data.filter((b: any) => b.state === 'APPROVED' || b.state === 'ACTIVE');
      setEvents(approved.map((b: any) => ({
        id: b.id,
        title: `${b.room?.name || 'Ruangan'} - ${b.eventName}`,
        start: new Date(b.dateStart),
        end: new Date(b.dateEnd)
      })));
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-bold">
              🏛️
            </div>
            <div>
              <span className="font-bold text-slate-900 leading-none block">Cimahi Techno Park</span>
              <span className="text-[11px] text-slate-500 block">Digital Service Portal</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#tentang" className="hover:text-blue-600 transition">Tentang</a>
            <a href="#sop" className="hover:text-blue-600 transition">Alur Peminjaman</a>
            <a href="#ruangan" className="hover:text-blue-600 transition">Fasilitas Ruangan</a>
            <a href="#kalender" className="hover:text-blue-600 transition">Kalender Jadwal</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="font-medium">Masuk</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-medium">Daftar Akun</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 text-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-semibold text-blue-200 uppercase tracking-wide">
            Satu Pintu Layanan UPTD Cimahi Techno Park & BITC
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Peminjaman Ruangan & Fasilitas Gedung Jadi Lebih Cepat & Transparan
          </h1>
          <p className="text-lg text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Ajukan reservasi Convention Hall, Ruang Rapat, dan Studio Multimedia secara digital dengan verifikasi berkas resmi dan jadwal ketersediaan waktu-nyata.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/portal">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 shadow-lg shadow-amber-500/20">
                🚀 Ajukan Peminjaman Ruangan
              </Button>
            </Link>
            <a href="#kalender">
              <Button size="lg" variant="outline" className="text-white border-white/40 hover:bg-white/10 px-6">
                📅 Cek Ketersediaan Jadwal
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Announcements Banner Section */}
      {announcements.length > 0 && (
        <section className="bg-amber-50 border-y border-amber-200 py-6 px-6">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-wide">
              <span>📢</span> Pengumuman & Informasi Terbaru
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.map((item) => (
                <div key={item.id} className="bg-white border border-amber-200 rounded-lg p-4 shadow-xs space-y-1">
                  <span className="text-[10px] text-amber-700 font-semibold uppercase bg-amber-100 px-2 py-0.5 rounded">
                    Info Resmi
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SOP Section */}
      <section id="sop" className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Alur & Standar Prosedur (SOP)</h2>
          <p className="text-slate-500 text-sm">4 langkah mudah pengajuan pemanfaatan fasilitas UPTD CTP</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center mb-4 text-lg">
              1
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Pilih Ruangan & Jadwal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pilih gedung CTP atau BITC, tentukan tanggal serta jam kegiatan, dan sistem akan menampilkan ruangan yang tersedia.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center mb-4 text-lg">
              2
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Upload Surat Permohonan</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lengkapi data kegiatan dan unggah surat permohonan resmi berstempel dari instansi / organisasi Anda.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center mb-4 text-lg">
              3
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Disposisi & Persetujuan</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Admin UPTD memproses lembar disposisi resmi pimpinan dan mengunci slot ruangan Anda dari bentrok pemohon lain.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center mb-4 text-lg">
              4
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Konfirmasi & Pelaksanaan</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unggah bukti retribusi jika berbayar, terima notifikasi WhatsApp resmi, dan PIC UPTD siap melayani kegiatan Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Ruangan Section */}
      <section id="ruangan" className="py-16 px-6 bg-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Daftar Fasilitas Gedung</h2>
            <p className="text-slate-500 text-sm">Gedung Cimahi Techno Park & Baros Information Technology Creative (BITC)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.flatMap(b => b.rooms?.map((r: any) => (
              <Card key={r.id} className="overflow-hidden border-slate-200 hover:shadow-md transition">
                <div className="h-44 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-4xl text-white">
                  🏢
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-slate-900">{r.name}</CardTitle>
                      <CardDescription className="text-xs text-blue-600 font-medium">{b.name} (Lt. {r.floor || 1})</CardDescription>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      Kapasitas {r.capacity} org
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-600">
                  <p>{r.description || 'Fasilitas pertemuan representatif dengan AC, Sound System, dan LCD Proyektor.'}</p>
                  {r.tariffs?.[0] && (
                    <div className="pt-2 border-t flex justify-between items-center">
                      <span className="text-slate-400">Tarif Retribusi:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        Rp {Number(r.tariffs[0].price).toLocaleString('id-ID')} / {r.tariffs[0].unit}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )))}
          </div>
        </div>
      </section>

      {/* Kalender Section */}
      <section id="kalender" className="py-16 px-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Kalender Jadwal Kegiatan Publik</h2>
          <p className="text-slate-500 text-sm">Pantau jadwal ruangan yang telah terkonfirmasi agar memudahkan penentuan tanggal acara Anda</p>
        </div>

        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-6">
            <div style={{ height: '550px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={['month', 'week', 'day']}
                defaultView="month"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed">
          <div>
            <h4 className="text-white font-bold text-sm mb-3">UPTD Cimahi Techno Park</h4>
            <p>Dinas Perdagangan, Koperasi, UKM dan Perindustrian Kota Cimahi</p>
            <p className="mt-2">Jl. Baros No. 78, Utama, Kec. Cimahi Selatan, Kota Cimahi, Jawa Barat 40533</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Layanan Terintegrasi</h4>
            <ul className="space-y-1.5">
              <li>• Peminjaman Ruangan & Aula</li>
              <li>• Working Space & Inkubasi Bisnis</li>
              <li>• Studio Dubbing & Multimedia</li>
              <li>• Pendaftaran Magang / PKL</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Kontak Resmi</h4>
            <p>Email: technopark@cimahikota.go.id</p>
            <p>WhatsApp Informasi: 0812-3456-7890</p>
            <p className="mt-4 text-slate-500">© 2026 UPTD Cimahi Techno Park. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
