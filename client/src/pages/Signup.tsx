import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import { useAuthStore } from '../store/auth';
import { Clock, Loader2, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth, token } = useAuthStore();
  const navigate = useNavigate();

  if (token) return <Navigate to="/" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { email, password, name });
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to create account');
      } else {
        setError('Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg mb-4">
            <Clock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Workspace</h1>
          <p className="text-sm text-slate-500 mt-2">Join the next generation of development tracking</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-1">Must be at least 8 characters</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="space-y-3 mb-6">
               <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                 <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                 Unlimited active projects
               </div>
               <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                 <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                 Real-time task tracking
               </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-slate-900 hover:underline underline-offset-4">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;