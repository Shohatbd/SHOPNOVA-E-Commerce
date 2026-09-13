import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types/index.ts';
import { api } from '../services/api.ts';
import { tracker } from '../utils/analytics.ts';
import { useSettings } from './SettingsContext.tsx';

interface AppliedCoupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
  min_order_amount: number;
  description_en?: string;
  description_bn?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  grandTotal: number;
  appliedCoupon: AppliedCoupon | null;
  shippingZone: 'inside' | 'outside';
  setShippingZone: (zone: 'inside' | 'outside') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  clearCart: () => void;
  freeShippingProgress: number;
  amountNeededForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shophatbd_cart') || localStorage.getItem('shopnova_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('shophatbd_coupon') || localStorage.getItem('shopnova_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [shippingZone, setShippingZone] = useState<'inside' | 'outside'>('inside');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('shophatbd_cart', JSON.stringify(items));
    localStorage.setItem('shopnova_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('shophatbd_coupon', JSON.stringify(appliedCoupon));
      localStorage.setItem('shopnova_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('shophatbd_coupon');
      localStorage.removeItem('shopnova_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.product_id === product.id && (variant ? it.variant_id === variant.id : !it.variant_id)
      );

      const unitPrice = (product.sale_price ?? product.regular_price) + (variant?.price_adjustment ?? 0);
      const maxStock = variant ? variant.stock_quantity : product.stock_quantity;

      if (existingIdx > -1) {
        const existing = prev[existingIdx];
        const newQty = Math.min(maxStock, existing.quantity + quantity);
        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          total_price: unitPrice * newQty
        };
        return updated;
      } else {
        const initialQty = Math.min(maxStock, quantity);
        return [
          ...prev,
          {
            product_id: product.id,
            variant_id: variant?.id,
            product,
            variant,
            quantity: initialQty,
            unit_price: unitPrice,
            total_price: unitPrice * initialQty
          }
        ];
      }
    });

    try {
      tracker.trackAddToCart(product, quantity, variant);
    } catch (e) {
      console.warn('Track AddToCart note:', e);
    }

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    const itemToRemove = items.find(
      (it) => it.product_id === productId && (variantId ? it.variant_id === variantId : !it.variant_id)
    );
    if (itemToRemove) {
      try {
        tracker.trackRemoveFromCart(itemToRemove.product, itemToRemove.quantity, itemToRemove.variant);
      } catch (e) {}
    }

    setItems((prev) =>
      prev.filter((it) => !(it.product_id === productId && (variantId ? it.variant_id === variantId : !it.variant_id)))
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems((prev) =>
      prev.map((it) => {
        if (it.product_id === productId && (variantId ? it.variant_id === variantId : !it.variant_id)) {
          const maxStock = it.variant ? it.variant.stock_quantity : it.product.stock_quantity;
          const finalQty = Math.min(maxStock, quantity);
          return {
            ...it,
            quantity: finalQty,
            total_price: it.unit_price * finalQty
          };
        }
        return it;
      })
    );
  };

  const applyCoupon = async (code: string) => {
    const rawSubtotal = items.reduce((acc, item) => acc + item.total_price, 0);
    try {
      const res = await api.validateCoupon({ code, subtotal: rawSubtotal });
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Invalid coupon code.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to apply coupon.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.total_price, 0);

  const { settings } = useSettings();

  const rawThreshold = Number(settings.free_shipping_threshold);
  const freeShippingThreshold = !isNaN(rawThreshold) && rawThreshold > 0 ? rawThreshold : 2500;
  const insideRate = Number(settings.shipping_inside_dhaka) || 60;
  const outsideRate = Number(settings.shipping_outside_dhaka) || 120;
  const baseShipping = shippingZone === 'inside' ? insideRate : outsideRate;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = items.length === 0 ? 0 : isFreeShipping ? 0 : baseShipping;

  let calculatedDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.min_order_amount) {
    if (appliedCoupon.discount_type === 'percentage') {
      calculatedDiscount = Math.round((subtotal * appliedCoupon.discount_value) / 100);
      if (appliedCoupon.max_discount_amount && calculatedDiscount > appliedCoupon.max_discount_amount) {
        calculatedDiscount = appliedCoupon.max_discount_amount;
      }
    } else {
      calculatedDiscount = appliedCoupon.discount_value;
    }
  }

  const grandTotal = Math.max(0, subtotal - calculatedDiscount + shippingCost);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount: calculatedDiscount,
        shippingCost,
        grandTotal,
        appliedCoupon,
        shippingZone,
        setShippingZone,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        freeShippingProgress,
        amountNeededForFreeShipping
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
