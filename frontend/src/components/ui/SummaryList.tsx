import React from 'react';
import { cn } from '@/lib/utils';

export interface SummaryListItem {
  key: string;
  value: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  actionAriaLabel?: string;
}

interface SummaryListProps {
  items: SummaryListItem[];
  className?: string;
}

export function SummaryList({ items, className }: SummaryListProps) {
  return (
    <dl
      className={cn(
        'divide-y divide-neutral-200 border-y border-neutral-200 bg-white rounded-lg overflow-hidden',
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-4 py-3.5 hover:bg-neutral-50/60 transition-colors"
        >
          <dt className="sm:col-span-4 text-sm font-semibold text-neutral-900 flex items-center">
            {item.key}
          </dt>
          <dd className="sm:col-span-6 text-sm text-neutral-700 break-words flex items-center">
            {item.value || <span className="text-neutral-400 italic">Tidak ada data</span>}
          </dd>
          <dd className="sm:col-span-2 text-left sm:text-right flex items-center sm:justify-end mt-1 sm:mt-0">
            {item.onAction && (
              <button
                type="button"
                onClick={item.onAction}
                className="text-xs font-semibold text-primary-700 hover:text-primary-900 underline underline-offset-2 focus:ring-2 focus:ring-yellow-400"
                aria-label={item.actionAriaLabel || `Ubah ${item.key}`}
              >
                {item.actionText || 'Ubah'}
              </button>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
