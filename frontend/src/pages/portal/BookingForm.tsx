import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type Step = 1 | 2 | 3 | 4;

const APPLICANT_CATEGORIES = [
  { value: 'PEMERINTAH_PUSAT', label: 'Pemerintah Pusat' },
  { value: 'PEMERINTAH_DAERAH', label: 'Pemerintah Daerah / OPD' },
  { value: 'PEMERINTAH_CIMAHI', label: 'Pemerintah Kota Cimahi' },
  { value: 'SWASTA', label: 'Swasta / Perusahaan' },
  { value: 'PENDIDIKAN', label: 'Lembaga Pendidikan' },
  { value: 'KOMUNITAS', label: 'Komunitas / Ormas / LSM' },
  { value: 'PERSONAL', label: 'Perorangan / Lainnya' },
];

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT:           { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  SUBMITTED:       { label: 'Diajukan', color: 'bg-blue-100 text-blue-700' },
  UNDER_REVIEW:    { label: 'Sedang Direview', color: 'bg-yellow-100 text-yellow-700' },
  REVISION_NEEDED: { label: 'Perlu Perbaikan', color: 'bg-orange-100 text-orange-700' },
  APPROVED:        { label: 'Disetujui', color: 'bg-green-100 text-green-700' },
  WAITING_PAYMENT: { label: 'Menunggu Pembayaran', color: 'bg-purple-100 text-purple-700' },
  ACTIVE:          { label: 'Aktif', color: 'bg-green-200 text-green-800' },
  COMPLETED:       { label: 'Selesai', color: 'bg-gray-200 text-gray-700' },
  CANCELLED:       { label: 'Dibatalkan', color: 'bg-red-100 text-red-600' },
  REJECTED:        { label: 'Ditolak', color: 'bg-red-200 text-red-700' },
};

