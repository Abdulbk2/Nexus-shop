import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Users, AlertTriangle, 
  TrendingUp, Plus, Trash2, Edit3, Loader2, Image as ImageIcon,
  MapPin, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils';
import { generateProductImage, getNearbyStores } from '../services/geminiService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', category: 'Electronics', stock: '', image_url: ''
  });
  const [generatingImage, setGeneratingImage] = useState(false);
  const [nearbyStores, setNearbyStores] = useState<any>(null);
  const [findingStores, setFindingStores] = useState(false);

  const fetchData = async () => {
    try {
      const [analyticsRes, productsRes] = await Promise.all([
        axios.get('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/products')
      ]);
      setAnalytics(analyticsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchData();
  }, [user]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/products', newProduct, { headers: { Authorization: `Bearer ${token}` } });
      setIsAdding(false);
      setNewProduct({ name: '', description: '', price: '', category: 'Electronics', stock: '', image_url: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleGenerateImage = async () => {
    if (!newProduct.name) return alert('Enter product name first');
    setGeneratingImage(true);
    try {
      const url = await generateProductImage(newProduct.name, "1K");
      if (url) setNewProduct({ ...newProduct, image_url: url });
    } catch (err) {
      alert('AI Image generation failed');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleFindStores = () => {
    setFindingStores(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const data = await getNearbyStores(pos.coords.latitude, pos.coords.longitude);
        setNearbyStores(data);
      } catch (err) {
        alert('Failed to find stores');
      } finally {
        setFindingStores(false);
      }
    });
  };

  const handleResetDB = async () => {
    if (!confirm('WARNING: This will delete all orders and reset products to default. Continue?')) return;
    try {
      await axios.post('/api/admin/reset-db', {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Database reset successfully');
      fetchData();
    } catch (err) {
      alert('Failed to reset database');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="text-center py-20">Access Denied</div>;
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  const chartData = {
    labels: analytics?.monthlyRevenue.map((m: any) => m.month) || [],
    datasets: [{
      label: 'Revenue',
      data: analytics?.monthlyRevenue.map((m: any) => m.revenue) || [],
      fill: true,
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4
    }]
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl"><TrendingUp size={24} /></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Sales</p>
          <h2 className="text-3xl font-bold">{formatPrice(analytics?.totalSales || 0)}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="p-3 bg-blue-50 text-blue-600 w-fit rounded-2xl"><ShoppingBag size={24} /></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
          <h2 className="text-3xl font-bold">{analytics?.totalOrders}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="p-3 bg-purple-50 text-purple-600 w-fit rounded-2xl"><Users size={24} /></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
          <h2 className="text-3xl font-bold">{analytics?.totalUsers}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="p-3 bg-orange-50 text-orange-600 w-fit rounded-2xl"><AlertTriangle size={24} /></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Low Stock</p>
          <h2 className="text-3xl font-bold">{analytics?.lowStock.length}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold">Revenue Overview</h3>
          <div className="h-[300px]">
            <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        {/* AI Tools */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold">AI Business Tools</h3>
          <div className="space-y-4">
            <button 
              onClick={handleFindStores}
              disabled={findingStores}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-black transition-all flex items-center gap-4 text-left group"
            >
              <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-black group-hover:text-white transition-all">
                {findingStores ? <Loader2 className="animate-spin" /> : <MapPin size={20} />}
              </div>
              <div>
                <p className="font-bold">Find Local Partners</p>
                <p className="text-xs text-gray-500">Use Maps Grounding to find stores</p>
              </div>
            </button>
            {nearbyStores && (
              <div className="text-xs p-4 bg-emerald-50 rounded-2xl text-emerald-800 space-y-2">
                <p className="font-bold">Nearby Locations Found:</p>
                <p>{nearbyStores.text}</p>
                {nearbyStores.places.map((chunk: any, i: number) => (
                  <a key={i} href={chunk.maps?.uri} target="_blank" className="block text-emerald-600 underline">
                    {chunk.maps?.title || 'View on Maps'}
                  </a>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-gray-50">
              <button 
                onClick={handleResetDB}
                className="w-full p-4 bg-red-50 text-red-600 rounded-2xl border border-transparent hover:border-red-200 transition-all flex items-center gap-4 text-left group"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-red-600 group-hover:text-white transition-all">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <p className="font-bold">Reset Database</p>
                  <p className="text-xs text-red-400">Clear all data and re-seed</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Management Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50">
          <h3 className="text-xl font-bold">Inventory Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Product</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4">Stock</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <span className="font-bold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-500">{p.category}</td>
                  <td className="px-8 py-4 font-bold">{formatPrice(p.price)}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.stock < 5 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {p.stock} in stock
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-black transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] p-10 max-w-2xl w-full shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">New Product</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Product Name</label>
                <input 
                  type="text" required
                  className="w-full p-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-black transition-all"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Category</label>
                <select 
                  className="w-full p-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-black transition-all"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                >
                  {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Price ($)</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full p-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-black transition-all"
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Stock</label>
                <input 
                  type="number" required
                  className="w-full p-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-black transition-all"
                  value={newProduct.stock}
                  onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700">Description</label>
                <textarea 
                  rows={3}
                  className="w-full p-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-black transition-all"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-bold text-gray-700">Product Image</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Image URL or generate with AI"
                    className="flex-1 p-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-black transition-all"
                    value={newProduct.image_url}
                    onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generatingImage}
                    className="bg-emerald-500 text-white px-6 rounded-2xl hover:bg-emerald-600 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {generatingImage ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
                    AI Generate
                  </button>
                </div>
                {newProduct.image_url && (
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border border-gray-100">
                    <img src={newProduct.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
              <div className="md:col-span-2 pt-4">
                <button className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all">
                  Create Product
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
