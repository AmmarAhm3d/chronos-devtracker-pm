import type { ReactNode } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  const { clearAuth, user } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/')} className="text-xl font-semibold tracking-tight">
            Chronos <span className="text-blue-600">DevTracker</span>
          </button>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-slate-600">{user.email}</span>}
            <button
              onClick={clearAuth}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 active:scale-[.98]"
            >Logout</button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-8">
        {children}
      </main>
      <footer className="text-center text-xs text-slate-500 py-4">
        Built with React, Express, Prisma & PostgreSQL
      </footer>
    </div>
  );
}
