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
    addToast('Subscribed to AURA India Insider newsletter!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-accent flex items-center justify-center font-display font-bold text-white shadow-glow text-xl">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-2xl tracking-wider text-white">
                  AURA<span className="text-brand-500">.in</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                  India E-Commerce Platform
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India's premier online destination for festive ethnic wear, modern electronics, ayurvedic wellness, and sports gear. Express delivery across 19,000+ Indian pincodes.
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
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-brand-400 transition-colors">
                  Diwali Sale Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-brand-400 transition-colors">
                  Browse Catalog (₹)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('wishlist')} className="hover:text-brand-400 transition-colors">
                  Saved Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-brand-400 transition-colors">
                  My Orders & Live Tracking
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
              <li className="hover:text-brand-400 cursor-pointer">Express Delivery (₹499 Free Threshold)</li>
              <li className="hover:text-brand-400 cursor-pointer">Easy 7-Day Doorstep Returns</li>
              <li className="hover:text-brand-400 cursor-pointer">GST Tax Invoice Support</li>
              <li className="hover:text-brand-400 cursor-pointer">Buyer Protection Guarantee</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider">
              Festive Deals Alert
            </h4>
            <p className="text-xs text-slate-400">
              Subscribe to receive exclusive coupon codes and Diwali Dhamaka sale alerts.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                Subscribe Now
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AURA India E-Commerce. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300">⚡ UPI INSTANT</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300">GPAY</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300">PHONEPE</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300">PAYTM</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300">RUPAY</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300">CASH ON DELIVERY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
