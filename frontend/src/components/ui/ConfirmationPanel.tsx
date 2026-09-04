import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

interface ConfirmationPanelProps {
  title?: string;
  referenceLabel?: string;
  referenceNumber: string;
  nextSteps?: string[];
  onAction?: () => void;
  actionText?: string;
  onSecondaryAction?: () => void;
  secondaryActionText?: string;
  className?: string;
}

export function ConfirmationPanel({
  title = 'Pengajuan Berhasil Dikirim',
  referenceLabel = 'Nomor Booking Anda',
  referenceNumber,
  nextSteps = [
    'Admin akan mereview berkas permohonan Anda dalam 1-2 hari kerja.',
    'Anda akan menerima konfirmasi via WhatsApp resmi UPTD CTP jika ada permintaan perbaikan berkas atau persetujuan.',
    'Setelah disposisi pimpinan terbit, jadwal ruangan Anda akan resmi dikunci.',
    'Bagi permohonan berbayar, instruksi pembayaran resmi akan diterbitkan setelah disetujui.',
  ],
  onAction,
  actionText = 'Lihat Status Pengajuan',
  onSecondaryAction,
  secondaryActionText = 'Kembali ke Beranda',
  className,
}: ConfirmationPanelProps) {
  return (
    <div className={cn('space-y-6 max-w-2xl mx-auto', className)}>
      {/* Green GOV.UK Confirmation Header */}
      <div className="bg-emerald-700 text-white rounded-lg p-8 sm:p-10 text-center shadow-sm space-y-4">
        <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-200" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
        <div className="pt-2 border-t border-emerald-600/60">
          <p className="text-xs sm:text-sm uppercase tracking-wider text-emerald-100 font-medium">
            {referenceLabel}
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 font-mono">
            {referenceNumber}
          </p>
        </div>
      </div>

      {/* What happens next instructions */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-neutral-900">
          Apa yang terjadi selanjutnya
        </h3>
        <ol className="space-y-2.5 text-sm text-neutral-700 list-decimal list-inside leading-relaxed">
          {nextSteps.map((step, idx) => (
            <li key={idx} className="pl-1">
              <span className="font-medium text-neutral-800">{step}</span>
            </li>
          ))}
        </ol>

        <div className="pt-4 border-t border-neutral-200 text-xs text-neutral-500">
          Simpan nomor booking ini sebagai rujukan verifikasi. Hubungi Admin UPTD via WhatsApp jika membutuhkan bantuan operasional mendesak.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
        {onSecondaryAction && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSecondaryAction}
            className="w-full sm:w-auto text-neutral-700 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {secondaryActionText}
          </Button>
        )}
        {onAction && (
          <Button
            type="button"
            onClick={onAction}
            className="w-full sm:w-auto bg-primary-700 hover:bg-primary-900 text-white"
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}
