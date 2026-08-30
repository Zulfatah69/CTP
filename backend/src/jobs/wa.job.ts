import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

// Graceful degradation: Hanya aktif jika process.env.REDIS_ACTIVE = 'true'
let waQueue: any = null;

if (process.env.REDIS_ACTIVE === 'true') {
  try {
    const connection = new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    });

    waQueue = new Queue('wa-notifications', { connection });

    const worker = new Worker('wa-notifications', async job => {
      const { to, message } = job.data;
      console.log(`[WhatsApp Job] Mengirim pesan ke ${to}: ${message}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { status: 'sent', timestamp: new Date() };
    }, { connection });

    worker.on('completed', job => console.log(`[WhatsApp Job] Job ${job.id} selesai!`));
    worker.on('failed', (job, err) => console.error(`[WhatsApp Job] Gagal: ${err.message}`));
  } catch (error) {
    console.warn('[WARNING] Gagal inisialisasi Redis/BullMQ');
  }
} else {
  console.warn('[WARNING] Redis tidak diaktifkan (REDIS_ACTIVE!=true). Notifikasi WA akan menggunakan simulasi log (Mock).');
}

export const sendWhatsAppNotification = async (to: string, message: string) => {
  if (waQueue) {
    try {
      await waQueue.add('send-message', { to, message });
    } catch (error) {
      console.error('Gagal memasukkan WA ke antrean BullMQ:', error);
    }
  } else {
    // Fallback Mock
    console.log(`[MOCK WA] to: ${to} | msg: ${message}`);
  }
};
