# ShopWave 🛒

A full-stack e-commerce web application built with React, Node.js, Express, and MongoDB. Users can browse products, filter by category and price, manage a cart, and securely checkout with Stripe payments.

---

## 🚀 Live Demo

- **Frontend:** [shopwave.netlify.app](https://shopwave.netlify.app)
- **Backend API:** [shopwave-api.onrender.com](https://shopwave-api.onrender.com)

---

## ✨ Features

- 🔐 User authentication with JWT (register, login, protected routes)
- 🛍️ Product browsing with search, category filter, and price range filter
- 📦 Shopping cart with quantity controls and real-time updates
- 💳 Secure payment integration via Stripe
- 📋 Order history and order tracking
- 🔑 Admin panel to manage products and view all orders
- 📱 Fully responsive design

---

## 🛠️ Tech Stack

**Frontend**
- React 18 (Vite)
- React Router v6
- Stripe React Elements
- Context API for state management

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcrypt for password hashing
- Stripe API

**Deployment**
- Frontend → Netlify
- Backend → Render
- Database → MongoDB Atlas

---

## 📁 Project Structure

```
shopwave/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   └── main.jsx
│   ├── .env
│   └── netlify.toml
│
└── server/                 # Node.js backend
    ├── controllers/
    ├── middleware/         # JWT auth middleware
    ├── models/             # Mongoose models
    ├── routes/             # Express routes
    ├── .env.example
    └── server.js
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Stripe account

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/shopwave.git
cd shopwave
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd client
npm install
```

Create a `.env` file in `/client`:

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

Start the frontend:

```bash
npm run dev
```

### 4. Open in browser

```
http://localhost:5173
```

---

## 🧪 Stripe Test Card

Use this card number to test payments locally:

```
Card Number : 4242 4242 4242 4242
Expiry      : Any future date
CVC         : Any 3 digits
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (supports filters) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin only) |
| PUT | `/api/products/:id` | Update product (admin only) |
| DELETE | `/api/products/:id` | Delete product (admin only) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update` | Update item quantity |
| DELETE | `/api/cart/remove/:productId` | Remove item |
| DELETE | `/api/cart/clear` | Clear entire cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/create` | Place new order |
| GET | `/api/orders/my-orders` | Get user orders |
| GET | `/api/orders/:id` | Get single order |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-intent` | Create Stripe payment intent |

---

## 🚢 Deployment

### Backend on Render
1. Push `/server` to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set environment variables (same as `.env`)
4. Deploy

### Frontend on Netlify
1. Push `/client` to GitHub
2. Create a new site on [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variables: `VITE_API_URL`, `VITE_STRIPE_PUBLIC_KEY`

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙋‍♂️ Author

Built by **[Your Name]** — feel free to connect on [LinkedIn](https://linkedin.com) or follow on [GitHub](https://github.com/yourusername).
