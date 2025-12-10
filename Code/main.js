// File: main.js - Main site scripts (cart, store, checkout handling)
// This file should NOT contain login/logout functionality

// ==================== GLOBAL UTILITIES ====================
const $ = (sel) => document.querySelector(sel);

const formatMoney = (n) => {
  const num = Number(n) || 0;
  return (
    "$" +
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const DISCOUNTS = {
  Installation: 0.1,
  Polycrystalline: 0.05,
};

const SHIPPING_TIERS = {
  standard: 5000,
  express: 10000,
  free: 0,
};

const TAX_RATE = 0.15;
const FREE_SHIPPING_THRESHOLD = 100000;

const PROMO_CODES = {
  SOLAR10: 0.1,
  SUNNY25: 0.25,
  GREEN50: 0.5,
};

function normalizePrice(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  return Number(String(value).replace(/[^0-9.-]+/g, "")) || 0;
}

function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==================== CART FUNCTIONS ====================
function readCart() {
  try {
    const raw = localStorage.getItem("cart");
    const cart = raw ? JSON.parse(raw) : [];

    // Migrate old cart items from 'qty' to 'quantity'
    return cart.map((item) => {
      if (item.qty !== undefined && item.quantity === undefined) {
        item.quantity = item.qty;
        delete item.qty;
      }
      return item;
    });
  } catch (e) {
    // File: main.js - Main site scripts (cart, store, checkout handling)
    // Cleaned and deduplicated version

    // ==================== GLOBAL UTILITIES ====================
    const $ = (sel) => document.querySelector(sel);

    const formatMoney = (n) => {
      const num = Number(n) || 0;
      return (
        "$" +
        num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }};

    const DISCOUNTS = {
      Installation: 0.1,
      Polycrystalline: 0.05,
    };

    const SHIPPING_TIERS = {
      standard: 5000,
      express: 10000,
      free: 0,
    };

    const TAX_RATE = 0.15;
    const FREE_SHIPPING_THRESHOLD = 100000;

    const PROMO_CODES = {
      SOLAR10: 0.1,
      SUNNY25: 0.25,
      GREEN50: 0.5,
    };
  }
    function normalizePrice(value) {
      if (value == null) return 0;
      if (typeof value === "number") return value;
      return Number(String(value).replace(/[^0-9.-]+/g, "")) || 0;
    }

    function escapeHtml(str) {
      if (!str && str !== 0) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // ==================== CART FUNCTIONS ====================
    function readCart() {
      try {
        const raw = localStorage.getItem("cart");
        const cart = raw ? JSON.parse(raw) : [];

        // Migrate old cart items from 'qty' to 'quantity'
        return cart.map((item) => {
          if (item && item.qty !== undefined && item.quantity === undefined) {
            item.quantity = item.qty;
            delete item.qty;
          }
          return item;
        });
      } catch (e) {
        console.error("cart parse error", e);
        return [];
      }
    }

    function saveCart(cart) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    function updateCartBadge() {
      const cart = readCart();
      const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

      const cartBadge = document.querySelector(".cart-qty-badge");
      const navCartBadge = document.getElementById("nav-cart-badge");

      if (cartBadge) {
        cartBadge.textContent = totalQty;
        cartBadge.style.display = totalQty > 0 ? "flex" : "none";
      }

      if (navCartBadge) {
        navCartBadge.textContent = totalQty;
        navCartBadge.style.display = totalQty > 0 ? "flex" : "none";
      }
    }

    function getDiscountedPrice(product) {
      const discountRate = DISCOUNTS[product.category] || 0;
      const discounted = (product.price || 0) * (1 - discountRate);
      return Math.round(discounted * 100) / 100;
    }

    function hasDiscount(product) {
      return !!DISCOUNTS[product.category];
    }

    function getDiscountPercentage(product) {
      return (DISCOUNTS[product.category] || 0) * 100;
    }

    function calculateCartTotals(cart, shippingMethod = "standard", promoCode = "") {
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

      const subTotal = cart.reduce((sum, item) => {
        const price = item.discountedPrice || item.price || 0;
        return sum + price * (item.quantity || 0);
      }, 0);

      const productDiscount = cart.reduce((sum, item) => {
        return item.discountedPrice
          ? sum + (item.price - item.discountedPrice) * (item.quantity || 0)
          : sum;
      }, 0);

      let shipping = 0;
      if (subTotal < FREE_SHIPPING_THRESHOLD) {
        shipping = SHIPPING_TIERS[shippingMethod] || SHIPPING_TIERS.standard;
      }

      let promoDiscount = 0;
      let validPromoCode = "";
      if (promoCode && PROMO_CODES[promoCode.toUpperCase()]) {
        const discountRate = PROMO_CODES[promoCode.toUpperCase()];
        promoDiscount = subTotal * discountRate;
        validPromoCode = promoCode.toUpperCase();
      }

      const totalDiscount = productDiscount + promoDiscount;
      const taxableAmount = Math.max(0, subTotal - promoDiscount);
      const taxes = taxableAmount * TAX_RATE;
      const total = subTotal + shipping + taxes - promoDiscount;

      return {
        totalItems,
        subTotal: Math.round(subTotal * 100) / 100,
        shipping,
        productDiscount: Math.round(productDiscount * 100) / 100,
        promoDiscount: Math.round(promoDiscount * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        taxes: Math.round(taxes * 100) / 100,
        total: Math.round(total * 100) / 100,
        validPromoCode,
        shippingMethod,
        freeShippingEligible: subTotal >= FREE_SHIPPING_THRESHOLD,
      };
    }

    function addToCart(id, name, price, img, quantity = 1) {
      if (!id || !name || !price) {
        console.warn("Missing product data:", { id, name, price, img });
        alert("⚠️ Could not add item to cart. Missing product info.");
        return;
      }

      const cart = readCart();
      const idx = cart.findIndex((i) => i.id === id);
      const numericPrice = normalizePrice(price);
      quantity = Math.max(1, Number(quantity) || 1);

      let category = "General";
      if (id && id.startsWith("inst")) {
        category = "Installation";
      } else if (id && id.startsWith("y")) {
        category = "Polycrystalline";
      } else if (id && id.startsWith("x")) {
        category = "Monocrystalline";
      }

      let discountedPrice = null;
      if (hasDiscount({ category })) {
        discountedPrice = getDiscountedPrice({ price: numericPrice, category });
      }

      if (idx > -1) {
        cart[idx].quantity = (cart[idx].quantity || cart[idx].qty || 0) + quantity;
        if (cart[idx].qty !== undefined) delete cart[idx].qty;
      } else {
        cart.push({ id, name, price: numericPrice, discountedPrice, quantity, img, category });
      }

      saveCart(cart);
      updateCartBadge();
      alert(`✅ "${name}" has been added to your cart.`);
    }

    // ==================== MAIN INITIALIZATION ====================
    document.addEventListener("DOMContentLoaded", function () {
      console.log("✅ main.js loaded - Cart, store, and checkout functions");
      initializePage();
    updateCartBadge();

    function initializePage() {
      // Cart page
      if (document.querySelector(".cart-container")) {
        renderCart();
      }

      // Checkout page
      if (document.querySelector(".checkout-container")) {
        renderCheckoutPage();
        attachCheckoutListeners();
      }

      // Invoice page
      if (document.querySelector(".invoice-container")) {
        generateInvoice();
        attachInvoiceListeners();
      }

      // Invoice History Page
      if (document.querySelector(".invoice-history-container")) {
        renderInvoiceHistory();
      }

      // Store page: wire up "Add to cart" buttons (elements with .store or .store-btn)
      document.querySelectorAll(".store, .store-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = this.dataset.id;
          const name = this.dataset.name;
          const price = this.dataset.price;
          const img = this.dataset.img;
          addToCart(id, name, price, img, 1);
        });
      });

      // Minimal backward-compatible checkout form handling (receipt-area)
      const checkoutForm = document.getElementById("checkout-form");
      const receiptSection = document.querySelector(".receipt-container");
      const receiptOutput = document.getElementById("receipt-output");
      const downloadBtn = document.getElementById("download-receipt");

      if (checkoutForm) {
        checkoutForm.addEventListener("submit", function (e) {
          e.preventDefault();

          const address = document.getElementById("address")
            ? document.getElementById("address").value.trim()
            : "";
          const payment = document.getElementById("payment")
            ? document.getElementById("payment").value
            : "";

          if (!address || !payment) {
            alert("⚠️ Please fill out all fields.");
            return;
          }

          const cart = readCart();
          if (!Array.isArray(cart) || cart.length === 0) {
            alert("⚠️ Your cart is empty.");
            return;
          }

          let receipt = `🧾 Solar Symphony Receipt\\n\\nDelivery Address:\\n${address}\\n\\nPayment Method: ${payment}\\n\\nItems:\\n`;
          let total = 0;

          cart.forEach((item) => {
            const line = `${item.name} x${item.quantity} @ ${formatMoney(item.price)} = ${formatMoney(
              item.price * item.quantity
            )}`;
            receipt += line + "\\n";
            total += item.price * item.quantity;
          });

          receipt += `\\nTotal: ${formatMoney(total)}\\n\\nThank you for your order!`;

          if (receiptOutput) receiptOutput.textContent = receipt;
          if (receiptSection) receiptSection.style.display = "block";
          saveCart([]);
          updateCartBadge();
        });
      }

      if (downloadBtn && receiptOutput) {
        downloadBtn.addEventListener("click", () => {
          const blob = new Blob([receiptOutput.textContent], { type: "text/plain" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "SolarSymphony_Receipt.txt";
          link.click();
        });
      }
    }
  updateCartBadge();
});

// ==================== RENDER FUNCTIONS ====================
function renderCart() {
  const root = document.getElementById("cart-items-root");
  if (!root) return;

  const cart = readCart();
  root.innerHTML = "";

  if (!cart.length) {
    root.innerHTML =
      '<div class="empty"><p>Your cart is empty.</p><p class="small">Add items from the store to get started.</p></div>';
    updateCartSummary(cart);
    return;
  }

  cart.forEach((item) => {
    const hasDisc = item.discountedPrice !== null;
    const displayPrice = hasDisc ? item.discountedPrice : item.price;
    const quantity = item.quantity || 0;
    const lineTotal = displayPrice * quantity;

    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <img src="${escapeHtml(
        item.img || "../Assets/product-placeholder.png"
      )}" alt="${escapeHtml(item.name)}" class="cart-image" />
      <div class="cart-details">
        <h3>${escapeHtml(item.name || "Product")}</h3>
        <p class="meta">${escapeHtml(item.id || "")} • ${item.category}</p>
        <div class="cart-price-info">
          ${
            hasDisc
              ? `
            <div class="original-price">${formatMoney(item.price)}</div>
            <div class="discount-badge">${getDiscountPercentage(
              item
            )}% OFF</div>
          `
              : ""
          }
          <p class="small">Unit: ${formatMoney(displayPrice)}</p>
        </div>
        <div class="line-actions">
          <div class="quantity-controls">
            <button class="qty-decrease" data-id="${escapeHtml(
              item.id
            )}" type="button">-</button>
            <span class="qty-display">${quantity}</span>
            <button class="qty-increase" data-id="${escapeHtml(
              item.id
            )}" type="button">+</button>
          </div>
          <button class="remove-btn" data-id="${escapeHtml(
            item.id
          )}" type="button">Remove</button>
        </div>
      </div>
      <div class="line-total">${formatMoney(lineTotal)}</div>
    `;
    root.appendChild(el);
  });

  addCartExtras();
  updateCartSummary(cart);
  attachCartEventListeners();
}

function addCartExtras() {
  const cartBox = document.querySelector(".cart-box");
  const summary = document.querySelector(".summary");

  const existingExtras = document.querySelector(".cart-extras");
  if (existingExtras) {
    existingExtras.remove();
  }

  const extrasHtml = `
    <div class="cart-extras">
      <div class="shipping-options">
        <h4>Shipping Method</h4>
        <div class="shipping-buttons">
          <button class="shipping-option active" data-method="standard">
            Standard Shipping - ${formatMoney(SHIPPING_TIERS.standard)}
          </button>
          <button class="shipping-option" data-method="express">
            Express Shipping - ${formatMoney(SHIPPING_TIERS.express)}
          </button>
        </div>
        <p class="free-shipping-note">
          Free shipping on orders over ${formatMoney(FREE_SHIPPING_THRESHOLD)}
        </p>
      </div>
      
      <div class="promo-code-section">
        <h4>Promo Code</h4>
        <div class="promo-input-group">
          <input type="text" id="promo-code-input" placeholder="Enter promo code" />
          <button id="apply-promo-btn" class="apply-promo-btn">Apply</button>
        </div>
        <div id="promo-message" class="promo-message"></div>
        <div class="available-promos">
          <p class="small">Available codes: SOLAR10 (10% off), SUNNY25 (25% off)</p>
        </div>
      </div>
    </div>
  `;

  summary.insertAdjacentHTML("beforebegin", extrasHtml);
}

function updateCartSummary(cart, shippingMethod = "standard", promoCode = "") {
  const totals = calculateCartTotals(cart, shippingMethod, promoCode);

  if (document.getElementById("total-items")) {
    document.getElementById("total-items").textContent = totals.totalItems;
  }
  if (document.getElementById("subtotal")) {
    document.getElementById("subtotal").textContent = formatMoney(
      totals.subTotal
    );
  }
  if (document.getElementById("shipping")) {
    const shippingEl = document.getElementById("shipping");
    shippingEl.textContent = formatMoney(totals.shipping);
    if (totals.shipping === 0 && totals.subTotal > 0) {
      shippingEl.innerHTML = `${formatMoney(
        totals.shipping
      )} <span class="free-shipping-badge">FREE</span>`;
    }
  }
  if (document.getElementById("discount")) {
    const discountEl = document.getElementById("discount");
    if (totals.totalDiscount > 0) {
      discountEl.innerHTML = `-${formatMoney(totals.totalDiscount)}`;
      if (totals.validPromoCode) {
        discountEl.innerHTML += ` <span class="promo-badge">${totals.validPromoCode}</span>`;
      }
    } else {
      discountEl.textContent = `-${formatMoney(0)}`;
    }
  }
  if (document.getElementById("taxes")) {
    document.getElementById("taxes").textContent = formatMoney(totals.taxes);
  }
  if (document.getElementById("total")) {
    document.getElementById("total").textContent = formatMoney(totals.total);
  }

  updateShippingButtons(shippingMethod);
  updateFreeShippingProgress(totals.subTotal);
}

function updateShippingButtons(selectedMethod) {
  document.querySelectorAll(".shipping-option").forEach((btn) => {
    if (btn.dataset.method === selectedMethod) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function updateFreeShippingProgress(subTotal) {
  const freeShippingNote = document.querySelector(".free-shipping-note");
  if (freeShippingNote && subTotal < FREE_SHIPPING_THRESHOLD) {
    const remaining = FREE_SHIPPING_THRESHOLD - subTotal;
    freeShippingNote.innerHTML = `Free shipping on orders over ${formatMoney(
      FREE_SHIPPING_THRESHOLD
    )}<br>
       <small>Add ${formatMoney(remaining)} more for free shipping!</small>`;
  } else if (freeShippingNote && subTotal > 0) {
    freeShippingNote.innerHTML = `🎉 You've qualified for <strong>FREE SHIPPING!</strong>`;
  }
}

