const { useState } = React;
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatINR } from '../utils/formatters.js';
import { api } from '../services/api.js';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi NCR', 'Gujarat', 'Haryana',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

export function CheckoutWizard({ onNavigate }) {
  const { cartItems, subtotal, shippingFee, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Indian Shipping Address State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user ? user.name : 'Aarav Sharma',
    street: user && user.address ? user.address : 'Flat 402, Sunshine Apartments, MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: user && user.pincode ? user.pincode : '560038',
    phone: user && user.phone ? user.phone : '+91 98765 43210'
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe / Paytm)');
  const [upiId, setUpiId] = useState('aarav@okaxis');

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
        addToast('Please fill out all required shipping fields', 'error');
        return;
      }
      if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
        addToast('Please enter a valid 6-digit Indian Pincode (e.g. 560038)', 'error');
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
        customerEmail: user ? user.email : 'customer@example.com',
        items: cartItems.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0]
        })),
        shippingAddress,
        paymentMethod: paymentMethod.includes('UPI') ? `UPI (${upiId})` : paymentMethod,
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
          Thank you for shopping on AURA India. Order confirmation and GST tax invoice have been sent to your email.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
          <div className="flex justify-between font-bold">
            <span className="text-slate-500">Order ID:</span>
            <span className="text-brand-600 dark:text-brand-400">{createdOrder.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tracking AWB:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{createdOrder.trackingNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated Delivery:</span>
            <span className="font-semibold text-emerald-500">{createdOrder.estimatedDelivery}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
            <span>Total Amount Paid:</span>
            <span className="text-slate-900 dark:text-white">{formatINR(createdOrder.totalAmount)}</span>
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
          { num: 1, title: 'Indian Address' },
          { num: 2, title: 'UPI / Payment' },
          { num: 3, title: 'Review Order' }
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
                1. Shipping Address (India)
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Name *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Flat, House No., Building, Street Address *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">State *</label>
                  <select
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full mt-1 px-2.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Pincode (6 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    placeholder="560038"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Mobile Number (10 digits) *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
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
                2. Indian Payment Options
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  'UPI (Google Pay / PhonePe / Paytm)',
                  'Cash on Delivery (COD)',
                  'Debit / Credit Card',
                  'Net Banking'
                ].map((m) => (
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

              {paymentMethod.includes('UPI') && (
                <div className="space-y-3 pt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Virtual Payment Address (VPA / UPI ID)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okaxis or mobile@paytm"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-500">Pay via Google Pay, PhonePe, Paytm, or BHIM UPI.</p>
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery Address</h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">{shippingAddress.fullName}</p>
                  <p className="text-slate-600 dark:text-slate-300">{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                  <p className="text-slate-500">{shippingAddress.phone}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Items in Order</h4>
                <div className="space-y-2">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {quantity}x {product.title}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatINR(product.price * quantity)}
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
                  {loading ? 'Processing Payment...' : `Confirm & Pay ${formatINR(total)}`}
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
              <span className="font-medium text-slate-900 dark:text-white">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
              <span>Total Payable</span>
              <span className="text-brand-600 dark:text-brand-400">{formatINR(total)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
            <p>✓ 100% Buyer Protection</p>
            <p>✓ GST Invoice Included</p>
          </div>
        </div>

      </div>
    </div>
  );
}
