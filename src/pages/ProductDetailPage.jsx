const { useState, useEffect } = React;
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { ReviewSection } from '../components/ReviewSection.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { api } from '../services/api.js';

export function ProductDetailPage({ productId, onSelectProduct, onNavigate }) {
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
