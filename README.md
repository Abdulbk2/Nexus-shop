# Nexus Shop 🚀

Nexus Shop is a professional, full-stack e-commerce platform designed for modern digital commerce. It features a sleek, responsive UI, robust inventory management, secure payments via Stripe, and an AI-powered shopping assistant.

## ✨ Features

- **🛍️ Premium Shopping Experience**: Modern, fluid UI built with React and Framer Motion.
- **🤖 AI Shopping Assistant**: Integrated ChatBot powered by Google Gemini for personalized product recommendations.
- **💳 Secure Checkout**: Full Stripe integration for safe and reliable payments.
- **🛠️ Admin Dashboard**: Comprehensive management tools for products, inventory, and orders.
- **💾 Hybrid Database Support**: Seamlessly switches between MongoDB Atlas (production) and SQLite (local development/fallback).
- **🔐 Secure Authentication**: JWT-based authentication with role-based access control (User/Admin).
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices.

## 🚀 Tech Stack

- **Frontend**: React 19, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: MongoDB (Mongoose) & SQLite (Better-SQLite3).
- **AI**: Google Gemini API (@google/genai).
- **Payments**: Stripe API.
- **Storage**: Cloudinary (for product images).

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB Atlas account (optional, fallback to SQLite available)
- Stripe account (for payments)
- Google AI Studio API Key (for the ChatBot)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Abdulbk2/Nexus.git
   cd Nexus
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key
   GEMINI_API_KEY=your_gemini_api_key
   CLOUDINARY_URL=your_cloudinary_url
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 📝 License

This project is licensed under the MIT License.

---
Built with ❤️ by [Abdulbk2](https://github.com/Abdulbk2)
