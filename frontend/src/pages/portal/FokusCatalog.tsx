import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Camera,
  Search,
  Building2,
  Tag,
  User,
  ArrowLeft,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface FokusItem {
  id: string;
  productName: string;
  category: string;
  ownerName?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
}

export default function FokusCatalog() {
  const [items, setItems] = useState<FokusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    api
      .get('/fokus')
      .then(({ data }) => setItems(data))
      .catch((err) => console.error('Gagal memuat katalog FOKUS:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ownerName && item.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-100 font-sans flex flex-col">
      {/* Header Pemerintah */}
      <header className="bg-primary-900 text-white shadow-xs sticky top-0 z-40 border-b border-primary-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-accent-600 text-white rounded-lg flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base leading-none block text-white">
                UPTD Cimahi Techno Park
              </span>
              <span className="text-[11px] text-neutral-300 block font-normal mt-0.5">
                Katalog Foto Produk FOKUS
              </span>
            </div>
          </Link>
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-primary-500 text-white hover:bg-primary-800 hover:text-white text-xs h-8 px-3"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-primary-950 text-white py-12 px-4 sm:px-6 border-b border-primary-800">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-800/80 border border-primary-700 text-accent-400 text-xs px-3 py-1 rounded-full font-medium mb-3">
            <Camera className="w-3.5 h-3.5" />
            Layanan Foto Produk UMKM Kota Cimahi
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Katalog Produk Kreatif FOKUS
          </h1>
          <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
            Galeri etalase produk UMKM dan industri kreatif lokal binaan UPTD Cimahi Techno Park
            yang telah melalui proses pemotretan profesional di Studio CTP.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 mb-6 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Cari produk atau pelaku usaha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-neutral-50 border-neutral-200"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-900 text-white font-semibold'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16 text-xs text-neutral-500">
            Memuat katalog produk FOKUS...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-neutral-200 p-8">
            <Camera className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Tidak Ada Produk Ditemukan</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Belum ada foto produk yang cocok dengan kata kunci pencarian atau kategori yang dipilih.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-neutral-200 hover:shadow-md transition-shadow flex flex-col bg-white"
              >
                {/* Product Image / Placeholder */}
                <div className="h-48 bg-neutral-100 relative overflow-hidden flex items-center justify-center border-b border-neutral-200">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback on image load error
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-neutral-400">
                      <Camera className="w-10 h-10 mb-1 stroke-1" />
                      <span className="text-[11px] font-medium">Studio CTP</span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-primary-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    {item.category}
                  </span>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-950 line-clamp-1 mb-1">
                      {item.productName}
                    </h3>
                    {item.ownerName && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 mb-2">
                        <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{item.ownerName}</span>
                      </div>
                    )}
                    {item.description && (
                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Fasilitas UPTD CTP</span>
                    <span className="font-medium text-accent-600">Terverifikasi</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 text-xs text-neutral-500 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 UPTD Cimahi Techno Park & BITC &bull; Dinas Perdagangan, Koperasi, UKM dan Perindustrian Kota Cimahi</p>
        </div>
      </footer>
    </div>
  );
}
