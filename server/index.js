const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'seed.json');

// In-memory data store with disk persistence
let db = {
  users: [],
  categories: [],
  products: [],
  reviews: [],
  orders: []
};

function loadDatabase() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      db = JSON.parse(raw);
      console.log(`[DB] Database loaded successfully (${db.products.length} products, ${db.users.length} users).`);
    } else {
      console.error(`[DB] Seed file not found at ${DATA_FILE}`);
    }
  } catch (err) {
    console.error('[DB] Error loading database:', err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Error saving database:', err);
  }
}

loadDatabase();

// CORS Headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Request Helper to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (!body) return resolve({});
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// MIME types for static server
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.ts': 'application/javascript; charset=utf-8',
  '.tsx': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(`[HTTP] ${req.method} ${pathname}`);

  // -------------------------------------------------------------
  // API ROUTER
  // -------------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    try {
      // 1. Authentication Endpoints
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const { email, password } = await parseJsonBody(req);
        const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
        if (!user || user.password !== password) {
          res.writeHead(401);
          res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
          return;
        }

        const token = 'jwt_token_' + crypto.randomBytes(16).toString('hex');
        const userClean = { ...user };
        delete userClean.password;

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, user: userClean, token }));
        return;
      }

      if (pathname === '/api/auth/register' && req.method === 'POST') {
        const { name, email, password } = await parseJsonBody(req);
        if (!name || !email || !password) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Name, email, and password are required' }));
          return;
        }

        const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Email is already registered' }));
          return;
        }

        const newUser = {
          id: 'usr_' + Date.now(),
          name,
          email,
          password,
          role: 'user',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
          address: '',
          phone: ''
        };

        db.users.push(newUser);
        saveDatabase();

        const token = 'jwt_token_' + crypto.randomBytes(16).toString('hex');
        const userClean = { ...newUser };
        delete userClean.password;

        res.writeHead(201);
        res.end(JSON.stringify({ success: true, user: userClean, token }));
        return;
      }

      // 2. Categories
      if (pathname === '/api/categories' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: db.categories }));
        return;
      }

      // 3. Products List & Filtering
      if (pathname === '/api/products' && req.method === 'GET') {
        let results = [...db.products];

        // Search Query
        if (query.q) {
          const qLower = query.q.toLowerCase();
          results = results.filter(p =>
            p.title.toLowerCase().includes(qLower) ||
            p.description.toLowerCase().includes(qLower) ||
            p.brand.toLowerCase().includes(qLower) ||
            p.category.toLowerCase().includes(qLower) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(qLower)))
          );
        }

        // Category Filter
        if (query.category && query.category !== 'all') {
          results = results.filter(p => p.category.toLowerCase() === query.category.toLowerCase());
        }

        // Min/Max Price
        if (query.minPrice) {
          results = results.filter(p => p.price >= parseFloat(query.minPrice));
        }
        if (query.maxPrice) {
          results = results.filter(p => p.price <= parseFloat(query.maxPrice));
        }

        // Min Rating
        if (query.minRating) {
          results = results.filter(p => p.rating >= parseFloat(query.minRating));
        }

        // In Stock Only
        if (query.inStock === 'true') {
          results = results.filter(p => p.inStock);
        }

        // Featured Only
        if (query.featured === 'true') {
          results = results.filter(p => p.isFeatured);
        }

        // Trending Only
        if (query.trending === 'true') {
          results = results.filter(p => p.isTrending);
        }

        // Sorting
        if (query.sort) {
          switch (query.sort) {
            case 'price-low':
              results.sort((a, b) => a.price - b.price);
              break;
            case 'price-high':
              results.sort((a, b) => b.price - a.price);
              break;
            case 'rating':
              results.sort((a, b) => b.rating - a.rating);
              break;
            case 'popular':
              results.sort((a, b) => b.reviewCount - a.reviewCount);
              break;
            case 'discount':
              results.sort((a, b) => (b.discount || 0) - (a.discount || 0));
              break;
            default:
              break;
          }
        }

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, total: results.length, data: results }));
        return;
      }

      // Single Product Details
      const productMatch = pathname.match(/^\/api\/products\/([a-zA-Z0-9_-]+)$/);
      if (productMatch && req.method === 'GET') {
        const prodId = productMatch[1];
        const prod = db.products.find(p => p.id === prodId);
        if (!prod) {
          res.writeHead(404);
          res.end(JSON.stringify({ success: false, message: 'Product not found' }));
          return;
        }

        const productReviews = db.reviews.filter(r => r.productId === prodId);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: { ...prod, reviewsList: productReviews } }));
        return;
      }

      // Add Product (Admin)
      if (pathname === '/api/products' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const newProduct = {
          id: 'prod_' + Date.now(),
          title: body.title || 'New Product',
          description: body.description || '',
          price: parseFloat(body.price) || 0,
          originalPrice: parseFloat(body.originalPrice) || parseFloat(body.price) || 0,
          discount: parseInt(body.discount) || 0,
          rating: 4.5,
          reviewCount: 0,
          category: body.category || 'electronics',
          brand: body.brand || 'Generic',
          inStock: body.inStock !== false,
          stockCount: parseInt(body.stockCount) || 10,
          isFeatured: !!body.isFeatured,
          isTrending: !!body.isTrending,
          images: body.images && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
          features: body.features || [],
          tags: body.tags || []
        };

        db.products.unshift(newProduct);
        saveDatabase();

        res.writeHead(201);
        res.end(JSON.stringify({ success: true, data: newProduct }));
        return;
      }

      // Update Product (Admin)
      if (productMatch && req.method === 'PUT') {
        const prodId = productMatch[1];
        const index = db.products.findIndex(p => p.id === prodId);
        if (index === -1) {
          res.writeHead(404);
          res.end(JSON.stringify({ success: false, message: 'Product not found' }));
          return;
        }

        const body = await parseJsonBody(req);
        db.products[index] = { ...db.products[index], ...body, id: prodId };
        saveDatabase();

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: db.products[index] }));
        return;
      }

      // Delete Product (Admin)
      if (productMatch && req.method === 'DELETE') {
        const prodId = productMatch[1];
        const index = db.products.findIndex(p => p.id === prodId);
        if (index === -1) {
          res.writeHead(404);
          res.end(JSON.stringify({ success: false, message: 'Product not found' }));
          return;
        }

        db.products.splice(index, 1);
        saveDatabase();

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Product deleted' }));
        return;
      }

      // 4. Submit Review
      const reviewMatch = pathname.match(/^\/api\/products\/([a-zA-Z0-9_-]+)\/reviews$/);
      if (reviewMatch && req.method === 'POST') {
        const prodId = reviewMatch[1];
        const { userName, rating, comment, title } = await parseJsonBody(req);
        
        const newReview = {
          id: 'rev_' + Date.now(),
          productId: prodId,
          userName: userName || 'Anonymous',
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
          rating: parseInt(rating) || 5,
          date: new Date().toISOString().split('T')[0],
          title: title || 'Great Product',
          comment: comment || ''
        };

        db.reviews.unshift(newReview);

        // Update product average rating
        const prod = db.products.find(p => p.id === prodId);
        if (prod) {
          const prodRevs = db.reviews.filter(r => r.productId === prodId);
          const sum = prodRevs.reduce((acc, r) => acc + r.rating, 0);
          prod.rating = parseFloat((sum / prodRevs.length).toFixed(1));
          prod.reviewCount = prodRevs.length;
        }

        saveDatabase();

        res.writeHead(201);
        res.end(JSON.stringify({ success: true, data: newReview }));
        return;
      }

      // 5. Orders
      if (pathname === '/api/orders' && req.method === 'GET') {
        let userOrders = [...db.orders];
        if (query.userId) {
          userOrders = userOrders.filter(o => o.userId === query.userId);
        }
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: userOrders }));
        return;
      }

      if (pathname === '/api/orders' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const newOrder = {
          id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
          userId: body.userId || 'usr_guest',
          customerName: body.customerName || 'Valued Customer',
          customerEmail: body.customerEmail || 'customer@example.com',
          date: new Date().toISOString(),
          items: body.items || [],
          shippingAddress: body.shippingAddress || {},
          paymentMethod: body.paymentMethod || 'Credit Card',
          subtotal: body.subtotal || 0,
          tax: body.tax || 0,
          shippingFee: body.shippingFee || 0,
          totalAmount: body.totalAmount || 0,
          status: 'Placed',
          trackingNumber: 'TRK' + Math.floor(100000000 + Math.random() * 900000000) + 'US',
          estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        db.orders.unshift(newOrder);
        saveDatabase();

        res.writeHead(201);
        res.end(JSON.stringify({ success: true, data: newOrder }));
        return;
      }

      // Order Status Update (Admin)
      const orderStatusMatch = pathname.match(/^\/api\/orders\/([a-zA-Z0-9_-]+)\/status$/);
      if (orderStatusMatch && req.method === 'PATCH') {
        const orderId = orderStatusMatch[1];
        const { status } = await parseJsonBody(req);
        const order = db.orders.find(o => o.id === orderId);

        if (!order) {
          res.writeHead(404);
          res.end(JSON.stringify({ success: false, message: 'Order not found' }));
          return;
        }

        order.status = status;
        saveDatabase();

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: order }));
        return;
      }

      // Default API Not Found
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, message: `Endpoint ${pathname} not found` }));
      return;

    } catch (apiErr) {
      console.error('[API ERROR]', apiErr);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
      return;
    }
  }

  // -------------------------------------------------------------
  // STATIC FILE SERVER FOR FRONTEND
  // -------------------------------------------------------------
  let filePath = path.join(__dirname, '..', pathname === '/' ? 'public/index.html' : pathname);

  // If path doesn't have an extension, try index.html for SPA routing fallback
  let ext = path.extname(filePath);
  if (!ext) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
      ext = '.html';
    } else {
      filePath = path.join(__dirname, '..', 'public/index.html');
      ext = '.html';
    }
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      // Fallback to public/index.html for SPA client routes
      const fallbackPath = path.join(__dirname, '..', 'public/index.html');
      fs.readFile(fallbackPath, (fbErr, fbContent) => {
        if (fbErr) {
          res.writeHead(404);
          res.end('404 File Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(fbContent);
        }
      });
    } else {
      const contentType = MIME_TYPES[ext] || 'text/plain';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 E-Commerce Server live at http://localhost:${PORT}`);
  console.log(`===================================================`);
});