function attachCartEventListeners() {
  document.querySelectorAll(".qty-increase").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const cart = readCart();
      const item = cart.find((i) => i.id === id);
      if (item) {
        item.quantity = (item.quantity || 0) + 1;
        saveCart(cart);
        renderCart();
      }
    });
  });

  document.querySelectorAll(".qty-decrease").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const cart = readCart();
      const item = cart.find((i) => i.id === id);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          saveCart(cart);
          renderCart();
        } else {
          const newCart = cart.filter((i) => i.id !== id);
          saveCart(newCart);
          renderCart();
        }
      }
    });
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      let cart = readCart();
      cart = cart.filter((i) => i.id !== id);
      saveCart(cart);
      renderCart();
    });
  });

  const clearCartBtn = document.getElementById("clearCartBtn");
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your cart?")) {
        saveCart([]);
        localStorage.removeItem("appliedPromoCode");
        renderCart();
      }
    });
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const cart = readCart();
      if (!cart.length) {
        alert("Your cart is empty!");
        return;
      }
      window.location.href = "checkout.html";
    });
  }

  document.querySelectorAll(".shipping-option").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const shippingMethod = e.target.dataset.method;
      const cart = readCart();
      const promoCode = document.getElementById("promo-code-input")
        ? document.getElementById("promo-code-input").value.trim()
        : "";
      updateCartSummary(cart, shippingMethod, promoCode);
    });
  });

  const applyPromoBtn = document.getElementById("apply-promo-btn");
  const promoInput = document.getElementById("promo-code-input");
  const promoMessage = document.getElementById("promo-message");

  if (applyPromoBtn && promoInput) {
    const savedPromoCode = localStorage.getItem("appliedPromoCode");
    if (savedPromoCode) {
      promoInput.value = savedPromoCode;
    }

    applyPromoBtn.addEventListener("click", () => {
      const promoCode = promoInput.value.trim();
      const cart = readCart();
      const totals = calculateCartTotals(
        cart,
        getCurrentShippingMethod(),
        promoCode
      );

      if (totals.validPromoCode) {
        promoMessage.textContent = `✅ Promo code ${
          totals.validPromoCode
        } applied! ${PROMO_CODES[totals.validPromoCode] * 100}% discount.`;
        promoMessage.className = "promo-message success";
        localStorage.setItem("appliedPromoCode", promoCode);
      } else if (promoCode) {
        promoMessage.textContent =
          "❌ Invalid promo code. Try SOLAR10 or SUNNY25.";
        promoMessage.className = "promo-message error";
        localStorage.removeItem("appliedPromoCode");
      } else {
        promoMessage.textContent = "Please enter a promo code.";
        promoMessage.className = "promo-message";
        localStorage.removeItem("appliedPromoCode");
      }

      updateCartSummary(cart, getCurrentShippingMethod(), promoCode);
    });

    promoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        applyPromoBtn.click();
      }
    });
  }
}

