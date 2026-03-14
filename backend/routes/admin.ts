import express from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { authenticate, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/reset-db", authenticate, isAdmin, async (req, res) => {
  try {
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({ role: { $ne: 'ADMIN' } });
    
    const seedProducts = [
      { name: "Nexus Pro X1", price: 1299.99, category: "Electronics", stock: 15, description: "Next-gen laptop with AI-accelerated processor.", image_url: "https://picsum.photos/seed/laptop/800/800" },
      { name: "Aero Buds", price: 199.99, category: "Electronics", stock: 50, description: "Crystal clear audio with active noise cancellation.", image_url: "https://picsum.photos/seed/buds/800/800" },
      { name: "Urban Stealth Hoodie", price: 89.99, category: "Fashion", stock: 3, description: "Premium tech-wear hoodie for the modern explorer.", image_url: "https://picsum.photos/seed/hoodie/800/800" },
      { name: "Zenith Smart Watch", price: 349.99, category: "Electronics", stock: 20, description: "Track your health and stay connected in style.", image_url: "https://picsum.photos/seed/watch/800/800" },
      { name: "Lumina Desk Lamp", price: 59.99, category: "Home", stock: 10, description: "Smart lighting with adjustable color temperature.", image_url: "https://picsum.photos/seed/lamp/800/800" }
    ];
    await Product.insertMany(seedProducts);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/analytics", authenticate, isAdmin, async (req, res) => {
  try {
    const totalSalesRes = await Order.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const lowStock = await Product.find({ stock: { $lt: 5 } });
    
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          revenue: { $sum: "$total_amount" }
      }},
      { $sort: { _id: -1 } },
      { $limit: 6 },
      { $project: { month: "$_id", revenue: 1, _id: 0 } }
    ]);

    res.json({
      totalSales: totalSalesRes[0]?.total || 0,
      totalOrders,
      totalUsers,
      lowStock,
      monthlyRevenue: monthlyRevenue.reverse()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
