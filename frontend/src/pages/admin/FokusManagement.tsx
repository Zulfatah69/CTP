import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Camera,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface FokusItem {
  id: string;
  productName: string;
  category: string;
  ownerName?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function FokusManagement() {
  const { toast } = useToast();
  const [items, setItems] = useState<FokusItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/fokus/all');
      setItems(data);
    } catch (e: any) {
      toast({
        title: 'Gagal Memuat Katalog FOKUS',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setProductName('');
    setCategory('');
    setOwnerName('');
    setDescription('');
    setImageUrl('');
    setEditingId(null);
  };

  const handleEdit = (item: FokusItem) => {
    setEditingId(item.id);
    setProductName(item.productName);
    setCategory(item.category);
    setOwnerName(item.ownerName || '');
    setDescription(item.description || '');
    setImageUrl(item.imageUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !category.trim()) {
      toast({ title: 'Nama produk dan kategori wajib diisi', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productName: productName.trim(),
        category: category.trim(),
        ownerName: ownerName.trim() || undefined,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      };

      if (editingId) {
        await api.patch(`/fokus/${editingId}`, payload);
        toast({ title: 'Katalog FOKUS berhasil diperbarui' });
      } else {
        await api.post('/fokus', payload);
        toast({ title: 'Produk baru berhasil ditambahkan ke katalog' });
      }

      resetForm();
      fetchItems();
    } catch (e: any) {
      toast({
        title: 'Gagal Menyimpan Data',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: FokusItem) => {
    try {
      if (item.isActive) {
        await api.delete(`/fokus/${item.id}`);
        toast({ title: 'Produk dinonaktifkan dari katalog publik' });
      } else {
        await api.patch(`/fokus/${item.id}`, { isActive: true });
        toast({ title: 'Produk diaktifkan kembali' });
      }
      fetchItems();
    } catch (e: any) {
      toast({
        title: 'Gagal Mengubah Status',
        description: e.response?.data?.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-950">Kelola Katalog Produk FOKUS</h1>
        <p className="text-xs text-neutral-600 mt-0.5">
          Manajemen etalase dan portofolio foto produk UMKM binaan UPTD Cimahi Techno Park
        </p>
      </div>

      {/* Form Tambah / Edit */}
      <Card className="border-neutral-200 shadow-2xs">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary-700" />
            {editingId ? 'Edit Data Foto Produk' : 'Tambah Foto Produk Baru'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Nama Produk *</label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Keripik Singkong Cimahi Rasa Balado"
                  className="text-xs h-9 bg-neutral-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Kategori Produk *</label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Contoh: Kuliner, Fashion, Kriya, IT"
                  className="text-xs h-9 bg-neutral-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Pelaku Usaha / Pemilik</label>
                <Input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nama pemilik atau merk UMKM"
                  className="text-xs h-9 bg-neutral-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  URL Foto Produk (Sementara)
                </label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/foto-produk.jpg"
                  className="text-xs h-9 bg-neutral-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Deskripsi Singkat</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rincian mengenai produk, kemasan, atau catatan pemotretan studio..."
                rows={2}
                className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary-900 hover:bg-primary-800 text-white text-xs h-8 px-4"
              >
                {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah ke Katalog'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="text-xs h-8 px-3 border-neutral-300"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Batal Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Daftar Item Tabel */}
      <Card className="border-neutral-200 shadow-2xs">
        <CardHeader className="pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-neutral-900">
            Daftar Produk FOKUS ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase tracking-wider border-b border-neutral-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Pemilik UMKM</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                      Memuat daftar produk...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                      Belum ada data produk FOKUS
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-neutral-900">{item.productName}</div>
                        {item.description && (
                          <div className="text-[11px] text-neutral-500 line-clamp-1 max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {item.ownerName || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                            <XCircle className="w-3 h-3" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="h-7 px-2 text-xs border-neutral-300"
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(item)}
                            className={`h-7 px-2 text-xs ${
                              item.isActive
                                ? 'text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50'
                                : 'text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                        </div>
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