function getCurrentShippingMethod() {
  const activeBtn = document.querySelector(".shipping-option.active");
  return activeBtn ? activeBtn.dataset.method : "standard";
}

// ==================== CHECKOUT FUNCTIONS ====================
function renderCheckoutPage() {
  const checkoutItemsContainer = document.getElementById(
    "checkout-items-container"
  );
  if (!checkoutItemsContainer) return;

  const cart = readCart();
  if (!cart.length) {
    window.location.href = "cart.html";
    return;
  }

  checkoutItemsContainer.innerHTML = "";

  cart.forEach((item) => {
    const hasDisc = item.discountedPrice !== null;
    const displayPrice = hasDisc ? item.discountedPrice : item.price;
    const quantity = item.quantity || 0;

    const itemEl = document.createElement("div");
    itemEl.className = "checkout-item";
    itemEl.innerHTML = `
      <div class="checkout-item-img">
        <span class="qty-badge">${quantity}</span>
        <img src="${item.img}" alt="${item.name}" />
      </div>
      <div class="checkout-item-info">
        <strong>${item.name}</strong>
        ${
          hasDisc
            ? `<div class="original-price" style="font-size: 0.8rem;">${formatMoney(
                item.price
              )}</div>`
            : ""
        }
        <div style="font-size: 0.8rem; color: #666;">${item.category}</div>
      </div>
      <div>${formatMoney(displayPrice * quantity)}</div>
    `;
    checkoutItemsContainer.appendChild(itemEl);
  });

  addCheckoutExtras();

  const appliedPromoCode = localStorage.getItem("appliedPromoCode") || "";
  const totals = calculateCartTotals(cart, "standard", appliedPromoCode);

  if (document.getElementById("summary-subtotal")) {
    document.getElementById("summary-subtotal").textContent = formatMoney(
      totals.subTotal
    );
  }
  if (document.getElementById("summary-shipping")) {
    const shippingEl = document.getElementById("summary-shipping");
    shippingEl.textContent = formatMoney(totals.shipping);
    if (totals.shipping === 0 && totals.subTotal > 0) {
      shippingEl.innerHTML = `${formatMoney(
        totals.shipping
      )} <span class="free-shipping-badge">FREE</span>`;
    }
  }
  if (document.getElementById("summary-discount")) {
    const discountEl = document.getElementById("summary-discount");
    if (totals.totalDiscount > 0) {
      discountEl.innerHTML = `-${formatMoney(totals.totalDiscount)}`;
      if (totals.validPromoCode) {
        discountEl.innerHTML += ` <span class="promo-badge">${totals.validPromoCode}</span>`;
      }
    } else {
      discountEl.textContent = `-${formatMoney(0)}`;
    }
  }
  if (document.getElementById("summary-taxes")) {
    document.getElementById("summary-taxes").textContent = formatMoney(
      totals.taxes
    );
  }
  if (document.getElementById("summary-total")) {
    document.getElementById("summary-total").textContent = formatMoney(
      totals.total
    );
  }
}

