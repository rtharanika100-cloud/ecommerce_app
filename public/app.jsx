// AURA E-Commerce Bundled Application
const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext } = React;

/* --- File: src/services/api.js --- */
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('aura_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (err) {
    console.warn(`[API Call Error: ${endpoint}]`, err.message);
    throw err;
  }
}

const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    return request(`/products?${query.toString()}`);
  },

  async getProductById(id) {
    return request(`/products/${id}`);
  },

  async createProduct(productData) {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  async deleteProduct(id) {
    return request(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Categories
  async getCategories() {
    return request('/categories');
  },

  // Auth
  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(name, email, password) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  // Reviews
  async submitReview(productId, reviewData) {
    return request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },

  // Orders
  async getOrders(userId = '') {
    const query = userId ? `?userId=${userId}` : '';
    return request(`/orders${query}`);
  },

  async createOrder(orderData) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async updateOrderStatus(orderId, status) {
    return request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};


/* --- File: src/context/ThemeContext.jsx --- */

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aura_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}


/* --- File: src/context/ToastContext.jsx --- */

const ToastContext = createContext();

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Floating Toast Portal Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 dark:bg-emerald-950/90 text-emerald-100 border-emerald-700/50 shadow-emerald-950/40'
                : toast.type === 'error'
                ? 'bg-rose-950/90 dark:bg-rose-950/90 text-rose-100 border-rose-700/50 shadow-rose-950/40'
                : 'bg-indigo-950/90 dark:bg-indigo-950/90 text-indigo-100 border-indigo-700/50 shadow-indigo-950/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <span className="text-emerald-400">✓</span>}
              {toast.type === 'error' && <span className="text-rose-400">✕</span>}
              {toast.type === 'info' && <span className="text-indigo-400">ℹ</span>}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  return useContext(ToastContext);
}


/* --- File: src/context/AuthContext.jsx --- */

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aura_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('aura_user', JSON.stringify(res.user));
        localStorage.setItem('aura_auth_token', res.token);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.register(name, email, password);
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('aura_user', JSON.stringify(res.user));
        localStorage.setItem('aura_auth_token', res.token);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aura_user');
    localStorage.removeItem('aura_auth_token');
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}


/* --- File: src/context/CartContext.jsx --- */

