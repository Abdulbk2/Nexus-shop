import db from "../db.js";
import { Product as MongooseProduct } from "../models/Product.js";
import { User as MongooseUser } from "../models/User.js";
import { Order as MongooseOrder } from "../models/Order.js";
import mongoose from "mongoose";

export const isMongoConnected = () => mongoose.connection.readyState === 1;

export const getProducts = async (filter: any) => {
  if (isMongoConnected()) {
    const mongoFilter: any = {};
    if (filter.search) mongoFilter.name = { $regex: filter.search, $options: 'i' };
    if (filter.category) mongoFilter.category = filter.category;
    return await MongooseProduct.find(mongoFilter);
  } else {
    if (!db) throw new Error("Database not initialized. Please provide MONGODB_URI.");
    let query = "SELECT * FROM products WHERE 1=1";
    const params: any[] = [];
    if (filter.search) {
      query += " AND name LIKE ?";
      params.push(`%${filter.search}%`);
    }
    if (filter.category) {
      query += " AND category = ?";
      params.push(filter.category);
    }
    return db.prepare(query).all(...params);
  }
};

export const getUser = async (email: string) => {
  if (isMongoConnected()) {
    return await MongooseUser.findOne({ email });
  } else {
    if (!db) throw new Error("Database not initialized. Please provide MONGODB_URI.");
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  }
};

export const createUser = async (userData: any) => {
  if (isMongoConnected()) {
    return await MongooseUser.create(userData);
  } else {
    if (!db) throw new Error("Database not initialized. Please provide MONGODB_URI.");
    const stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    const info = stmt.run(userData.name, userData.email, userData.password, userData.role || 'USER');
    return { ...userData, id: info.lastInsertRowid };
  }
};
