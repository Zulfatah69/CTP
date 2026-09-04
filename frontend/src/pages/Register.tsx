import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Building2, ArrowLeft, UserPlus, ShieldAlert } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    nik: '',
    phone: '',
    password: '',
    confirmPassword: '',
    institutionName: '',
    institutionType: 'PERSONAL',
    address: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.nik.length !== 16) {
      toast({
        title: 'NIK Tidak Sesuai',
        description: 'Nomor Induk Kependudukan (NIK) harus tepat 16 digit angka.',
        variant: 'destructive',
      });
      return;
    }

    if (form.password.length < 8) {
      toast({
        title: 'Kata Sandi Terlalu Pendek',
        description: 'Kata sandi minimal berisi 8 karakter.',
        variant: 'destructive',
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast({
        title: 'Konfirmasi Sandi Salah',
        description: 'Konfirmasi kata sandi tidak cocok dengan kata sandi di atas.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        nik: form.nik,
        phone: form.phone,
        address: form.address,
        institutionName: form.institutionName,
        institutionType: form.institutionType,
      });

      toast({
        title: 'Registrasi Berhasil',
        description: 'Akun pemohon Anda berhasil didaftarkan. Silakan masuk.',
      });

      navigate('/login');
    } catch (err: any) {
      toast({
        title: 'Pendaftaran Gagal',
        description: err.response?.data?.message || 'Terjadi kendala saat mendaftarkan akun.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl space-y-4">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-900 underline underline-offset-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Beranda Utama
        </Link>

        <Card className="border border-neutral-200 shadow-xs rounded-lg bg-white">
          <CardHeader className="text-center pb-4 pt-6">
            <div className="mx-auto w-11 h-11 bg-primary-900 text-white rounded-lg flex items-center justify-center mb-2 shadow-xs">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-neutral-950">
              Pendaftaran Akun Pemohon
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Registrasi identitas resmi untuk pengajuan fasilitas UPTD CTP & BITC
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">
                    Nama Lengkap Pemohon *
                  </label>
                  <Input
                    name="fullName"
                    required
                    placeholder="Sesuai KTP"
                    value={form.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">
                    Alamat Email Aktif *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="nama@instansi.go.id / email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">
                    NIK KTP (16 Digit) *
                  </label>
                  <Input
                    name="nik"
                    maxLength={16}
                    required
                    placeholder="3277xxxxxxxxxxxx"
                    value={form.nik}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">
                    Nama Instansi / Perusahaan
                  </label>
                  <Input
                    name="institutionName"
                    placeholder="Contoh: Dinas Kesehatan / PT Kreatif"
                    value={form.institutionName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">
                    Kategori Pemohon *
                  </label>
                  <select
                    name="institutionType"
                    className="w-full h-11 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-neutral-950 focus:ring-2 focus:ring-yellow-400"
                    value={form.institutionType}
                    onChange={handleChange}
                  >
                    <option value="PERSONAL">Perorangan / Personal</option>
                    <option value="PEMERINTAH">Instansi Pemerintah / OPD</option>
                    <option value="SWASTA">Swasta / Pelaku Bisnis</option>
                    <option value="PENDIDIKAN">Institusi Pendidikan (Kampus/Sekolah)</option>
                    <option value="KOMUNITAS">Komunitas Kreatif / Ormas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1">
                  Alamat Lengkap Pemohon
                </label>
                <Input
                  name="address"
                  placeholder="Jl. Nama Jalan No. XX, Kota Cimahi"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">
                    Kata Sandi (min. 8 Karakter) *
                  </label>
                  <Input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">
                    Ulangi Kata Sandi *
                  </label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <p>
                  Data identitas dan NIK Anda tersimpan secara terenkripsi sesuai standar keamanan data informasi publik.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-700 hover:bg-primary-900 text-white font-bold h-11 mt-2"
                disabled={loading}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                {loading ? 'Mendaftarkan Akun...' : 'Daftar Sebagai Pemohon'}
              </Button>
            </form>

            <div className="text-center mt-6 text-xs text-neutral-600 pt-4 border-t border-neutral-200">
              Sudah memiliki akun resmi?{' '}
              <Link to="/login" className="font-bold text-primary-700 hover:underline">
                Masuk ke akun Anda
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
