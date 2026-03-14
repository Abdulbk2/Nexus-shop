import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/checkout', {
        items: cart.map(item => ({ id: item.id || item._id, quantity: item.quantity }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = res.data.url;
    } catch (err: any) {
      alert(err.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-32 space-y-6">
        <div className="flex justify-center text-gray-200">
          <ShoppingBag size={100} />
        </div>
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="text-gray-500 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <div className="space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div 
                key={item.id || item._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-4 rounded-3xl border border-gray-100 flex gap-6 items-center"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50">
                  <img 
                    src={item.image_url || `https://picsum.photos/seed/${item.id || item._id}/200/200`} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-emerald-600 font-bold">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                  <button 
                    onClick={() => updateCartQuantity(item.id || item._id as string, item.quantity - 1)}
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQuantity(item.id || item._id as string, item.quantity + 1)}
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id || item._id as string)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-xl font-bold">Order Summary</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Free</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={handleCheckout}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Checkout <ArrowRight size={20} /></>}
          </button>
          <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
