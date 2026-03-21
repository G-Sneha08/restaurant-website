# 🍽️ Lumina Dine - Restaurant Management System

[![Frontend Deployment](https://img.shields.io/badge/Vercel-Frontend-black?logo=vercel)](https://restaurant-website-umber-three.vercel.app/)
[![Backend Deployment](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render)](https://restaurant-backend-cli2.onrender.com/health)

A modern, full-stack, production-ready Restaurant Management Web Application. Designed for luxury dining experiences with a deep focus on stability, security, and performance.

## 📌 Sections
- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Visual Highlights](#-visual-highlights)
- [Local Installation](#-local-installation)
- [Deployment Info](#-deployment-info)

---

## 🌐 Live Demo
Experience the excellence here: [Lumina Dine Live Website](https://restaurant-website-umber-three.vercel.app/)

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & CSS3**: Custom vanilla design with glassmorphism and modern aesthetics.
- **JavaScript (Vanilla)**: High-performance core logic without heavy framework overhead.
- **Icons**: FontAwesome 6.5.1

### Backend
- **Node.js & Express.js**: Reliable server-side architecture.
- **MySQL2**: Scalable and relational database management.
- **JWT**: Secure session-less authentication.

### Infrastructure & Dev
- **Vercel**: High-speed frontend hosting.
- **Render**: Reliable backend compute.
- **Railway**: Managed MySQL database.
- **BcryptJS**: Advanced password hashing.

---

## ✨ Key Features

### 👤 User Excellence
- **Secure Authentication**: JWT-based login/register with hashed passwords and route protection.
- **Dynamic Menu**: Real-time menu updates from the database with category filtering.
- **Premium Order Flow**: Seamless cart management and order history tracking.
- **Table Reservations**: Advanced booking system with integrated guest tracking.
- **Aesthetic UI**: Smooth scroll reveals, responsive video empty states, and modern design.

### 🛡️ Admin Power
- **Intuitive Dashboard**: Real-time sales stats, active orders, and reservation metrics.
- **Catalog Management**: Full CRUD operations on restaurant menu items.
- **Order Control**: Complete status lifecycle management (Pending, Confirmed, Delivered, Cancelled).
- **User Management**: Unified view of all registered patrons.

---

## 📦 Local Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v14+)
- [MySQL](https://www.mysql.com/) server

### 2. Database Initialization
```bash
# Log into MySQL and run the schema file
mysql -u root -p < schema.sql
```

### 3. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_db
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4. Setup & Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🌐 Deployment Configuration

This project is configured for **Unified Deployment**:
- **Frontend**: Serves from `client/` directory.
- **Backend Entry**: `api/index.js` for Vercel Serverless Functions.
- **API Routing**: Configured via `vercel.json` for seamless frontend-backend communication.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

*Crafted with precision & culinary inspiration. Lumina Dine — Where Technology Meets Taste.*
