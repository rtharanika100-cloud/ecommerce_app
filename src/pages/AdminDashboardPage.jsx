const { useState, useEffect } = React;
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { AdminProductModal } from '../components/AdminProductModal.jsx';
import { api } from '../services/api.js';

export function AdminDashboardPage({ onNavigate }) {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('products'); // products | orders
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes, cRes] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getCategories()
      ]);

      if (pRes.success) setProducts(pRes.data);
      if (oRes.success) setOrders(oRes.data);
      if (cRes.success) setCategories(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="text-5xl">🚫</div>
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-slate-500">You must be logged in with an Admin account to access the control panel.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        addToast(`Deleted "${title}" successfully`, 'info');
        loadAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        addToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
        loadAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Admin Portal Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
              SYSTEM ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-500">Manage catalog products, monitor sales revenue, and update customer order status</p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
          <div className="font-display font-black text-2xl text-emerald-500">${totalRevenue.toFixed(2)}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Catalog Products</span>
          <div className="font-display font-black text-2xl text-brand-500">{products.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Orders</span>
          <div className="font-display font-black text-2xl text-purple-500">{orders.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
          <div className="font-display font-black text-2xl text-amber-500">2</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'products'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'orders'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Orders Management ({orders.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'products' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={prod.images && prod.images.length > 0 ? prod.images[0] : ''}
                        alt={prod.title}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{prod.title}</p>
                        <span className="text-[10px] text-slate-400">{prod.brand}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize font-semibold text-slate-700 dark:text-slate-300">{prod.category}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">${prod.price.toFixed(2)}</td>
                    <td className="p-4 font-semibold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        prod.stockCount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {prod.stockCount} in stock
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-amber-500">★ {prod.rating}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.title)}
                        className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-mono font-bold text-brand-600 dark:text-brand-400">{ord.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{ord.customerName}</p>
                      <span className="text-[10px] text-slate-400">{ord.customerEmail}</span>
                    </td>
                    <td className="p-4 font-semibold">{ord.items.length} items</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">${ord.totalAmount.toFixed(2)}</td>
                    <td className="p-4 font-bold">
                      <span className="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Product Modal */}
      {isModalOpen && (
        <AdminProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSaved={loadAdminData}
        />
      )}

    </div>
  );
}
