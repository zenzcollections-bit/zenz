// ╔════════════════════════════════════════════════════╗
// ║   ZEN-Z COLLECTION — BACKEND SERVER               ║
// ║   Node.js + Express + Razorpay + Nodemailer        ║
// ╚════════════════════════════════════════════════════╝

const express = require('express');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

// ── Serve frontend ──────────────────────────────────────
app.use(express.static(path.join(__dirname, '.')));

// ── Razorpay instance ───────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,     // rzp_test_XXXX or rzp_live_XXXX
  key_secret: process.env.RAZORPAY_KEY_SECRET, // from Razorpay dashboard
});

// ── Nodemailer transporter ──────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,  // your Gmail / SMTP email
    pass: process.env.SMTP_PASS,  // Gmail App Password or SMTP password
  },
});

// ── ROUTE: Create Razorpay Order ────────────────────────
// Frontend calls this before opening Razorpay checkout
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency,
      receipt:  receipt || `rcpt_${Date.now()}`,
      notes:    notes || {},
    });

    res.json({
      success:  true,
      order_id: order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── ROUTE: Verify Razorpay Payment ─────────────────────
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSig === razorpay_signature) {
    res.json({ success: true, message: 'Payment verified' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

// ── ROUTE: Send Order Confirmation Email ────────────────
app.post('/api/send-order-email', async (req, res) => {
  const { to, subject, name, orderId, items, total, paymentId } = req.body;

  if (!to || !orderId) return res.status(400).json({ error: 'Missing required fields' });

  // Build HTML email
  const itemsHTML = items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #222;font-family:monospace;color:#c8ff00">${i.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #222;text-align:center;color:#909090">${i.size}</td>
      <td style="padding:10px 0;border-bottom:1px solid #222;text-align:center;color:#909090">${i.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #222;text-align:right;color:#f2ede6">₹${(i.price * i.qty).toLocaleString('en-IN')}</td>
    </tr>`).join('');

  const emailHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(200,255,0,0.2);max-width:600px;width:100%">
        
        <!-- HEADER -->
        <tr><td style="background:#0a0a0a;padding:32px 40px;border-bottom:2px solid #c8ff00">
          <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;color:#c8ff00;letter-spacing:6px">ZEN-Z</h1>
          <p style="margin:4px 0 0;font-family:monospace;font-size:11px;color:#909090;letter-spacing:3px">COLLECTION</p>
        </td></tr>
        
        <!-- HERO TEXT -->
        <tr><td style="padding:32px 40px;border-bottom:1px solid #222">
          <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:24px;color:#f2ede6;letter-spacing:2px">ORDER CONFIRMED ✦</h2>
          <p style="margin:0;color:#909090;font-size:14px;line-height:1.7">Hey ${name || 'there'}, your order is confirmed and being processed. We'll notify you once it ships.</p>
        </td></tr>

        <!-- ORDER META -->
        <tr><td style="padding:24px 40px;background:rgba(200,255,0,0.04);border-bottom:1px solid #222">
          <table width="100%">
            <tr>
              <td style="font-family:monospace;font-size:11px;color:#909090;letter-spacing:2px">ORDER ID</td>
              <td style="font-family:monospace;font-size:11px;color:#c8ff00;text-align:right">${orderId}</td>
            </tr>
            <tr>
              <td style="font-family:monospace;font-size:11px;color:#909090;letter-spacing:2px;padding-top:8px">PAYMENT ID</td>
              <td style="font-family:monospace;font-size:11px;color:#00ffe7;text-align:right;padding-top:8px">${paymentId}</td>
            </tr>
          </table>
        </td></tr>

        <!-- ITEMS -->
        <tr><td style="padding:24px 40px">
          <p style="margin:0 0 16px;font-family:monospace;font-size:11px;color:#c8ff00;letter-spacing:3px">YOUR ITEMS</p>
          <table width="100%">
            <tr>
              <th style="text-align:left;font-family:monospace;font-size:10px;color:#555;letter-spacing:2px;padding-bottom:8px">ITEM</th>
              <th style="text-align:center;font-family:monospace;font-size:10px;color:#555;letter-spacing:2px;padding-bottom:8px">SIZE</th>
              <th style="text-align:center;font-family:monospace;font-size:10px;color:#555;letter-spacing:2px;padding-bottom:8px">QTY</th>
              <th style="text-align:right;font-family:monospace;font-size:10px;color:#555;letter-spacing:2px;padding-bottom:8px">PRICE</th>
            </tr>
            ${itemsHTML}
          </table>
        </td></tr>

        <!-- TOTAL -->
        <tr><td style="padding:20px 40px;background:rgba(200,255,0,0.06);border-top:1px solid rgba(200,255,0,0.2)">
          <table width="100%">
            <tr>
              <td style="font-family:monospace;font-size:11px;color:#909090;letter-spacing:2px">SHIPPING</td>
              <td style="font-family:monospace;font-size:11px;color:#c8ff00;text-align:right">FREE</td>
            </tr>
            <tr>
              <td style="font-family:Georgia,serif;font-size:22px;color:#f2ede6;padding-top:12px">TOTAL</td>
              <td style="font-family:Georgia,serif;font-size:22px;color:#c8ff00;text-align:right;padding-top:12px">₹${total.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding:24px 40px;border-top:1px solid #222;text-align:center">
          <p style="margin:0 0 8px;font-family:monospace;font-size:11px;color:#555;letter-spacing:2px">QUESTIONS? REACH US AT</p>
          <a href="mailto:support@zenz.in" style="color:#c8ff00;font-family:monospace;font-size:12px;text-decoration:none">support@zenz.in</a>
          <p style="margin:16px 0 0;font-family:monospace;font-size:10px;color:#444">© 2025 ZEN-Z COLLECTION · ALL RIGHTS RESERVED</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from:    `"ZEN-Z Collection" <${process.env.SMTP_USER}>`,
      to,
      subject: subject || `Order Confirmed #${orderId} — ZEN-Z Collection`,
      html:    emailHTML,
    });

    // Also send admin notification
    if (process.env.ADMIN_EMAIL) {
      await transporter.sendMail({
        from:    `"ZEN-Z Orders" <${process.env.SMTP_USER}>`,
        to:      process.env.ADMIN_EMAIL,
        subject: `🛍️ New Order #${orderId} — ₹${total.toLocaleString('en-IN')}`,
        html:    `<p>New order from <b>${name}</b> (${to})</p><p>Order: ${orderId} | Amount: ₹${total}</p>`,
      });
    }

    console.log(`✅ Order email sent → ${to} | Order: ${orderId}`);
    res.json({ success: true, message: 'Email sent' });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── ROUTE: Health check ─────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ZEN-Z Backend', time: new Date().toISOString() });
});

// ── START SERVER ────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  ZEN-Z COLLECTION SERVER RUNNING     ║`);
  console.log(`║  http://localhost:${PORT}               ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});
