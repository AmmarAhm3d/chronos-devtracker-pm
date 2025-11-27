import clsx from 'clsx';
import type { ReactNode } from 'react';

const MAP: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETE: 'Complete',
  ON_HOLD: 'On Hold'
};

const ICONS: Record<string, ReactNode> = {
  TODO: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>,
  IN_PROGRESS: <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  COMPLETE: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
  ON_HOLD: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm',
        status === 'TODO' && 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200/50',
        status === 'IN_PROGRESS' && 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50',
        status === 'COMPLETE' && 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200/50',
        status === 'ON_HOLD' && 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-600 border border-slate-200/50'
      )}
    >
      {ICONS[status]}
      {MAP[status] || status}
    </span>
  );
}
