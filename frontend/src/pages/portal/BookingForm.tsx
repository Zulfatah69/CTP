import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { StatusTag } from '@/components/ui/StatusTag';
import { NotificationBanner } from '@/components/ui/NotificationBanner';
import { SummaryList, type SummaryListItem } from '@/components/ui/SummaryList';
import { ConfirmationPanel } from '@/components/ui/ConfirmationPanel';
import { CalComSplitPane } from '@/components/booking/CalComSplitPane';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Building2,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Star,
  Users,
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5;

const APPLICANT_CATEGORIES = [
  { value: 'PEMERINTAH_PUSAT', label: 'Pemerintah Pusat' },
  { value: 'PEMERINTAH_DAERAH', label: 'Pemerintah Daerah / OPD' },
  { value: 'PEMERINTAH_CIMAHI', label: 'Pemerintah Kota Cimahi' },
  { value: 'SWASTA', label: 'Swasta / Pelaku Bisnis' },
  { value: 'PENDIDIKAN', label: 'Lembaga Pendidikan (Kampus / Sekolah)' },
  { value: 'KOMUNITAS', label: 'Komunitas / Ormas / Asosiasi' },
  { value: 'PERSONAL', label: 'Perorangan / Personal' },
];

export default function BookingForm() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  // Form selections
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Step 2 formData
  const [formData, setFormData] = useState({
    eventName: '',
    participantCount: '',
    attendeesDescription: '',
    activityPurpose: '',
    activityDescription: '',
    applicantCategory: '',
  });

  // Step 3 files
  const [suratFile, setSuratFile] = useState<File | null>(null);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Success state reference
  const [confirmedBookingNumber, setConfirmedBookingNumber] = useState<string | null>(null);

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
    try {
      const { data } = await api.get('/master/buildings');
      setBuildings(data);
    } catch (e) {
      console.error('Failed to fetch buildings');
    }
  };

  const fetchMyBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setMyBookings(data);
    } catch (e) {
      console.error('Failed to fetch bookings');
    }
  };

  // Fetch rooms for the selected building
  useEffect(() => {
    if (!selectedBuilding) {
      setRooms([]);
      setSelectedRoom('');
      return;
    }
    const b = buildings.find((b) => b.id === selectedBuilding);
    if (b && b.rooms) {
      setRooms(b.rooms);
    }
  }, [selectedBuilding, buildings]);

  // Handle slot confirmation from Cal.com component
  const handleSlotConfirmed = () => {
    if (!selectedDate || !selectedSlot) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startIso = `${dateStr}T${selectedSlot.start}:00`;
    const endIso = `${dateStr}T${selectedSlot.end}:00`;
    setDateStart(startIso);
    setDateEnd(endIso);
  };

  // Step 1 → Step 2 validation
  const handleProceedToStep2 = () => {
    if (!selectedBuilding || !selectedRoom) {
      toast({
        title: 'Pilih Ruangan',
        description: 'Silakan pilih gedung dan ruangan terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedDate || !selectedSlot) {
      toast({
        title: 'Pilih Tanggal & Waktu',
        description: 'Silakan pilih tanggal dan slot jam pada kalender.',
        variant: 'destructive',
      });
      return;
    }
    handleSlotConfirmed();
    setStep(2);
  };

  // Step 2 → Step 3 validation
  const handleProceedToStep3 = () => {
    if (!formData.eventName.trim()) {
      toast({ title: 'Nama Kegiatan Wajib Diisi', variant: 'destructive' });
      return;
    }
    if (!formData.participantCount || Number(formData.participantCount) <= 0) {
      toast({ title: 'Jumlah Peserta Wajib Diisi', variant: 'destructive' });
      return;
    }
    if (!formData.applicantCategory) {
      toast({ title: 'Kategori Pemohon Wajib Dipilih', variant: 'destructive' });
      return;
    }

    const room = rooms.find((r) => r.id === selectedRoom);
    if (room && room.capacity && Number(formData.participantCount) > room.capacity) {
      toast({
        title: 'Kapasitas Melebihi Batas',
        description: `Jumlah peserta (${formData.participantCount}) melebihi daya tampung ruangan (${room.capacity} orang).`,
        variant: 'destructive',
      });
      return;
    }
    setStep(3);
  };

  // Step 3 → Step 4 validation
  const handleProceedToStep4 = () => {
    if (!suratFile) {
      toast({
        title: 'Surat Permohonan Wajib Diunggah',
        description: 'Unggah surat permohonan resmi berstempel basah atau TTE.',
        variant: 'destructive',
      });
      return;
    }
    setStep(4);
  };

  // Step 4: Final Submit
  const handleSubmit = async () => {
    if (!declarationChecked) {
      toast({
        title: 'Pernyataan Belum Dicentang',
        description: 'Harap centang pernyataan kebenaran data sebelum mengirim.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Buat booking DRAFT
      const { data: booking } = await api.post('/bookings', {
        roomId: selectedRoom,
        dateStart,
        dateEnd,
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
      await api.post(`/documents/booking/${booking.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 3. Upload proposal jika ada
      if (proposalFile) {
        const fd2 = new FormData();
        fd2.append('file', proposalFile);
        fd2.append('type', 'PROPOSAL');
        await api.post(`/documents/booking/${booking.id}`, fd2, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // 4. Submit booking
      await api.post(`/bookings/${booking.id}/submit`);

      setConfirmedBookingNumber(booking.bookingNumber);
      setStep(5);

      // Reset form fields
      setSelectedBuilding('');
      setSelectedRoom('');
      setSelectedSlot(null);
      setFormData({
        eventName: '',
        participantCount: '',
        attendeesDescription: '',
        activityPurpose: '',
        activityDescription: '',
        applicantCategory: '',
      });
      setSuratFile(null);
      setProposalFile(null);
      setDeclarationChecked(false);
      fetchMyBookings();
    } catch (e: any) {
      toast({
        title: 'Pengajuan Gagal',
        description: e.response?.data?.message || 'Terjadi kesalahan saat memproses permohonan.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Upload bukti bayar
  const handleUploadBukti = async (bookingId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post(`/payments/${bookingId}/upload-proof`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({
        title: 'Bukti Berhasil Diunggah',
        description: 'Menunggu proses verifikasi manual oleh petugas Admin UPTD.',
      });
      fetchMyBookings();
    } catch (e: any) {
      toast({
        title: 'Gagal Mengunggah',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    }
  };

  // Submit SKM
  const handleSkmSubmit = async () => {
    if (!skmBookingId) return;
    setSubmittingSkm(true);
    try {
      await api.post(`/skm/${skmBookingId}`, {
        rating: Number(skmRating),
        comment: skmComment,
      });
      toast({
        title: 'Ulasan Diterima',
        description: 'Terima kasih atas partisipasi Anda dalam survei kepuasan layanan UPTD.',
      });
      setSkmBookingId(null);
      setSkmComment('');
      fetchMyBookings();
    } catch (e: any) {
      toast({
        title: 'Gagal Mengirim Survei',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmittingSkm(false);
    }
  };

  const selectedBuildingData = buildings.find((b) => b.id === selectedBuilding);
  const selectedRoomData = rooms.find((r) => r.id === selectedRoom);

  // Summary list items for Step 4
  const summaryItems: SummaryListItem[] = [
    {
      key: 'Gedung',
      value: selectedBuildingData?.name,
      onAction: () => setStep(1),
    },
    {
      key: 'Ruangan',
      value: selectedRoomData?.name,
      onAction: () => setStep(1),
    },
    {
      key: 'Tanggal Kegiatan',
      value: selectedDate ? format(selectedDate, 'EEEE, d MMMM yyyy', { locale: id }) : '',
      onAction: () => setStep(1),
    },
    {
      key: 'Waktu / Jam',
      value: selectedSlot ? `${selectedSlot.start} - ${selectedSlot.end} WIB` : '',
      onAction: () => setStep(1),
    },
    {
      key: 'Nama Kegiatan',
      value: formData.eventName,
      onAction: () => setStep(2),
    },
    {
      key: 'Jumlah Peserta',
      value: `${formData.participantCount} orang ${
        formData.attendeesDescription ? `(${formData.attendeesDescription})` : ''
      }`,
      onAction: () => setStep(2),
    },
    {
      key: 'Kategori Pemohon',
      value: APPLICANT_CATEGORIES.find((c) => c.value === formData.applicantCategory)?.label,
      onAction: () => setStep(2),
    },
    {
      key: 'Surat Permohonan',
      value: (
        <span className="inline-flex items-center gap-1.5 text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {suratFile?.name}
        </span>
      ),
      onAction: () => setStep(3),
    },
    {
      key: 'Proposal Kegiatan',
      value: proposalFile ? proposalFile.name : 'Tidak dilampirkan (opsional)',
      onAction: () => setStep(3),
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── SKM Modal Dialog ── */}
      {skmBookingId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg space-y-4 border border-neutral-200">
            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-neutral-950">
                Survei Kepuasan Masyarakat (SKM)
              </h3>
              <p className="text-xs text-neutral-500">
                Kuesioner evaluasi pelayanan UPTD Cimahi Techno Park.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5 text-center">
                  Tingkat Kepuasan Pelayanan
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSkmRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded"
                      aria-label={`Beri rating ${star} dari 5`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          skmRating >= star
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-neutral-300 hover:text-neutral-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-bold text-primary-700 mt-1">
                  {skmRating === 5
                    ? 'Sangat Puas (5/5)'
                    : skmRating === 4
                    ? 'Puas (4/5)'
                    : skmRating === 3
                    ? 'Cukup (3/5)'
                    : skmRating === 2
                    ? 'Kurang Puas (2/5)'
                    : 'Tidak Puas (1/5)'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Kritik, Saran & Masukan
                </label>
                <textarea
                  className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm focus:border-neutral-950 focus:ring-2 focus:ring-yellow-400"
                  rows={3}
                  placeholder="Berikan masukan mengenai kebersihan, fasilitas, atau pelayanan petugas..."
                  value={skmComment}
                  onChange={(e) => setSkmComment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button variant="outline" size="sm" onClick={() => setSkmBookingId(null)}>
                Tutup
              </Button>
              <Button
                size="sm"
                onClick={handleSkmSubmit}
                disabled={submittingSkm}
                className="bg-primary-700 hover:bg-primary-900 text-white"
              >
                {submittingSkm ? 'Mengirim...' : 'Kirim Ulasan Resmi'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Wizard Card ── */}
      {step === 5 && confirmedBookingNumber ? (
        <ConfirmationPanel
          referenceNumber={confirmedBookingNumber}
          onAction={() => {
            setStep(1);
            setConfirmedBookingNumber(null);
          }}
          actionText="Buat Pengajuan Lainnya"
          onSecondaryAction={() => {
            window.location.href = '/';
          }}
          secondaryActionText="Kembali ke Beranda"
        />
      ) : (
        <div className="space-y-4">
          {/* Breadcrumb / Step Indicator */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Formulir Peminjaman Fasilitas
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 mt-0.5">
                {step === 1 && 'Langkah 1 dari 4: Pilih Ruangan & Jadwal'}
                {step === 2 && 'Langkah 2 dari 4: Rincian Kegiatan'}
                {step === 3 && 'Langkah 3 dari 4: Unggah Dokumen Permohonan'}
                {step === 4 && 'Langkah 4 dari 4: Periksa & Konfirmasi Pengajuan'}
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                    step === s
                      ? 'bg-primary-900 text-white'
                      : step > s
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {step > s ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: Gedung, Ruangan & Cal.com Date/Time Picker */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    1. Pilih Gedung *
                  </label>
                  <select
                    className="w-full h-11 px-3.5 rounded-lg border border-neutral-300 bg-white text-sm font-medium focus:border-neutral-950 focus:ring-2 focus:ring-yellow-400"
                    value={selectedBuilding}
                    onChange={(e) => {
                      setSelectedBuilding(e.target.value);
                      setSelectedRoom('');
                    }}
                  >
                    <option value="">-- Pilih Gedung Fasilitas --</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    2. Pilih Ruangan *
                  </label>
                  <select
                    className="w-full h-11 px-3.5 rounded-lg border border-neutral-300 bg-white text-sm font-medium focus:border-neutral-950 focus:ring-2 focus:ring-yellow-400"
                    value={selectedRoom}
                    disabled={!selectedBuilding}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                  >
                    <option value="">-- Pilih Ruangan / Aula --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Kapasitas: {r.capacity} org)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Once room is selected, display Cal.com Split Pane */}
              {selectedRoomData ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-800 block">
                    3. Pilih Tanggal & Jam Kegiatan (Cal.com Split-Pane)
                  </span>
                  <CalComSplitPane
                    room={selectedRoomData}
                    selectedDate={selectedDate}
                    onDateChange={(d) => setSelectedDate(d)}
                    selectedSlot={selectedSlot}
                    onSlotSelect={(slot) => {
                      setSelectedSlot(slot);
                    }}
                    onConfirm={() => {
                      handleSlotConfirmed();
                    }}
                  />
                </div>
              ) : (
                <div className="p-8 border border-dashed border-neutral-300 rounded-xl bg-white text-center text-xs text-neutral-500 space-y-2">
                  <Building2 className="w-8 h-8 text-neutral-300 mx-auto" />
                  <p className="font-semibold text-neutral-800">
                    Pilih gedung dan ruangan di atas untuk melihat kalender ketersediaan
                  </p>
                  <p className="text-neutral-500">
                    Jadwal akan diperiksa secara langsung terhadap kalender operasional resmi UPTD CTP.
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-neutral-200">
                <Button
                  onClick={handleProceedToStep2}
                  disabled={!selectedRoom || !selectedDate || !selectedSlot}
                  className="bg-primary-700 hover:bg-primary-900 text-white font-bold h-11 px-6"
                >
                  <span>Lanjutkan ke Rincian</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Detail Kegiatan */}
          {step === 2 && (
            <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4 shadow-xs">
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Nama Kegiatan / Acara *
                </label>
                <Input
                  placeholder="Contoh: Rapat Kerja Dinas Koperasi & UKM Tahun 2026"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    Estimasi Jumlah Peserta (Orang) *
                  </label>
                  <Input
                    type="number"
                    placeholder="Contoh: 50"
                    value={formData.participantCount}
                    onChange={(e) =>
                      setFormData({ ...formData, participantCount: e.target.value })
                    }
                  />
                  {selectedRoomData?.capacity && (
                    <span className="text-[11px] text-neutral-500 mt-1 block">
                      Daya tampung ruangan: maksimal {selectedRoomData.capacity} orang
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    Kategori Pemohon *
                  </label>
                  <select
                    className="w-full h-11 px-3.5 rounded-lg border border-neutral-300 bg-white text-sm focus:border-neutral-950 focus:ring-2 focus:ring-yellow-400"
                    value={formData.applicantCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, applicantCategory: e.target.value })
                    }
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {APPLICANT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Deskripsi Profil Peserta
                </label>
                <Input
                  placeholder="Contoh: Kepala OPD, staf teknis, dan perwakilan UMKM"
                  value={formData.attendeesDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, attendeesDescription: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Tujuan Kegiatan
                </label>
                <Input
                  placeholder="Contoh: Sosialisasi regulasi pemanfaatan aset daerah"
                  value={formData.activityPurpose}
                  onChange={(e) =>
                    setFormData({ ...formData, activityPurpose: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Deskripsi & Susunan Singkat Acara
                </label>
                <textarea
                  className="w-full border border-neutral-300 rounded-lg p-3 text-sm focus:border-neutral-950 focus:ring-2 focus:ring-yellow-400"
                  rows={3}
                  placeholder="Jelaskan secara ringkas rangkaian acara dan kebutuhan fasilitas pendukung..."
                  value={formData.activityDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, activityDescription: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-11 px-5"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Kembali
                </Button>
                <Button
                  onClick={handleProceedToStep3}
                  className="bg-primary-700 hover:bg-primary-900 text-white font-bold h-11 px-6"
                >
                  <span>Lanjutkan ke Dokumen</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Upload Dokumen */}
          {step === 3 && (
            <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-5 shadow-xs">
              <NotificationBanner
                type="warning"
                title="Persyaratan Dokumen Resmi Pemerintah"
              >
                Surat Permohonan wajib berkop resmi, bertanggal, ditandatangani pimpinan/pejabat
                berwenang, dan dibubuhi stempel instansi atau Tanda Tangan Elektronik (TTE).
              </NotificationBanner>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    Surat Permohonan Resmi (PDF / JPG) *
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setSuratFile(e.target.files?.[0] || null)}
                  />
                  {suratFile ? (
                    <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Berkas terpilih: {suratFile.name} ({(suratFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-500 mt-1">Maksimal ukuran file 10MB.</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    Proposal Kegiatan (Opsional)
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
                  />
                  {proposalFile && (
                    <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Proposal terpilih: {proposalFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-11 px-5"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Kembali
                </Button>
                <Button
                  onClick={handleProceedToStep4}
                  disabled={!suratFile}
                  className="bg-primary-700 hover:bg-primary-900 text-white font-bold h-11 px-6"
                >
                  <span>Periksa Data</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Periksa & Kirim (Summary List) */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-bold text-neutral-950">
                    Periksa Kembali Data Pengajuan Anda
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Pastikan seluruh informasi telah sesuai sebelum diteruskan ke petugas review UPTD.
                  </p>
                </div>

                {/* GOV.UK Summary List component */}
                <SummaryList items={summaryItems} />

                {/* Declaration Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={declarationChecked}
                      onChange={(e) => setDeclarationChecked(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-700 focus:ring-yellow-400 mt-0.5"
                    />
                    <span className="text-xs text-neutral-800 leading-relaxed font-medium">
                      Saya menyatakan bahwa data yang tercantum dalam permohonan ini adalah benar, dan
                      bersedia mematuhi tata tertib pemanfaatan aset serta ketentuan retribusi daerah Kota
                      Cimahi.
                    </span>
                  </label>
                </div>

                <div className="flex justify-between pt-4 border-t border-neutral-200">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    disabled={submitting}
                    className="h-11 px-5"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Kembali
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!declarationChecked || submitting}
                    className="bg-primary-700 hover:bg-primary-900 text-white font-bold h-11 px-6"
                  >
                    {submitting ? 'Mengirim Berkas...' : 'Kirim Pengajuan Resmi'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Riwayat Pengajuan Saya (Table / List) ── */}
      <Card className="border border-neutral-200 shadow-xs rounded-lg bg-white">
        <CardHeader className="pb-3 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-bold text-neutral-950">
                Riwayat Pengajuan Saya
              </CardTitle>
              <p className="text-xs text-neutral-500">
                Daftar permohonan peminjaman ruangan yang pernah Anda ajukan.
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded">
              {myBookings.length} Pengajuan
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {myBookings.length === 0 && (
            <div className="text-center py-8 text-xs text-neutral-500">
              Belum ada riwayat pengajuan peminjaman ruangan.
            </div>
          )}

          {myBookings.map((b: any) => (
            <div
              key={b.id}
              className="border border-neutral-200 rounded-lg p-4 sm:p-5 space-y-3 hover:border-neutral-300 transition-colors bg-white shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-neutral-950">
                      {b.bookingNumber}
                    </span>
                    <StatusTag status={b.state} />
                  </div>
                  <h4 className="font-bold text-base text-neutral-900 mt-1">{b.eventName}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      {b.room?.name} ({b.room?.building?.name})
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
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

              {/* Revision note notification banner */}
              {b.state === 'REVISION_NEEDED' && b.revisionNote && (
                <NotificationBanner type="warning" title="Perlu Perbaikan Berkas">
                  <p className="font-semibold text-neutral-900">Catatan Petugas Admin:</p>
                  <p className="mt-0.5">{b.revisionNote}</p>
                </NotificationBanner>
              )}

              {/* Waiting payment upload prompt */}
              {b.state === 'WAITING_PAYMENT' && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <CreditCard className="w-4 h-4 text-amber-700" />
                    <span>Silakan Lakukan Pembayaran Retribusi Resmi</span>
                  </div>
                  <p className="text-xs text-amber-900">
                    Unggah bukti pembayaran (struk transfer / QRIS resmi) sebelum batas waktu H-1.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      type="file"
                      id={`bukti-${b.id}`}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="text-xs h-9 bg-white"
                    />
                    <Button
                      size="sm"
                      className="bg-primary-700 hover:bg-primary-900 text-white text-xs h-9 font-semibold shrink-0"
                      onClick={() => {
                        const fi = document.getElementById(`bukti-${b.id}`) as HTMLInputElement;
                        if (fi?.files?.[0]) handleUploadBukti(b.id, fi.files[0]);
                      }}
                    >
                      Unggah Bukti
                    </Button>
                  </div>
                </div>
              )}

              {/* SKM Invitation Banner */}
              {b.state === 'COMPLETED' && !b.skmDone && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-amber-950 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-600" />
                      Kegiatan Telah Selesai Dilaksanakan
                    </p>
                    <p className="text-xs text-amber-800">
                      Bantu kami mengevaluasi kualitas sarana dan petugas melalui Survei Kepuasan.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-8 shrink-0"
                    onClick={() => setSkmBookingId(b.id)}
                  >
                    Isi Survei SKM
                  </Button>
                </div>
              )}

              {b.state === 'COMPLETED' && b.skmDone && (
                <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2.5 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Survei Kepuasan Masyarakat (SKM) untuk kegiatan ini telah Anda kirimkan. Terima kasih!</span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
