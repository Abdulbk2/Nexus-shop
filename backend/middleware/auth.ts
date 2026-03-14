import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nexus-secret-key-123";

export const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  next();
};
