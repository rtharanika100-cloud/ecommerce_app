const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('aura_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (err) {
    console.warn(`[API Call Error: ${endpoint}]`, err.message);
    throw err;
  }
}

export const api = {
  // Products
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
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  async deleteProduct(id) {
    return request(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Categories
  async getCategories() {
    return request('/categories');
  },

  // Auth
  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(name, email, password) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  // Reviews
  async submitReview(productId, reviewData) {
    return request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },

  // Orders
  async getOrders(userId = '') {
    const query = userId ? `?userId=${userId}` : '';
    return request(`/orders${query}`);
  },

  async createOrder(orderData) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async updateOrderStatus(orderId, status) {
    return request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};
