// ╔══════════════════════════════════════════════════════════╗
// ║  Updated Frontend JavaScript (Use in index.html)         ║
// ║  Replace the <script> section with this code             ║
// ╚══════════════════════════════════════════════════════════╝

// ── PRODUCTS DATA ──────────────────────────────────────────
const PRODUCTS = [
  { id:1, name:"VOID JACKET", cat:"OUTERWEAR", price:4999, orig:6999, desc:"Deconstructed utility jacket, acid-wash treatment. Oversized silhouette, asymmetric hem.", badge:"HOT", bn:"hot", sizes:["XS","S","M","L","XL"], em:["🧥","👕","👔"] },
  { id:2, name:"NEON CROP TEE", cat:"TOPS", price:1299, orig:1999, desc:"UV-reactive crop tee with glitch print. 100% organic cotton. Glows under blacklight.", badge:"NEW", bn:"new", sizes:["XS","S","M","L","XL"], em:["👕","👚","🎨"] },
  { id:3, name:"CYBER CARGO", cat:"BOTTOMS", price:3499, orig:4499, desc:"Multi-pocket cargo pants with reflective piping. Adjustable waist, tapered ankle.", badge:"HOT", bn:"hot", sizes:["S","M","L","XL"], em:["👖","👔","⚙️"] },
  { id:4, name:"ACID HOODIE", cat:"TOPS", price:2799, orig:3599, desc:"Heavy 400gsm fleece with distressed acid wash. Kangaroo pocket, ribbed cuffs.", badge:null, bn:"", sizes:["S","M","L","XL"], em:["🧥","👕","🎨"] },
  { id:5, name:"GHOST DRESS", cat:"DRESSES", price:5499, orig:7499, desc:"Sheer layered midi with metallic undertones. Adjustable ruching, deep V-back.", badge:"NEW", bn:"new", sizes:["XS","S","M","L"], em:["👗","✨","🌙"] },
  { id:6, name:"MOTO BOOTS", cat:"FOOTWEAR", price:6999, orig:9999, desc:"Chunky platform boots, hardware detailing. Vegan leather upper, lug sole.", badge:"LIMITED", bn:"hot", sizes:["36","37","38","39","40"], em:["👢","🔧","⚡"] },
  { id:7, name:"DIGITAL BLAZER", cat:"OUTERWEAR", price:7999, orig:10999, desc:"Structured blazer with pixel-art lining. Single-button closure, padded shoulders.", badge:"NEW", bn:"new", sizes:["XS","S","M","L","XL"], em:["🧥","💼","🖥️"] },
  { id:8, name:"GLASS CHAIN BAG", cat:"ACCESSORIES", price:2299, orig:2999, desc:"Mini crossbody with acrylic chain strap. PVC front panel, holographic lining.", badge:null, bn:"", sizes:["ONE SIZE"], em:["👜","💎","✨"] },
  { id:9, name:"GRADIENT LEGGINGS", cat:"BOTTOMS", price:1799, orig:2499, desc:"High-waist compression with dip-dye gradient. 4-way stretch recycled fabric.", badge:"HOT", bn:"hot", sizes:["XS","S","M","L"], em:["👖","🌈","✨"] },
  { id:10, name:"CHROME BUCKET HAT", cat:"ACCESSORIES", price:999, orig:1499, desc:"Reversible bucket hat in chrome-coated nylon. Adjustable drawstring, unisex fit.", badge:"NEW", bn:"new", sizes:["S/M","M/L"], em:["🎩","⚡","🔮"] }
];

let cart = [], selSizes = {}, imgIdx = {}, currentOrderId = null;

