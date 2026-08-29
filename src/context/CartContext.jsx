const { createContext, useContext, useState, useEffect } = React;
import { useToast } from './ToastContext.jsx';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('aura_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null); // { code, discountPercent }
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
    if (cleanCode === 'AURA20' || cleanCode === 'PROMO20') {
      setCoupon({ code: cleanCode, discountPercent: 20 });
      if (addToast) addToast('Coupon code applied: 20% OFF!', 'success');
      return true;
    } else if (cleanCode === 'WELCOME10') {
      setCoupon({ code: cleanCode, discountPercent: 10 });
      if (addToast) addToast('Coupon code applied: 10% OFF!', 'success');
      return true;
    } else {
      if (addToast) addToast('Invalid promo code. Try "AURA20"', 'error');
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

  const rawSavings = cartItems.reduce(
    (sum, item) =>
      sum + ((item.product.originalPrice || item.product.price) - item.product.price) * item.quantity,
    0
  );

  const couponDiscount = coupon ? (subtotal * coupon.discountPercent) / 100 : 0;
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);

  const shippingFee = subtotalAfterCoupon > 100 || cartItems.length === 0 ? 0 : 9.99;
  const tax = subtotalAfterCoupon * 0.08; // 8% estimated sales tax
  const total = subtotalAfterCoupon + shippingFee + tax;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        rawSavings,
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
