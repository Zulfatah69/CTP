import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT:           { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  SUBMITTED:       { label: 'Menunggu Review', color: 'bg-blue-100 text-blue-700' },
  UNDER_REVIEW:    { label: 'Sedang Direview', color: 'bg-yellow-100 text-yellow-700' },
  REVISION_NEEDED: { label: 'Perlu Perbaikan', color: 'bg-orange-100 text-orange-700' },
  APPROVED:        { label: 'Disetujui', color: 'bg-green-100 text-green-700' },
  WAITING_PAYMENT: { label: 'Menunggu Pembayaran', color: 'bg-purple-100 text-purple-700' },
  ACTIVE:          { label: 'Aktif', color: 'bg-green-200 text-green-800' },
  COMPLETED:       { label: 'Selesai', color: 'bg-gray-200 text-gray-700' },
  CANCELLED:       { label: 'Dibatalkan', color: 'bg-red-100 text-red-600' },
  REJECTED:        { label: 'Ditolak', color: 'bg-red-200 text-red-700' },
};

const PIC_ROLES = [
  { value: 'MAIN_PIC', label: 'PIC Utama' },
  { value: 'VIDEOTRON_OPERATOR', label: 'Operator Videotron & Multimedia' },
  { value: 'CLEANING_STAFF', label: 'Petugas Kebersihan' },
  { value: 'TECHNICIAN', label: 'Teknisi Audio Visual & Listrik' },
  { value: 'OTHER', label: 'Petugas Pendukung Lainnya' },
];

