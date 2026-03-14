import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as dbService from "../services/dbService.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "nexus-secret-key-123";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await dbService.createUser({ name, email, password: hashedPassword });
    const id = (user as any)._id || (user as any).id;
    const token = jwt.sign({ id, email: (user as any).email, role: (user as any).role }, JWT_SECRET);
    res.json({ token, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await dbService.getUser(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const id = user._id || user.id;
    const token = jwt.sign({ id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
