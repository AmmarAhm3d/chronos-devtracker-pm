import type { ReactNode } from 'react';

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300">
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}
