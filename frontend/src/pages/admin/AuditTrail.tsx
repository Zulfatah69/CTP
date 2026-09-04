import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ShieldCheck, History, Clock, User, Database } from 'lucide-react';

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/audit');
      setLogs(data);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">
          Audit Trail Log Aktivitas
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Catatan riwayat terenkripsi dan tidak dapat diubah (immutable) atas semua perubahan status dan aksi sistem.
        </p>
      </div>

      <Card className="border-neutral-200 shadow-xs bg-white rounded-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-bold text-neutral-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-700" />
                Catatan Jejak Audit
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500">
                Menampilkan seluruh rekaman aksi pengguna dan operator
              </CardDescription>
            </div>
            <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded">
              {logs.length} Catatan Log
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-700 border-b border-neutral-200">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Waktu Eksekusi</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Aktor / Pengguna</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Aksi Terdata</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Model & ID Target</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Keterangan / Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-neutral-400 text-xs">
                    Memuat catatan log audit...
                  </td>
                </tr>
              )}
              {!loading &&
                logs.map((log: any, idx: number) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-neutral-50/70 transition-colors ${
                      idx % 2 === 1 ? 'bg-neutral-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="p-3.5 text-neutral-700 font-mono text-[11px]">
                      {format(new Date(log.performedAt), 'dd/MM/yyyy HH:mm:ss')}
                    </td>
                    <td className="p-3.5 font-medium text-neutral-900">
                      {log.user?.email || log.performedById || 'Sistem'}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-neutral-100 text-primary-900 border border-neutral-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-600 font-mono text-[11px]">
                      {log.modelName} &bull; <span className="text-neutral-400">ID: {log.recordId}</span>
                    </td>
                    <td className="p-3.5 text-neutral-700 max-w-xs truncate">
                      {log.reason || '—'}
                    </td>
                  </tr>
                ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-neutral-400 text-xs">
                    Belum ada riwayat jejak audit yang tercatat di basis data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
