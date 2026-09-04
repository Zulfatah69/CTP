import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function Announcements() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/announcements/all');
      setAnnouncements(data);
    } catch (e: any) {
      toast({
        title: 'Gagal Memuat Pengumuman',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Judul dan isi pengumuman wajib diisi', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/announcements/${editingId}`, {
          title,
          content,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        });
        toast({ title: 'Pengumuman Berhasil Diperbarui' });
      } else {
        await api.post('/announcements', {
          title,
          content,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        });
        toast({ title: 'Pengumuman Baru Berhasil Diterbitkan' });
      }
      resetForm();
      fetchAnnouncements();
    } catch (e: any) {
      toast({
        title: 'Gagal Menyimpan Pengumuman',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setExpiresAt(item.expiresAt ? item.expiresAt.slice(0, 16) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/announcements/${id}`, { isActive: !currentStatus });
      toast({
        title: !currentStatus ? 'Pengumuman berhasil diaktifkan' : 'Pengumuman dinonaktifkan',
      });
      fetchAnnouncements();
    } catch (e: any) {
      toast({
        title: 'Gagal Mengubah Status',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Nonaktifkan pengumuman ini secara permanen?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast({ title: 'Pengumuman berhasil dinonaktifkan' });
      fetchAnnouncements();
    } catch (e: any) {
      toast({
        title: 'Gagal Menghapus',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setExpiresAt('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">
          Publikasi Pengumuman Resmi
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Kelola informasi pemeliharaan fasilitas, hari libur nasional, atau pengumuman tarif resmi.
        </p>
      </div>

      {/* Form Buat / Edit */}
      <Card className="border-neutral-200 shadow-xs rounded-lg bg-white">
        <CardHeader className="pb-3 border-b border-neutral-200">
          <CardTitle className="text-base font-bold text-neutral-950 flex items-center gap-2">
            {editingId ? (
              <>
                <Pencil className="w-4 h-4 text-primary-700" />
                <span>Perbarui Pengumuman</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-primary-700" />
                <span>Buat Pengumuman Baru</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Judul Pengumuman *
              </label>
              <Input
                placeholder="Contoh: Pemberitahuan Pemeliharaan Kelistrikan Gedung BITC"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Isi Pengumuman *
              </label>
              <textarea
                className="w-full border border-neutral-300 rounded-lg p-3 text-sm focus:border-neutral-950 focus:ring-2 focus:ring-yellow-400"
                rows={4}
                placeholder="Tuliskan isi informasi pengumuman resmi yang akan ditampilkan di beranda publik..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Batas Waktu Tayang (Opsional — kosongkan jika berlaku permanen)
              </label>
              <Input
                type="datetime-local"
                className="max-w-xs"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-neutral-100">
              {editingId && (
                <Button type="button" variant="outline" size="sm" onClick={resetForm} className="text-xs h-9">
                  Batal Edit
                </Button>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary-700 hover:bg-primary-900 text-white font-bold text-xs h-9 px-4"
              >
                {submitting
                  ? 'Menyimpan...'
                  : editingId
                  ? 'Simpan Perubahan'
                  : 'Terbitkan Pengumuman'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Daftar Pengumuman */}
      <Card className="border-neutral-200 shadow-xs rounded-lg bg-white">
        <CardHeader className="pb-3 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-bold text-neutral-950">
              Daftar Pengumuman Terbit
            </CardTitle>
            <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded">
              {announcements.length} Pengumuman
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3">
          {loading && (
            <p className="text-xs text-neutral-400 text-center py-6">Memuat pengumuman...</p>
          )}
          {!loading && announcements.length === 0 && (
            <p className="text-xs text-neutral-500 text-center py-6">Belum ada pengumuman yang dibuat.</p>
          )}
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${
                item.isActive
                  ? 'bg-white border-neutral-200 shadow-2xs'
                  : 'bg-neutral-50 border-neutral-200 opacity-60'
              }`}
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : 'bg-neutral-200 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    {item.isActive ? 'Aktif Tayang' : 'Nonaktif'}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Diterbitkan: {format(new Date(item.publishedAt), 'd MMM yyyy HH:mm', { locale: idLocale })}
                  </span>
                  {item.expiresAt && (
                    <span className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                      Berakhir: {format(new Date(item.expiresAt), 'd MMM yyyy HH:mm', { locale: idLocale })}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-neutral-950 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs text-neutral-600 whitespace-pre-line leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                  className="text-xs h-8 px-2.5"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1 text-primary-700" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={`text-xs h-8 px-2.5 ${
                    item.isActive
                      ? 'text-amber-800 border-amber-300 hover:bg-amber-50'
                      : 'text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                  }`}
                  onClick={() => handleToggleActive(item.id, item.isActive)}
                >
                  {item.isActive ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 mr-1" />
                      Sembunyikan
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Tayangkan
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                  onClick={() => handleDelete(item.id)}
                  title="Hapus Pengumuman"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
