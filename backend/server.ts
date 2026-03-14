import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import adminRoutes from "./routes/admin.js";
import checkoutRoutes from "./routes/checkout.js";

// Models
import { User } from "./models/User.js";
import { Product } from "./models/Product.js";
import db from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// --- MongoDB Connection ---
let MONGODB_URI = process.env.MONGODB_URI;

// Clean up URI if user accidentally included brackets from templates
if (MONGODB_URI) {
  MONGODB_URI = MONGODB_URI.replace(/[<>]/g, "");
}

const isLocalhost = !MONGODB_URI || MONGODB_URI.includes("localhost") || MONGODB_URI.includes("127.0.0.1");

if (isLocalhost) {
  console.log("ℹ️ No remote MongoDB URI detected. Using local SQLite database (nexus.db).");
  console.log("💡 To use MongoDB Atlas, add MONGODB_URI to the Settings -> Secrets menu.");
  // Trigger seeding for SQLite immediately
  seedDb();
} else {
  const sanitizedUri = MONGODB_URI!.replace(/:([^@]+)@/, ":****@");
  console.log(`📡 Attempting to connect to MongoDB Atlas: ${sanitizedUri}`);
  
  mongoose.connect(MONGODB_URI!)
    .then(() => {
      console.log("✅ Connected to MongoDB successfully");
      seedDb();
    })
    .catch(err => {
      console.error("❌ MongoDB connection error:", err.message);
      console.log("⚠️ Falling back to local SQLite database (nexus.db).");
      seedDb();
    });
}

// --- Seeding ---
async function seedDb() {
  try {
    if (mongoose.connection.readyState === 1) {
      const adminExists = await User.findOne({ role: 'ADMIN' });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({
          name: "Admin User",
          email: "admin@nexus.com",
          password: hashedPassword,
          role: "ADMIN"
        });
        console.log("✅ MongoDB Admin seeded");
      }

      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        const seedProducts = [
          { name: "Nexus Pro X1", price: 1299.99, category: "Electronics", stock: 15, description: "Next-gen laptop with AI-accelerated processor.", image_url: "https://picsum.photos/seed/laptop/800/800" },
          { name: "Aero Buds", price: 199.99, category: "Electronics", stock: 50, description: "Crystal clear audio with active noise cancellation.", image_url: "https://picsum.photos/seed/buds/800/800" },
          { name: "Urban Stealth Hoodie", price: 89.99, category: "Fashion", stock: 3, description: "Premium tech-wear hoodie for the modern explorer.", image_url: "https://picsum.photos/seed/hoodie/800/800" },
          { name: "Zenith Smart Watch", price: 349.99, category: "Electronics", stock: 20, description: "Track your health and stay connected in style.", image_url: "https://picsum.photos/seed/watch/800/800" },
          { name: "Lumina Desk Lamp", price: 59.99, category: "Home", stock: 10, description: "Smart lighting with adjustable color temperature.", image_url: "https://picsum.photos/seed/lamp/800/800" }
        ];
        await Product.insertMany(seedProducts);
        console.log("✅ MongoDB Products seeded");
      }
    } else {
      // Seed SQLite
      const adminExists = db.prepare("SELECT * FROM users WHERE role = 'ADMIN'").get();
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run("Admin User", "admin@nexus.com", hashedPassword, "ADMIN");
        console.log("✅ SQLite Admin seeded");
      }
      const productCount = (db.prepare("SELECT COUNT(*) as count FROM products").get() as any).count;
      if (productCount === 0) {
        const seedProducts = [
          { name: "Nexus Pro X1", price: 1299.99, category: "Electronics", stock: 15, description: "Next-gen laptop with AI-accelerated processor.", image_url: "https://picsum.photos/seed/laptop/800/800" },
          { name: "Aero Buds", price: 199.99, category: "Electronics", stock: 50, description: "Crystal clear audio with active noise cancellation.", image_url: "https://picsum.photos/seed/buds/800/800" },
          { name: "Urban Stealth Hoodie", price: 89.99, category: "Fashion", stock: 3, description: "Premium tech-wear hoodie for the modern explorer.", image_url: "https://picsum.photos/seed/hoodie/800/800" },
          { name: "Zenith Smart Watch", price: 349.99, category: "Electronics", stock: 20, description: "Track your health and stay connected in style.", image_url: "https://picsum.photos/seed/watch/800/800" },
          { name: "Lumina Desk Lamp", price: 59.99, category: "Home", stock: 10, description: "Smart lighting with adjustable color temperature.", image_url: "https://picsum.photos/seed/lamp/800/800" }
        ];
        const insert = db.prepare("INSERT INTO products (name, price, category, stock, description, image_url) VALUES (?, ?, ?, ?, ?, ?)");
        for (const p of seedProducts) insert.run(p.name, p.price, p.category, p.stock, p.description, p.image_url);
        console.log("✅ SQLite Products seeded");
      }
    }
  } catch (err) {
    console.error("❌ Seeding error:", err);
  }
}

// --- Middleware ---
app.use(express.json());

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/checkout", checkoutRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("🔥 API Error:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message,
    tip: "Check if MongoDB is connected correctly in the server logs."
  });
});

// --- Frontend Serving ---
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({ 
      server: { middlewareMode: true }, 
      appType: "spa",
      root: path.join(__dirname, "../frontend")
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve from root dist (platform expectation)
    const distPath = path.join(__dirname, "../dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // If it's an API route that didn't match, don't serve index.html
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  
  // Only listen if not running on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
  }
}

startServer();

export default app;
