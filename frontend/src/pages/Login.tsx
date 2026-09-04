import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { useToast } from '../hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, ArrowLeft, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      setAuth(response.data.user, response.data.accessToken);

      toast({
        title: 'Masuk Berhasil',
        description: `Selamat datang kembali, ${response.data.user.email}!`,
      });

      // Redirect based on role
      const role = response.data.user.role;
      if (role === 'PEMOHON') navigate('/portal');
      else navigate('/admin');
    } catch (error: any) {
      toast({
        title: 'Gagal Masuk',
        description: error.response?.data?.message || 'Kredensial salah atau akun tidak ditemukan.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-100 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
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
            <div className="mx-auto w-11 h-11 bg-primary-900 text-white rounded-lg flex items-center justify-center mb-3 shadow-xs">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-neutral-950">
              Masuk Portal Layanan
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              UPTD Cimahi Techno Park & BITC Kota Cimahi
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-neutral-800">
                        Alamat Email Resmi
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nama@instansi.go.id atau email Anda"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-neutral-800">
                        Kata Sandi
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary-700 hover:bg-primary-900 text-white font-bold h-11"
                  disabled={isLoading}
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  {isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
                </Button>
              </form>
            </Form>

            <div className="pt-4 border-t border-neutral-200 text-center text-xs text-neutral-600 space-y-1">
              <p>
                Belum memiliki akun pemohon?{' '}
                <Link to="/register" className="font-bold text-primary-700 hover:underline">
                  Daftar akun baru
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
