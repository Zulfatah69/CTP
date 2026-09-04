import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { StatusTag } from '@/components/ui/StatusTag';
import { NotificationBanner } from '@/components/ui/NotificationBanner';
import {
  CalendarDays,
  Clock,
  CreditCard,
  Building2,
  AlertTriangle,
  Megaphone,
  ShieldCheck,
  BarChart3,
  Star,
  Users,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  total: number;
  byState: Record<string, number>;
  revenue: number;
  skmAverage: number;
  paymentOverdue: Array<{
    id: string;
    bookingNumber: string;
    eventName: string;
    dateStart: string;
    paymentDeadline: string;
  }>;
}

const ALL_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'REVISION_NEEDED',
  'APPROVED',
  'WAITING_PAYMENT',
  'ACTIVE',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
];

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

      const byState: Record<string, number> = {};
      (data.bookings || []).forEach((b: any) => {
        byState[b.state] = (byState[b.state] || 0) + 1;
      });

      const now = new Date();
      const paymentOverdue = (data.bookings || []).filter(
        (b: any) =>
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

  const needsAttention =
    (stats?.byState['SUBMITTED'] || 0) +
    (stats?.byState['UNDER_REVIEW'] || 0) +
    (stats?.byState['REVISION_NEEDED'] || 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">Dashboard Operasional</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Selamat bertugas, <b>{user?.email}</b> &bull; UPTD Cimahi Techno Park & Gedung BITC
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/admin/bookings')}
            className="bg-primary-700 hover:bg-primary-900 text-white text-xs font-semibold h-9"
          >
            <CalendarDays className="w-4 h-4 mr-1.5" />
            Buka Antrean Booking
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500">Memuat data statistik operasional...</div>
      ) : (
        <>
          {/* URGENT: Payment Overdue Warning Banner (Section 10.5) */}
          {(stats?.paymentOverdue?.length ?? 0) > 0 && (
            <NotificationBanner
              type="error"
              title={`PERHATIAN: ${stats!.paymentOverdue.length} Booking Melewati Batas Waktu Pembayaran (H-1)`}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/admin/bookings')}
                  className="bg-white border-red-300 text-red-800 hover:bg-red-50 text-xs h-8"
                >
                  Tindak Lanjuti
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              }
            >
              <p>
                Permohonan berikut telah melampaui deadline retribusi (H-1 acara). Harap lakukan konfirmasi
                atau ajukan permohonan toleransi ke Kepala UPTD sesuai ketentuan BR-PAYMENT-001.
              </p>
              <div className="mt-2 space-y-1.5">
                {stats!.paymentOverdue.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between bg-white border border-red-200 rounded px-2.5 py-1.5 text-xs text-neutral-800"
                  >
                    <span className="font-mono font-bold text-red-700">{b.bookingNumber}</span>
                    <span className="truncate max-w-xs">{b.eventName}</span>
                    <span className="text-neutral-500">
                      Batas: {new Date(b.paymentDeadline).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </NotificationBanner>
          )}

          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-neutral-200 rounded-lg shadow-xs bg-white">
              <CardContent className="p-5 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Total Permohonan
                </span>
                <p className="text-3xl font-extrabold text-neutral-950 tabular-nums">
                  {stats?.total ?? 0}
                </p>
                <p className="text-[11px] text-neutral-500">Akumulasi seluruh permohonan</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-600 border border-neutral-200 rounded-lg shadow-xs bg-white">
              <CardContent className="p-5 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Perlu Ditindaklanjuti
                </span>
                <p className="text-3xl font-extrabold text-blue-900 tabular-nums">{needsAttention}</p>
                <p className="text-[11px] text-neutral-500">Menunggu review & perbaikan</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-lg shadow-xs bg-white">
              <CardContent className="p-5 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Realisasi Retribusi
                </span>
                <p className="text-xl sm:text-2xl font-extrabold text-neutral-950 tabular-nums">
                  Rp {(stats?.revenue ?? 0).toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-neutral-500">Pembayaran terverifikasi</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 rounded-lg shadow-xs bg-white">
              <CardContent className="p-5 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Indeks Kepuasan (SKM)
                </span>
                <p className="text-3xl font-extrabold text-amber-900 tabular-nums flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  {stats?.skmAverage ? `${stats.skmAverage}/5` : '—'}
                </p>
                <p className="text-[11px] text-neutral-500">Survei pelayanan publik</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown Grid */}
          <Card className="border-neutral-200 rounded-lg shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-neutral-200">
              <CardTitle className="text-base font-bold text-neutral-950">
                Distribusi Status Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {ALL_STATUSES.map((st) => {
                  const count = stats?.byState[st] || 0;
                  return (
                    <div
                      key={st}
                      onClick={() => navigate('/admin/bookings')}
                      className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/70 hover:border-neutral-300 transition-colors cursor-pointer flex flex-col justify-between space-y-2"
                    >
                      <StatusTag status={st} size="sm" />
                      <div className="text-right">
                        <span className="text-2xl font-bold text-neutral-900 tabular-nums">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Action Toolbar */}
          <Card className="border-neutral-200 rounded-lg shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-neutral-200">
              <CardTitle className="text-base font-bold text-neutral-950">
                Pintasan Menu Operasional
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-wrap gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/bookings')}
                className="text-xs h-9 text-neutral-800"
              >
                <CalendarDays className="w-4 h-4 mr-1.5 text-primary-700" />
                Daftar Permohonan Booking
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/buildings')}
                className="text-xs h-9 text-neutral-800"
              >
                <Building2 className="w-4 h-4 mr-1.5 text-primary-700" />
                Kelola Gedung & Ruangan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/reports')}
                className="text-xs h-9 text-neutral-800"
              >
                <BarChart3 className="w-4 h-4 mr-1.5 text-primary-700" />
                Laporan & Ekspor Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/announcements')}
                className="text-xs h-9 text-neutral-800"
              >
                <Megaphone className="w-4 h-4 mr-1.5 text-primary-700" />
                Publikasi Pengumuman
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/audit')}
                className="text-xs h-9 text-neutral-800"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5 text-primary-700" />
                Audit Trail Log
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
