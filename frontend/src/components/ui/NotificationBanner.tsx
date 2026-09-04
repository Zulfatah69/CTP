import React from 'react';
import { cn } from '@/lib/utils';
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

type BannerType = 'info' | 'success' | 'warning' | 'error';

interface NotificationBannerProps {
  type?: BannerType;
  title: string;
  children?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const TYPE_CONFIG = {
  info: {
    border: 'border-l-4 border-l-blue-600 border-blue-200',
    bg: 'bg-blue-50',
    titleColor: 'text-blue-950',
    textColor: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600',
  },
  success: {
    border: 'border-l-4 border-l-emerald-700 border-emerald-200',
    bg: 'bg-emerald-50',
    titleColor: 'text-emerald-950',
    textColor: 'text-emerald-800',
    icon: CheckCircle2,
    iconColor: 'text-emerald-700',
  },
  warning: {
    border: 'border-l-4 border-l-amber-600 border-amber-300',
    bg: 'bg-amber-50',
    titleColor: 'text-amber-950',
    textColor: 'text-amber-900',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  error: {
    border: 'border-l-4 border-l-red-600 border-red-200',
    bg: 'bg-red-50',
    titleColor: 'text-red-950',
    textColor: 'text-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-600',
  },
};

export function NotificationBanner({
  type = 'info',
  title,
  children,
  className,
  action,
}: NotificationBannerProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      role="region"
      aria-label={title}
      className={cn(
        'rounded-r-lg border border-l-4 p-4 shadow-2xs',
        config.border,
        config.bg,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconColor)} aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <h4 className={cn('text-sm font-bold tracking-tight', config.titleColor)}>{title}</h4>
          {children && (
            <div className={cn('text-xs sm:text-sm leading-relaxed', config.textColor)}>
              {children}
            </div>
          )}
        </div>
        {action && <div className="shrink-0 ml-2">{action}</div>}
      </div>
    </div>
  );
}
