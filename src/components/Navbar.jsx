const { useState, useEffect, useRef } = React;
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export function Navbar({ onNavigate, currentView, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories = [] }) {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearchFocused(false);
    if (onNavigate) onNavigate('products');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel dark:glass-panel glass-panel-light shadow-lg transition-all duration-300">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 text-white text-xs font-semibold py-1.5 px-4 text-center tracking-wide shadow-sm flex items-center justify-center gap-2">
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold">LIMITED DEAL</span>
        <span>Get 20% OFF on your first purchase! Use promo code <strong className="underline underline-offset-2">AURA20</strong> at checkout.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-accent flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-display font-black text-xl tracking-tighter">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-2xl tracking-wider text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                AURA<span className="text-brand-500">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold -mt-1">
                Luxe Commerce
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <i data-lucide="search" className="w-4 h-4"></i>
              </div>

              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-inner"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-20 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-1.5 py-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  ✕
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                Search
              </button>
            </form>

            {/* Live Search Autocomplete Overlay */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Popular Categories
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Electronics', 'Fashion', 'Home Decor', 'Beauty', 'Sports', 'Books'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat.toLowerCase().replace(' ', '-'));
                        setSearchQuery('');
                        setIsSearchFocused(false);
                        onNavigate('products');
                      }}
                      className="px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {searchQuery && (
                  <div 
                    onClick={() => {
                      setIsSearchFocused(false);
                      onNavigate('products');
                    }}
                    className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-xs font-medium text-brand-600 dark:text-brand-400 cursor-pointer hover:underline"
                  >
                    View all search results for "{searchQuery}" →
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Right Navigation Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors hover:text-brand-500 ${
                currentView === 'home' ? 'text-brand-500 font-semibold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('products')}
              className={`text-sm font-medium transition-colors hover:text-brand-500 ${
                currentView === 'products' ? 'text-brand-500 font-semibold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Explore Products
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
              >
                ★ Admin Panel
              </button>
            )}

            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? (
                <span className="text-amber-400">☀️</span>
              ) : (
                <span className="text-indigo-600">🌙</span>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group"
              title="View Wishlist"
            >
              <i data-lucide="heart" className="w-5 h-5 group-hover:text-rose-500 transition-colors"></i>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm flex items-center gap-2.5 shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
              title="View Shopping Cart"
            >
              <i data-lucide="shopping-bag" className="w-4 h-4"></i>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white text-brand-700 text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/40"
                  />
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-all"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* User Dropdown */}
              {isUserMenuOpen && user && (
                <div className="absolute right-0 mt-3 w-56 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('orders');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                    >
                      📦 My Orders & Tracking
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('wishlist');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                    >
                      ❤️ My Saved Wishlist
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/10 rounded-lg flex items-center gap-2"
                      >
                        ⚡ Admin Portal
                      </button>
                    )}
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        onNavigate('home');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-500/10 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-brand-600 text-white text-xs font-semibold flex items-center gap-1"
            >
              <span>🛒</span>
              {cartCount > 0 && <span className="font-bold">{cartCount}</span>}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              ☰
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 bg-white dark:bg-slate-900">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              🏠 Home
            </button>
            <button
              onClick={() => {
                onNavigate('products');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              🛍️ All Products
            </button>
            <button
              onClick={() => {
                onNavigate('wishlist');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ❤️ Wishlist ({wishlistCount})
            </button>
            {user ? (
              <button
                onClick={() => {
                  onNavigate('orders');
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-left text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                📦 My Orders
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('login');
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-left text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                🔑 Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
