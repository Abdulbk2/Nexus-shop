import express from "express";
import * as dbService from "../services/dbService.js";
import { Product } from "../models/Product.js";
import { authenticate, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { search, category } = req.query;
  try {
    const products = await dbService.getProducts({ search, category });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
