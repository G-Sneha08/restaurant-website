# 🍽️ Lumina Dine — Restaurant Management System

**Streamlining dining experiences with a modern, responsive, and secure restaurant management system.**

---

## 🌟 Overview

Lumina Dine is a full-stack restaurant management web application designed to provide a seamless dining experience.

Customers can browse menus, place orders, book tables, and submit feedback, while administrators can manage all operations efficiently through a dedicated admin panel.

---

## 🌐 Live Demo

- **Frontend (User Interface):**  
  [https://restaurant-website-umber-three.vercel.app/](https://restaurant-website-umber-three.vercel.app/)

- **Backend API (Health Check):**  
  [https://restaurant-backend-cli2.onrender.com/health](https://restaurant-backend-cli2.onrender.com/health)

- **Local Development (when running locally):**  
  [http://localhost:5000](http://localhost:5000)

⚠️ **Note:**  
- Backend link returns API status (not a UI page)  
- Local link works only when the project is running on your system

---

## 🛠️ Tech Stack

**Frontend**  
- HTML5  
- CSS3 (Modern UI with glassmorphism design)  
- JavaScript (Vanilla)

**Backend**  
- Node.js  
- Express.js

**Database**  
- MySQL (Railway – Production)  
- MySQL (Local – Development)

**Security**  
- JWT Authentication  
- BcryptJS (Password Hashing)

---

## ✨ Key Features

### 👤 User Features
- 🔐 User Registration & Login  
- 🍽️ Dynamic Menu Browsing  
- 🛒 Add to Cart & Place Orders  
- 📦 Order History Tracking  
- 📅 Table Booking System  
- 💬 Feedback Submission  
- 🎨 Responsive and aesthetic UI  

### 🛡️ Admin Features
- 🧑💼 Admin Panel Dashboard  
- 🍴 Menu Management (Add / Update / Delete items)  
- 📦 Order Status Management  
- 🪑 Table Booking Management  
- 💬 Feedback Monitoring  
- 👥 User Management  

---

## ⚙️ Local Setup

1️⃣ **Clone Repository**  
```bash
git clone https://github.com/G-Sneha08/restaurant-website.git
cd restaurant-website
```

2️⃣ **Install Dependencies**  
```bash
node server/server.js
npm install
```

3️⃣ **Setup Environment Variables**  
Create a `.env` file using `.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_db

JWT_SECRET=your_secret_key

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:5000
```

4️⃣ **Setup Database**  
```sql
CREATE DATABASE restaurant_db;
mysql -u root -p restaurant_db < schema.sql
```

5️⃣ **Run the Project**  
```bash
npm run dev
```

---

## 🔄 Environment Configuration

| Environment | Database |
| :--- | :--- |
| **Local** | `restaurant_db` |
| **Production** | `Railway` |

---

## 🚀 Deployment

- **Frontend** → Vercel  
- **Backend** → Render  
- **Database** → Railway  

---

## 🔐 Security

- `.env` file is excluded using `.gitignore`  
- Sensitive credentials are not exposed  
- Passwords are securely hashed using Bcrypt  
- JWT is used for authentication  

---

## 💡 Key Highlights

- 💼 Full-stack real-world application  
- 🔐 Secure authentication system  
- ⚙️ Admin-controlled operations  
- 🌐 Fully deployed and production-ready  
- 🧠 Solves real-world issues (API, DB, deployment)  

---

## 📄 License

This project is licensed under the MIT License.  
You are free to use, modify, and distribute this project while including the license notice.

---

### ✨ Tagline

**“Lumina Dine — Where Technology Meets Taste.”**
