import type { ReactNode } from 'react';
import { useAuthStore } from '../store/auth';
import { Link } from 'react-router-dom';
import { LogOut, Clock, User } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const { clearAuth, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link 
            to="/" 
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight text-slate-900">CHRONOS</span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">DevTracker</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-slate-200 mr-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                    {user.name || 'Developer'}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
              </div>
            )}
            
            <button
              onClick={clearAuth}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 h-9 px-4 py-2 text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-500">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500">
                © {new Date().getFullYear()} Chronos DevTracker. Built for high performance.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tech Stack</span>
              <div className="flex gap-4">
                {['React', 'TypeScript', 'Node.js', 'Prisma'].map((tech) => (
                  <span key={tech} className="text-[10px] text-slate-500 hover:text-slate-900 cursor-default transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
