const { useState, useEffect } = React;
import { FilterSidebar } from '../components/FilterSidebar.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { api } from '../services/api.js';

export function ProductListPage({
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
