import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import { useAuthStore } from '../store/auth';
import { SignupSchema, getZodFirstError } from '../lib/validation';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate with Zod
    const validation = SignupSchema.safeParse({ email, password, name: name || undefined });
    if (!validation.success) {
      setError(getZodFirstError(validation.error));
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { email, password, name });
      setAuth(res.data.token, res.data.user);
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Signup failed');
      } else {
        setError('Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Terminal grid background */}
      <div className="absolute inset-0 bg-terminal-grid opacity-20"></div>
      
      {/* Animated scanlines */}
      <div className="absolute inset-0 bg-scanlines opacity-10"></div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-terminal-lime/20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-terminal-orange/20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-terminal-cyan/20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-terminal-lime/20"></div>
      
      <div className="relative w-full max-w-md z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="font-mono text-3xl font-bold text-terminal-lime mb-2 tracking-wider">
            CHRONOS_<span className="text-terminal-cyan">DEVTRACKER</span>
          </h1>
          <p className="font-mono text-xs text-terminal-gray-500 tracking-widest">PORTFOLIO_PROJECT_MANAGEMENT</p>
        </div>

        {/* Signup Card */}
        <div className="bg-terminal-surface border-2 border-terminal-lime/30 p-8 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terminal-lime/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terminal-lime/50 to-transparent"></div>
          
          <h2 className="font-mono text-xl font-bold text-terminal-lime mb-1 tracking-wide uppercase">{'>'} CREATE_ACCOUNT</h2>
          <p className="font-mono text-xs text-terminal-gray-500 mb-6 tracking-wide">REGISTER_TO_START_TRACKING</p>
          
          {error && (
            <div className="mb-6 p-4 border-2 border-terminal-orange/50 bg-terminal-orange/10 font-mono text-xs text-terminal-orange flex items-center gap-2">
              <span className="text-lg">⚠</span>
              <span>{'>'} ERROR: {error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block font-mono text-xs font-medium text-terminal-lime mb-2 tracking-wider uppercase">
                FULL_NAME
              </label>
              <input
                id="name"
                type="text"
                placeholder="JOHN_DOE"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-terminal-gray-700 bg-terminal-bg text-terminal-cyan font-mono text-sm placeholder:text-terminal-gray-600 focus:outline-none focus:border-terminal-lime transition-all"
                autoComplete="name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block font-mono text-xs font-medium text-terminal-lime mb-2 tracking-wider uppercase">
                EMAIL_ADDRESS
              </label>
              <input
                id="email"
                type="email"
                placeholder="user@domain.tld"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-terminal-gray-700 bg-terminal-bg text-terminal-cyan font-mono text-sm placeholder:text-terminal-gray-600 focus:outline-none focus:border-terminal-lime transition-all"
                required
                autoComplete="email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block font-mono text-xs font-medium text-terminal-lime mb-2 tracking-wider uppercase">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-terminal-gray-700 bg-terminal-bg text-terminal-cyan font-mono text-sm placeholder:text-terminal-gray-600 focus:outline-none focus:border-terminal-lime transition-all"
                required
                autoComplete="new-password"
              />
              <p className="mt-1.5 font-mono text-[10px] text-terminal-gray-600 tracking-wide">MIN_LENGTH: 6_CHARS</p>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full border-2 border-terminal-lime/50 bg-terminal-lime/5 text-terminal-lime font-mono text-sm py-3 px-5 hover:bg-terminal-lime/10 hover:border-terminal-lime active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider uppercase"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-pulse">▓▓▓</span> REGISTERING<span className="terminal-cursor"></span>
                </span>
              ) : (
                <span>{'>'} CREATE_ACCOUNT</span>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center border-t-2 border-terminal-gray-800 pt-6">
            <span className="font-mono text-xs text-terminal-gray-500 tracking-wide">HAVE_ACCOUNT? </span>
            <Link to="/login" className="font-mono text-xs text-terminal-cyan hover:text-terminal-lime transition-colors tracking-wide uppercase">
              SIGN_IN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
