// ╔══════════════════════════════════════════════════╗
// ║   ZEN-Z COLLECTION — Backend Server              ║
// ║   Express.js + Nodemailer + MongoDB              ║
// ╚══════════════════════════════════════════════════╝

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ─────────────────────────────────────────
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ── DATABASE SETUP (MongoDB) ───────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zenz-collection', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ── ORDER SCHEMA ───────────────────────────────────────
const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  items: [{
    name: String,
    size: String,
    qty: Number,
    price: Number
  }],
  total: Number,
  email: String,
  name: String,
  phone: String,
  address: String,
  city: String,
  pincode: String,
  status: { type: String, default: 'pending' }, // pending, paid, shipped, delivered
  paymentId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// ── EMAIL SETUP (Nodemailer) ───────────────────────────
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ── UTILITY: Generate Unique Order ID ──────────────────
function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `ZNZ${timestamp}${random}`;
}

// ── API ROUTE: Create Order ────────────────────────────
app.post('/api/orders/create-order', async (req, res) => {
  try {
    const { items, total, email, name, phone, address, city, pincode } = req.body;

    // Validate required fields
    if (!items || !total || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique Order ID
    const orderId = generateOrderId();

    // Create order in database
    const newOrder = new Order({
      orderId,
      items,
      total,
      email,
      name,
      phone,
      address,
      city,
      pincode,
      status: 'pending'
    });

    await newOrder.save();

    // Return orderId and amount (in paise for Razorpay)
    res.json({
      success: true,
      orderId,
      amount: total * 100, // Razorpay requires paise
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── API ROUTE: Send Order Confirmation Email ──────────
app.post('/api/send-order-email', async (req, res) => {
  try {
    const { orderId, name, email, items, total, paymentId } = req.body;

    // Generate HTML email template
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
        <td style="padding:10px;border-bottom:1px solid #ddd">${item.name}</td>
        <td style="padding:10px;border-bottom:1px solid #ddd;text-align:center">${item.size}</td>
        <td style="padding:10px;border-bottom:1px solid #ddd;text-align:center">${item.qty}</td>
        <td style="padding:10px;border-bottom:1px solid #ddd;text-align:right">₹${item.price.toLocaleString('en-IN')}</td>
      </tr>`
      )
      .join('');

    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Syne', sans-serif; line-height: 1.6; color: #0a0a0a; }
    .container { max-width: 600px; margin: 0 auto; background: #f2ede6; padding: 20px; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); color: #c8ff00; padding: 20px; text-align: center; border-radius: 8px; }
    .header h1 { margin: 0; font-size: 2rem; letter-spacing: 0.1em; }
    .content { padding: 20px 0; }
    .section-title { color: #c8ff00; font-size: 1.2rem; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #c8ff00; padding-bottom: 5px; }
    .order-details { background: #fff; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 5px 0; }
    .detail-label { font-weight: bold; color: #555; }
    .detail-value { color: #0a0a0a; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #c8ff00; color: #0a0a0a; padding: 10px; text-align: left; font-weight: bold; }
    .total-row { background: #f9f9f9; font-weight: bold; font-size: 1.1rem; }
    .total-row td { padding: 15px; border-top: 2px solid #c8ff00; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9rem; }
    .cta-button { background: #c8ff00; color: #0a0a0a; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✦ ORDER CONFIRMED ✦</h1>
      <p style="margin:10px 0 0 0;font-size:0.9rem">Thank you for your order!</p>
    </div>

    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your order has been successfully placed. Here are the details:</p>

      <div class="section-title">📦 ORDER DETAILS</div>
      <div class="order-details">
        <div class="detail-row">
          <span class="detail-label">Order ID:</span>
          <span class="detail-value"><strong>${orderId}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment ID:</span>
          <span class="detail-value">${paymentId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Order Date:</span>
          <span class="detail-value">${new Date().toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      <div class="section-title">🛍️ ITEMS</div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr class="total-row">
            <td colspan="3" style="text-align:right">TOTAL:</td>
            <td style="text-align:right">₹${total.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">📬 WHAT'S NEXT?</div>
      <div class="order-details">
        <p>✓ Your order is being processed</p>
        <p>✓ You will receive tracking info within 24 hours</p>
        <p>✓ Free shipping on all orders (No additional charges)</p>
        <p>✓ Questions? Email us at support@zenz.in</p>
      </div>

      <center>
        <a href="https://zz.vercel.app" class="cta-button">TRACK YOUR ORDER</a>
      </center>
    </div>

    <div class="footer">
      <p>ZEN-Z COLLECTION © 2025 | Future Fashion for the Boundless Generation</p>
      <p>Made with ✦ in India | Worn Worldwide</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `✦ Order Confirmed #${orderId} — ZEN-Z Collection`,
      html: emailHTML
    });

    // Update order status
    await Order.findOneAndUpdate(
      { orderId },
      { status: 'confirmed', updatedAt: new Date() },
      { new: true }
    );

    res.json({ success: true, message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── API ROUTE: Get Order by ID ─────────────────────────
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── API ROUTE: Update Order Status ─────────────────────
app.patch('/api/orders/:orderId', async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── API ROUTE: List All Orders (Admin) ─────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── HEALTH CHECK ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✓', timestamp: new Date() });
});

// ── ERROR HANDLING ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ── START SERVER ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║   ZEN-Z Collection Backend Server                ║
║   Running on: http://localhost:${PORT}            ║
╚══════════════════════════════════════════════════╝
  `);
});
