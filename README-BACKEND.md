# ZEN-Z Collection — Backend Setup Guide

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017/zenz-collection
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zenz-collection

# Email (Gmail SMTP)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Gmail App Password Setup

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Generate an app password (16-character code)
4. Use this code as `SMTP_PASS` in `.env`

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community
# macOS: brew install mongodb-community
# Then start: brew services start mongodb-community

# Default connection: mongodb://localhost:27017/zenz-collection
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/zenz-collection`

---

## 🚀 Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will run on `http://localhost:3001`

---

## 📡 API Endpoints

### 1. Create Order
**POST** `/api/orders/create-order`

**Request:**
```json
{
  "items": [
    {
      "name": "VOID JACKET",
      "size": "M",
      "qty": 1,
      "price": 4999
    }
  ],
  "total": 4999,
  "email": "customer@example.com",
  "name": "John Doe",
  "phone": "+91 98765 43210",
  "address": "123 Street Name",
  "city": "Mumbai",
  "pincode": "400001"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "ZNZ9L8K7M6N5P4",
  "amount": 499900,
  "message": "Order created successfully"
}
```

---

### 2. Send Confirmation Email
**POST** `/api/send-order-email`

**Request:**
```json
{
  "orderId": "ZNZ9L8K7M6N5P4",
  "name": "John Doe",
  "email": "customer@example.com",
  "items": [
    {
      "name": "VOID JACKET",
      "size": "M",
      "qty": 1,
      "price": 4999
    }
  ],
  "total": 4999,
  "paymentId": "pay_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Confirmation email sent"
}
```

---

### 3. Get Order by ID
**GET** `/api/orders/:orderId`

**Response:**
```json
{
  "_id": "...",
  "orderId": "ZNZ9L8K7M6N5P4",
  "items": [...],
  "total": 4999,
  "email": "customer@example.com",
  "status": "confirmed",
  "createdAt": "2025-08-03T10:30:00Z"
}
```

---

### 4. Update Order Status (Admin)
**PATCH** `/api/orders/:orderId`

**Request:**
```json
{
  "status": "shipped"
}
```

---

### 5. List All Orders (Admin)
**GET** `/api/orders`

**Response:**
```json
[
  {
    "orderId": "ZNZ9L8K7M6N5P4",
    "name": "John Doe",
    "total": 4999,
    "status": "confirmed",
    "createdAt": "2025-08-03T10:30:00Z"
  },
  ...
]
```

---

### 6. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "Server is running ✓",
  "timestamp": "2025-08-03T10:30:00Z"
}
```

---

## 🔄 Frontend Integration

Replace the `<script>` section in `index.html` with the code from `frontend-updated.js`.

Key changes:
- `initiateRazorpay()` now creates order via backend
- Order ID is generated on server (guaranteed unique)
- Email confirmation is sent automatically
- Order data is persisted in MongoDB

---

## 📊 Order Status Flow

```
pending → confirmed → shipped → delivered
```

---

## 🧪 Testing with cURL

### Test API
```bash
curl http://localhost:3001/api/health
```

### Create Test Order
```bash
curl -X POST http://localhost:3001/api/orders/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"name": "Test Item", "size": "M", "qty": 1, "price": 999}],
    "total": 999,
    "email": "test@test.com",
    "name": "Test User",
    "phone": "+91 98765 43210",
    "address": "Test Address",
    "city": "Test City",
    "pincode": "100001"
  }'
```

---

## 🐛 Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify IP whitelist on MongoDB Atlas

**Email Not Sending**
- Enable "Less secure app access" in Gmail (or use App Password)
- Check `SMTP_USER` and `SMTP_PASS` in `.env`
- Verify internet connection

**Order Not Created**
- Check all required fields are sent
- Look at server console for error messages
- Verify MongoDB is connected

---

## 🚢 Deployment

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS=your-app-password
```

### Vercel
1. Connect GitHub repo to Vercel
2. Add environment variables in project settings
3. Set build command: `npm install`
4. Set start command: `npm start`

---

## 📝 License
MIT © 2025 ZEN-Z Collection
