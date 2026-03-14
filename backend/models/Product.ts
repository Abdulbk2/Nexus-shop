import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  image_url: { type: String },
  stock: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

export const Product = mongoose.model("Product", productSchema);
