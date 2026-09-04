import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { StatusTag } from '@/components/ui/StatusTag';
import { NotificationBanner } from '@/components/ui/NotificationBanner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Search,
  CheckCircle2,
  FileText,
  UserCheck,
  Clock,
  Building2,
  Users,
  Upload,
  RefreshCw,
  XCircle,
  CreditCard,
  Check,
  X,
} from 'lucide-react';

const PIC_ROLES = [
  { value: 'MAIN_PIC', label: 'PIC Utama' },
  { value: 'VIDEOTRON_OPERATOR', label: 'Operator Videotron & Multimedia' },
  { value: 'CLEANING_STAFF', label: 'Petugas Kebersihan' },
  { value: 'TECHNICIAN', label: 'Teknisi Audio Visual & Kelistrikan' },
  { value: 'OTHER', label: 'Petugas Pendukung Lainnya' },
];

export default function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Reschedule Modal state
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [newDateStart, setNewDateStart] = useState('');
  const [newDateEnd, setNewDateEnd] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // PIC Modal state
  const [picBookingId, setPicBookingId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedRole, setSelectedRole] = useState('MAIN_PIC');

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (e) {
      console.error('Failed to load bookings');
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/master/employees');
      setEmployees(data);
    } catch (e) {
      console.error('Failed to load employees');
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchEmployees();
  }, []);

  const action = async (endpoint: string, body: any = {}, successMsg: string) => {
    try {
      await api.post(endpoint, body);
      toast({ title: successMsg });
      fetchBookings();
    } catch (e: any) {
      toast({
        title: 'Tindakan Gagal',
        description: e.response?.data?.message || 'Terjadi kesalahan sistem.',
        variant: 'destructive',
      });
    }
  };

  const promptAction = async (
    endpoint: string,
    promptMsg: string,
    field: string,
    successMsg: string
  ) => {
    const val = prompt(promptMsg);
    if (!val) return;
    await action(endpoint, { [field]: val }, successMsg);
  };

  const handleUploadDisposisi = async (bookingId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'LEMBAR_DISPOSISI');
      try {
        await api.post(`/documents/booking/${bookingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
          title: 'Lembar Disposisi Berhasil Diunggah',
          description: 'Anda sekarang dapat menyetujui booking ini.',
        });
        fetchBookings();
      } catch (e: any) {
        toast({
          title: 'Gagal Mengunggah Disposisi',
          description: e.response?.data?.message,
          variant: 'destructive',
        });
      }
    };
    input.click();
  };

  const handleDownloadDoc = async (doc: any) => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const { data } = await api.get(`/documents/${doc.id}/download`);
      window.open(data.url + (data.url.includes('?') ? '&' : '?') + `token=${token}`, '_blank');
    } catch (e) {
      toast({ title: 'Gagal mengunduh berkas', variant: 'destructive' });
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!newDateStart || !newDateEnd || !rescheduleReason) {
      toast({ title: 'Lengkapi semua parameter perubahan jadwal', variant: 'destructive' });
      return;
    }

    try {
      await api.post(`/bookings/${rescheduleBookingId}/reschedule`, {
        newDateStart,
        newDateEnd,
        reason: rescheduleReason,
      });
      toast({
        title: 'Perubahan Jadwal Berhasil',
        description: 'Jadwal booking telah diperbarui dalam sistem.',
      });
      setRescheduleBookingId(null);
      setNewDateStart('');
      setNewDateEnd('');
      setRescheduleReason('');
      fetchBookings();
    } catch (e: any) {
      toast({
        title: 'Reschedule Gagal',
        description: e.response?.data?.message || 'Terjadi kesalahan.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignPicSubmit = async () => {
    if (!selectedEmployee || !selectedRole) {
      toast({ title: 'Pilih nama pegawai dan peran PIC', variant: 'destructive' });
      return;
    }

    try {
      await api.post(`/bookings/${picBookingId}/pic`, {
        employeeId: selectedEmployee,
        role: selectedRole,
      });
      toast({ title: 'Petugas PIC Berhasil Ditugaskan' });
      setPicBookingId(null);
      setSelectedEmployee('');
      fetchBookings();
    } catch (e: any) {
      toast({
        title: 'Penugasan Gagal',
        description: e.response?.data?.message || 'Terjadi kesalahan.',
        variant: 'destructive',
      });
    }
  };

  const handleRemovePic = async (bookingId: string, assignmentId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan penugasan PIC ini?')) return;
    try {
      await api.delete(`/bookings/${bookingId}/pic/${assignmentId}`);
      toast({ title: 'Penugasan PIC dihapus' });
      fetchBookings();
    } catch (e: any) {
      toast({
        title: 'Gagal Menghapus PIC',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      !filterQuery ||
      b.bookingNumber?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      b.eventName?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      b.room?.name?.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesStatus = !statusFilter || b.state === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">
            Manajemen Antrean Booking
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Verifikasi berkas fisik, validasi disposisi pimpinan, dan penugasan petugas PIC UPTD.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Cari nomor booking / acara..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="h-10 pl-9 w-52 sm:w-64 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs font-semibold focus:border-neutral-950 focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Semua Status</option>
            <option value="SUBMITTED">Menunggu Review</option>
            <option value="UNDER_REVIEW">Sedang Direview</option>
            <option value="REVISION_NEEDED">Perlu Perbaikan</option>
            <option value="APPROVED">Disetujui</option>
            <option value="WAITING_PAYMENT">Menunggu Bayar</option>
            <option value="ACTIVE">Aktif</option>
            <option value="COMPLETED">Selesai</option>
            <option value="REJECTED">Ditolak</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Modal Reschedule */}
      {rescheduleBookingId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg space-y-4 border border-neutral-200">
            <div>
              <h3 className="text-base font-bold text-neutral-950">Reschedule Tanggal Booking</h3>
              <p className="text-xs text-neutral-500">
                Sesuai BR-RESCHEDULE, maksimal 3x perubahan jadwal dalam tahun kalender berjalan.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Waktu Mulai Baru *
                </label>
                <Input
                  type="datetime-local"
                  value={newDateStart}
                  onChange={(e) => setNewDateStart(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Waktu Selesai Baru *
                </label>
                <Input
                  type="datetime-local"
                  value={newDateEnd}
                  onChange={(e) => setNewDateEnd(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Alasan Perubahan Jadwal Resmi *
                </label>
                <Input
                  placeholder="Contoh: Permohonan tertulis pemohon tanggal XX"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button variant="outline" size="sm" onClick={() => setRescheduleBookingId(null)}>
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleRescheduleSubmit}
                className="bg-primary-700 hover:bg-primary-900 text-white"
              >
                Simpan Jadwal Baru
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal PIC Assignment */}
      {picBookingId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg space-y-4 border border-neutral-200">
            <div>
              <h3 className="text-base font-bold text-neutral-950">
                Tugaskan Petugas PIC Fasilitas
              </h3>
              <p className="text-xs text-neutral-500">
                Pilih pegawai internal UPTD CTP yang bertugas melayani teknis kegiatan ini.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Pilih Pegawai Bertugas *
                </label>
                <select
                  className="w-full h-11 px-3 rounded-lg border border-neutral-300 text-xs font-medium"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Peran / Tanggung Jawab PIC *
                </label>
                <select
                  className="w-full h-11 px-3 rounded-lg border border-neutral-300 text-xs font-medium"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  {PIC_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button variant="outline" size="sm" onClick={() => setPicBookingId(null)}>
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleAssignPicSubmit}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                Tugaskan PIC
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking List */}
      {filtered.length === 0 && (
        <div className="p-12 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded-lg">
          Tidak ada data booking yang sesuai dengan kriteria filter.
        </div>
      )}

      {filtered.map((b: any) => {
        const hasDisposisi = b.documents?.some((d: any) => d.type === 'LEMBAR_DISPOSISI');
        const isNonGov = ['KOMUNITAS', 'PERSONAL'].includes(b.applicantCategory);

        return (
          <Card key={b.id} className="border-neutral-200 shadow-2xs rounded-lg bg-white">
            <CardContent className="p-5 sm:p-6 space-y-4">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-neutral-950">
                      {b.bookingNumber}
                    </span>
                    <StatusTag status={b.state} />
                    {b.rescheduleCount > 0 && (
                      <span className="text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                        Reschedule {b.rescheduleCount}x
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mt-1">{b.eventName}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      {b.room?.name} ({b.room?.building?.name})
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {format(new Date(b.dateStart), 'd MMM yyyy HH:mm', { locale: id })} –{' '}
                      {format(new Date(b.dateEnd), 'HH:mm')} WIB
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      {b.participantCount} peserta
                    </span>
                  </div>
                </div>
              </div>

              {/* BR-BOOKING-005 Internal Warning Banner */}
              {isNonGov && (
                <NotificationBanner
                  type="warning"
                  title="Peringatan Regulasi Internal (BR-BOOKING-005)"
                >
                  Pemohon memilih kategori non-pemerintah ({b.applicantCategory}). Pastikan terdapat dasar
                  atau arahan pimpinan yang terdokumentasi sebelum persetujuan resmi diberikan.
                </NotificationBanner>
              )}

              {/* Revision note banner */}
              {b.state === 'REVISION_NEEDED' && b.revisionNote && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 space-y-1">
                  <span className="font-bold block">Catatan Perbaikan Terkirim:</span>
                  <p>{b.revisionNote}</p>
                </div>
              )}

              {/* Digital Dossier Document Chips (No deletion button per BR-DOSSIER) */}
              {b.documents?.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide block">
                    Berkas Digital Dossier:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {b.documents.map((d: any) => (
                      <Button
                        key={d.id}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 bg-neutral-50 border-neutral-300 hover:bg-neutral-100"
                        onClick={() => handleDownloadDoc(d)}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1 text-primary-700" />
                        <span>
                          {d.type === 'LEMBAR_DISPOSISI' ? 'Disposisi Pimpinan' : d.type}: {d.originalName}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned PICs */}
              {b.picAssignments?.length > 0 && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1.5">
                  <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    Petugas PIC Lapangan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {b.picAssignments.map((pic: any) => (
                      <span
                        key={pic.id}
                        className="inline-flex items-center gap-1.5 bg-white border border-neutral-300 px-2.5 py-1 rounded text-xs font-medium shadow-2xs"
                      >
                        <b className="text-neutral-900">{pic.role}:</b>
                        <span className="text-neutral-700">{pic.employee?.fullName || 'Petugas'}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePic(b.id, pic.id)}
                          className="text-neutral-400 hover:text-red-700 ml-1 p-0.5 rounded transition-colors"
                          title="Hapus Penugasan PIC"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-200 items-center">
                {/* SUBMITTED → UNDER_REVIEW */}
                {b.state === 'SUBMITTED' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      action(`/bookings/${b.id}/review`, {}, 'Status berubah ke UNDER_REVIEW')
                    }
                    className="bg-primary-700 hover:bg-primary-900 text-white text-xs h-9"
                  >
                    Buka Review Berkas
                  </Button>
                )}

                {/* UNDER_REVIEW actions */}
                {b.state === 'UNDER_REVIEW' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-amber-800 border-amber-400 hover:bg-amber-50 text-xs h-9"
                      onClick={() =>
                        promptAction(
                          `/bookings/${b.id}/request-revision`,
                          'Masukkan catatan perbaikan berkas untuk pemohon:',
                          'note',
                          'Permintaan perbaikan berhasil dikirim ke pemohon'
                        )
                      }
                    >
                      Minta Perbaikan
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-700 border-red-300 hover:bg-red-50 text-xs h-9"
                      onClick={() =>
                        promptAction(
                          `/bookings/${b.id}/reject`,
                          'Masukkan alasan penolakan permohonan:',
                          'reason',
                          'Permohonan booking resmi ditolak'
                        )
                      }
                    >
                      Tolak
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-primary-700 border-primary-400 hover:bg-primary-50 text-xs h-9"
                      onClick={() => handleUploadDisposisi(b.id)}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Upload Disposisi {hasDisposisi && <Check className="w-3.5 h-3.5 text-emerald-600 inline ml-1 stroke-[2.5]" />}
                    </Button>

                    <Button
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 font-bold"
                      onClick={() => action(`/bookings/${b.id}/approve`, {}, 'Permohonan berhasil disetujui!')}
                      title={!hasDisposisi ? 'Upload lembar disposisi terlebih dahulu' : ''}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Setujui {!hasDisposisi && '(Wajib Disposisi)'}
                    </Button>
                  </>
                )}

                {/* WAITING_PAYMENT actions */}
                {b.state === 'WAITING_PAYMENT' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-primary-700 hover:bg-primary-900 text-white text-xs h-9 font-bold"
                      onClick={() => {
                        if (confirm('Konfirmasi verifikasi pembayaran retribusi resmi?'))
                          action(`/payments/${b.id}/verify`, {}, 'Pembayaran terverifikasi! Status booking AKTIF.');
                      }}
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1" />
                      Verifikasi Pembayaran
                    </Button>
                    {b.payment?.state === 'PROOF_UPLOADED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 border-red-300 hover:bg-red-50 text-xs h-9"
                        onClick={() =>
                          promptAction(
                            `/payments/${b.id}/reject-proof`,
                            'Masukkan alasan penolakan bukti transfer:',
                            'reason',
                            'Bukti pembayaran ditolak'
                          )
                        }
                      >
                        Tolak Bukti
                      </Button>
                    )}
                  </>
                )}

                {/* ACTIVE → COMPLETED (Check-out) */}
                {b.state === 'ACTIVE' && (
                  <Button
                    size="sm"
                    className="bg-neutral-900 hover:bg-black text-white text-xs h-9 font-bold"
                    onClick={() => {
                      if (confirm('Konfirmasi kegiatan selesai dan lakukan check-out?'))
                        action(
                          `/bookings/${b.id}/checkout`,
                          {},
                          'Kegiatan selesai! Pemohon diundang mengisi survei SKM.'
                        );
                    }}
                  >
                    Check-out Selesai
                  </Button>
                )}

                {/* Tugaskan PIC button */}
                {['APPROVED', 'WAITING_PAYMENT', 'ACTIVE'].includes(b.state) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-800 border-emerald-300 hover:bg-emerald-50 text-xs h-9"
                    onClick={() => setPicBookingId(b.id)}
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    Tugaskan PIC
                  </Button>
                )}

                {/* Reschedule button */}
                {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'WAITING_PAYMENT', 'ACTIVE'].includes(
                  b.state
                ) &&
                  b.rescheduleCount < 3 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-primary-700 border-primary-300 hover:bg-primary-50 text-xs h-9"
                      onClick={() => {
                        setRescheduleBookingId(b.id);
                        setNewDateStart(b.dateStart.slice(0, 16));
                        setNewDateEnd(b.dateEnd.slice(0, 16));
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Reschedule
                    </Button>
                  )}

                {/* Cancellation button (Admin-only BR-BOOKING-006) */}
                {!['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.state) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-9 ml-auto"
                    onClick={() =>
                      promptAction(
                        `/bookings/${b.id}/cancel`,
                        'Masukkan alasan pembatalan resmi permohonan:',
                        'reason',
                        'Permohonan booking berhasil dibatalkan secara resmi'
                      )
                    }
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Batalkan Booking
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