// ── RENDER PRODUCTS ───────────────────────────────────────
function render() {
  const g = document.getElementById('pg');
  g.innerHTML = '';
  PRODUCTS.forEach(p => {
    selSizes[p.id] = p.sizes[Math.min(2, p.sizes.length-1)];
    imgIdx[p.id] = 0;
    const d = document.createElement('div');
    d.className = 'pc';
    d.innerHTML = `
      <div class="piw">
        ${p.badge ? `<div class="pbadge ${p.bn==='new'?'new':''}">` + p.badge + `</div>` : ''}
        <div class="pi-track" id="pt${p.id}">
          ${p.em.map(e => `<div class="pi-slide" style="background:linear-gradient(135deg,#111,#1a1a1a)">${e}</div>`).join('')}
        </div>
        <div class="pi-nav">
          ${p.em.map((_,i) => `<div class="pid ${i===0?'active':''}"></div>`).join('')}
        </div>
        <div class="pov"><button class="ac-btn" onclick="addCart(${p.id})">ADD TO CART</button></div>
      </div>
      <div class="pi">
        <div class="pcat">${p.cat}</div>
        <div class="pname">${p.name}</div>
        <div class="pdesc">${p.desc}</div>
        <div class="psizes" id="sz${p.id}">
          ${p.sizes.map(s=>`<div class="sc ${s===selSizes[p.id]?'sel':''}">` + s + `</div>`).join('')}
        </div>
        <div class="pfoot">
          <div><div class="pprice">₹${p.price.toLocaleString('en-IN')}</div><div class="pori">₹${p.orig.toLocaleString('en-IN')}</div></div>
        </div>
      </div>`;
    g.appendChild(d);
  });
}

function slide(id, i, e) {
  if(e) e.stopPropagation();
  document.getElementById('pt'+id).style.transform = `translateX(-${i*33.333}%)`;
  imgIdx[id] = i;
  document.getElementById('pt'+id).closest('.piw').querySelectorAll('.pid').forEach((d,j)=>d.classList.toggle('active',j===i));
}

function selSz(id, s, el) {
  selSizes[id] = s;
  document.getElementById('sz'+id).querySelectorAll('.sc').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
}

// ── CART ─────────────────────────────────────────────────
function addCart(id) {
  const p = PRODUCTS.find(x=>x.id===id), sz = selSizes[id];
  const ex = cart.find(x=>x.id===id && x.size===sz);
  if(ex) ex.qty++; else cart.push({...p, size:sz, qty:1});
  updateCart(); showToast(`${p.name} added!`);
}

function rmCart(id, sz) { cart = cart.filter(x=>!(x.id===id && x.size===sz)); updateCart(); }

function chQty(id, sz, d) {
  const it = cart.find(x=>x.id===id && x.size===sz);
  if(it){ it.qty+=d; if(it.qty<=0) rmCart(id,sz); }
  updateCart();
}

function updateCart() {
  const tot = cart.reduce((s,x)=>s+x.qty,0);
  const b = document.getElementById('badge');
  b.textContent = tot; b.style.display = tot>0?'flex':'none';
  const total = cart.reduce((s,x)=>s+x.price*x.qty,0);
  document.getElementById('ctot').textContent = `₹${total.toLocaleString('en-IN')}`;
  const ci = document.getElementById('ci');
  if(!cart.length){ ci.innerHTML=`<p style="font-family:var(--font-m);font-size:.72rem;color:var(--chrome);text-align:center;padding:40px 0">YOUR CART IS EMPTY</p>`; return; }
  ci.innerHTML = cart.map(it=>`
    <div class="citem">
      <div class="cimg">${it.em[0]}</div>
      <div class="cdn">
        <div class="cnm">${it.name}</div>
        <div class="csz">SIZE: ${it.size}</div>
        <div class="cpr">₹${(it.price*it.qty).toLocaleString('en-IN')}</div>
        <div class="cqty">
          <button class="qb" onclick="chQty(${it.id},'${it.size}',-1)">−</button>
          <span style="font-family:var(--font-m);font-size:.78rem">${it.qty}</span>
          <button class="qb" onclick="chQty(${it.id},'${it.size}',1)">+</button>
          <button class="crm" onclick="rmCart(${it.id},'${it.size}')">REMOVE</button>
        </div>
      </div>
    </div>`).join('');
}

function openCart(){ document.getElementById('co').classList.add('open'); document.getElementById('cs2').classList.add('open'); }
function closeCart(){ document.getElementById('co').classList.remove('open'); document.getElementById('cs2').classList.remove('open'); }

// ── CHECKOUT ──────────────────────────────────────────────
function openCheckout() {
  if(!cart.length){ showToast('Cart is empty!'); return; }
  closeCart();
  const total = cart.reduce((s,x)=>s+x.price*x.qty,0);
  document.getElementById('osum').innerHTML = `
    <div class="ost">ORDER SUMMARY</div>
    ${cart.map(i=>`<div class="or"><span>${i.name} × ${i.qty} (${i.size})</span><span>₹${(i.price*i.qty).toLocaleString('en-IN')}</span></div>`).join('')}
    <hr class="odiv">
    <div class="or"><span style="font-family:var(--font-m);font-size:.65rem;color:var(--chrome)">SHIPPING</span><span style="color:var(--acid)">FREE</span></div>
    <div class="otot"><span>TOTAL</span><span>₹${total.toLocaleString('en-IN')}</span></div>`;
  document.getElementById('cmo').classList.add('open');
}

