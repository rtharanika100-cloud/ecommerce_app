const { createContext, useContext, useState, useEffect } = React;
import { useToast } from './ToastContext.jsx';
import { formatINR } from '../utils/formatters.js';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('aura_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity }];
      }
    });

    if (addToast) {
      addToast(`Added "${product.title}" to your cart!`, 'success');
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    if (addToast) {
      addToast('Item removed from cart', 'info');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'DIWALI20' || cleanCode === 'AURA20') {
      setCoupon({ code: cleanCode, discountPercent: 20 });
      if (addToast) addToast('Diwali Special Coupon Applied: 20% OFF!', 'success');
      return true;
    } else if (cleanCode === 'FREESHIP') {
      setCoupon({ code: cleanCode, discountPercent: 10 });
      if (addToast) addToast('Coupon Applied: 10% OFF!', 'success');
      return true;
    } else {
      if (addToast) addToast('Invalid coupon. Try "DIWALI20"', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Computations
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const couponDiscount = coupon ? (subtotal * coupon.discountPercent) / 100 : 0;
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);

  // Delivery Charges: Free over ₹499 else ₹50
  const shippingFee = subtotalAfterCoupon >= 499 || cartItems.length === 0 ? 0 : 50;
  const tax = subtotalAfterCoupon * 0.18; // 18% GST simulation
  const total = subtotalAfterCoupon + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        coupon,
        couponDiscount,
        shippingFee,
        tax,
        total,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