const CartContext = createContext();

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('aura_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null); // { code, discountPercent }
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity }];
      }
    });

    if (addToast) {
      addToast(`Added "${product.title}" to your cart!`, 'success');
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    if (addToast) {
      addToast('Item removed from cart', 'info');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'AURA20' || cleanCode === 'PROMO20') {
      setCoupon({ code: cleanCode, discountPercent: 20 });
      if (addToast) addToast('Coupon code applied: 20% OFF!', 'success');
      return true;
    } else if (cleanCode === 'WELCOME10') {
      setCoupon({ code: cleanCode, discountPercent: 10 });
      if (addToast) addToast('Coupon code applied: 10% OFF!', 'success');
      return true;
    } else {
      if (addToast) addToast('Invalid promo code. Try "AURA20"', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Computations
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const rawSavings = cartItems.reduce(
    (sum, item) =>
      sum + ((item.product.originalPrice || item.product.price) - item.product.price) * item.quantity,
    0
  );

  const couponDiscount = coupon ? (subtotal * coupon.discountPercent) / 100 : 0;
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);

  const shippingFee = subtotalAfterCoupon > 100 || cartItems.length === 0 ? 0 : 9.99;
  const tax = subtotalAfterCoupon * 0.08; // 8% estimated sales tax
  const total = subtotalAfterCoupon + shippingFee + tax;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        rawSavings,
        coupon,
        couponDiscount,
        shippingFee,
        tax,
        total,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  return useContext(CartContext);
}


/* --- File: src/context/WishlistContext.jsx --- */

const WishlistContext = createContext();

function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('aura_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const { addToast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const toggleWishlist = (product) => {
    const exists = wishlistItems.some(item => item.id === product.id);
    if (exists) {
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
      if (addToast) addToast(`Removed "${product.title}" from Wishlist`, 'info');
    } else {
      setWishlistItems(prev => [...prev, product]);
      if (addToast) addToast(`Added "${product.title}" to Wishlist!`, 'success');
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const moveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveToCart
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

function useWishlist() {
  return useContext(WishlistContext);
}


/* --- File: src/components/Navbar.jsx --- */

function Navbar({ onNavigate, currentView, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories = [] }) {
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


/* --- File: src/components/Footer.jsx --- */

function Footer({ onNavigate }) {
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


/* --- File: src/components/HeroCarousel.jsx --- */

const BANNERS = [
  {
    id: 1,
    title: "Revolutionize Your Audio Experience",
    subtitle: "NEXT-GEN NOISE CANCELLATION",
    description: "Immerse yourself in audiophile sound dynamics with the newly released AuraSound Pro Wireless Headphones.",
    buttonText: "Shop Audio Deals",
    category: "electronics",
    badge: "24% OFF THIS WEEK",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-indigo-900/90 via-slate-900/80 to-transparent"
  },
  {
    id: 2,
    title: "Scandinavian Minimalist Home Essentials",
    subtitle: "MODERN LIVING COLLECTION",
    description: "Transform your living space with solid walnut lamps, ceramic decor, and sustainable handcrafted furniture.",
    buttonText: "Explore Home Decor",
    category: "home-living",
    badge: "NEW ARRIVALS",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-amber-950/90 via-slate-900/80 to-transparent"
  },
  {
    id: 3,
    title: "Urban Tactical & Weatherproof Streetwear",
    subtitle: "AETHER STUDIO FASHION",
    description: "Breathable storm-proof parkas, utility coats, and sleek footwear built for modern outdoor aesthetics.",
    buttonText: "Discover Fashion",
    category: "fashion",
    badge: "TRENDING NOW",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-slate-950/90 via-slate-900/80 to-transparent"
  }
];

function HeroCarousel({ onSelectCategory, onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = BANNERS[currentSlide];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900 my-6 group">
      {/* Banner Background Image */}
      <div className="relative h-[380px] sm:h-[450px] lg:h-[500px] w-full">
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 transform scale-105 group-hover:scale-100"
        />

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />

        {/* Content Container */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/30 backdrop-blur-md border border-brand-400/40 text-brand-300 text-xs font-bold w-fit mb-4">
            <span>🔥</span>
            <span>{slide.badge}</span>
          </div>

          <span className="text-xs sm:text-sm font-semibold tracking-widest text-brand-400 uppercase mb-2">
            {slide.subtitle}
          </span>

          <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl leading-tight mb-4 tracking-tight">
            {slide.title}
          </h2>

          <p className="text-xs sm:text-base text-slate-300 mb-8 line-clamp-2 leading-relaxed font-light">
            {slide.description}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory(slide.category);
                if (onNavigate) onNavigate('products');
              }}
              className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-glow transition-all transform active:scale-95 flex items-center gap-2"
            >
              <span>{slide.buttonText}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((currentSlide - 1 + BANNERS.length) % BANNERS.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
      >
        ‹
      </button>

      <button
        onClick={() => setCurrentSlide((currentSlide + 1) % BANNERS.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
      >
        ›
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-brand-500' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}


/* --- File: src/components/ProductCard.jsx --- */


function ProductCard({ product, onSelectProduct }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const discount = product.discount || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-brand-950/30 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      
      {/* Product Image Box */}
      <div 
        onClick={() => onSelectProduct && onSelectProduct(product.id)}
        className="relative aspect-square w-full rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer mb-3"
      >
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-extrabold tracking-wide shadow-md">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold tracking-wider uppercase shadow-md">
              FEATURED
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-10 backdrop-blur-md shadow-md ${
            isWishlisted
              ? 'bg-rose-500 text-white scale-110'
              : 'bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 hover:text-rose-500'
          }`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <span className="text-base leading-none">{isWishlisted ? '♥' : '♡'}</span>
        </button>

        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
            <span>{product.brand || product.category}</span>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <span className="text-amber-400">★</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{product.rating || 4.5}</span>
              <span>({product.reviewCount || 0})</span>
            </div>
          </div>

          <h3 
            onClick={() => onSelectProduct && onSelectProduct(product.id)}
            className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-brand-500 transition-colors cursor-pointer mb-2"
          >
            {product.title}
          </h3>
        </div>

        {/* Price & Cart Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                ${product.price ? product.price.toFixed(2) : '0.00'}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-light">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={!product.inStock}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 dark:bg-slate-800 dark:hover:bg-brand-600 text-white text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>+ Cart</span>
          </button>
        </div>

      </div>

    </div>
  );
}


/* --- File: src/components/FilterSidebar.jsx --- */
function FilterSidebar({
  categories = [],
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  inStockOnly,
  setInStockOnly,
  sortOption,
  setSortOption,
  onResetFilters
}) {
  return (
    <aside className="w-full lg:w-64 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm h-fit">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <span>⚙️</span>
          <span>Filters & Sort</span>
        </h3>
        <button
          onClick={onResetFilters}
          className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Sort Option */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Sort By
        </label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="featured">Featured First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Customer Rating</option>
          <option value="popular">Most Popular</option>
          <option value="discount">Highest Discount</option>
        </select>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Categories
        </label>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white font-semibold shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white font-semibold shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Max Price
          </label>
          <span className="font-bold text-brand-600 dark:text-brand-400">
            ${priceRange}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-brand-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>$10</span>
          <span>$500+</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Minimum Rating
        </label>
        <div className="flex gap-2">
          {[0, 4, 4.5].map((rate) => (
            <button
              key={rate}
              onClick={() => setMinRating(rate)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                minRating === rate
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {rate === 0 ? 'All' : `${rate}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
          />
          <span>In Stock Only</span>
        </label>
      </div>

    </aside>
  );
}


/* --- File: src/components/CartDrawer.jsx --- */

function CartDrawer({ onNavigate }) {
  const {
    cartItems,
    cartCount,
    subtotal,
    coupon,
    couponDiscount,
    shippingFee,
    tax,
    total,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');

  if (!isCartOpen) return null;

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (couponCodeInput) {
      applyCoupon(couponCodeInput);
      setCouponCodeInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-300">
      {/* Dark Overlay Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🛍️</span>
              <h2 className="font-display font-bold text-lg">Your Shopping Bag</h2>
              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-extrabold">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-4xl">
                  🛒
                </div>
                <h3 className="font-display font-bold text-lg">Your bag is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('products');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg transition-all"
                >
                  Start Shopping Now
                </button>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
                >
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200'}
                    alt={product.title}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-200 dark:bg-slate-700"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-display font-bold text-xs line-clamp-1">
                          {product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-slate-400 hover:text-rose-500 text-xs font-bold transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{product.brand}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-0.5 text-xs font-bold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-display font-extrabold text-xs text-brand-600 dark:text-brand-400">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Order Summary & Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              
              {/* Coupon input */}
              {coupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Code <strong>{coupon.code}</strong> ({coupon.discountPercent}% OFF)</span>
                  <button onClick={removeCoupon} className="text-xs hover:underline">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (Try AURA20)..."
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs uppercase font-medium focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Subtotal details */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-semibold">
                    <span>Discount</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-medium text-slate-900 dark:text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Estimated Total</span>
                  <span className="text-brand-600 dark:text-brand-400">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('checkout');
                }}
                className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <span>→</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


/* --- File: src/components/ReviewSection.jsx --- */

function ReviewSection({ productId, reviews = [], onReviewSubmitted }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast('Please write a review comment', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitReview(productId, {
        userName: user ? user.name : 'Verified Customer',
        rating,
        title: title || 'Exceptional Quality',
        comment
      });

      if (res.success) {
        addToast('Thank you! Your review has been published.', 'success');
        setTitle('');
        setComment('');
        if (onReviewSubmitted) onReviewSubmitted();
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '4.8';

  return (
    <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-8">
      
      {/* Header & Rating Breakdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-1">
            Customer Reviews & Ratings
          </h3>
          <p className="text-xs text-slate-500">Real feedback from verified purchasers</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="font-display font-black text-3xl text-brand-600 dark:text-brand-400">
              {avgRating}
            </div>
            <div className="flex text-amber-400 text-xs justify-center my-0.5">
              {'★'.repeat(Math.round(Number(avgRating)))}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{reviews.length} reviews</span>
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
          Write a Product Review
        </h4>

        {/* Rating selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Your Rating:</span>
          <div className="flex gap-1 text-xl cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-transform hover:scale-125 ${
                  star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Review Title (e.g. Best audio quality!)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <textarea
          rows="3"
          placeholder="Share details about your experience with this item..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
        >
          {submitting ? 'Publishing...' : 'Submit Review'}
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No reviews submitted yet. Be the first to review this product!
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt={rev.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h5 className="font-display font-bold text-xs text-slate-900 dark:text-white">
                      {rev.userName}
                    </h5>
                    <div className="flex text-amber-400 text-xs">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400">{rev.date}</span>
              </div>

              <h6 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                {rev.title}
              </h6>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}


/* --- File: src/components/CheckoutWizard.jsx --- */

function CheckoutWizard({ onNavigate }) {
  const { cartItems, subtotal, shippingFee, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user ? user.name : 'Alex Johnson',
    street: user && user.address ? user.address : '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62704',
    phone: user && user.phone ? user.phone : '+1 (555) 234-5678'
  });

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '•••• •••• •••• 4242',
    expDate: '12/28',
    cvv: '123'
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
        addToast('Please fill out all required shipping fields', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        userId: user ? user.id : 'usr_guest',
        customerName: shippingAddress.fullName,
        customerEmail: user ? user.email : 'guest@example.com',
        items: cartItems.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0]
        })),
        shippingAddress,
        paymentMethod: paymentMethod === 'Credit Card' ? `Credit Card (${cardDetails.cardNumber.slice(-4)})` : paymentMethod,
        subtotal,
        tax,
        shippingFee,
        totalAmount: total
      };

      const res = await api.createOrder(orderPayload);
      if (res.success) {
        setCreatedOrder(res.data);
        clearCart();
        setStep(4);
        addToast('Order placed successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to process order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 4 && createdOrder) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center text-4xl">
          ✓
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
          Order Placed Successfully!
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Thank you for shopping with AURA. Your order confirmation and digital invoice have been dispatched to your email.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
          <div className="flex justify-between font-bold">
            <span className="text-slate-500">Order ID:</span>
            <span className="text-brand-600 dark:text-brand-400">{createdOrder.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tracking Number:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{createdOrder.trackingNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated Delivery:</span>
            <span className="font-semibold text-emerald-500">{createdOrder.estimatedDelivery}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
            <span>Total Paid:</span>
            <span className="text-slate-900 dark:text-white">${createdOrder.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={() => onNavigate('orders')}
            className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg transition-all"
          >
            Track Order Details
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 space-y-8">
      
      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {[
          { num: 1, title: 'Shipping' },
          { num: 2, title: 'Payment' },
          { num: 3, title: 'Review' }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= s.num
                ? 'bg-brand-600 text-white shadow-glow'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              {s.num}
            </div>
            <span className={`text-xs font-semibold ${step >= s.num ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              {s.title}
            </span>
            {s.num < 3 && <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-800 mx-2"></div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Step Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">
                1. Shipping Address
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Postal / Zip Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Phone Number</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition-all"
              >
                Proceed to Payment Step →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">
                2. Payment Method
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {['Credit Card', 'UPI Instant', 'Net Banking', 'Cash on Delivery'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`p-3.5 rounded-2xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      paymentMethod === m
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{m}</span>
                    {paymentMethod === m && <span>✓</span>}
                  </button>
                ))}
              </div>

              {paymentMethod === 'Credit Card' && (
                <div className="space-y-3 pt-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500">Card Number</label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500">Exp Date</label>
                      <input
                        type="text"
                        value={cardDetails.expDate}
                        onChange={(e) => setCardDetails({ ...cardDetails, expDate: e.target.value })}
                        className="w-full mt-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">CVV</label>
                      <input
                        type="password"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full mt-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition-all"
                >
                  Review Order Details →
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                3. Final Order Review
              </h3>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipping To</h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">{shippingAddress.fullName}</p>
                  <p className="text-slate-600 dark:text-slate-300">{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.zipCode}</p>
                  <p className="text-slate-500">{shippingAddress.phone}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Items in Order</h4>
                <div className="space-y-2">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {quantity}x {product.title}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  ← Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing Payment...' : `Confirm & Pay $${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar Summary Box */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit space-y-4">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Order Summary
          </h3>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-medium text-slate-900 dark:text-white">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
              <span>Total Due</span>
              <span className="text-brand-600 dark:text-brand-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
            <p>✓ 256-Bit SSL Encrypted Payment</p>
            <p>✓ 30-Day Money-Back Guarantee</p>
          </div>
        </div>

      </div>
    </div>
  );
}


/* --- File: src/components/AdminProductModal.jsx --- */

function AdminProductModal({ product, categories = [], onClose, onSaved }) {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: 'electronics',
    brand: '',
    price: '',
    originalPrice: '',
    discount: '',
    stockCount: '10',
    description: '',
    image: '',
    isFeatured: false,
    isTrending: false
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        category: product.category || 'electronics',
        brand: product.brand || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        discount: product.discount || '',
        stockCount: product.stockCount !== undefined ? product.stockCount : '10',
        description: product.description || '',
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        isFeatured: !!product.isFeatured,
        isTrending: !!product.isTrending
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      addToast('Title and Price are required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        brand: formData.brand || 'Generic',
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice || formData.price),
        discount: parseInt(formData.discount) || 0,
        stockCount: parseInt(formData.stockCount) || 10,
        description: formData.description,
        images: formData.image ? [formData.image] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        inStock: parseInt(formData.stockCount) > 0
      };

      if (product && product.id) {
        await api.updateProduct(product.id, payload);
        addToast('Product updated successfully!', 'success');
      } else {
        await api.createProduct(payload);
        addToast('New product created successfully!', 'success');
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 text-slate-900 dark:text-white space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-display font-bold text-lg">
            {product ? 'Edit Product Item' : 'Create New Product'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="font-bold text-slate-500">Product Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-500">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-500">Brand Name</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-500">Selling Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500">Original Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500">Stock Count</label>
              <input
                type="number"
                value={formData.stockCount}
                onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-500">Image URL</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-500">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Mark as Featured Item</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Mark as Trending Deal</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


/* --- File: src/pages/HomePage.jsx --- */

function HomePage({ onNavigate, onSelectCategory, onSelectProduct }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catsRes, featRes, trendRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: 'true' }),
          api.getProducts({ trending: 'true' })
        ]);

        if (catsRes.success) setCategories(catsRes.data);
        if (featRes.success) setFeaturedProducts(featRes.data);
        if (trendRes.success) setTrendingProducts(trendRes.data);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Carousel Slider */}
      <HeroCarousel onSelectCategory={onSelectCategory} onNavigate={onNavigate} />

      {/* Trust Badges Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5 p-2">
          <div className="w-11 h-11 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xl font-bold">
            🚀
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white">Free Express Shipping</h4>
            <p className="text-[11px] text-slate-500">On all orders over $100</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl font-bold">
            🛡️
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white">2-Year Guarantee</h4>
            <p className="text-[11px] text-slate-500">Full warranty coverage</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl font-bold">
            💬
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white">24/7 Client Support</h4>
            <p className="text-[11px] text-slate-500">Dedicated assistance</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl font-bold">
            🔒
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white">Encrypted Checkout</h4>
            <p className="text-[11px] text-slate-500">100% secure payments</p>
          </div>
        </div>
      </div>

      {/* Category Navigation Cards */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs text-slate-500">Explore curated collections crafted for every lifestyle</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            View All Categories →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onNavigate('products');
              }}
              className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 flex flex-col justify-end text-white">
                <span className="font-display font-bold text-sm tracking-wide group-hover:text-brand-300 transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-300 font-medium">Explore Collection →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Deals */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-sm">
              🔥
            </div>
            <div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                Trending Hot Deals
              </h2>
              <p className="text-xs text-slate-500">Items with highest demand and limited stock</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Callout Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <span className="px-3 py-1 rounded-full bg-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
            EXCLUSIVE OFFER
          </span>
          <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl leading-tight">
            Upgrade Your Tech & Living Setup with AURA Club
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            Enjoy priority shipping, early access to limited edition drops, and exclusive member-only reward discounts.
          </p>
        </div>

        <button
          onClick={() => onNavigate('products')}
          className="px-8 py-4 rounded-2xl bg-white text-slate-950 font-bold text-sm shadow-xl hover:bg-slate-100 active:scale-95 transition-all whitespace-nowrap"
        >
          Explore Catalog Now →
        </button>
      </div>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
              Featured Showcase
            </h2>
            <p className="text-xs text-slate-500">Handpicked premium releases rated 4.5★ and above</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}


/* --- File: src/pages/ProductListPage.jsx --- */

function ProductListPage({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSelectProduct
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [priceRange, setPriceRange] = useState(500);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState('featured');

  useEffect(() => {
    async function fetchInitialCategories() {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchInitialCategories();
  }, []);

  useEffect(() => {
    async function loadFilteredProducts() {
      setLoading(true);
      try {
        const params = {
          q: searchQuery,
          category: selectedCategory,
          maxPrice: priceRange < 500 ? priceRange : undefined,
          minRating: minRating > 0 ? minRating : undefined,
          inStock: inStockOnly ? 'true' : undefined,
          sort: sortOption
        };

        const res = await api.getProducts(params);
        if (res.success) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFilteredProducts();
  }, [searchQuery, selectedCategory, priceRange, minRating, inStockOnly, sortOption]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange(500);
    setMinRating(0);
    setInStockOnly(false);
    setSortOption('featured');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Page Title & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Discover {products.length} premium products across various categories
          </p>
        </div>

        {/* Active Filter Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategory !== 'all' && (
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center gap-1.5 border border-brand-500/30">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('all')} className="hover:text-white">✕</button>
            </span>
          )}
          {searchQuery && (
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center gap-1.5 border border-brand-500/30">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-white">✕</button>
            </span>
          )}
          {priceRange < 500 && (
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center gap-1.5 border border-brand-500/30">
              Under ${priceRange}
              <button onClick={() => setPriceRange(500)} className="hover:text-white">✕</button>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <FilterSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          minRating={minRating}
          setMinRating={setMinRating}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          sortOption={sortOption}
          setSortOption={setSortOption}
          onResetFilters={handleResetFilters}
        />

        {/* Products Grid */}
        <div className="flex-1 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="text-4xl">🔍</div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                No matching products found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any items matching your selected criteria. Try resetting your search filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


/* --- File: src/pages/ProductDetailPage.jsx --- */

function ProductDetailPage({ productId, onSelectProduct, onNavigate }) {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const loadProductDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getProductById(productId);
      if (res.success) {
        setProduct(res.data);
        // Load related category products
        const relRes = await api.getProducts({ category: res.data.category });
        if (relRes.success) {
          setRelatedProducts(relRes.data.filter(p => p.id !== productId).slice(0, 4));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) loadProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Product Not Found</h2>
        <button
          onClick={() => onNavigate('products')}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const discount = product.discount || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-12 pb-16">
      
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => onNavigate('home')} className="hover:underline">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('products')} className="hover:underline">Products</button>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-xs">{product.title}</span>
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <img
              src={product.images && product.images.length > 0 ? product.images[selectedImage] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-rose-500 text-white font-black text-xs shadow-lg">
                -{discount}% DISCOUNT
              </span>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === idx ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1">
              <span>{product.brand} • {product.category}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[11px]">
                {product.inStock ? `In Stock (${product.stockCount} left)` : 'Out of Stock'}
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-amber-400/20 text-amber-500 px-2.5 py-1 rounded-lg text-xs font-bold">
                <span>★</span>
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-slate-500">
                {product.reviewCount || 0} customer reviews
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-baseline gap-3">
            <span className="font-display font-black text-3xl text-slate-900 dark:text-white">
              ${product.price ? product.price.toFixed(2) : '0.00'}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-base text-slate-400 line-through font-light">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-bold text-rose-500 ml-auto">
                You Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Features bullet list */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Highlights</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-brand-500 font-bold">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add to Cart Actions */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                disabled={!product.inStock}
                className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Add to Shopping Bag</span>
                <span>🛒</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isWishlisted
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-500 hover:text-white'
                }`}
                title={isWishlisted ? "Remove Wishlist" : "Save to Wishlist"}
              >
                ♥
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Customer Reviews Section */}
      <ReviewSection
        productId={product.id}
        reviews={product.reviewsList || []}
        onReviewSubmitted={loadProductDetails}
      />

      {/* Related Products Carousel Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProd) => (
              <ProductCard
                key={relProd.id}
                product={relProd}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}


/* --- File: src/pages/CartPage.jsx --- */

function CartPage({ onNavigate }) {
  const {
    cartItems,
    cartCount,
    subtotal,
    coupon,
    couponDiscount,
    shippingFee,
    tax,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="text-5xl">🛒</div>
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500">Explore our catalog to discover incredible deals on top items.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg transition-all"
        >
          Explore Catalog Now →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8 pb-16">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Shopping Cart ({cartCount} Items)
          </h1>
          <p className="text-xs text-slate-500">Review your items before proceeding to checkout</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-500 hover:underline font-semibold"
        >
          Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
            >
              <img
                src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200'}
                alt={product.title}
                className="w-24 h-24 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
              />

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">{product.brand}</span>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                  ${product.price.toFixed(2)} each
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="px-3 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="px-3 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold"
                  >
                    +
                  </button>
                </div>

                <span className="font-display font-black text-sm text-brand-600 dark:text-brand-400 w-20 text-right">
                  ${(product.price * quantity).toFixed(2)}
                </span>

                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-slate-400 hover:text-rose-500 text-sm font-bold"
                  title="Remove Item"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-fit space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Order Total Summary
          </h3>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-500 font-semibold">
                <span>Coupon ({coupon.code})</span>
                <span>-${couponDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-medium text-slate-900 dark:text-white">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
              <span>Total Price</span>
              <span className="text-brand-600 dark:text-brand-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
          >
            Proceed to Checkout →
          </button>
        </div>

      </div>
    </div>
  );
}


/* --- File: src/pages/WishlistPage.jsx --- */


function WishlistPage({ onNavigate, onSelectProduct }) {
  const { wishlistItems, wishlistCount } = useWishlist();

  if (wishlistCount === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="text-5xl">❤️</div>
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-500">Save items you love by clicking the heart icon on any product.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg transition-all"
        >
          Explore Catalog Now →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 pb-16">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Saved Wishlist ({wishlistCount} Items)
        </h1>
        <p className="text-xs text-slate-500">Your favorite saved items across all categories</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </div>
  );
}


/* --- File: src/pages/CheckoutPage.jsx --- */

function CheckoutPage({ onNavigate }) {
  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Secure Order Checkout
        </h1>
        <p className="text-xs text-slate-500">Complete your shipping and payment details to place your order</p>
      </div>

      <CheckoutWizard onNavigate={onNavigate} />
    </div>
  );
}


/* --- File: src/pages/OrdersPage.jsx --- */

function OrdersPage({ onNavigate }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserOrders() {
      setLoading(true);
      try {
        const res = await api.getOrders(user ? user.id : '');
        if (res.success) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserOrders();
  }, [user]);

  const getStatusStep = (status) => {
    switch (status) {
      case 'Placed': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 pb-16">
      
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
          My Orders & Live Tracking
        </h1>
        <p className="text-xs text-slate-500">Track package status and view order receipts</p>
      </div>

      {orders.length === 0 ? (
        <div className="max-w-md mx-auto my-12 text-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="text-5xl">📦</div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">No Orders Found</h3>
          <p className="text-xs text-slate-500">You haven't placed any orders yet.</p>
          <button
            onClick={() => onNavigate('products')}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
          >
            Start Shopping Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStep = getStatusStep(order.status);

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-base text-slate-900 dark:text-white">
                        Order #{order.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Placed on {new Date(order.date).toLocaleDateString()} • Tracking: <span className="font-mono text-slate-700 dark:text-slate-300">{order.trackingNumber}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Paid</span>
                    <p className="font-display font-black text-lg text-slate-900 dark:text-white">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Progress Status Visualizer */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    {['Placed', 'Processing', 'Shipped', 'Delivered'].map((st, idx) => (
                      <span
                        key={st}
                        className={idx + 1 <= currentStep ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                  <div className="relative h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-500"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-right">
                    Estimated Delivery: <strong className="text-emerald-500">{order.estimatedDelivery}</strong>
                  </p>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200'}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500">{item.quantity}x ${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}


/* --- File: src/pages/AdminDashboardPage.jsx --- */

function AdminDashboardPage({ onNavigate }) {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('products'); // products | orders
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes, cRes] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getCategories()
      ]);

      if (pRes.success) setProducts(pRes.data);
      if (oRes.success) setOrders(oRes.data);
      if (cRes.success) setCategories(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="text-5xl">🚫</div>
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-slate-500">You must be logged in with an Admin account to access the control panel.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        addToast(`Deleted "${title}" successfully`, 'info');
        loadAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        addToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
        loadAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Admin Portal Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
              SYSTEM ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-500">Manage catalog products, monitor sales revenue, and update customer order status</p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
          <div className="font-display font-black text-2xl text-emerald-500">${totalRevenue.toFixed(2)}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Catalog Products</span>
          <div className="font-display font-black text-2xl text-brand-500">{products.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Orders</span>
          <div className="font-display font-black text-2xl text-purple-500">{orders.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
          <div className="font-display font-black text-2xl text-amber-500">2</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'products'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'orders'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Orders Management ({orders.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'products' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={prod.images && prod.images.length > 0 ? prod.images[0] : ''}
                        alt={prod.title}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{prod.title}</p>
                        <span className="text-[10px] text-slate-400">{prod.brand}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize font-semibold text-slate-700 dark:text-slate-300">{prod.category}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">${prod.price.toFixed(2)}</td>
                    <td className="p-4 font-semibold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        prod.stockCount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {prod.stockCount} in stock
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-amber-500">★ {prod.rating}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.title)}
                        className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-mono font-bold text-brand-600 dark:text-brand-400">{ord.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{ord.customerName}</p>
                      <span className="text-[10px] text-slate-400">{ord.customerEmail}</span>
                    </td>
                    <td className="p-4 font-semibold">{ord.items.length} items</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">${ord.totalAmount.toFixed(2)}</td>
                    <td className="p-4 font-bold">
                      <span className="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Product Modal */}
      {isModalOpen && (
        <AdminProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSaved={loadAdminData}
        />
      )}

    </div>
  );
}


/* --- File: src/pages/LoginPage.jsx --- */

function LoginPage({ onNavigate }) {
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


/* --- File: src/pages/RegisterPage.jsx --- */

function RegisterPage({ onNavigate }) {
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


/* --- File: src/App.jsx --- */

function MainLayout() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Re-create lucide icons on route state changes
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProductId]);

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    setCurrentView('product-detail');
  };

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setCurrentView('products');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        onNavigate={handleNavigate}
        currentView={currentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main View Router Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'products' && (
          <ProductListPage
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailPage
            productId={selectedProductId}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'cart' && (
          <CartPage onNavigate={handleNavigate} />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage onNavigate={handleNavigate} />
        )}

        {currentView === 'orders' && (
          <OrdersPage onNavigate={handleNavigate} />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage onNavigate={handleNavigate} />
        )}

        {currentView === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {currentView === 'register' && (
          <RegisterPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Quick Slide-Out Cart Drawer */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Multi-Column Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <MainLayout />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}


/* --- File: src/main.jsx --- */

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

