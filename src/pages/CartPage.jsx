const { useState } = React;
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../utils/formatters.js';

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

  const [couponInput, setCouponInput] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="text-5xl">🛒</div>
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500">Explore our catalog to discover incredible festive deals.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg transition-all"
        >
          Explore Catalog Now →
        </button>
      </div>
    );
  }

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (couponInput) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8 pb-16">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Shopping Cart ({cartCount} Items)
          </h1>
          <p className="text-xs text-slate-500">Review your items before proceeding to Indian checkout</p>
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
                  {formatINR(product.price)} each
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

                <span className="font-display font-black text-sm text-brand-600 dark:text-brand-400 w-24 text-right">
                  {formatINR(product.price * quantity)}
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

          {/* Coupon Form */}
          {coupon ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Code <strong>{coupon.code}</strong> ({coupon.discountPercent}% OFF)</span>
              <button onClick={removeCoupon} className="text-xs hover:underline">Remove</button>
            </div>
          ) : (
            <form onSubmit={handleCouponSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code (Try DIWALI20)..."
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs uppercase font-medium focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Apply
              </button>
            </form>
          )}

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatINR(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-500 font-semibold">
                <span>Coupon ({coupon.code})</span>
                <span>-{formatINR(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST Simulation (18%)</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatINR(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
              <span>Total Payable</span>
              <span className="text-brand-600 dark:text-brand-400">{formatINR(total)}</span>
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