function addCheckoutExtras() {
  const formContainer = document.querySelector(".checkout-forms");

  const shippingMethodHtml = `
    <div class="form-section">
      <h3>Shipping Method</h3>
      <div class="shipping-methods">
        <label class="shipping-method">
          <input type="radio" name="shipping-method" value="standard" checked>
          <div class="shipping-info">
            <strong>Standard Shipping</strong>
            <span>${formatMoney(SHIPPING_TIERS.standard)}</span>
            <small>5-7 business days</small>
          </div>
        </label>
        <label class="shipping-method">
          <input type="radio" name="shipping-method" value="express">
          <div class="shipping-info">
            <strong>Express Shipping</strong>
            <span>${formatMoney(SHIPPING_TIERS.express)}</span>
            <small>2-3 business days</small>
          </div>
        </label>
      </div>
      <p class="free-shipping-note">
        ${
          calculateCartTotals(readCart()).freeShippingEligible
            ? "🎉 You qualify for FREE SHIPPING!"
            : `Free shipping on orders over ${formatMoney(
                FREE_SHIPPING_THRESHOLD
              )}`
        }
      </p>
    </div>
  `;

  const addressForm = document.querySelector(".form-section");
  if (addressForm) {
    addressForm.insertAdjacentHTML("afterend", shippingMethodHtml);
  }

  const appliedPromoCode = localStorage.getItem("appliedPromoCode");
  if (appliedPromoCode) {
    const promoDisplayHtml = `
      <div class="form-section">
        <h3>Applied Discount</h3>
        <div class="applied-promo">
          <strong>Promo Code: ${appliedPromoCode}</strong>
          <span>${PROMO_CODES[appliedPromoCode] * 100}% OFF</span>
          <button id="remove-promo-btn" class="remove-promo-btn">Remove</button>
        </div>
      </div>
    `;
    const shippingSection = document.querySelector(".form-section:last-child");
    if (shippingSection) {
      shippingSection.insertAdjacentHTML("afterend", promoDisplayHtml);

      const removePromoBtn = document.getElementById("remove-promo-btn");
      if (removePromoBtn) {
        removePromoBtn.addEventListener("click", () => {
          localStorage.removeItem("appliedPromoCode");
          renderCheckoutPage();
        });
      }
    }
  }
}

