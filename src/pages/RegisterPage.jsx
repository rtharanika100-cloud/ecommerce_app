const { useState } = React;
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function RegisterPage({ onNavigate }) {
  const { register, loading } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please complete all registration fields', 'error');
      return;
    }

    const res = await register(name, email, password);
    if (res.success) {
      addToast('Account created successfully! Welcome to AURA.', 'success');
      onNavigate('home');
    } else {
      addToast(res.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
      
      <div className="text-center space-y-2">
        <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
          Create AURA Account
        </h2>
        <p className="text-xs text-slate-500">Join our luxury platform to unlock special member rewards</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-500 dark:text-slate-400">Full Name</label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="font-bold text-slate-500 dark:text-slate-400">Email Address</label>
          <input
            type="email"
            required
            placeholder="john@example.com"
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
            placeholder="••••••••"
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
          {loading ? 'Creating Account...' : 'Register Account'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2">
        Already have an account?{' '}
        <button onClick={() => onNavigate('login')} className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
          Sign in here
        </button>
      </div>

    </div>
  );
}
