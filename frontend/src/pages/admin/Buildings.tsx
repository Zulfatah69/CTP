import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, DoorOpen, Users, MapPin, Layers } from 'lucide-react';

type Room = { id: string; name: string; capacity: number; floor: number };
type Building = { id: string; name: string; address: string; description: string; rooms: Room[] };

const buildingSchema = z.object({
  name: z.string().min(3, 'Nama gedung minimal 3 karakter'),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  description: z.string().optional(),
});

const roomSchema = z.object({
  name: z.string().min(2, 'Nama ruangan minimal 2 karakter'),
  capacity: z.coerce.number().min(1, 'Kapasitas minimal 1 orang'),
  floor: z.coerce.number().min(1).optional(),
});

export default function Buildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isBuildingOpen, setIsBuildingOpen] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof buildingSchema>>({
    resolver: zodResolver(buildingSchema),
    defaultValues: { name: '', address: '', description: '' },
  });

  const roomForm = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: '', capacity: 10, floor: 1 },
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const { data } = await api.get('/master/buildings');
      setBuildings(data);
    } catch (error) {
      toast({ title: 'Gagal memuat data master', variant: 'destructive' });
    }
  };

  const onSubmitBuilding = async (values: z.infer<typeof buildingSchema>) => {
    try {
      await api.post('/master/buildings', values);
      toast({ title: 'Gedung berhasil ditambahkan' });
      setIsBuildingOpen(false);
      form.reset();
      fetchBuildings();
    } catch (error: any) {
      toast({
        title: 'Gagal menambah gedung',
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    }
  };

  const onSubmitRoom = async (values: z.infer<typeof roomSchema>) => {
    if (!activeBuildingId) return;
    try {
      await api.post('/master/rooms', { ...values, buildingId: activeBuildingId });
      toast({ title: 'Ruangan berhasil ditambahkan' });
      setIsRoomOpen(false);
      roomForm.reset();
      fetchBuildings();
    } catch (error: any) {
      toast({
        title: 'Gagal menambah ruangan',
        description: error.response?.data?.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">
            Master Data: Gedung & Ruangan
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Konfigurasi gedung aset UPTD CTP, kapasitas daya tampung, dan fasilitas ruangan.
          </p>
        </div>

        <Dialog open={isBuildingOpen} onOpenChange={setIsBuildingOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-700 hover:bg-primary-900 text-white font-semibold text-xs h-9 px-4 shrink-0 shadow-xs">
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Gedung Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white rounded-lg border border-neutral-200 p-6">
            <DialogHeader className="pb-3 border-b border-neutral-200">
              <DialogTitle className="text-base font-bold text-neutral-950 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-700" />
                Tambah Gedung Baru
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitBuilding)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-neutral-800">
                        Nama Gedung *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Gedung BITC" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-neutral-800">
                        Alamat Lengkap *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Jl. Baros No. XX, Cimahi" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-neutral-800">
                        Deskripsi / Informasi Gedung
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Kawasan pusat kreatif dan teknologi..." {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />
                <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBuildingOpen(false)}
                    className="text-xs h-9"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary-700 hover:bg-primary-900 text-white font-bold text-xs h-9 px-4"
                  >
                    Simpan Gedung
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buildings.map((building) => (
          <Card key={building.id} className="border-neutral-200 shadow-xs rounded-lg bg-white overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="bg-neutral-50/70 border-b border-neutral-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary-700" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-neutral-950">
                      {building.name}
                    </CardTitle>
                    <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      {building.address}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs text-neutral-600">
                {building.description && (
                  <p className="text-neutral-600 leading-relaxed">{building.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                    <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                      <DoorOpen className="w-3.5 h-3.5 text-primary-700" />
                      Daftar Ruangan ({building.rooms?.length || 0})
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {building.rooms?.map((room) => (
                      <div
                        key={room.id}
                        className="flex justify-between items-center p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs hover:bg-neutral-100/60 transition-colors"
                      >
                        <div>
                          <span className="font-bold text-neutral-900">{room.name}</span>
                          <span className="text-neutral-400 ml-2">Lantai {room.floor || 1}</span>
                        </div>
                        <span className="font-semibold text-neutral-700 bg-white border border-neutral-300 px-2 py-0.5 rounded text-[11px] tabular-nums">
                          {room.capacity} orang
                        </span>
                      </div>
                    ))}
                    {(!building.rooms || building.rooms.length === 0) && (
                      <p className="text-xs text-neutral-400 py-3 text-center">
                        Belum ada ruangan yang terdaftar di gedung ini.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="p-4 bg-neutral-50/50 border-t border-neutral-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-9 font-semibold text-primary-700 border-neutral-300 hover:bg-neutral-100"
                onClick={() => {
                  setActiveBuildingId(building.id);
                  setIsRoomOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Ruangan di {building.name}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Room Modal */}
      <Dialog open={isRoomOpen} onOpenChange={setIsRoomOpen}>
        <DialogContent className="max-w-md bg-white rounded-lg border border-neutral-200 p-6">
          <DialogHeader className="pb-3 border-b border-neutral-200">
            <DialogTitle className="text-base font-bold text-neutral-950 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-primary-700" />
              Tambah Ruangan Baru
            </DialogTitle>
          </DialogHeader>
          <Form {...roomForm}>
            <form onSubmit={roomForm.handleSubmit(onSubmitRoom)} className="space-y-4 pt-2">
              <FormField
                control={roomForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-neutral-800">
                      Nama Ruangan / Aula *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Convention Hall / Ruang Rapat 1" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={roomForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-neutral-800">
                        Kapasitas Maksimal (Orang) *
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={roomForm.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-neutral-800">
                        Lantai (Nomor)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRoomOpen(false)}
                  className="text-xs h-9"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-700 hover:bg-primary-900 text-white font-bold text-xs h-9 px-4"
                >
                  Simpan Ruangan
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
