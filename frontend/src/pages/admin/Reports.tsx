import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusTag } from '@/components/ui/StatusTag';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  Download,
  Filter,
  BarChart3,
  Star,
  FileSpreadsheet,
  Calendar,
  Building2,
  Clock,
} from 'lucide-react';

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
          status: status || undefined,
        },
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
      alert('Tidak ada data yang tersedia untuk diekspor.');
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
      'SKM Rating',
    ];

    const rows = data.bookings.map((b: any) => [
      `"${b.bookingNumber}"`,
      `"${b.applicantName || ''}"`,
      `"${b.applicantEmail || ''}"`,
      `"${b.applicantPhone || ''}"`,
      `"${(b.eventName || '').replace(/"/g, '""')}"`,
      `"${b.roomName || ''}"`,
      `"${b.buildingName || ''}"`,
      `"${format(new Date(b.dateStart), 'yyyy-MM-dd HH:mm')}"`,
      `"${format(new Date(b.dateEnd), 'yyyy-MM-dd HH:mm')}"`,
      b.participantCount || 0,
      `"${b.state}"`,
      b.paymentAmount || 0,
      `"${b.paymentState || ''}"`,
      b.skmRating || '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Booking_CTP_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [exportingExcel, setExportingExcel] = useState(false);

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status) params.status = status;

      const response = await api.get('/reports/export-excel', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Booking_CTP_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Gagal mengekspor data Excel. Silakan coba lagi.');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">
            Laporan & Statistik Layanan
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Rekapitulasi pemanfaatan ruangan, realisasi tarif retribusi, dan evaluasi kepuasan SKM.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs h-9 px-4 shrink-0 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            {exportingExcel ? 'Mengunduh...' : 'Ekspor Excel (.xlsx)'}
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-semibold text-xs h-9 px-4 shrink-0 shadow-xs"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-neutral-200 shadow-xs bg-white rounded-lg">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">Dari Tanggal</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40 text-xs h-10"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">Sampai Tanggal</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40 text-xs h-10"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">Status Permohonan</label>
            <select
              className="h-10 px-3 border border-neutral-300 rounded-lg text-xs font-medium bg-white focus:border-neutral-950 focus:ring-1 focus:ring-yellow-400"
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
          <Button
            onClick={fetchReports}
            disabled={loading}
            className="bg-primary-700 hover:bg-primary-900 text-white font-bold text-xs h-10 px-4"
          >
            <Filter className="w-4 h-4 mr-1.5" />
            {loading ? 'Memuat Data...' : 'Terapkan Filter'}
          </Button>
        </CardContent>
      </Card>

      {/* Metrics Cards (Clean borders, no gradients per Design.md Section 12) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-neutral-200 shadow-xs bg-white rounded-lg">
          <CardContent className="p-5 space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Total Pengajuan
            </span>
            <p className="text-3xl font-extrabold text-neutral-950 tabular-nums">
              {data.metrics?.total || 0}
            </p>
            <p className="text-[11px] text-neutral-500">Seluruh periode filter</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600 border border-neutral-200 shadow-xs bg-white rounded-lg">
          <CardContent className="p-5 space-y-1">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
              Kegiatan Terlaksana
            </span>
            <p className="text-3xl font-extrabold text-teal-950 tabular-nums">
              {(data.metrics?.active || 0) + (data.metrics?.completed || 0)}
            </p>
            <p className="text-[11px] text-neutral-500">Aktif & Selesai</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-xs bg-white rounded-lg">
          <CardContent className="p-5 space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Total Retribusi
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-neutral-950 tabular-nums">
              Rp {(data.metrics?.totalRevenue || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-neutral-500">Pendapatan daerah</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-xs bg-white rounded-lg">
          <CardContent className="p-5 space-y-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
              Rata-rata SKM
            </span>
            <p className="text-3xl font-extrabold text-neutral-950 tabular-nums flex items-center gap-1.5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              {skmStats.averageRating > 0 ? skmStats.averageRating : '—'}
            </p>
            <p className="text-[11px] text-neutral-500">{skmStats.total} responden survei</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Data */}
      <Card className="border-neutral-200 shadow-xs bg-white rounded-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-bold text-neutral-950">
                Rincian Catatan Peminjaman Ruangan
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500">
                Menampilkan {data.bookings?.length || 0} baris data transaksi
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-700 border-b border-neutral-200">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">No. Booking</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Pemohon</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Kegiatan</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Ruangan & Gedung</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Jadwal Acara</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Status</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-right">Tarif (Rp)</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-center">SKM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {data.bookings?.map((b: any, idx: number) => (
                <tr
                  key={b.id}
                  className={`hover:bg-neutral-50/70 transition-colors ${
                    idx % 2 === 1 ? 'bg-neutral-50/40' : 'bg-white'
                  }`}
                >
                  <td className="p-3.5 font-mono font-bold text-primary-700">{b.bookingNumber}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-neutral-900">{b.applicantName}</p>
                    <p className="text-[11px] text-neutral-400">{b.applicantPhone || b.applicantEmail}</p>
                  </td>
                  <td className="p-3.5 font-medium text-neutral-800 max-w-[200px] truncate">
                    {b.eventName}
                  </td>
                  <td className="p-3.5">
                    <p className="font-medium text-neutral-800">{b.roomName}</p>
                    <p className="text-[11px] text-neutral-400">{b.buildingName}</p>
                  </td>
                  <td className="p-3.5 text-neutral-700 tabular-nums">
                    {format(new Date(b.dateStart), 'dd/MM/yy HH:mm')} – {format(new Date(b.dateEnd), 'HH:mm')}
                  </td>
                  <td className="p-3.5">
                    <StatusTag status={b.state} size="sm" />
                  </td>
                  <td className="p-3.5 text-right font-semibold text-neutral-900 tabular-nums">
                    {b.paymentAmount > 0
                      ? Number(b.paymentAmount).toLocaleString('id-ID')
                      : 'Bebas Retribusi'}
                  </td>
                  <td className="p-3.5 text-center font-bold text-amber-700 tabular-nums">
                    {b.skmRating ? `${b.skmRating} / 5` : '—'}
                  </td>
                </tr>
              ))}
              {(!data.bookings || data.bookings.length === 0) && (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-neutral-400 text-xs">
                    Tidak ada data peminjaman yang cocok dengan parameter filter di atas.
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
