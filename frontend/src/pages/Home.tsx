import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Plus, Star } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { addToCart } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/products?search=${search}&category=${category}`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-3xl overflow-hidden bg-black flex items-center px-12">
        <div className="absolute inset-0 opacity-50">
          <img 
            src="https://picsum.photos/seed/tech/1920/1080" 
            alt="Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white leading-tight"
          >
            Elevate Your <br /> <span className="text-emerald-400">Digital Life.</span>
          </motion.h1>
          <p className="text-gray-300 text-lg">
            Discover the next generation of premium electronics and lifestyle essentials.
          </p>
          <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all flex items-center gap-2">
            Shop Now <ShoppingBag size={20} />
          </button>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          <button 
            onClick={() => setCategory('')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${!category ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-300'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${category === cat ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-3xl p-4 space-y-4 animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-2xl" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <motion.div 
              key={product.id || product._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group bg-white rounded-3xl p-4 border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
                <img 
                  src={product.image_url || `https://picsum.photos/seed/${product.id || product._id}/400/400`} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {product.stock < 5 && product.stock > 0 && (
                  <span className="absolute top-2 left-2 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">
                    Low Stock
                  </span>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</p>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                  <button 
                    disabled={product.stock === 0}
                    onClick={() => addToCart(product)}
                    className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="text-gray-300 flex justify-center">
            <ShoppingBag size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-400">No products found</h2>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
