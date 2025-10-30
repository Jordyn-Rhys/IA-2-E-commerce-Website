// cart.js - modified to match your setup
const $ = sel => document.querySelector(sel);
const formatMoney = n => {
  const num = Number(n) || 0;
  return '$' + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function readCart(){
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Invalid cart in localStorage', e);
    return [];
  }
}

function saveCart(cart){
  localStorage.setItem('cart', JSON.stringify(cart));
}

function escapeHtml(str){
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
  normalizePrice:
  - Accepts numbers or strings like "25,000", "$25,000.00" or "25000"
  - Returns numeric value (units, not cents). Adjust if you store cents.
*/
function normalizePrice(value){
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^0-9.-]+/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function renderCart(){
  const root = document.getElementById('cart-items-root');
  const cart = readCart();
  root.innerHTML = '';

  if (!cart.length) {
    root.innerHTML = '<div class="empty"><p>Your cart is empty.</p><p class="small">Add items from the store to get started.</p></div>';
    $('#subtotal').textContent = formatMoney(0);
    return;
  }

  let subtotal = 0;

  cart.forEach(item => {
    // support legacy or inconsistent shapes
    const priceVal = normalizePrice(item.price);
    const qtyVal = Math.max(1, Number(item.qty) || 1);
    const lineTotal = priceVal * qtyVal;
    subtotal += lineTotal;

    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${escapeHtml(item.img || '../Assets/product-placeholder.png')}" alt="${escapeHtml(item.name)}" class="cart-image" />
      <div class="cart-details">
        <h3>${escapeHtml(item.name || 'Product')}</h3>
        <p class="small">${escapeHtml(item.id || '')}</p>
        <p class="small">Unit: ${formatMoney(priceVal)}</p>
        <div class="line-actions">
          <label class="small">Qty
            <input class="qty-input" data-id="${escapeHtml(item.id)}" type="number" min="1" value="${escapeHtml(qtyVal)}" />
          </label>
          <button class="remove-btn" data-id="${escapeHtml(item.id)}" type="button">Remove</button>
        </div>
      </div>
      <div class="line-total">${formatMoney(lineTotal)}</div>
    `;

    root.appendChild(el);
  });

  $('#subtotal').textContent = formatMoney(subtotal);

  // attach handlers
  document.querySelectorAll('.qty-input').forEach(inp => {
    inp.addEventListener('change', e => {
      const id = e.target.dataset.id;
      const q = Math.max(1, parseInt(e.target.value) || 1);
      const cart = readCart();
      const idx = cart.findIndex(i => i.id === id);
      if (idx > -1) {
        cart[idx].qty = q;
        saveCart(cart);
        renderCart();
      }
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      let cart = readCart();
      cart = cart.filter(i => i.id !== id);
      saveCart(cart);
      renderCart();
    });
  });
}

// Auth-aware checkout flow
function isLoggedInClientSide(){
  // adjust this check to match how you store auth (token, flag, etc.)
  // example: localStorage.setItem('authToken', '...') on login
  return !!localStorage.getItem('authToken');
}

function redirectToLoginWithReturn(){
  const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `login.html?returnTo=${returnTo}`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  const checkoutBtn = $('#checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const cart = readCart();
      if (!cart.length) return;

      if (!isLoggedInClientSide()) {
        // prompt user to sign in first, then return to checkout
        redirectToLoginWithReturn();
        return;
      }

      // if logged in, proceed to checkout page
      window.location.href = 'checkout.html';
    });
  }
});