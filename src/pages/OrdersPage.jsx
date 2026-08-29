const { useState, useEffect } = React;
import { useAuth } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/formatters.js';
import { api } from '../services/api.js';

export function OrdersPage({ onNavigate }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

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
        <p className="text-xs text-slate-500">Track package status and download GST tax invoices</p>
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
                      Placed on {new Date(order.date).toLocaleDateString()} • Tracking AWB: <span className="font-mono text-slate-700 dark:text-slate-300">{order.trackingNumber}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700"
                    >
                      📄 GST Tax Invoice
                    </button>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Total Paid</span>
                      <p className="font-display font-black text-lg text-slate-900 dark:text-white">
                        {formatINR(order.totalAmount)}
                      </p>
                    </div>
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
                        <p className="text-[11px] text-slate-500">{item.quantity}x {formatINR(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* GST Invoice Modal Preview */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center">
          <div onClick={() => setSelectedInvoiceOrder(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" />

          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 text-slate-900 dark:text-white space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl">TAX INVOICE</span>
                <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-500 font-bold text-[10px]">GSTIN: 29AABCA1234F1Z9</span>
              </div>
              <button onClick={() => setSelectedInvoiceOrder(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-400">Billed To:</p>
                <p className="font-bold">{selectedInvoiceOrder.customerName}</p>
                <p className="text-slate-500">{selectedInvoiceOrder.shippingAddress.street}, {selectedInvoiceOrder.shippingAddress.city}, {selectedInvoiceOrder.shippingAddress.state} - {selectedInvoiceOrder.shippingAddress.pincode}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="font-bold text-slate-400">Invoice Details:</p>
                <p>Invoice #: <strong>INV-{selectedInvoiceOrder.id}</strong></p>
                <p>Date: {new Date(selectedInvoiceOrder.date).toLocaleDateString()}</p>
                <p>Payment: {selectedInvoiceOrder.paymentMethod}</p>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedInvoiceOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{item.title}</td>
                      <td className="p-2.5 text-center">{item.quantity}</td>
                      <td className="p-2.5 text-right font-bold">{formatINR(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold">Total Invoice Amount:</span>
              <span className="font-display font-black text-xl text-brand-600 dark:text-brand-400">{formatINR(selectedInvoiceOrder.totalAmount)}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-md"
              >
                🖨️ Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
