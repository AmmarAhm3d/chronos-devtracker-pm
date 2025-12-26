import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ title, subtitle, children, actions, className, noPadding = false }: CardProps) {
  return (
    <div className={cn(
      "bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden",
      className
    )}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/30">
          <div>
            {title && <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn(noPadding ? "" : "p-6")}>
        {children}
      </div>
    </div>
  );
}