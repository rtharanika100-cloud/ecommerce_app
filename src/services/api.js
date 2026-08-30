const API_BASE = '/api';

// Fallback Indian E-Commerce Dataset for GitHub Pages static hosting
const FALLBACK_SEED = {
  categories: [
    { id: 'electronics', name: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' },
    { id: 'fashion', name: 'Fashion & Ethnic', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400' },
    { id: 'home-kitchen', name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=400' },
    { id: 'beauty-wellness', name: 'Beauty & Wellness', image: 'https://images.unsplash.com/photo-1608248597262-838236700978?auto=format&fit=crop&q=80&w=400' },
    { id: 'sports-fitness', name: 'Sports & Cricket', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400' },
    { id: 'books-media', name: 'Books & Stationery', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400' }
  ],
  products: [
    {
      id: 'prod_1',
      title: 'AuraSound Pro Wireless Headphones',
      category: 'electronics',
      brand: 'AuraSound',
      price: 4999,
      originalPrice: 8999,
      discount: 44,
      rating: 4.8,
      reviewCount: 342,
      inStock: true,
      stockCount: 25,
      isFeatured: true,
      isTrending: true,
      description: 'Active Noise Canceling wireless headphones with 40h battery, fast charging, and deep bass mode tuned for Indian music lovers.',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
      features: ['Active Noise Cancellation (ANC)', '40-Hour Battery Life', 'Bluetooth 5.3 Quick Pair', 'Type-C Fast Charging']
    },
    {
      id: 'prod_2',
      title: 'Royal Kurta Men Royal Ethnic Chikankari Set',
      category: 'fashion',
      brand: 'Royal Kurta',
      price: 2999,
      originalPrice: 5999,
      discount: 50,
      rating: 4.7,
      reviewCount: 189,
      inStock: true,
      stockCount: 15,
      isFeatured: true,
      isTrending: true,
      description: 'Handcrafted Lucknowi Chikankari embroidery cotton kurta set for Diwali festivities and wedding celebrations.',
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'],
      features: ['100% Pure Organic Cotton', 'Lucknowi Handwork', 'Includes Silk Blend Pyjama', 'Diwali Special Release']
    },
    {
      id: 'prod_3',
      title: 'Kumkumadi Ayurvedic Radiant Facial Oil',
      category: 'beauty-wellness',
      brand: 'Aura Botanicals',
      price: 1499,
      originalPrice: 2499,
      discount: 40,
      rating: 4.9,
      reviewCount: 512,
      inStock: true,
      stockCount: 40,
      isFeatured: true,
      isTrending: false,
      description: 'Traditional 26-herb Ayurvedic night elixir infused with Kashmiri Saffron and Sandalwood for radiant skin.',
      images: ['https://images.unsplash.com/photo-1608248597262-838236700978?auto=format&fit=crop&q=80&w=800'],
      features: ['Real Kashmiri Saffron', '100% Organic & Vegan', 'Dermatologically Tested', 'No Chemicals or Parabens']
    },
    {
      id: 'prod_4',
      title: 'MRF Genius Grand Edition English Willow Cricket Bat',
      category: 'sports-fitness',
      brand: 'MRF Sports',
      price: 12999,
      originalPrice: 18999,
      discount: 31,
      rating: 4.9,
      reviewCount: 94,
      inStock: true,
      stockCount: 8,
      isFeatured: true,
      isTrending: true,
      description: 'Grade 1 English Willow professional cricket bat with massive edges and lightweight pick-up.',
      images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800'],
      features: ['Grade 1 English Willow', 'Concave Edge Profile', 'Singapore Cane Handle', 'Includes Padded Bat Cover']
    }
  ],
  orders: [
    {
      id: 'ORD-IND-98241',
      userId: 'usr_1',
      customerName: 'Aarav Sharma',
      customerEmail: 'user@example.com',
      date: '2026-08-28T14:32:00.000Z',
      status: 'Shipped',
      trackingNumber: 'IN883920194DEL',
      estimatedDelivery: '01 Sep 2026',
      paymentMethod: 'UPI (aarav@okaxis)',
      items: [
        { productId: 'prod_1', title: 'AuraSound Pro Wireless Headphones', price: 4999, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800' }
      ],
      shippingAddress: { fullName: 'Aarav Sharma', street: 'Flat 402, Sunshine Apartments, MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', phone: '+91 98765 43210' },
      subtotal: 4999, tax: 899.82, shippingFee: 0, totalAmount: 4999
    }
  ]
};

function getLocalData(key, fallback) {
  const saved = localStorage.getItem(`aura_db_${key}`);
  return saved ? JSON.parse(saved) : fallback;
}

function setLocalData(key, data) {
  localStorage.setItem(`aura_db_${key}`, JSON.stringify(data));
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('aura_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) throw new Error('Network response not ok');
    return await res.json();
  } catch (err) {
    // Static Client-Side Fallback Handler for GitHub Pages hosting
    return handleStaticFallback(endpoint, options);
  }
}

function handleStaticFallback(endpoint, options) {
  const method = options.method || 'GET';
  const urlParts = endpoint.split('?');
  const path = urlParts[0];

  if (path === '/categories') {
    return { success: true, data: FALLBACK_SEED.categories };
  }

  if (path === '/products') {
    let prods = getLocalData('products', FALLBACK_SEED.products);
    if (method === 'POST') {
      const newProd = { ...JSON.parse(options.body), id: `prod_${Date.now()}` };
      prods.unshift(newProd);
      setLocalData('products', prods);
      return { success: true, data: newProd };
    }
    return { success: true, data: prods };
  }

  if (path.startsWith('/products/')) {
    const parts = path.split('/');
    const id = parts[2];
    let prods = getLocalData('products', FALLBACK_SEED.products);
    const prod = prods.find(p => p.id === id);

    if (method === 'DELETE') {
      prods = prods.filter(p => p.id !== id);
      setLocalData('products', prods);
      return { success: true, message: 'Deleted' };
    }

    if (method === 'PUT') {
      const updatedData = JSON.parse(options.body);
      prods = prods.map(p => p.id === id ? { ...p, ...updatedData } : p);
      setLocalData('products', prods);
      return { success: true, data: updatedData };
    }

    return { success: true, data: prod || prods[0] };
  }

  if (path === '/auth/login') {
    const body = JSON.parse(options.body || '{}');
    const isOwnerAdmin = body.email === 'admin@example.com';
    const user = {
      id: isOwnerAdmin ? 'usr_admin' : 'usr_1',
      name: isOwnerAdmin ? 'Priya Patel (Admin)' : 'Aarav Sharma',
      email: body.email || 'user@example.com',
      role: isOwnerAdmin ? 'admin' : 'user',
      avatar: isOwnerAdmin ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    };
    return { success: true, user, token: 'jwt_token_demo_' + Date.now() };
  }

  if (path === '/auth/register') {
    const body = JSON.parse(options.body || '{}');
    const user = { id: 'usr_' + Date.now(), name: body.name || 'New User', email: body.email, role: 'user' };
    return { success: true, user, token: 'jwt_token_demo_' + Date.now() };
  }

  if (path === '/orders') {
    let orders = getLocalData('orders', FALLBACK_SEED.orders);
    if (method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      const newOrder = {
        ...body,
        id: `ORD-IND-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toISOString(),
        status: 'Placed',
        trackingNumber: `IN${Math.floor(100000000 + Math.random() * 900000000)}DEL`,
        estimatedDelivery: '3 Days'
      };
      orders.unshift(newOrder);
      setLocalData('orders', orders);
      return { success: true, data: newOrder };
    }
    return { success: true, data: orders };
  }

  if (path.includes('/status')) {
    const orderId = path.split('/')[2];
    const body = JSON.parse(options.body || '{}');
    let orders = getLocalData('orders', FALLBACK_SEED.orders);
    orders = orders.map(o => o.id === orderId ? { ...o, status: body.status } : o);
    setLocalData('orders', orders);
    return { success: true };
  }

  return { success: true, data: [] };
}

export const api = {
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    return request(`/products?${query.toString()}`);
  },

  async getProductById(id) {
    return request(`/products/${id}`);
  },

  async createProduct(productData) {
    return request('/products', { method: 'POST', body: JSON.stringify(productData) });
  },

  async updateProduct(id, productData) {
    return request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) });
  },

  async deleteProduct(id) {
    return request(`/products/${id}`, { method: 'DELETE' });
  },

  async getCategories() {
    return request('/categories');
  },

  async login(email, password) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },

  async register(name, email, password) {
    return request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  },

  async submitReview(productId, reviewData) {
    return request(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(reviewData) });
  },

  async getOrders(userId = '') {
    const query = userId ? `?userId=${userId}` : '';
    return request(`/orders${query}`);
  },

  async createOrder(orderData) {
    return request('/orders', { method: 'POST', body: JSON.stringify(orderData) });
  },

  async updateOrderStatus(orderId, status) {
    return request(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }
};
