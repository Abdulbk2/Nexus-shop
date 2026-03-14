import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const { token, clearCart } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId || !token) return;
      try {
        await axios.post('/api/checkout/success', { session_id: sessionId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        clearCart();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    confirmPayment();
  }, [sessionId, token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <h1 className="text-2xl font-bold">Confirming your order...</h1>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-8">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle size={48} />
      </motion.div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Order Confirmed!</h1>
        <p className="text-gray-500">Thank you for your purchase. Your order is being processed and will be shipped soon.</p>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Order ID</span>
          <span className="font-bold">#NX-{sessionId?.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Status</span>
          <span className="text-emerald-600 font-bold">Processing</span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
        >
          Continue Shopping <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
