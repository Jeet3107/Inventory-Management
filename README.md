# 📦 Inventory Management System (MERN Stack)

A full-stack Inventory Management System built with MongoDB, Express.js, React, and Node.js.

## 🚀 Features
- JWT Authentication (Register / Login)
- Role-based access (Admin, Manager, Staff)
- Product CRUD with SKU, pricing, stock management
- Category management
- Low stock alerts
- Dashboard with charts & stats
- Pagination & filtering

## 📁 Project Structure
```
inventory-management/
├── backend/          # Express + MongoDB API
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── controllers/  # Business logic
│   └── middleware/   # Auth middleware
└── frontend/         # React app
    └── src/
        ├── pages/    # Page components
        ├── components/
        ├── context/  # Auth context
        └── utils/    # API helpers
```

## ⚙️ Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env     # Fill in your MongoDB URI and JWT secret
npm run dev              # Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start                # Runs on http://localhost:3000
```

## 🔐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/products | List products (search, filter, paginate) |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| PATCH | /api/products/:id/stock | Update stock |
| GET | /api/categories | List categories |
| POST | /api/categories | Create category |
| GET | /api/dashboard/stats | Dashboard statistics |

## 🛠️ Tech Stack
- **Frontend**: React 18, React Router v6, Axios, Recharts, React Toastify
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs
- **Database**: MongoDB
