// File: main.js - Main site scripts (cart, store, checkout handling)
document.addEventListener('DOMContentLoaded', function () {
  console.log("✅ main.js loaded");

  // Utility helpers
  // Short selector helper
  const $ = sel => document.querySelector(sel);
  // Format numbers as currency strings
  const formatMoney = n => {
    const num = Number(n) || 0;
    return '$' + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Read cart from localStorage (returns array)
  function readCart() {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('cart parse error', e);
      return [];
    }
  }

  // Save cart to localStorage
  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Normalize incoming price values to numbers
  function normalizePrice(value) {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    return Number(String(value).replace(/[^0-9.-]+/g, '')) || 0;
  }

  // Very small HTML escape for inserted strings
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Add an item to cart (or increment qty if exists)
  function addToCart(id, name, price, img, qty = 1) {
    if (!id || !name || !price) {
      console.warn('Missing product data:', { id, name, price, img });
      alert('⚠️ Could not add item to cart. Missing product info.');
      return;
    }

    const cart = readCart();
    const idx = cart.findIndex(i => i.id === id);
    const numericPrice = normalizePrice(price);
    qty = Math.max(1, Number(qty) || 1);

    if (idx > -1) {
      cart[idx].qty += qty;
    } else {
      cart.push({ id, name, price: numericPrice, qty, img });
    }

    saveCart(cart);
    alert(`✅ "${name}" has been added to your cart.`);
  }

  // Render cart page contents; attaches event handlers
  function renderCart() {
    const root = document.getElementById('cart-items-root');
    if (!root) return; // not on cart page

    const cart = readCart();
    root.innerHTML = '';

    if (!cart.length) {
      root.innerHTML = '<div class="empty"><p>Your cart is empty.</p><p class="small">Add items from the store to get started.</p></div>';
      $('#subtotal').textContent = formatMoney(0);
      return;
    }

    let subtotal = 0;

    cart.forEach(item => {
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

  // Simple auth check using localStorage token
  function isLoggedInClientSide() {
    return !!localStorage.getItem('authToken');
  }

  // Redirect user to login and preserve returnTo path
  function redirectToLoginWithReturn() {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `login.html?returnTo=${returnTo}`;
  }

  // Store page: wire up "Add to cart" buttons
  document.querySelectorAll('.store').forEach(btn => {
    btn.addEventListener('click', function () {
      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = this.dataset.price;
      const img = this.dataset.img;
      addToCart(id, name, price, img, 1);
    });
  });
 renderCart();

  // Checkout page logic: submit, generate receipt, clear cart
  const checkoutForm = document.getElementById('checkout-form');
  const receiptSection = document.querySelector('.receipt-container');
  const receiptOutput = document.getElementById('receipt-output');
  const downloadBtn = document.getElementById('download-receipt');

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!isLoggedInClientSide()) {
        alert('⚠️ You must be logged in to place an order.');
        redirectToLoginWithReturn();
        return;
      }

      const address = document.getElementById('address').value.trim();
      const payment = document.getElementById('payment').value;

      if (!address || !payment) {
        alert('⚠️ Please fill out all fields.');
        return;
      }

      const cart = readCart();
      console.log("✅ Cart contents:", cart); 
      if (!Array.isArray(cart) || cart.length === 0) {
        alert('⚠️ Your cart is empty.');
        return;
      }
      let receipt = `🧾 Solar Symphony Receipt\n\nDelivery Address:\n${address}\n\nPayment Method: ${payment}\n\nItems:\n`;
      let total = 0;

      cart.forEach(item => {
        const line = `${item.name} x${item.qty} @ $${item.price} = $${item.price * item.qty}`;
        receipt += line + '\n';
        total += item.price * item.qty;
      });

      receipt += `\nTotal: $${total.toFixed(2)}\n\nThank you for your order!`;

      receiptOutput.textContent = receipt;
      receiptSection.style.display = 'block';
      localStorage.removeItem('cart');
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const blob = new Blob([receiptOutput.textContent], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'SolarSymphony_Receipt.txt';
      link.click();
    });
  }
});