function attachCheckoutListeners() {
  const confirmBtn = document.getElementById("confirm-payment");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const fName = document.getElementById("fName").value.trim();
      const lName = document.getElementById("lName").value.trim();
      const email = document.getElementById("email").value.trim();
      const trn = document.getElementById("trn").value.trim();
      const dob = document.getElementById("dob").value.trim();
      const pNum = document.getElementById("pNum").value.trim();
      const address1 = document.getElementById("address1").value.trim();
      const address2 = document.getElementById("address2").value.trim();
      const paymentMethod = document.getElementById("payment-method").value;

      const selectedShipping = document.querySelector(
        'input[name="shipping-method"]:checked'
      );
      const shippingMethod = selectedShipping
        ? selectedShipping.value
        : "standard";

      if (
        !fName ||
        !lName ||
        !email ||
        !trn ||
        !dob ||
        !pNum ||
        !address1 ||
        !address2 ||
        !paymentMethod
      ) {
        alert("Please fill in all required fields.");
        return;
      }
      if (!validateTRN(trn)) {
        alert("Please enter a valid 9-digit TRN.");
        return;
      }

      if (!validateDOB(dob)) {
        alert("You must be at least 18 years old to make a purchase.");
        return;
      }
      const cart = readCart();
      const appliedPromoCode = localStorage.getItem("appliedPromoCode") || "";
      const totals = calculateCartTotals(
        cart,
        shippingMethod,
        appliedPromoCode
      );

      const invoiceData = {
        customer: {
          name: `${fName} ${lName}`,
          email,
          trn,
          dob,
          phone: pNum,
          address: `${address1}, ${address2}`,
        },
        paymentMethod,
        shippingMethod,
        appliedPromoCode: appliedPromoCode || null,
        cart,
        totals,
        date: new Date().toLocaleDateString(),
        invoiceNo: `SOLAR-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      handleCheckoutSuccess(invoiceData);
    });
  }
  //Validate trn format
  function validateTRN(trn) {
    const trnRegex = /^\d{9}$/;
    return trnRegex.test(trn);
  }

  //validate date of birth (dob) to ensure user is at least 18 years old  
  function validateDOB(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }
  document
    .querySelectorAll('input[name="shipping-method"]')
    .forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const cart = readCart();
        const appliedPromoCode = localStorage.getItem("appliedPromoCode") || "";
        const totals = calculateCartTotals(
          cart,
          e.target.value,
          appliedPromoCode
        );

        if (document.getElementById("summary-shipping")) {
          const shippingEl = document.getElementById("summary-shipping");
          shippingEl.textContent = formatMoney(totals.shipping);
          if (totals.shipping === 0 && totals.subTotal > 0) {
            shippingEl.innerHTML = `${formatMoney(
              totals.shipping
            )} <span class="free-shipping-badge">FREE</span>`;
          }
        }
        if (document.getElementById("summary-total")) {
          document.getElementById("summary-total").textContent = formatMoney(
            totals.total
          );
        }
      });
    });
}

function handleCheckoutSuccess(invoiceData) {
  const invoiceId = saveInvoiceToHistory(invoiceData);
  localStorage.setItem("invoiceData", JSON.stringify(invoiceData));
  saveCart([]);
  localStorage.removeItem("appliedPromoCode");

  alert(
    `Purchase successful! Invoice #${invoiceData.invoiceNo} has been created.`
  );
  window.location.href = "invoice.html";
}

