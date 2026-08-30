import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.nik.length !== 16) {
      toast({ title: 'NIK Tidak Valid', description: 'NIK harus tepat 16 digit angka.', variant: 'destructive' });
      return;
    }

    if (form.password.length < 8) {
      toast({ title: 'Password Terlalu Pendek', description: 'Password minimal 8 karakter.', variant: 'destructive' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast({ title: 'Password Tidak Cocok', description: 'Konfirmasi password tidak sesuai.', variant: 'destructive' });
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
        institutionType: form.institutionType
      });

      toast({
        title: 'Registrasi Berhasil! 🎉',
        description: 'Akun pemohon Anda berhasil dibuat. Silakan login.'
      });

      navigate('/login');
    } catch (err: any) {
      toast({
        title: 'Registrasi Gagal',
        description: err.response?.data?.message || 'Terjadi kesalahan saat pendaftaran.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10">
      <Card className="w-full max-w-xl shadow-lg border-slate-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-2">
            🏛️
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Daftar Akun Pemohon</CardTitle>
          <CardDescription>
            Registrasi portal layanan digital Cimahi Techno Park (CTP) & BITC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Nama Lengkap *</label>
                <Input
                  name="fullName"
                  required
                  placeholder="Sesuai KTP"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Email Aktif *</label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">NIK (16 Digit) *</label>
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
                <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp / HP *</label>
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
                <label className="text-xs font-semibold text-slate-700">Asal Instansi / Komunitas</label>
                <Input
                  name="institutionName"
                  placeholder="Contoh: PT Kreatif Mandiri"
                  value={form.institutionName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Jenis Pemohon</label>
                <select
                  name="institutionType"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={form.institutionType}
                  onChange={handleChange}
                >
                  <option value="PERSONAL">Perorangan / Personal</option>
                  <option value="PEMERINTAH">Instansi Pemerintah</option>
                  <option value="SWASTA">Perusahaan / Swasta</option>
                  <option value="PENDIDIKAN">Institusi Pendidikan (Kampus/Sekolah)</option>
                  <option value="KOMUNITAS">Komunitas / Asosiasi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Alamat Lengkap</label>
              <Input
                name="address"
                placeholder="Jl. Nama Jalan No. XX, Kota"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700">Password (min. 8 Karakter) *</label>
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
                <label className="text-xs font-semibold text-slate-700">Ulangi Password *</label>
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

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={loading}>
              {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-slate-600">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
