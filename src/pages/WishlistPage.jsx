import { useWishlist } from '../context/WishlistContext.jsx';
import { ProductCard } from '../components/ProductCard.jsx';

export function WishlistPage({ onNavigate, onSelectProduct }) {
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
