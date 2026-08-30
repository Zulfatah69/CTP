import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

type Room = { id: string; name: string; capacity: number; floor: number };
type Building = { id: string; name: string; address: string; description: string; rooms: Room[] };

const buildingSchema = z.object({
  name: z.string().min(3, 'Nama gedung minimal 3 karakter'),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  description: z.string().optional()
});

const roomSchema = z.object({
  name: z.string().min(2, 'Nama ruangan minimal 2 karakter'),
  capacity: z.coerce.number().min(1, 'Kapasitas minimal 1'),
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
      toast({ title: 'Gagal memuat data', variant: 'destructive' });
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
      toast({ title: 'Gagal menambah gedung', description: error.response?.data?.message, variant: 'destructive' });
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
      toast({ title: 'Gagal menambah ruangan', description: error.response?.data?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Data: Gedung & Ruangan</h1>
          <p className="text-gray-500">Kelola fasilitas yang tersedia untuk di-booking</p>
        </div>
        <Dialog open={isBuildingOpen} onOpenChange={setIsBuildingOpen}>
          <DialogTrigger asChild>
            <Button>+ Tambah Gedung</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Gedung Baru</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitBuilding)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nama Gedung</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Alamat</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Simpan Gedung</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buildings.map((building) => (
          <Card key={building.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-zinc-900 border-b">
              <CardTitle>{building.name}</CardTitle>
              <p className="text-sm text-gray-500">{building.address}</p>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm">{building.description}</p>
              
              <div>
                <h4 className="font-semibold mb-2">Daftar Ruangan:</h4>
                <ul className="space-y-2">
                  {building.rooms.map((room) => (
                    <li key={room.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-900 rounded-md text-sm border">
                      <span className="font-medium">{room.name} (Lt. {room.floor || '-'})</span>
                      <span className="text-gray-500">Kapasitas: {room.capacity} org</span>
                    </li>
                  ))}
                  {building.rooms.length === 0 && <p className="text-sm text-gray-500">Belum ada ruangan.</p>}
                </ul>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => { setActiveBuildingId(building.id); setIsRoomOpen(true); }}
              >
                + Tambah Ruangan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isRoomOpen} onOpenChange={setIsRoomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Ruangan Baru</DialogTitle>
          </DialogHeader>
          <Form {...roomForm}>
            <form onSubmit={roomForm.handleSubmit(onSubmitRoom)} className="space-y-4">
              <FormField control={roomForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nama Ruangan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={roomForm.control} name="capacity" render={({ field }) => (
                  <FormItem><FormLabel>Kapasitas (Orang)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={roomForm.control} name="floor" render={({ field }) => (
                  <FormItem><FormLabel>Lantai (Opsional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">Simpan Ruangan</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
