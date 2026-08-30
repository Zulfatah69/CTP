import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/audit');
      setLogs(data);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Audit Trail</h1>
      <p className="text-gray-500">Log sistem terpusat untuk memantau perubahan status dan aksi Admin.</p>

      <div className="bg-white rounded-md shadow p-0 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-3">Waktu</th>
              <th className="px-6 py-3">Aktor</th>
              <th className="px-6 py-3">Aksi</th>
              <th className="px-6 py-3">Target Tabel</th>
              <th className="px-6 py-3">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{format(new Date(log.performedAt), 'dd/MM/yyyy HH:mm:ss')}</td>
                <td className="px-6 py-4">{log.user?.email || log.performedById}</td>
                <td className="px-6 py-4 font-semibold">{log.action}</td>
                <td className="px-6 py-4">{log.modelName} (ID: {log.recordId})</td>
                <td className="px-6 py-4 text-gray-600">{log.reason || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="text-center p-4">Belum ada log</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
