import express from "express";
import Stripe from "stripe";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, async (req: any, res) => {
  const { items } = req.body;
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "Stripe secret key not configured" });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const lineItems = [];
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.id);
      if (!product || product.stock < item.quantity) throw new Error(`Insufficient stock for ${product?.name || 'unknown product'}`);
      
      lineItems.push({
        price_data: { 
          currency: "usd", 
          product_data: { name: product.name }, 
          unit_amount: Math.round(product.price * 100) 
        },
        quantity: item.quantity,
      });
      
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/cart`,
    });

    await Order.create({
      user: req.user.id,
      total_amount: totalAmount,
      stripe_session_id: session.id,
      items: orderItems
    });

    res.json({ id: session.id, url: session.url });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.post("/success", authenticate, async (req, res) => {
  const { session_id } = req.body;
  try {
    const order = await Order.findOne({ stripe_session_id: session_id });
    if (order && order.status === 'PENDING') {
      order.status = 'COMPLETED';
      await order.save();
      
      for (const item of order.items) {
        if (item.product && item.quantity) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
      }
      res.json({ success: true });
    } else res.status(400).json({ error: "Order already processed or not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
