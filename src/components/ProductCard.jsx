import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export function ProductCard({ product, onSelectProduct }) {
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
