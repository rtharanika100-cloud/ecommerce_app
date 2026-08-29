const { useState } = React;
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function CheckoutWizard({ onNavigate }) {
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
