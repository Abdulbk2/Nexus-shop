import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Search, Menu, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import Success from './pages/Success';
import ChatBot from './components/ChatBot';

const Navbar = () => {
  const { user, logout, cart } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="font-bold text-xl tracking-tight">NEXUS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Shop</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1">
                <LayoutDashboard size={16} /> Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-black transition-colors">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={() => { logout(); navigate('/'); }} className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all">
                Login
              </Link>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 py-6 flex flex-col gap-4"
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Shop</Link>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium flex justify-between">
              Cart <span>({cart.length})</span>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Admin Dashboard</Link>
            )}
            {user ? (
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-lg font-medium text-red-600 text-left">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Login</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#F9F9F9] text-gray-900 font-sans">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/success" element={<Success />} />
            </Routes>
          </main>
          <ChatBot />
        </div>
      </Router>
    </AuthProvider>
  );
}
