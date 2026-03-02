<<<<<<< HEAD
z# Lumina Dine - Restaurant Management System
=======
# Lumina Dine - Restaurant Management System
>>>>>>> 5cc34f09652c928b31cdd89313c065a5f7fd6b40

A full-stack, production-ready Restaurant Management Web Application built with Node.js, Express, MySQL, and Vanilla JavaScript.

## 🚀 Features

- **User Authentication**: Secure JWT-based login and registration with bcrypt password hashing.
- **Dynamic Menu**: Categorized menu items fetched from MySQL.
- **Shopping Cart**: Real-time cart updates (Add/Remove/Update Quantity).
- **Order Management**: Transaction-based order placement and history.
- **Table Booking**: Reservation system with date/time selection.
- **Feedback System**: User ratings and testimonials.
- **Admin Dashboard**:
    - Manage all users.
    - View and update order statuses (Pending, Confirmed, Delivered, Cancelled).
    - CRUD operations on Menu items.
    - View customer feedback.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Security**: JWT, Bcrypt, Helmet, CORS, Dotenv

## 📦 Setup Instructions

### 1. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench or Terminal).
2. Run the commands in `schema.sql` to create the database and tables.

### 2. Environment Variables
Create a `.env` file in the root directory and add the following:
```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=restaurant_db
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### 3. Installation
```bash
npm install
```

### 4. Running the App
```bash
# Production mode
npm start

# Development mode (requires nodemon)
npm run dev
```

The application will be available at `http://localhost:5000`.

## 🌐 Deployment Guide (Render/Railway)

1. Push your code to a GitHub repository.
2. Connect your repository to Render/Railway.
3. Add the environment variables in the platform's dashboard.
4. Set the Build Command to `npm install`.
5. Set the Start Command to `npm start`.
6. Ensure your MySQL database is accessible from the deployment environment (use a managed DB like PlanetScale or Aiven for production).

## 📄 License
MIT License
