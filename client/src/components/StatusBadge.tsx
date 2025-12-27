import clsx from 'clsx';
import type { ReactNode } from 'react';

const MAP: Record<string, string> = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROG',
  COMPLETE: 'DONE',
  ON_HOLD: 'HOLD'
};

const ICONS: Record<string, ReactNode> = {
  TODO: <span className="font-mono">○</span>,
  IN_PROGRESS: <span className="font-mono animate-pulse">◐</span>,
  COMPLETE: <span className="font-mono">●</span>,
  ON_HOLD: <span className="font-mono">▪</span>,
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-medium tracking-wider border uppercase',
        status === 'TODO' && 'bg-terminal-orange/10 text-terminal-orange border-terminal-orange/40',
        status === 'IN_PROGRESS' && 'bg-terminal-cyan/10 text-terminal-cyan border-terminal-cyan/40',
        status === 'COMPLETE' && 'bg-terminal-lime/10 text-terminal-lime border-terminal-lime/40',
        status === 'ON_HOLD' && 'bg-terminal-gray-800 text-terminal-gray-400 border-terminal-gray-600'
      )}
    >
      {ICONS[status]}
      {MAP[status] || status}
    </span>
  );
}
