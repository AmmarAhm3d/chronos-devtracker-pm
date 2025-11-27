import type { ReactNode } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  const { clearAuth, user } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col">
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-xl font-bold tracking-tight flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-xl group-hover:shadow-indigo-500/40 transition-all duration-200">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-slate-800">Chronos</span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">DevTracker</span>
          </button>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm text-slate-600 hidden sm:block">{user.email}</span>
              </div>
            )}
            <button
              onClick={clearAuth}
              className="bg-white text-slate-700 font-medium py-2 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 shadow-sm text-sm"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {children}
      </main>
      <footer className="border-t border-slate-200/80 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-slate-500">
            Built with <span className="text-indigo-600">React</span>, <span className="text-emerald-600">Express</span>, <span className="text-purple-600">Prisma</span> & <span className="text-blue-600">PostgreSQL</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            © {new Date().getFullYear()} Chronos DevTracker. Portfolio Project.
          </p>
        </div>
      </footer>
    </div>
  );
}
