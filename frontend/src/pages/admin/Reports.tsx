import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function Reports() {
  const [data, setData] = useState<any>({ metrics: {}, bookings: [] });
  const [skmStats, setSkmStats] = useState<any>({ total: 0, averageRating: 0, responses: [] });
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/bookings', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: status || undefined
        }
      });
      setData(res.data);

      const skmRes = await api.get('/skm/stats');
      setSkmStats(skmRes.data);
    } catch (e) {
      console.error('Failed to fetch reports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!data.bookings || data.bookings.length === 0) {
      alert('Tidak ada data untuk diexport');
      return;
    }

    const headers = [
      'No Booking',
      'Pemohon',
      'Email',
      'No HP',
      'Kegiatan',
      'Ruangan',
      'Gedung',
      'Waktu Mulai',
      'Waktu Selesai',
      'Peserta',
      'Status',
      'Biaya (Rp)',
      'Status Bayar',
      'SKM Rating'
    ];

    const rows = data.bookings.map((b: any) => [
      `"${b.bookingNumber}"`,
      `"${b.applicantName}"`,
      `"${b.applicantEmail}"`,
      `"${b.applicantPhone}"`,
      `"${b.eventName.replace(/"/g, '""')}"`,
      `"${b.roomName}"`,
      `"${b.buildingName}"`,
      `"${format(new Date(b.dateStart), 'yyyy-MM-dd HH:mm')}"`,
      `"${format(new Date(b.dateEnd), 'yyyy-MM-dd HH:mm')}"`,
      b.participantCount || 0,
      `"${b.state}"`,
      b.paymentAmount || 0,
      `"${b.paymentState}"`,
      b.skmRating || '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Booking_CTP_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Laporan & Statistik Layanan</h1>
          <p className="text-sm text-slate-500">Rekapitulasi pemanfaatan ruangan, pendapatan tarif, dan indeks kepuasan masyarakat.</p>
        </div>
        <Button onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-700">
          📥 Export Data CSV (Excel)
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Dari Tanggal</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Sampai Tanggal</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Status Booking</label>
            <select
              className="h-10 px-3 border rounded-md text-sm bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="SUBMITTED">Menunggu Review</option>
              <option value="UNDER_REVIEW">Sedang Direview</option>
              <option value="APPROVED">Disetujui</option>
              <option value="WAITING_PAYMENT">Menunggu Pembayaran</option>
              <option value="ACTIVE">Aktif (Sedang Berjalan)</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
          <Button onClick={fetchReports} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Memuat...' : '🔍 Terapkan Filter'}
          </Button>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-700">TOTAL PENGAJUAN</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-950">{data.metrics?.total || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-700">KEGIATAN AKTIF & SELESAI</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-950">
              {(data.metrics?.active || 0) + (data.metrics?.completed || 0)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-purple-700">TOTAL PENDAPATAN TARIF</CardDescription>
            <CardTitle className="text-xl font-bold text-purple-950">
              Rp {(data.metrics?.totalRevenue || 0).toLocaleString('id-ID')}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-amber-700">SKOR KEPUASAN (SKM)</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-950">
              ⭐ {skmStats.averageRating > 0 ? skmStats.averageRating : '-'}{' '}
              <span className="text-xs font-normal text-amber-800">({skmStats.total} responden)</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rincian Data Peminjaman Ruangan</CardTitle>
          <CardDescription>Menampilkan {data.bookings?.length || 0} catatan</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 border-y">
              <tr>
                <th className="p-3">No. Booking</th>
                <th className="p-3">Pemohon</th>
                <th className="p-3">Kegiatan</th>
                <th className="p-3">Ruangan & Gedung</th>
                <th className="p-3">Jadwal Acara</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Tarif (Rp)</th>
                <th className="p-3 text-center">SKM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.bookings?.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-blue-700">{b.bookingNumber}</td>
                  <td className="p-3">
                    <p className="font-medium text-slate-800">{b.applicantName}</p>
                    <p className="text-[10px] text-slate-400">{b.applicantPhone}</p>
                  </td>
                  <td className="p-3 font-medium text-slate-700 max-w-[200px] truncate">{b.eventName}</td>
                  <td className="p-3">
                    <p className="font-medium">{b.roomName}</p>
                    <p className="text-[10px] text-slate-400">{b.buildingName}</p>
                  </td>
                  <td className="p-3 text-slate-600">
                    {format(new Date(b.dateStart), 'dd/MM/yy HH:mm')} - {format(new Date(b.dateEnd), 'HH:mm')}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800">
                      {b.state}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium">
                    {b.paymentAmount > 0 ? Number(b.paymentAmount).toLocaleString('id-ID') : 'Gratis'}
                  </td>
                  <td className="p-3 text-center font-bold text-amber-600">
                    {b.skmRating ? `⭐ ${b.skmRating}` : '-'}
                  </td>
                </tr>
              ))}
              {(!data.bookings || data.bookings.length === 0) && (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-slate-400">
                    Tidak ada data booking yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
