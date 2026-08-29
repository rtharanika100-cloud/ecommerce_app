const { createContext, useContext, useState, useEffect } = React;
import { useToast } from './ToastContext.jsx';
import { useCart } from './CartContext.jsx';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('aura_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const { addToast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const toggleWishlist = (product) => {
    const exists = wishlistItems.some(item => item.id === product.id);
    if (exists) {
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
      if (addToast) addToast(`Removed "${product.title}" from Wishlist`, 'info');
    } else {
      setWishlistItems(prev => [...prev, product]);
      if (addToast) addToast(`Added "${product.title}" to Wishlist!`, 'success');
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const moveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveToCart
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
