import React from 'react';
import { cn } from '@/lib/utils';

export type BookingStatusType =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION_NEEDED'
  | 'APPROVED'
  | 'WAITING_PAYMENT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | string;

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-300',
    dot: 'bg-neutral-400',
  },
  SUBMITTED: {
    label: 'Menunggu Review',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
  },
  UNDER_REVIEW: {
    label: 'Sedang Direview',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
  },
  REVISION_NEEDED: {
    label: 'Perlu Perbaikan',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-300',
    dot: 'bg-amber-600',
  },
  APPROVED: {
    label: 'Disetujui',
    bg: 'bg-teal-50',
    text: 'text-teal-900',
    border: 'border-teal-200',
    dot: 'bg-teal-600',
  },
  WAITING_PAYMENT: {
    label: 'Menunggu Pembayaran',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-300',
    dot: 'bg-amber-600',
  },
  ACTIVE: {
    label: 'Aktif',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
  },
  COMPLETED: {
    label: 'Selesai',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
  },
  REJECTED: {
    label: 'Ditolak',
    bg: 'bg-red-50',
    text: 'text-red-900',
    border: 'border-red-200',
    dot: 'bg-red-600',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    bg: 'bg-red-50',
    text: 'text-red-900',
    border: 'border-red-200',
    dot: 'bg-red-600',
  },
  // Payment states
  PENDING: {
    label: 'Menunggu Pembayaran',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-300',
    dot: 'bg-amber-600',
  },
  PROOF_UPLOADED: {
    label: 'Bukti Diunggah',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
  },
  VERIFIED: {
    label: 'Terverifikasi',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
  },
  OVERDUE: {
    label: 'Melewati Batas H-1',
    bg: 'bg-red-100',
    text: 'text-red-950 font-bold',
    border: 'border-red-400',
    dot: 'bg-red-600 animate-ping',
  },
};

interface StatusTagProps {
  status: BookingStatusType;
  customLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusTag({ status, customLabel, className, size = 'md' }: StatusTagProps) {
  const config = STATUS_MAP[status] || {
    label: status,
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-300',
    dot: 'bg-neutral-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-md border tracking-wide uppercase',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dot)} aria-hidden="true" />
      <span>{customLabel || config.label}</span>
    </span>
  );
}
