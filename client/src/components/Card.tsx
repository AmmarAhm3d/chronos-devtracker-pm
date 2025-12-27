import type { ReactNode } from 'react';

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="relative bg-terminal-surface border-2 border-terminal-gray-700 overflow-hidden group hover:border-terminal-cyan/40 transition-all duration-300">
      <div className="absolute inset-0 bg-terminal-grid opacity-30"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terminal-cyan/50 to-transparent"></div>
      {title && (
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-terminal-gray-700">
          <h2 className="font-mono text-sm font-semibold text-terminal-cyan tracking-wider uppercase">
            {'>'} {title}
          </h2>
          {actions}
        </div>
      )}
      <div className="relative z-10 p-6 space-y-4">{children}</div>
    </div>
  );
}
