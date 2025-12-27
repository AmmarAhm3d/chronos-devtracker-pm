import type { ReactNode } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  const { clearAuth, user } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col relative overflow-hidden">
      {/* Terminal grid background */}
      <div className="fixed inset-0 bg-terminal-grid opacity-20 pointer-events-none"></div>
      
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-scanlines opacity-20"></div>
      </div>
      
      <header className="relative z-20 border-b-2 border-terminal-cyan/20 bg-terminal-surface/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => navigate('/')} 
            className="font-mono text-lg font-bold tracking-tight flex items-center gap-3 group"
          >
            <div className="w-10 h-10 border-2 border-terminal-cyan/50 flex items-center justify-center text-terminal-cyan font-mono text-xl group-hover:border-terminal-cyan group-hover:shadow-[0_0_10px_rgba(0,255,255,0.5)] transition-all duration-300">
              ⧗
            </div>
            <span className="text-terminal-cyan group-hover:text-glow transition-all">CHRONOS</span>
            <span className="text-terminal-lime group-hover:text-glow transition-all">_DEVTRACKER</span>
          </button>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-terminal-cyan/40 flex items-center justify-center font-mono text-xs text-terminal-cyan">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="font-mono text-xs text-terminal-gray-400 hidden sm:block tracking-wide">{user.email}</span>
              </div>
            )}
            <button
              onClick={clearAuth}
              className="border-2 border-terminal-orange/50 text-terminal-orange font-mono text-xs py-2 px-4 hover:bg-terminal-orange/10 hover:border-terminal-orange active:scale-95 transition-all duration-200 tracking-wider uppercase"
            >
              <span className="flex items-center gap-2">
                <span>{'>'}</span>
                LOGOUT
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {children}
      </main>
      <footer className="relative z-10 border-t-2 border-terminal-cyan/10 bg-terminal-surface/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="font-mono text-xs text-terminal-gray-500 space-y-2">
            <p className="tracking-wide">
              {'>'} STACK: <span className="text-terminal-cyan">REACT</span> + <span className="text-terminal-lime">EXPRESS</span> + <span className="text-terminal-orange">PRISMA</span> + <span className="text-terminal-cyan">POSTGRESQL</span>
            </p>
            <p className="text-terminal-gray-600 tracking-wide">
              © {new Date().getFullYear()} CHRONOS_DEVTRACKER // PORTFOLIO_PROJECT
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
