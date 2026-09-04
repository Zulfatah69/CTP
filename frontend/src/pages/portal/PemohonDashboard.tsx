import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '../../services/api';
import { StatusTag } from '@/components/ui/StatusTag';
import { NotificationBanner } from '@/components/ui/NotificationBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Clock,
  CreditCard,
  CheckCircle2,
  Star,
  Plus,
  Calendar,
  FileText,
  Building2,
} from 'lucide-react';

export default function PemohonDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => {
        toast({ title: 'Gagal memuat data booking', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, []);

  const count = (states: string[]) =>
    bookings.filter((b) => states.includes(b.state)).length;

  const revisionBookings = bookings.filter(
    (b) => b.state === 'REVISION_NEEDED' && b.revisionNote
  );

  const stats = [
    {
      label: 'Menunggu Review',
      value: count(['SUBMITTED', 'UNDER_REVIEW', 'REVISION_NEEDED']),
      icon: Clock,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      label: 'Menunggu Pembayaran',
      value: count(['WAITING_PAYMENT']),
      icon: CreditCard,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      label: 'Sedang Berlangsung',
      value: count(['ACTIVE', 'APPROVED']),
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      label: 'Selesai',
      value: count(['COMPLETED']),
      icon: Star,
      color: 'text-primary-700',
      bg: 'bg-primary-50',
      border: 'border-primary-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">
          Selamat Datang
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">{user?.email}</p>
      </div>

      {/* Revision banners */}
      {revisionBookings.length > 0 && (
        <div className="space-y-2">
          {revisionBookings.map((b) => (
            <NotificationBanner
              key={b.id}
              type="warning"
              title={`Perbaikan Diperlukan — ${b.bookingNumber}`}
            >
              {b.revisionNote}
            </NotificationBanner>
          ))}
        </div>
      )}

      {/* Stat Cards — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className={`border ${s.border} ${s.bg} shadow-2xs rounded-lg`}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg bg-white/60 border ${s.border}`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-neutral-600 leading-tight">
                    {s.label}
                  </p>
                  <p className={`text-2xl font-bold ${s.color} leading-tight mt-0.5`}>
                    {loading ? '—' : s.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* History Table */}
      <Card className="border border-neutral-200 shadow-2xs rounded-lg bg-white">
        <CardHeader className="px-5 pt-5 pb-3 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-neutral-950">
            Riwayat Permohonan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              Memuat data...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              Belum ada permohonan. Klik tombol di bawah untuk mengajukan booking baru.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                      No Booking
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                      Kegiatan
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">
                      Ruangan
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wide hidden md:table-cell">
                      Tanggal Mulai
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-neutral-950 whitespace-nowrap">
                        {b.bookingNumber}
                      </td>
                      <td className="px-4 py-3 text-neutral-800 max-w-[180px] truncate">
                        {b.eventName}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          {b.room?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 hidden md:table-cell whitespace-nowrap">
                        {b.dateStart
                          ? format(new Date(b.dateStart), 'd MMM yyyy', { locale: id })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusTag status={b.state} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                          onClick={() =>
                            toast({
                              title: 'Halaman Detail',
                              description: `Halaman detail booking ${b.bookingNumber} belum tersedia.`,
                            })
                          }
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 pt-1">
        <Button
          className="bg-primary-700 hover:bg-primary-900 text-white font-bold text-xs h-10"
          onClick={() => navigate('/portal')}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Ajukan Booking Baru
        </Button>
        <Button
          variant="outline"
          className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold text-xs h-10"
          onClick={() => navigate('/portal/calendar')}
        >
          <Calendar className="w-4 h-4 mr-1.5" />
          Lihat Kalender
        </Button>
      </div>
    </div>
  );
}