export default function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

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
      toast({ title: 'Gagal', description: e.response?.data?.message || 'Terjadi kesalahan', variant: 'destructive' });
    }
  };

  const promptAction = async (endpoint: string, promptMsg: string, field: string, successMsg: string) => {
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
        await api.post(`/documents/booking/${bookingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast({ title: 'Disposisi diunggah. Sekarang Anda bisa menyetujui booking.' });
        fetchBookings();
      } catch (e: any) {
        toast({ title: 'Gagal upload', description: e.response?.data?.message, variant: 'destructive' });
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
      toast({ title: 'Gagal mengunduh dokumen', variant: 'destructive' });
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!newDateStart || !newDateEnd || !rescheduleReason) {
      toast({ title: 'Lengkapi semua field reschedule', variant: 'destructive' });
      return;
    }

    try {
      await api.post(`/bookings/${rescheduleBookingId}/reschedule`, {
        newDateStart,
        newDateEnd,
        reason: rescheduleReason
      });
      toast({ title: 'Reschedule Berhasil! 📅', description: 'Jadwal booking telah diperbarui.' });
      setRescheduleBookingId(null);
      setNewDateStart('');
      setNewDateEnd('');
      setRescheduleReason('');
      fetchBookings();
    } catch (e: any) {
      toast({ title: 'Reschedule Gagal', description: e.response?.data?.message || 'Error', variant: 'destructive' });
    }
  };

  const handleAssignPicSubmit = async () => {
    if (!selectedEmployee || !selectedRole) {
      toast({ title: 'Pilih pegawai dan peran PIC', variant: 'destructive' });
      return;
    }

    try {
      await api.post(`/bookings/${picBookingId}/pic`, {
        employeeId: selectedEmployee,
        role: selectedRole
      });
      toast({ title: 'PIC Berhasil Ditugaskan! 👷' });
      setPicBookingId(null);
      setSelectedEmployee('');
      fetchBookings();
    } catch (e: any) {
      toast({ title: 'Penugasan PIC Gagal', description: e.response?.data?.message || 'Error', variant: 'destructive' });
    }
  };

  const handleRemovePic = async (bookingId: string, assignmentId: string) => {
    if (!confirm('Hapus penugasan PIC ini?')) return;
    try {
      await api.delete(`/bookings/${bookingId}/pic/${assignmentId}`);
      toast({ title: 'Penugasan PIC dihapus' });
      fetchBookings();
    } catch (e: any) {
      toast({ title: 'Gagal menghapus PIC', description: e.response?.data?.message, variant: 'destructive' });
    }
  };

  const filtered = bookings.filter(b =>
    !filter || b.state === filter || b.bookingNumber.includes(filter) || b.eventName?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Booking</h1>
          <p className="text-sm text-slate-500">Kelola antrean pengajuan, persetujuan, penugasan PIC, dan perubahan jadwal.</p>
        </div>
        <Input
          placeholder="Filter status / nomor booking..."
          className="max-w-xs"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {/* Modal Reschedule */}
      {rescheduleBookingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Reschedule Booking Jadwal</h3>
            <p className="text-xs text-slate-500">Maksimal 3x perubahan jadwal. Wajib dalam tahun kalender yang sama.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Waktu Mulai Baru *</label>
                <Input type="datetime-local" value={newDateStart} onChange={e => setNewDateStart(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Waktu Selesai Baru *</label>
                <Input type="datetime-local" value={newDateEnd} onChange={e => setNewDateEnd(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Alasan Perubahan Jadwal *</label>
                <Input placeholder="Contoh: Permohonan pemohon via surat permohonan tanggal XX" value={rescheduleReason} onChange={e => setRescheduleReason(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRescheduleBookingId(null)}>Batal</Button>
              <Button onClick={handleRescheduleSubmit} className="bg-blue-600 hover:bg-blue-700">Simpan Jadwal Baru</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal PIC Assignment */}
      {picBookingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Tugaskan Petugas PIC Ruangan</h3>
            <p className="text-xs text-slate-500">Pilih pegawai internal UPTD CTP yang bertugas melayani kegiatan ini.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Pilih Pegawai *</label>
                <select
                  className="w-full h-10 px-3 rounded-md border text-sm"
                  value={selectedEmployee}
                  onChange={e => setSelectedEmployee(e.target.value)}
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.position})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Peran / Tugas PIC *</label>
                <select
                  className="w-full h-10 px-3 rounded-md border text-sm"
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                >
                  {PIC_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPicBookingId(null)}>Batal</Button>
              <Button onClick={handleAssignPicSubmit} className="bg-emerald-600 hover:bg-emerald-700">Tugaskan PIC</Button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && <p className="text-gray-500">Tidak ada data booking yang sesuai.</p>}

      {filtered.map((b: any) => {
        const stateInfo = STATE_LABELS[b.state] || { label: b.state, color: 'bg-gray-100 text-gray-600' };
        const hasDisposisi = b.documents?.some((d: any) => d.type === 'LEMBAR_DISPOSISI');

        return (
          <Card key={b.id} className="border-slate-200 shadow-sm">
            <CardContent className="p-5 space-y-4">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold text-lg text-slate-900">{b.bookingNumber}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stateInfo.color}`}>{stateInfo.label}</span>
                    {b.rescheduleCount > 0 && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                        🔄 Reschedule ({b.rescheduleCount}x)
                      </span>
                    )}
                  </div>
                  <p className="text-base font-medium text-slate-800 mt-1">{b.eventName}</p>
                  <p className="text-xs text-slate-500">
                    🏢 {b.room?.name} ({b.room?.building?.name}) &nbsp;|&nbsp; 
                    📅 {format(new Date(b.dateStart), 'dd MMM yyyy HH:mm')} – {format(new Date(b.dateEnd), 'HH:mm')} &nbsp;|&nbsp; 
                    👥 {b.participantCount} peserta
                  </p>
                </div>
              </div>

              {/* Revision note */}
              {b.state === 'REVISION_NEEDED' && b.revisionNote && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 text-xs text-orange-800">
                  <p className="font-semibold">Catatan perbaikan yang dikirim ke pemohon:</p>
                  <p>{b.revisionNote}</p>
                </div>
              )}

              {/* BR-BOOKING-005: Banner internal untuk kategori non-pemerintah */}
              {['KOMUNITAS', 'PERSONAL'].includes(b.applicantCategory) && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2.5 text-xs text-yellow-900 flex items-start gap-2">
                  <span className="text-base">⚠️</span>
                  <div>
                    <p className="font-bold">Perhatian Internal: Kategori Pemohon — {b.applicantCategory === 'KOMUNITAS' ? 'Komunitas/Ormas/LSM' : 'Perorangan/Lainnya'}</p>
                    <p className="mt-0.5 text-yellow-800">Pastikan terdapat dasar/arahan pimpinan yang terdokumentasi sesuai ketentuan regulasi sebelum disetujui (BR-BOOKING-005).</p>
                  </div>
                </div>
              )}


              {/* Dossier Dokumen */}
              {b.documents?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {b.documents.map((d: any) => (
                    <Button key={d.id} variant="outline" size="sm" className="text-xs bg-slate-50" onClick={() => handleDownloadDoc(d)}>
                      📎 {d.type} — {d.originalName}
                    </Button>
                  ))}
                </div>
              )}

              {/* PIC List (Jika ada) */}
              {b.picAssignments?.length > 0 && (
                <div className="bg-slate-50 border rounded-lg p-2.5 text-xs space-y-1">
                  <span className="font-semibold text-slate-700">👷 PIC Bertugas:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {b.picAssignments.map((pic: any) => (
                      <span key={pic.id} className="inline-flex items-center gap-1.5 bg-white border px-2 py-1 rounded shadow-xs">
                        <b>{pic.role}:</b> {pic.employee?.fullName || 'Petugas'}
                        <button
                          onClick={() => handleRemovePic(b.id, pic.id)}
                          className="text-red-500 hover:text-red-700 ml-1 font-bold"
                          title="Hapus PIC"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t items-center">
                {/* SUBMITTED → UNDER_REVIEW */}
                {b.state === 'SUBMITTED' && (
                  <Button size="sm" onClick={() => action(`/bookings/${b.id}/review`, {}, 'Status berubah ke UNDER_REVIEW')}>
                    🔍 Buka Review
                  </Button>
                )}

                {/* UNDER_REVIEW actions */}
                {b.state === 'UNDER_REVIEW' && (
                  <>
                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-400"
                      onClick={() => promptAction(`/bookings/${b.id}/request-revision`, 'Masukkan catatan perbaikan untuk pemohon:', 'note', 'Permintaan perbaikan dikirim')}>
                      ✏️ Minta Perbaikan
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-400"
                      onClick={() => promptAction(`/bookings/${b.id}/reject`, 'Masukkan alasan penolakan:', 'reason', 'Booking ditolak')}>
                      ❌ Tolak
                    </Button>
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-400" onClick={() => handleUploadDisposisi(b.id)}>
                      📤 Upload Disposisi {hasDisposisi && '✓'}
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700"
                      onClick={() => action(`/bookings/${b.id}/approve`, {}, 'Booking disetujui!')}
                      title={!hasDisposisi ? 'Upload disposisi terlebih dahulu' : ''}>
                      ✅ Setujui {!hasDisposisi && '(butuh disposisi)'}
                    </Button>
                  </>
                )}

                {/* WAITING_PAYMENT actions */}
                {b.state === 'WAITING_PAYMENT' && (
                  <>
                    {b.payment?.state === 'PROOF_UPLOADED' && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                        Bukti bayar siap diverifikasi
                      </span>
                    )}
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => { if (confirm('Konfirmasi verifikasi pembayaran manual?')) action(`/payments/${b.id}/verify`, {}, 'Pembayaran terverifikasi! Booking ACTIVE'); }}>
                      💰 Verifikasi Pembayaran
                    </Button>
                    {b.payment?.state === 'PROOF_UPLOADED' && (
                      <Button size="sm" variant="outline" className="text-red-600 border-red-400"
                        onClick={() => promptAction(`/payments/${b.id}/reject-proof`, 'Masukkan alasan penolakan bukti:', 'reason', 'Bukti pembayaran ditolak')}>
                        ❌ Tolak Bukti
                      </Button>
                    )}
                  </>
                )}

                {/* ACTIVE → COMPLETED */}
                {b.state === 'ACTIVE' && (
                  <Button size="sm" className="bg-gray-700 hover:bg-gray-800"
                    onClick={() => { if (confirm('Konfirmasi checkout? Kegiatan telah selesai?')) action(`/bookings/${b.id}/checkout`, {}, 'Checkout berhasil! Pemohon diminta mengisi SKM.'); }}>
                    🏁 Selesai (Checkout)
                  </Button>
                )}

                {/* Tombol Tugaskan PIC */}
                {['APPROVED', 'WAITING_PAYMENT', 'ACTIVE'].includes(b.state) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    onClick={() => setPicBookingId(b.id)}
                  >
                    👷 Tugaskan PIC
                  </Button>
                )}

                {/* Tombol Reschedule */}
                {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'WAITING_PAYMENT', 'ACTIVE'].includes(b.state) && b.rescheduleCount < 3 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                    onClick={() => {
                      setRescheduleBookingId(b.id);
                      setNewDateStart(b.dateStart.slice(0, 16));
                      setNewDateEnd(b.dateEnd.slice(0, 16));
                    }}
                  >
                    🔄 Reschedule
                  </Button>
                )}

                {/* Batalkan */}
                {!['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.state) && (
                  <Button size="sm" variant="ghost" className="text-red-500 ml-auto hover:bg-red-50"
                    onClick={() => promptAction(`/bookings/${b.id}/cancel`, 'Masukkan alasan pembatalan resmi:', 'reason', 'Booking dibatalkan')}>
                    🚫 Batalkan
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
