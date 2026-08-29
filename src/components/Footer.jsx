const { useState } = React;
import { useToast } from '../context/ToastContext.jsx';

export function Footer({ onNavigate }) {
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    addToast('Subscribed to AURA Insider newsletter!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-accent flex items-center justify-center font-display font-bold text-white shadow-glow">
                A
              </div>
              <span className="font-display font-extrabold text-2xl tracking-wider text-white">
                AURA<span className="text-brand-500">.</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Architecting modern luxury e-commerce with curated collections, lighting-fast delivery, secure end-to-end checkout, and 24/7 dedicated client support.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {['twitter', 'instagram', 'facebook', 'youtube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors"
                >
                  ★
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-brand-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-brand-400 transition-colors">
                  All Product Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('wishlist')} className="hover:text-brand-400 transition-colors">
                  Saved Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-brand-400 transition-colors">
                  My Orders & Tracking
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-brand-400 cursor-pointer">Help Center & FAQ</li>
              <li className="hover:text-brand-400 cursor-pointer">Shipping & Delivery</li>
              <li className="hover:text-brand-400 cursor-pointer">Returns & Exchanges</li>
              <li className="hover:text-brand-400 cursor-pointer">Track Package</li>
              <li className="hover:text-brand-400 cursor-pointer">Privacy Policy</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider">
              Stay Connected
            </h4>
            <p className="text-xs text-slate-400">
              Subscribe to get special discounts and new release updates.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                Join AURA Club
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AURA Luxe Commerce. Built with precision for top-tier performance.</p>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-slate-800 text-[10px]">VISA</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[10px]">MASTERCARD</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[10px]">APPLE PAY</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[10px]">UPI FAST</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
