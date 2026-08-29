const fs = require('fs');
const path = require('path');

const fileOrder = [
  'src/utils/formatters.js',
  'src/services/api.js',
  'src/context/ThemeContext.jsx',
  'src/context/ToastContext.jsx',
  'src/context/AuthContext.jsx',
  'src/context/CartContext.jsx',
  'src/context/WishlistContext.jsx',
  'src/components/Navbar.jsx',
  'src/components/Footer.jsx',
  'src/components/HeroCarousel.jsx',
  'src/components/ProductCard.jsx',
  'src/components/FilterSidebar.jsx',
  'src/components/CartDrawer.jsx',
  'src/components/ReviewSection.jsx',
  'src/components/CheckoutWizard.jsx',
  'src/components/AdminProductModal.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/ProductListPage.jsx',
  'src/pages/ProductDetailPage.jsx',
  'src/pages/CartPage.jsx',
  'src/pages/WishlistPage.jsx',
  'src/pages/CheckoutPage.jsx',
  'src/pages/OrdersPage.jsx',
  'src/pages/AdminDashboardPage.jsx',
  'src/pages/LoginPage.jsx',
  'src/pages/RegisterPage.jsx',
  'src/App.jsx',
  'src/main.jsx'
];

let combinedCode = `// AURA E-Commerce Bundled Application\n`;
combinedCode += `const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext } = React;\n`;

for (const relPath of fileOrder) {
  const fullPath = path.join(__dirname, '..', relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Clean import & export statements & duplicate React destructuring
    content = content
      .replace(/^import\s+.*?;?\s*$/gm, '')
      .replace(/^export\s+default\s+/gm, '')
      .replace(/^export\s+(const|function|class|let|var)\s+/gm, '$1 ')
      .replace(/^const\s+\{.*?\}\s*=\s*React;\s*$/gm, '');

    combinedCode += `\n/* --- File: ${relPath} --- */\n` + content + '\n';
  } else {
    console.warn(`[BUILD WARNING] File missing: ${relPath}`);
  }
}

const outputPath = path.join(__dirname, '..', 'public', 'app.jsx');
fs.writeFileSync(outputPath, combinedCode, 'utf8');
console.log(`[BUILD SUCCESS] Bundle created cleanly at ${outputPath} (${(combinedCode.length / 1024).toFixed(1)} KB)`);
