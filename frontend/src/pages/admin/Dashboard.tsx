import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  total: number;
  byState: Record<string, number>;
  revenue: number;
  skmAverage: number;
  paymentOverdue: Array<{ id: string; bookingNumber: string; eventName: string; dateStart: string; paymentDeadline: string }>;
}

const STATE_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  DRAFT:           { label: 'Draft', color: 'bg-gray-100 text-gray-700', emoji: '📝' },
  SUBMITTED:       { label: 'Menunggu Review', color: 'bg-blue-100 text-blue-700', emoji: '📨' },
  UNDER_REVIEW:    { label: 'Sedang Direview', color: 'bg-yellow-100 text-yellow-700', emoji: '🔍' },
  REVISION_NEEDED: { label: 'Perlu Perbaikan', color: 'bg-orange-100 text-orange-700', emoji: '✏️' },
  APPROVED:        { label: 'Disetujui', color: 'bg-green-100 text-green-700', emoji: '✅' },
  WAITING_PAYMENT: { label: 'Menunggu Pembayaran', color: 'bg-purple-100 text-purple-700', emoji: '💳' },
  ACTIVE:          { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700', emoji: '🟢' },
  COMPLETED:       { label: 'Selesai', color: 'bg-gray-200 text-gray-700', emoji: '🏁' },
  CANCELLED:       { label: 'Dibatalkan', color: 'bg-red-100 text-red-600', emoji: '🚫' },
  REJECTED:        { label: 'Ditolak', color: 'bg-red-200 text-red-700', emoji: '❌' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ role: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reports/bookings');

      // Hitung byState dari data report
      const byState: Record<string, number> = {};
      (data.bookings || []).forEach((b: any) => {
        byState[b.state] = (byState[b.state] || 0) + 1;
      });

      // Hitung payment overdue: WAITING_PAYMENT yang deadline-nya sudah lewat
      const now = new Date();
      const paymentOverdue = (data.bookings || []).filter((b: any) =>
        b.state === 'WAITING_PAYMENT' && b.paymentDeadline && new Date(b.paymentDeadline) < now
      );

      setStats({
        total: data.total ?? 0,
        byState,
        revenue: data.totalRevenue ?? 0,
        skmAverage: data.averageSkmRating ?? 0,
        paymentOverdue,
      });
    } catch (e) {
      console.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const needsAttention = (stats?.byState['SUBMITTED'] || 0) + (stats?.byState['REVISION_NEEDED'] || 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="text-sm text-slate-500 mt-1">
          Selamat datang{user ? `, ${user.email}` : ''} — UPTD Cimahi Techno Park
        </p>
      </div>

      {loading ? (
        <p className="text-slate-400 animate-pulse">Memuat data dashboard...</p>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Booking</p>
                <p className="text-4xl font-bold text-slate-900 mt-1">{stats?.total ?? 0}</p>
                <p className="text-xs text-slate-400 mt-1">Semua waktu</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Perlu Tindakan</p>
                <p className="text-4xl font-bold text-blue-700 mt-1">{needsAttention}</p>
                <p className="text-xs text-blue-500 mt-1">Baru masuk + perlu perbaikan</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Total Pendapatan</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  Rp {(stats?.revenue ?? 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-emerald-500 mt-1">Pembayaran terverifikasi</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Rata-rata SKM</p>
                <p className="text-4xl font-bold text-amber-700 mt-1">
                  {stats?.skmAverage ? `${stats.skmAverage}/5` : '—'}
                </p>
                <p className="text-xs text-amber-500 mt-1">Indeks kepuasan layanan</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Overdue Warning — BR-PAYMENT-001 */}
          {(stats?.paymentOverdue?.length ?? 0) > 0 && (
            <Card className="border-red-300 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-700 text-base flex items-center gap-2">
                  ⚠️ Pembayaran Lewat Deadline (H-1) — {stats!.paymentOverdue.length} booking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-red-600">Booking berikut belum melunasi pembayaran dan deadline telah terlewat. Harap tindak lanjuti (BR-PAYMENT-001).</p>
                {stats!.paymentOverdue.map(b => (
                  <div key={b.id} className="flex justify-between items-center bg-white border border-red-200 rounded-lg px-3 py-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{b.bookingNumber}</span>
                      <span className="text-slate-500 ml-2">{b.eventName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-medium">Deadline: {new Date(b.paymentDeadline).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="text-red-600 border-red-300 mt-1" onClick={() => navigate('/admin/bookings')}>
                  Lihat Semua Booking →
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {Object.entries(STATE_LABELS).map(([state, info]) => {
                  const count = stats?.byState[state] || 0;
                  if (count === 0) return null;
                  return (
                    <div
                      key={state}
                      className={`rounded-lg p-3 text-center cursor-pointer hover:shadow-md transition ${info.color}`}
                      onClick={() => navigate('/admin/bookings')}
                    >
                      <p className="text-xl">{info.emoji}</p>
                      <p className="text-2xl font-bold mt-1">{count}</p>
                      <p className="text-xs mt-0.5 font-medium">{info.label}</p>
                    </div>
                  );
                })}
                {Object.values(stats?.byState || {}).every(v => v === 0) && (
                  <p className="text-sm text-slate-400 col-span-5 text-center py-4">Belum ada data booking.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/admin/bookings')} className="bg-blue-600 hover:bg-blue-700">
                📋 Kelola Booking
              </Button>
              <Button onClick={() => navigate('/admin/buildings')} variant="outline">
                🏢 Master Gedung & Ruangan
              </Button>
              <Button onClick={() => navigate('/admin/reports')} variant="outline">
                📊 Laporan & Statistik
              </Button>
              <Button onClick={() => navigate('/admin/announcements')} variant="outline">
                📢 Kelola Pengumuman
              </Button>
              <Button onClick={() => navigate('/admin/audit')} variant="outline">
                🔍 Audit Trail
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
