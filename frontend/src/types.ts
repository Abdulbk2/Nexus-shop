export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Product {
  id?: number | string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  lowStock: Product[];
  monthlyRevenue: { month: string; revenue: number }[];
}
