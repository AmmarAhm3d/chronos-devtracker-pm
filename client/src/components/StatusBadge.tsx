import clsx from 'clsx';

const MAP: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETE: 'Complete',
  ON_HOLD: 'On Hold'
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        status === 'TODO' && 'bg-yellow-50 text-yellow-700 ring-yellow-600/30',
        status === 'IN_PROGRESS' && 'bg-blue-50 text-blue-700 ring-blue-600/30',
        status === 'COMPLETE' && 'bg-green-50 text-green-700 ring-green-600/30',
        status === 'ON_HOLD' && 'bg-slate-100 text-slate-600 ring-slate-500/30'
      )}
    >
      {MAP[status] || status}
    </span>
  );
}
