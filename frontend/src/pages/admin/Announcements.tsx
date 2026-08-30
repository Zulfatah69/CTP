import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
      toast({ title: 'Gagal memuat pengumuman', description: e.response?.data?.message, variant: 'destructive' });
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
        toast({ title: '✅ Pengumuman berhasil diperbarui' });
      } else {
        await api.post('/announcements', {
          title,
          content,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        });
        toast({ title: '✅ Pengumuman baru berhasil diterbitkan' });
      }
      resetForm();
      fetchAnnouncements();
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan pengumuman', description: e.response?.data?.message, variant: 'destructive' });
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
      toast({ title: !currentStatus ? 'Pengumuman diaktifkan' : 'Pengumuman dinonaktifkan' });
      fetchAnnouncements();
    } catch (e: any) {
      toast({ title: 'Gagal mengubah status', description: e.response?.data?.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Nonaktifkan pengumuman ini?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast({ title: 'Pengumuman dinonaktifkan' });
      fetchAnnouncements();
    } catch (e: any) {
      toast({ title: 'Gagal menghapus', description: e.response?.data?.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setExpiresAt('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Kelola Pengumuman Publik</h1>
        <p className="text-sm text-slate-500">
          Publikasikan informasi jadwal operasional, pemeliharaan gedung, atau kebijakan baru ke beranda publik.
        </p>
      </div>

      {/* Form Buat / Edit */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">
            {editingId ? '✏️ Edit Pengumuman' : '➕ Buat Pengumuman Baru'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Pengumuman *</label>
              <Input
                placeholder="Contoh: Jadwal Penutupan Sementara Gedung BITC untuk Pemeliharaan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Pengumuman *</label>
              <textarea
                className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Tulis detail pengumuman yang ingin disampaikan kepada masyarakat dan pemohon..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batas Waktu Tayang (Opsional - Kosongkan jika berlaku permanen)
              </label>
              <Input
                type="datetime-local"
                className="max-w-xs"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal Edit
                </Button>
              )}
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Daftar Pengumuman */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Daftar Semua Pengumuman</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-slate-400">Memuat pengumuman...</p>}
          {!loading && announcements.length === 0 && (
            <p className="text-sm text-slate-500">Belum ada pengumuman yang dibuat.</p>
          )}
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${
                item.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {item.isActive ? 'Aktif Tayang' : 'Nonaktif'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Diterbitkan: {format(new Date(item.publishedAt), 'dd MMM yyyy HH:mm')}
                  </span>
                  {item.expiresAt && (
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      Berakhir: {format(new Date(item.expiresAt), 'dd MMM yyyy HH:mm')}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-sm text-slate-600 whitespace-pre-line">{item.content}</p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                  ✏️ Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={item.isActive ? 'text-amber-600 border-amber-300' : 'text-green-600 border-green-300'}
                  onClick={() => handleToggleActive(item.id, item.isActive)}
                >
                  {item.isActive ? 'Sembunyikan' : 'Tayangkan'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => handleDelete(item.id)}
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
