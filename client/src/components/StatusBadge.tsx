import { cn } from '../lib/utils';
import { Circle, Loader2, CheckCircle2, AlertCircle, type LucideIcon } from 'lucide-react';

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
  animate?: boolean;
}

const CONFIG: Record<string, StatusConfig> = {
  TODO: {
    label: 'To Do',
    icon: Circle,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Loader2,
    className: 'bg-blue-50 text-blue-700 border-blue-100',
    animate: true,
  },
  COMPLETE: {
    label: 'Complete',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  ON_HOLD: {
    label: 'On Hold',
    icon: AlertCircle,
    className: 'bg-amber-50 text-amber-700 border-amber-100',
  },
} as const;

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = CONFIG[status as keyof typeof CONFIG] || {
    label: status,
    icon: Circle,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold border transition-colors',
        config.className,
        className
      )}
    >
      <Icon className={cn("h-3 w-3", config.animate && "animate-spin")} />
      {config.label}
    </span>
  );
}