// ==================== INVOICE FUNCTIONS ====================
function saveInvoiceToHistory(invoiceData) {
  try {
    const invoices = JSON.parse(localStorage.getItem("allInvoices")) || [];
    const invoiceWithId = {
      ...invoiceData,
      id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    invoices.unshift(invoiceWithId);
    localStorage.setItem("allInvoices", JSON.stringify(invoices));
    return invoiceWithId.id;
  } catch (error) {
    console.error("Error saving invoice to history:", error);
    return null;
  }
}

function getAllInvoices() {
  try {
    return JSON.parse(localStorage.getItem("allInvoices")) || [];
  } catch (error) {
    console.error("Error reading invoices:", error);
    return [];
  }
}
//******************************************************//
// Name: Jordyn-Rhys Davis (2405407)//
//Purpose: Function to get invoice specific to user//
//******************************************************//
// Name: Jordyn-Rhys Davis (2405407)//
//Purpose: Function to get invoice specific to user//
function getInvoiceById(invoiceId) {
  const invoices = getAllInvoices();
  return invoices.find((invoice) => invoice.id === invoiceId);
}
//******************************************************//
//******************************************************//

function generateInvoice() {
  const invoiceData = JSON.parse(localStorage.getItem("invoiceData"));
  if (!invoiceData) {
    alert("No invoice data found!");
    window.location.href = "store.html";
    return;
  }

  document.getElementById("customer-name").textContent =
    invoiceData.customer.name;
  document.getElementById("customer-address").textContent =
    invoiceData.customer.address;
  document.getElementById("customer-email").textContent =
    invoiceData.customer.email;
  document.getElementById("customer-phone").textContent =
    invoiceData.customer.phone;
  document.getElementById("invoice-no").textContent = invoiceData.invoiceNo;
  document.getElementById("invoice-date").textContent = invoiceData.date;

  const trnElement = document.getElementById("customer-trn");
  if (trnElement && invoiceData.customer.trn) {
    trnElement.textContent = invoiceData.customer.trn;
  }
  const productsContainer = document.getElementById("invoice-products");
  productsContainer.innerHTML = "";

  invoiceData.cart.forEach((item) => {
    const hasDisc = item.discountedPrice !== null;
    const displayPrice = hasDisc ? item.discountedPrice : item.price;
    const quantity = item.quantity || 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}<br><small>${item.category}</small></td>
      <td>${formatMoney(displayPrice)}</td>
      <td>${quantity}</td>
      <td>${formatMoney(displayPrice * quantity)}</td>
    `;
    productsContainer.appendChild(tr);
  });

  document.getElementById("invoice-subtotal").textContent = formatMoney(
    invoiceData.totals.subTotal
  );
  document.getElementById("invoice-shipping").textContent = formatMoney(
    invoiceData.totals.shipping
  );
  document.getElementById("invoice-discount").textContent = `-${formatMoney(
    invoiceData.totals.totalDiscount
  )}`;
  document.getElementById("invoice-taxes").textContent = formatMoney(
    invoiceData.totals.taxes
  );
  document.getElementById("invoice-total").textContent = formatMoney(
    invoiceData.totals.total
  );

  const invoiceTable = document.querySelector(".invoice-table tfoot");
  if (invoiceData.shippingMethod && invoiceTable) {
    const shippingRow = document.createElement("tr");
    shippingRow.className = "summary-row";
    shippingRow.innerHTML = `
      <td colspan="2"></td>
      <td><strong>Shipping Method</strong></td>
      <td>${
        invoiceData.shippingMethod.charAt(0).toUpperCase() +
        invoiceData.shippingMethod.slice(1)
      }</td>
    `;
    invoiceTable.insertBefore(
      shippingRow,
      invoiceTable.querySelector(".grand-total-row")
    );
  }

  if (invoiceData.appliedPromoCode && invoiceTable) {
    const promoRow = document.createElement("tr");
    promoRow.className = "summary-row";
    promoRow.innerHTML = `
      <td colspan="2"></td>
      <td><strong>Promo Code</strong></td>
      <td>${invoiceData.appliedPromoCode} (${
      PROMO_CODES[invoiceData.appliedPromoCode] * 100
    }% OFF)</td>
    `;
    invoiceTable.insertBefore(
      promoRow,
      invoiceTable.querySelector(".grand-total-row")
    );
  }
}
//******************************************************// 
// Name: Jordyn-Rhys Davis (2405407)// 
//Purpose: Function to show invoice history// 
//******************************************************// 
// Name: Jordyn-Rhys Davis (2405407)// 
//Purpose: Function to show invoice history// 
function renderInvoiceHistory() {
  const invoicesList = document.getElementById("invoices-list");
  const emptyHistory = document.getElementById("empty-history");

  if (!invoicesList) return;

  const invoices = getAllInvoices();

  if (invoices.length === 0) {
    invoicesList.style.display = "none";
    if (emptyHistory) emptyHistory.style.display = "block";
    return;
  }

  invoicesList.style.display = "block";
  if (emptyHistory) emptyHistory.style.display = "none";

  invoicesList.innerHTML = "";

  invoices.forEach((invoice) => {
    const invoiceCard = document.createElement("div");
    invoiceCard.className = "invoice-card";

    invoiceCard.innerHTML = `
      <div class="invoice-header">
        <div class="invoice-main-info">
          <h3>Invoice #${invoice.invoiceNo}</h3>
          <p><strong>Customer:</strong> ${invoice.customer.name}</p>
          <p><strong>Date:</strong> ${invoice.date}</p>
          <p><strong>Items:</strong> ${invoice.cart.length} product(s)</p>
        </div>
        <div class="invoice-amount">
          <div class="invoice-total">${formatMoney(invoice.totals.total)}</div>
          <div class="invoice-status">Completed</div>
        </div>
      </div>
      
      <div class="invoice-details">
        <div class="detail-item">
          <span class="detail-label">Payment Method</span>
          <span class="detail-value">${invoice.paymentMethod}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Shipping</span>
          <span class="detail-value">${invoice.shippingMethod}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Discount Applied</span>
          <span class="detail-value">${
            invoice.appliedPromoCode
              ? invoice.appliedPromoCode +
                " (" +
                PROMO_CODES[invoice.appliedPromoCode] * 100 +
                "% OFF)"
              : "None"
          }</span>
        </div>
      </div>
      
      <div class="invoice-actions">
        <button class="view-invoice-btn" data-invoice-id="${invoice.id}">
          View Invoice
        </button>
        <button class="download-invoice-btn" data-invoice-id="${invoice.id}">
          Download PDF
        </button>
      </div>
    `;

    invoicesList.appendChild(invoiceCard);
  });

  attachInvoiceHistoryListeners();
}
//******************************************************// 
//******************************************************// 

function attachInvoiceHistoryListeners() {
  document.querySelectorAll(".view-invoice-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const invoiceId = e.target.dataset.invoiceId;
      viewInvoice(invoiceId);
    });
  });

  document.querySelectorAll(".download-invoice-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const invoiceId = e.target.dataset.invoiceId;
      downloadInvoice(invoiceId);
    });
  });

  const backToStoreBtn = document.getElementById("back-to-store");
  if (backToStoreBtn) {
    backToStoreBtn.addEventListener("click", () => {
      window.location.href = "store.html";
    });
  }

  const clearHistoryBtn = document.getElementById("clear-history");
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to clear your entire invoice history? This cannot be undone."
        )
      ) {
        localStorage.removeItem("allInvoices");
        renderInvoiceHistory();
      }
    });
  }
}

function viewInvoice(invoiceId) {
  const invoice = getInvoiceById(invoiceId);
  if (invoice) {
    localStorage.setItem("invoiceData", JSON.stringify(invoice));
    window.location.href = "invoice.html";
  } else {
    alert("Invoice not found!");
  }
}

function downloadInvoice(invoiceId) {
  const invoice = getInvoiceById(invoiceId);
  if (!invoice) {
    alert("Invoice not found!");
    return;
  }

  let receiptText = `SOLAR SYMPHONY - INVOICE\n`;
  receiptText += `========================\n\n`;
  receiptText += `Invoice No: ${invoice.invoiceNo}\n`;
  receiptText += `Date: ${invoice.date}\n\n`;
  receiptText += `BILLING TO:\n`;
  receiptText += `${invoice.customer.name}\n`;
  receiptText += `${invoice.customer.address}\n`;
  receiptText += `Email: ${invoice.customer.email}\n`;
  receiptText += `Phone: ${invoice.customer.phone}\n\n`;
  receiptText += `ITEMS:\n`;
  if (invoice.customer.trn) {
    receiptText += `TRN: ${invoice.customer.trn}\n`;
  }
  receiptText += `------------------------\n`;

  invoice.cart.forEach((item) => {
    const price = item.discountedPrice || item.price;
    receiptText += `${item.name} x${item.quantity} @ ${formatMoney(
      price
    )} = ${formatMoney(price * item.quantity)}\n`;
  });

  receiptText += `\n`;
  receiptText += `SUBTOTAL: ${formatMoney(invoice.totals.subTotal)}\n`;
  receiptText += `SHIPPING: ${formatMoney(invoice.totals.shipping)}\n`;
  receiptText += `DISCOUNT: -${formatMoney(invoice.totals.totalDiscount)}\n`;
  receiptText += `TAX: ${formatMoney(invoice.totals.taxes)}\n`;
  receiptText += `TOTAL: ${formatMoney(invoice.totals.total)}\n\n`;
  receiptText += `Payment Method: ${invoice.paymentMethod}\n`;
  receiptText += `Shipping Method: ${invoice.shippingMethod}\n`;
  if (invoice.appliedPromoCode) {
    receiptText += `Promo Code: ${invoice.appliedPromoCode}\n`;
  }
  receiptText += `\nThank you for your business!\n`;
  receiptText += `Solar Symphony - Powering Your Future\n`;

  const blob = new Blob([receiptText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `SolarSymphony_Invoice_${invoice.invoiceNo}.txt`;
  link.click();
}

function attachInvoiceListeners() {
  const printBtn = document.getElementById("print-invoice");
  const backBtn = document.getElementById("back-to-store");

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "store.html";
    });
  }
}
