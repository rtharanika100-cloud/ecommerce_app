import { useCart } from '../context/CartContext.jsx';

export function CartPage({ onNavigate }) {
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
