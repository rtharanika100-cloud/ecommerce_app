const { useState, useEffect } = React;
import { HeroCarousel } from '../components/HeroCarousel.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { api } from '../services/api.js';

export function HomePage({ onNavigate, onSelectCategory, onSelectProduct }) {
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
      
      {/* Hero Carousel Slider - Festive Sale */}
      <HeroCarousel onSelectCategory={onSelectCategory} onNavigate={onNavigate} />

      {/* Trust Badges Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5 p-2">
          <div className="w-11 h-11 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xl font-bold">
            🚀
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white">Free Express Shipping</h4>
            <p className="text-[11px] text-slate-500">On all orders over ₹499</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl font-bold">
            🛡️
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white">100% Buyer Protection</h4>
            <p className="text-[11px] text-slate-500">Authentic products guaranteed</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl font-bold">
            💬
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white">24/7 Client Care</h4>
            <p className="text-[11px] text-slate-500">Dedicated support team</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl font-bold">
            🔄
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white">7-Day Easy Returns</h4>
            <p className="text-[11px] text-slate-500">Hassle-free doorstep pickup</p>
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
            <p className="text-xs text-slate-500">Explore curated festive collections crafted for every lifestyle</p>
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

      {/* Trending Hot Deals */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-sm">
              🔥
            </div>
            <div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                Diwali Trending Deals
              </h2>
              <p className="text-xs text-slate-500">Popular products at unbeatable Indian Rupee prices</p>
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
            🪔 FESTIVE OFFERS
          </span>
          <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl leading-tight">
            The Great Indian Festive Sale is Live!
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            Enjoy priority shipping, extra cashback on UPI payments, and flat 50% discount on top ethnic wear & tech gadgets.
          </p>
        </div>

        <button
          onClick={() => onNavigate('products')}
          className="px-8 py-4 rounded-2xl bg-white text-slate-950 font-bold text-sm shadow-xl hover:bg-slate-100 active:scale-95 transition-all whitespace-nowrap"
        >
          Explore Festive Catalog →
        </button>
      </div>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
              Featured Showcase
            </h2>
            <p className="text-xs text-slate-500">Handpicked top releases rated 4.5★ and above</p>
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
