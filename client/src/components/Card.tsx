import type { ReactNode } from 'react';

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}