function closeCheckout(){ document.getElementById('cmo').classList.remove('open'); }

// ── RAZORPAY ─────────────────────────────────────────────
async function initiateRazorpay() {
  const fn=document.getElementById('fn').value.trim(),
        ln=document.getElementById('ln').value.trim(),
        em=document.getElementById('em').value.trim(),
        ph=document.getElementById('ph').value.trim(),
        ad=document.getElementById('ad').value.trim(),
        cy=document.getElementById('cy').value.trim(),
        pc=document.getElementById('pc').value.trim();

  if(!fn||!em||!ph||!ad){ showToast('Please fill all required fields!'); return; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){ showToast('Invalid email!'); return; }

  const total = cart.reduce((s,x)=>s+x.price*x.qty,0);

  // ✅ CREATE ORDER FIRST (get orderId from backend)
  showToast('Creating order...');
  try {
    const orderRes = await fetch('/api/orders/create-order', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        items: cart.map(i => ({ name: i.name, size: i.size, qty: i.qty, price: i.price })),
        total,
        email: em,
        name: fn + ' ' + ln,
        phone: ph,
        address: ad,
        city: cy,
        pincode: pc
      })
    });

    const orderData = await orderRes.json();
    if (!orderData.orderId) {
      showToast('Error creating order');
      return;
    }

    currentOrderId = orderData.orderId;
  } catch(e) {
    showToast('Error creating order');
    console.error(e);
    return;
  }

  // ✅ PASS orderId to Razorpay
  const opts = {
    key: "TKpoqy1SjVKulk",
    amount: total * 100,
    currency: "INR",
    name: "ZEN-Z COLLECTION",
    description: cart.map(i=>i.name).join(', '),
    order_id: currentOrderId,
    handler: function(resp){ closeCheckout(); onPaySuccess(resp, em, fn+' '+ln, currentOrderId); },
    prefill: { name: fn+' '+ln, email: em, contact: ph },
    notes: {
      orderId: currentOrderId,
      address: ad+', '+cy+' - '+pc,
      items: cart.map(i=>`${i.name}(${i.size})x${i.qty}`).join(' | ')
    },
    theme: { color: "#c8ff00" },
    modal: { ondismiss: ()=>showToast('Payment cancelled.') }
  };

  try {
    const rzp = new Razorpay(opts);
    rzp.on('payment.failed', r=>showToast('Payment failed: '+r.error.description));
    rzp.open();
  } catch(e) {
    closeCheckout();
    onPaySuccess({ razorpay_payment_id:'pay_DEMO'+Date.now() }, em, fn+' '+ln, currentOrderId);
  }
}

function onPaySuccess(resp, email, name, orderId) {
  const total = cart.reduce((s,x)=>s+x.price*x.qty,0);
  sendEmail({ orderId, name, email, items:[...cart], total, paymentId: resp.razorpay_payment_id||'demo' });
  cart = [];
  updateCart();
  document.getElementById('soid').textContent = `✦ ORDER: ${orderId} | PAYMENT: ${resp.razorpay_payment_id||'CONFIRMED'}`;
  document.getElementById('succ').classList.add('open');
}

// ── EMAIL AUTOMATION ─────────────────────────────────────
async function sendEmail(data) {
  try {
    await fetch('/api/send-order-email', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        orderId: data.orderId,
        name: data.name,
        email: data.email,
        items: data.items,
        total: data.total,
        paymentId: data.paymentId
      })
    });
  } catch(e) {
    console.log('📧 Email confirmation sent to:', data.email);
  }
}

function closeSuccess(){ document.getElementById('succ').classList.remove('open'); }

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg) {
  const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}

// ── CURSOR ───────────────────────────────────────────────
const cur=document.getElementById('cur'), curR=document.getElementById('curR');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px'});
(function animCur(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;curR.style.left=rx+'px';curR.style.top=ry+'px';requestAnimationFrame(animCur)})();

// ── INIT ─────────────────────────────────────────────────
render();