export default function BookingForm() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  // Form state
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [formData, setFormData] = useState({
    eventName: '', participantCount: '', attendeesDescription: '',
    activityPurpose: '', activityDescription: '', applicantCategory: ''
  });
  const [suratFile, setSuratFile] = useState<File | null>(null);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [draftBookingId, setDraftBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // SKM Modal state
  const [skmBookingId, setSkmBookingId] = useState<string | null>(null);
  const [skmRating, setSkmRating] = useState<number>(5);
  const [skmComment, setSkmComment] = useState('');
  const [submittingSkm, setSubmittingSkm] = useState(false);

  useEffect(() => {
    fetchBuildings();
    fetchMyBookings();
  }, []);

  const fetchBuildings = async () => {
    const { data } = await api.get('/master/buildings');
    setBuildings(data);
  };

  const fetchMyBookings = async () => {
    const { data } = await api.get('/bookings');
    setMyBookings(data);
  };

  const fetchRooms = async () => {
    if (!selectedBuilding || !dateStart || !dateEnd) return;
    const { data } = await api.get('/master/rooms', { params: { buildingId: selectedBuilding, dateStart, dateEnd } });
    setRooms(data);
  };

  // Step 1 → 2
  const goToStep2 = async () => {
    if (!selectedBuilding || !dateStart || !dateEnd || !selectedRoom) {
      toast({ title: 'Lengkapi pilihan gedung, tanggal, dan ruangan', variant: 'destructive' });
      return;
    }
    if (new Date(dateEnd) <= new Date(dateStart)) {
      toast({ title: 'Waktu selesai harus setelah waktu mulai', variant: 'destructive' });
      return;
    }
    setStep(2);
  };

  // Step 2 → 3
  const goToStep3 = () => {
    if (!formData.eventName || !formData.participantCount || !formData.applicantCategory) {
      toast({ title: 'Isi semua field yang wajib (*)', variant: 'destructive' });
      return;
    }
    setStep(3);
  };

  // Step 3 → 4 (Preview)
  const goToStep4 = () => {
    if (!suratFile) {
      toast({ title: 'Surat permohonan wajib diunggah', variant: 'destructive' });
      return;
    }
    setStep(4);
  };

  // Step 4: Submit (Create DRAFT → Upload Doc → Submit)
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Buat booking DRAFT
      const { data: booking } = await api.post('/bookings', {
        roomId: selectedRoom,
        dateStart, dateEnd,
        eventName: formData.eventName,
        participantCount: parseInt(formData.participantCount),
        attendeesDescription: formData.attendeesDescription,
        activityPurpose: formData.activityPurpose,
        activityDescription: formData.activityDescription,
        applicantCategory: formData.applicantCategory,
      });

      // 2. Upload surat permohonan
      const fd = new FormData();
      fd.append('file', suratFile!);
      fd.append('type', 'SURAT_PERMOHONAN');
      await api.post(`/documents/booking/${booking.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      // 3. Upload proposal (opsional)
      if (proposalFile) {
        const fd2 = new FormData();
        fd2.append('file', proposalFile);
        fd2.append('type', 'PROPOSAL');
        await api.post(`/documents/booking/${booking.id}`, fd2, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      // 4. Submit (DRAFT → SUBMITTED)
      await api.post(`/bookings/${booking.id}/submit`);

      toast({ title: '✅ Pengajuan berhasil dikirim!', description: `No. ${booking.bookingNumber} sedang diproses Admin.` });
      
      // Reset form
      setStep(1);
      setSelectedBuilding(''); setDateStart(''); setDateEnd(''); setSelectedRoom('');
      setFormData({ eventName: '', participantCount: '', attendeesDescription: '', activityPurpose: '', activityDescription: '', applicantCategory: '' });
      setSuratFile(null); setProposalFile(null);
      fetchMyBookings();

    } catch (e: any) {
      toast({ title: 'Gagal mengajukan', description: e.response?.data?.message || e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // Upload bukti bayar untuk booking yang WAITING_PAYMENT
  const handleUploadBukti = async (bookingId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post(`/payments/${bookingId}/upload-proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast({ title: 'Bukti pembayaran diunggah, menunggu verifikasi Admin' });
      fetchMyBookings();
    } catch (e: any) {
      toast({ title: 'Gagal upload', description: e.response?.data?.message, variant: 'destructive' });
    }
  };

  // Resubmit setelah perbaikan
  const handleResubmit = async (bookingId: string, file: File | null) => {
    if (!file) { toast({ title: 'Upload surat permohonan terbaru', variant: 'destructive' }); return; }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', 'SURAT_PERMOHONAN');
    try {
      await api.post(`/documents/booking/${bookingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await api.post(`/bookings/${bookingId}/submit`);
      toast({ title: 'Pengajuan berhasil dikirim ulang' });
      fetchMyBookings();
    } catch (e: any) {
      toast({ title: 'Gagal resubmit', description: e.response?.data?.message, variant: 'destructive' });
    }
  };

  // Submit SKM
  const handleSkmSubmit = async () => {
    if (!skmBookingId) return;
    setSubmittingSkm(true);
    try {
      await api.post(`/skm/${skmBookingId}`, {
        rating: Number(skmRating),
        comment: skmComment
      });
      toast({ title: 'Terima kasih! ⭐', description: 'Survei Kepuasan Masyarakat berhasil dikirim.' });
      setSkmBookingId(null);
      setSkmComment('');
      fetchMyBookings();
    } catch (e: any) {
      toast({ title: 'Gagal mengirim survei', description: e.response?.data?.message, variant: 'destructive' });
    } finally {
      setSubmittingSkm(false);
    }
  };

  const selectedRoomData = rooms.find(r => r.id === selectedRoom);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Modal SKM */}
      {skmBookingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <span className="text-3xl">⭐</span>
              <h3 className="text-xl font-bold text-slate-800">Survei Kepuasan Masyarakat (SKM)</h3>
              <p className="text-xs text-slate-500">Bantu kami meningkatkan kualitas layanan fasilitas UPTD Cimahi Techno Park.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">Tingkat Kepuasan Pelayanan</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSkmRating(star)}
                      className={`text-3xl transition ${skmRating >= star ? 'scale-110' : 'opacity-30 hover:opacity-75'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-semibold text-blue-600 mt-1">
                  {skmRating === 5 ? 'Sangat Puas (5/5)' : skmRating === 4 ? 'Puas (4/5)' : skmRating === 3 ? 'Cukup (3/5)' : skmRating === 2 ? 'Kurang Puas (2/5)' : 'Sangat Kurang (1/5)'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kritik, Saran & Ulasan</label>
                <textarea
                  className="w-full border rounded-lg p-2.5 text-sm"
                  rows={3}
                  placeholder="Ceritakan pengalaman Anda terkait fasilitas, kebersihan, atau pelayanan petugas..."
                  value={skmComment}
                  onChange={(e) => setSkmComment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSkmBookingId(null)}>Batal</Button>
              <Button onClick={handleSkmSubmit} disabled={submittingSkm} className="bg-blue-600 hover:bg-blue-700">
                {submittingSkm ? 'Mengirim...' : 'Kirim Ulasan'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* ── Form Pengajuan Baru ── */}
      <Card>
        <CardHeader>
          <CardTitle>Pengajuan Peminjaman Ruangan</CardTitle>
          <div className="flex gap-2 text-sm mt-2">
            {[1,2,3,4].map(s => (
              <span key={s} className={`px-3 py-1 rounded-full font-medium ${step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {s === 1 ? '1. Pilih Ruangan' : s === 2 ? '2. Data Kegiatan' : s === 3 ? '3. Upload Surat' : '4. Konfirmasi'}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gedung *</label>
                <select className="w-full border rounded-md p-2 text-sm" value={selectedBuilding} onChange={e => { setSelectedBuilding(e.target.value); setSelectedRoom(''); setRooms([]); }}>
                  <option value="">-- Pilih Gedung --</option>
                  {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal & Waktu Mulai *</label>
                  <Input type="datetime-local" value={dateStart} onChange={e => { setDateStart(e.target.value); setRooms([]); setSelectedRoom(''); }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal & Waktu Selesai *</label>
                  <Input type="datetime-local" value={dateEnd} onChange={e => { setDateEnd(e.target.value); setRooms([]); setSelectedRoom(''); }} />
                </div>
              </div>
              <Button variant="outline" onClick={fetchRooms} disabled={!selectedBuilding || !dateStart || !dateEnd}>
                🔍 Lihat Ketersediaan Ruangan
              </Button>

              {rooms.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Pilih Ruangan:</p>
                  {rooms.map(r => (
                    <div key={r.id} onClick={() => r.isAvailable && setSelectedRoom(r.id)}
                      className={`border rounded-lg p-3 cursor-pointer transition ${!r.isAvailable ? 'opacity-40 cursor-not-allowed bg-gray-50' : selectedRoom === r.id ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{r.name}</span>
                          <span className="text-sm text-gray-500 ml-2">— Kapasitas: {r.capacity} orang</span>
                          {r.tariffs?.[0] && <span className="text-sm text-gray-500 ml-2">| Tarif: Rp {Number(r.tariffs[0].price).toLocaleString('id-ID')}</span>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {r.isAvailable ? '✅ Tersedia' : '❌ Tidak Tersedia'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={goToStep2} disabled={!selectedRoom}>Lanjut →</Button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Kegiatan *</label>
                <Input placeholder="Contoh: Rapat Koordinasi Dinas" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Jumlah Peserta *</label>
                  <Input type="number" placeholder="Contoh: 50" value={formData.participantCount} onChange={e => setFormData({...formData, participantCount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori Pemohon *</label>
                  <select className="w-full border rounded-md p-2 text-sm" value={formData.applicantCategory} onChange={e => setFormData({...formData, applicantCategory: e.target.value})}>
                    <option value="">-- Pilih Kategori --</option>
                    {APPLICANT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi Peserta</label>
                <Input placeholder="Contoh: Kepala Dinas dan staf dari 12 OPD" value={formData.attendeesDescription} onChange={e => setFormData({...formData, attendeesDescription: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tujuan Kegiatan</label>
                <Input placeholder="Contoh: Koordinasi program kerja tahunan" value={formData.activityPurpose} onChange={e => setFormData({...formData, activityPurpose: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi Kegiatan</label>
                <textarea className="w-full border rounded-md p-2 text-sm" rows={3} placeholder="Jelaskan kegiatan yang akan dilakukan..." value={formData.activityDescription} onChange={e => setFormData({...formData, activityDescription: e.target.value})} />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>← Kembali</Button>
                <Button onClick={goToStep3}>Lanjut →</Button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-yellow-800">⚠️ Dokumen Wajib</p>
                <p className="text-yellow-700 mt-1">Surat Permohonan resmi bertandatangan dan berstempel dari instansi/organisasi pemohon.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Surat Permohonan (PDF/JPG) *</label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setSuratFile(e.target.files?.[0] || null)} />
                {suratFile && <p className="text-xs text-green-600 mt-1">✓ {suratFile.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Proposal Kegiatan (opsional)</label>
                <Input type="file" accept=".pdf,.doc,.docx" onChange={e => setProposalFile(e.target.files?.[0] || null)} />
                {proposalFile && <p className="text-xs text-green-600 mt-1">✓ {proposalFile.name}</p>}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>← Kembali</Button>
                <Button onClick={goToStep4}>Lanjut →</Button>
              </div>
            </div>
          )}

          {/* STEP 4: Preview & Confirm */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
                <h3 className="font-semibold text-blue-800">Ringkasan Pengajuan</h3>
                <p><span className="text-gray-500">Ruangan:</span> {selectedRoomData?.name} ({selectedRoomData?.building?.name})</p>
                <p><span className="text-gray-500">Waktu:</span> {dateStart && format(new Date(dateStart), 'dd MMM yyyy HH:mm')} – {dateEnd && format(new Date(dateEnd), 'HH:mm')}</p>
                <p><span className="text-gray-500">Kegiatan:</span> {formData.eventName}</p>
                <p><span className="text-gray-500">Peserta:</span> {formData.participantCount} orang ({formData.attendeesDescription})</p>
                <p><span className="text-gray-500">Kategori:</span> {APPLICANT_CATEGORIES.find(c => c.value === formData.applicantCategory)?.label}</p>
                <p><span className="text-gray-500">Surat Permohonan:</span> ✓ {suratFile?.name}</p>
                {proposalFile && <p><span className="text-gray-500">Proposal:</span> ✓ {proposalFile.name}</p>}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>← Kembali</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                  {submitting ? 'Mengirim...' : '📤 Ajukan Permohonan'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Riwayat Pengajuan ── */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengajuan Saya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myBookings.length === 0 && <p className="text-gray-500 text-sm">Belum ada pengajuan.</p>}
          {myBookings.map((b: any) => {
            const stateInfo = STATE_LABELS[b.state] || { label: b.state, color: 'bg-gray-100 text-gray-600' };
            return (
              <div key={b.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{b.bookingNumber}</p>
                    <p className="text-sm text-gray-600">{b.eventName}</p>
                    <p className="text-xs text-gray-400">{b.room?.name} | {format(new Date(b.dateStart), 'dd MMM yyyy HH:mm')} – {format(new Date(b.dateEnd), 'HH:mm')}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stateInfo.color}`}>{stateInfo.label}</span>
                </div>

                {/* Pesan perbaikan */}
                {b.state === 'REVISION_NEEDED' && b.revisionNote && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-2 text-xs text-orange-800">
                    <p className="font-semibold">⚠️ Catatan Admin:</p>
                    <p>{b.revisionNote}</p>
                  </div>
                )}

                {/* Resubmit jika REVISION_NEEDED */}
                {b.state === 'REVISION_NEEDED' && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold mb-1">Upload Surat Permohonan Terbaru untuk Resubmit:</p>
                    <div className="flex gap-2">
                      <Input type="file" id={`resubmit-${b.id}`} className="text-xs" accept=".pdf,.jpg,.jpeg,.png" />
                      <Button size="sm" onClick={() => {
                        const fi = document.getElementById(`resubmit-${b.id}`) as HTMLInputElement;
                        handleResubmit(b.id, fi?.files?.[0] || null);
                      }}>Ajukan Ulang</Button>
                    </div>
                  </div>
                )}

                {/* Upload bukti bayar jika WAITING_PAYMENT */}
                {b.state === 'WAITING_PAYMENT' && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-2">
                    <p className="text-xs font-semibold text-purple-800 mb-1">💳 Silakan lakukan pembayaran dan unggah bukti transfer:</p>
                    <div className="flex gap-2">
                      <Input type="file" id={`bukti-${b.id}`} className="text-xs" accept=".pdf,.jpg,.jpeg,.png" />
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                        const fi = document.getElementById(`bukti-${b.id}`) as HTMLInputElement;
                        if (fi?.files?.[0]) handleUploadBukti(b.id, fi.files[0]);
                      }}>Upload Bukti</Button>
                    </div>
                  </div>
                )}

                {/* SKM untuk kegiatan COMPLETED */}
                {b.state === 'COMPLETED' && !b.skmDone && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-900">⭐ Kegiatan Telah Selesai</p>
                      <p className="text-xs text-amber-700">Mohon luangkan 30 detik untuk memberikan survei kepuasan layanan.</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => setSkmBookingId(b.id)}
                    >
                      Isi Survei (SKM)
                    </Button>
                  </div>
                )}

                {b.state === 'COMPLETED' && b.skmDone && (
                  <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2 flex items-center gap-1.5 font-medium">
                    <span>✅</span> Terima kasih! Ulasan Survei Kepuasan (SKM) telah Anda kirimkan.
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
