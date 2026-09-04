import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { StatusTag } from '@/components/ui/StatusTag';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function ToleranceRequests() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchToleranceBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings');
      // Filter bookings that have tolerance requested
      const withTolerance = data.filter((b: any) => b.payment?.toleranceRequestedAt);
      setBookings(withTolerance);
    } catch (e: any) {
      toast({
        title: 'Gagal Memuat Permintaan Toleransi',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToleranceBookings();
  }, []);

  const handleDecision = async (bookingId: string, approved: boolean) => {
    if (!approved && !rejectionReason.trim()) {
      toast({ title: 'Alasan penolakan toleransi wajib diisi', variant: 'destructive' });
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/payments/${bookingId}/decide-tolerance`, {
        approved,
        reason: approved ? undefined : rejectionReason.trim(),
      });

      toast({
        title: approved ? 'Toleransi Disetujui' : 'Toleransi Ditolak',
        description: approved
          ? 'Booking diizinkan tetap aktif melampaui batas H-1.'
          : 'Permintaan toleransi ditolak.',
      });

      setSelectedBooking(null);
      setRejectionReason('');
      fetchToleranceBookings();
    } catch (e: any) {
      toast({
        title: 'Gagal Memproses Keputusan',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const pendingRequests = bookings.filter((b) => b.payment?.toleranceApproved === null);
  const historyRequests = bookings.filter((b) => b.payment?.toleranceApproved !== null);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-950 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          Persetujuan Toleransi Pembayaran H-1
        </h1>
        <p className="text-xs text-neutral-600 mt-0.5">
          Kewenangan Kepala UPTD untuk memberikan toleransi permohonan yang belum melunasi biaya sewa hingga H-1
        </p>
      </div>

      {/* Pending Requests */}
      <Card className="border-neutral-200 shadow-2xs">
        <CardHeader className="pb-3 border-b border-neutral-100 bg-amber-50/50">
          <CardTitle className="text-sm font-bold text-amber-950 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Menunggu Keputusan ({pendingRequests.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-xs text-neutral-400">
              Memuat permohonan toleransi...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-500">
              Tidak ada permohonan toleransi pembayaran yang menunggu persetujuan.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {pendingRequests.map((b) => (
                <div key={b.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-900">
                        {b.bookingNumber}
                      </span>
                      <StatusTag status={b.state} />
                    </div>
                    <div className="text-xs font-semibold text-neutral-800">{b.eventName}</div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-3">
                      <span>Pemohon: {b.user?.profile?.fullName || b.user?.email}</span>
                      <span>Ruangan: {b.room?.name || '-'}</span>
                      <span>
                        Pelaksanaan:{' '}
                        {format(new Date(b.dateStart), 'd MMM yyyy, HH:mm', { locale: idLocale })}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded inline-block">
                      Batas bayar normal H-1:{' '}
                      {b.paymentDeadline
                        ? format(new Date(b.paymentDeadline), 'd MMM yyyy', { locale: idLocale })
                        : '-'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleDecision(b.id, true)}
                      disabled={processing}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 px-3"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Setujui Toleransi
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedBooking(selectedBooking?.id === b.id ? null : b)}
                      className="text-rose-600 border-rose-300 hover:bg-rose-50 text-xs h-8 px-3"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Tolak...
                    </Button>
                  </div>

                  {selectedBooking?.id === b.id && (
                    <div className="w-full md:w-auto mt-2 pt-2 border-t md:border-t-0 flex items-center gap-2">
                      <Input
                        placeholder="Alasan penolakan toleransi..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="text-xs h-8 w-64"
                      />
                      <Button
                        size="sm"
                        disabled={processing}
                        onClick={() => handleDecision(b.id, false)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-3"
                      >
                        Kirim Penolakan
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Requests */}
      <Card className="border-neutral-200 shadow-2xs">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <CardTitle className="text-sm font-bold text-neutral-900">
            Riwayat Keputusan Toleransi ({historyRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase tracking-wider border-b border-neutral-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3">No Booking</th>
                  <th className="px-4 py-3">Kegiatan</th>
                  <th className="px-4 py-3">Waktu Diajukan</th>
                  <th className="px-4 py-3">Waktu Diputuskan</th>
                  <th className="px-4 py-3">Keputusan</th>
                  <th className="px-4 py-3">Catatan / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {historyRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                      Belum ada riwayat keputusan toleransi
                    </td>
                  </tr>
                ) : (
                  historyRequests.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-mono font-bold text-neutral-900">
                        {b.bookingNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-900">{b.eventName}</td>
                      <td className="px-4 py-3 text-neutral-500">
                        {b.payment?.toleranceRequestedAt
                          ? format(new Date(b.payment.toleranceRequestedAt), 'd MMM yyyy HH:mm', {
                              locale: idLocale,
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {b.payment?.toleranceApprovedAt
                          ? format(new Date(b.payment.toleranceApprovedAt), 'd MMM yyyy HH:mm', {
                              locale: idLocale,
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {b.payment?.toleranceApproved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Disetujui
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Ditolak
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {b.payment?.toleranceRejectedReason || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
