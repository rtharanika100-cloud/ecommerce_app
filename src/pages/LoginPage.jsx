const { useState } = React;
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function LoginPage({ onNavigate }) {
  const { login, loading } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      addToast('Logged in successfully! Welcome back.', 'success');
      onNavigate('home');
    } else {
      addToast(res.message || 'Invalid credentials', 'error');
    }
  };

  const fillDemoUser = () => {
    setEmail('user@example.com');
    setPassword('password123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-accent mx-auto flex items-center justify-center font-display font-black text-white text-xl shadow-glow">
          A
        </div>
        <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
          Sign In to AURA
        </h2>
        <p className="text-xs text-slate-500">Access your saved wishlist, orders, and personal recommendations</p>
      </div>

      {/* Quick Demo Shortcuts */}
      <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-2">
        <p className="font-bold text-brand-600 dark:text-brand-400 text-center">⚡ Quick Demo Login Shortcuts</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fillDemoUser}
            className="flex-1 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-brand-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-[11px] hover:border-brand-500"
          >
            👤 Customer Demo
          </button>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="flex-1 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold text-[11px] hover:bg-amber-500/30"
          >
            ★ Admin Demo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-500 dark:text-slate-400">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="font-bold text-slate-500 dark:text-slate-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 active:scale-98 transition-all disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2">
        Don't have an account?{' '}
        <button onClick={() => onNavigate('register')} className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
          Create one now
        </button>
      </div>

    </div>
  );
}
