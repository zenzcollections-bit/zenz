# ZEN-Z COLLECTION — Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Razorpay keys and SMTP credentials
```

### 3. Add Your Razorpay Key to Frontend
In `index.html`, find this line and replace with your key:
```js
key: "rzp_test_YOUR_KEY_HERE",
```

### 4. Run the Server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Open: **http://localhost:3000**

---

## 🔑 Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Dashboard → Settings → API Keys
3. Generate Test Key (starts with `rzp_test_`)
4. Copy Key ID → paste in `.env` and `index.html`
5. Copy Key Secret → paste in `.env` only (NEVER in frontend)

**For Production:**
- Complete KYC on Razorpay dashboard
- Switch to Live keys (`rzp_live_`)
- Enable `/api/create-order` endpoint in frontend for proper order_id flow

---

## 📧 Email Setup (Gmail)

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Create an App Password for "Mail"
3. Use that 16-char password in `SMTP_PASS`

**For production:** Use SendGrid, Mailgun, or AWS SES instead of Gmail.

---

## 🖼️ Adding Your 3 Product Images

Each product shows 3 image slides. To replace the emoji placeholders:

In `index.html`, find the product data and update the `em` array:
```js
// Current (emoji placeholders):
em:["🌑","🌒","🌓"]

// Replace with your image paths:
images:["img/jacket-front.jpg","img/jacket-back.jpg","img/jacket-detail.jpg"]
```

Then in the render function, change:
```js
// From:
`<div class="pi-slide">${e}</div>`

// To:
`<div class="pi-slide"><img src="${e}" style="width:100%;height:100%;object-fit:cover"></div>`
```

Place your images in an `img/` folder next to `index.html`.

---

## 📁 File Structure
```
zen-z-collection/
├── index.html        ← Frontend (complete website)
├── server.js         ← Backend (Express + Razorpay + Email)
├── package.json      ← Dependencies
├── .env.example      ← Environment template
├── .env              ← Your actual keys (create this)
└── img/              ← Your product images (create this)
```

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/create-order` | Create Razorpay order |
| POST | `/api/verify-payment` | Verify payment signature |
| POST | `/api/send-order-email` | Send confirmation email |
| GET  | `/api/health` | Server health check |

---

## 💳 Payment Flow

```
User clicks "Pay with Razorpay"
    ↓
Frontend calls /api/create-order (get order_id)
    ↓
Razorpay Checkout opens (UPI/Cards/Wallets/EMI)
    ↓
User completes payment
    ↓
Frontend calls /api/verify-payment
    ↓
Backend calls /api/send-order-email
    ↓
Customer gets confirmation email ✦
```

---

Built with ♥ for ZEN-Z Collection
