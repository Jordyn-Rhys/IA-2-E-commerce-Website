// File: login.js - Handles login/logout functionality only
// This file runs IMMEDIATELY when loaded to prevent flickering

// ==================== IMMEDIATE EXECUTION ====================
// Run this immediately, not waiting for DOMContentLoaded
(function initNavButtons() {
  // Check if we're in a browser environment
  if (typeof document === "undefined") return;

  // Get login status
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // Get all nav buttons
  const loginButtons = document.querySelectorAll(".login-btn, .register-btn");
  const authButtons = document.querySelectorAll(
    ".invoices-btn, .logout-btn, .cart-icon-btn"
  );

  // Update button visibility IMMEDIATELY
  if (loginButtons.length > 0) {
    loginButtons.forEach((btn) => {
      if (btn) btn.style.display = isLoggedIn ? "none" : "inline-flex";
    });
  }

  if (authButtons.length > 0) {
    authButtons.forEach((btn) => {
      if (btn) btn.style.display = isLoggedIn ? "inline-flex" : "none";
    });
  }

  // Also update cart badge immediately
  updateCartBadge();

  // Mark as initialized to prevent duplicate updates
  window.navButtonsInitialized = true;
})();

// ==================== DOM CONTENT LOADED ====================
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ login.js DOM loaded - Handling form submission");

  // ==================== LOGIN FORM HANDLING ====================
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const trn = document.getElementById("trn").value.trim();
      const password = document.getElementById("password").value.trim();

      // Basic validation
      //checks if both trn and password are entered
      if (!trn || !password) {
        alert("Please enter both trn and password.");
        return;
      }
      //checks if trn is valid
      if (!validateTRN(trn)) {
        alert("Please enter a valid TRN (9 digits).");
        return;
      }

      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(
        (u) => u.trn === trn && u.password === password
      );

      if (user) {
        // Successful login
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            email: user.email,
            name: user.name || user.email.split("@")[0],
          })
        );

        // Update UI immediately
        updateNavButtonsImmediately();

        // Record this login and show frequency (uses user.id if available, otherwise email)
        try {
          const uid = user.id || user.email;
          recordLogin(uid);
          ShowUserFrequency(uid);
        } catch (e) {
          console.warn("Could not record login frequency:", e);
        }

        alert(`Welcome back, ${user.name || user.email.split("@")[0]}!`);
        window.location.href = "index.html";
      } else {
        // Failed login
        alert("Invalid TRN or password. Please try again.");
      }
    });
  }

  // ==================== REGISTRATION FORM HANDLING ====================
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form values
      const firstName = document.getElementById("first-name").value.trim();
      const lastName = document.getElementById("last-name").value.trim();
      const address = document.getElementById("address").value.trim();
      const trn = document.getElementById("trn").value.trim();
      const email = document.getElementById("register-email").value.trim();
      const dob = document.getElementById("dob").value.trim();

      const password = document
        .getElementById("register-password")
        .value.trim();
      const phone = document.getElementById("phone").value.trim();

      // Basic validation
      if (
        !firstName ||
        !lastName ||
        !address ||
        !email ||
        !trn ||
        !dob ||
        !password ||
        !phone
      ) {
        alert("Please fill in all required fields.");
        return;
      }

      // Email validation (basic)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }
      // DOB validation
      if (!validateDOB(dob)) {
        alert("You must be at least 18 years old to register.");
        return;
      }

      // TRN validation
      function validateTRN(trn) {
        const trnRegex = /^\d{9}$/;
        return trnRegex.test(trn);
      }

      // Password validation (at least 6 characters)
      if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
      }

      // Check if user already exists
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const existingUser = users.find((u) => u.email === email || u.trn === trn);

      if (existingUser) {
        alert(
          "An account with this email or TRN already exists. Please log in instead."
        );
        return;
      }

      // Create new user object
      const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        address,
        email,
        dob,
        trn,
        password,
        phone,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      // Auto-login the new user
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          trn: newUser.trn,
          name: newUser.name,
        })
      );

      // Update UI immediately
      updateNavButtonsImmediately();

      // Record this new user's first login and show frequency
      try {
        recordLogin(newUser.id);
        ShowUserFrequency(newUser.id);
      } catch (e) {
        console.warn("Could not record login frequency for new user:", e);
      }

      alert(
        `Welcome to Solar Symphony, ${firstName}! Your account has been created.`
      );
      window.location.href = "index.html";
    });

    // Change button text from "Log in" to "Sign up"
    const submitButton = registerForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Sign up";
    }
  }

  // Check for logout parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("logout")) {
    logout();
  }
});

// ==================== FUNCTIONS ====================
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
// Logout function (called from navbar button)
function logout() {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");

    // Update UI immediately before redirect
    updateNavButtonsImmediately();

    // Redirect to home page
    window.location.href = "index.html";
  }
}

// Update navigation buttons immediately (no DOMContentLoaded wait)
function updateNavButtonsImmediately() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const loginButtons = document.querySelectorAll(".login-btn, .register-btn");
  const authButtons = document.querySelectorAll(
    ".invoices-btn, .logout-btn, .cart-icon-btn"
  );

  if (loginButtons.length > 0) {
    loginButtons.forEach((btn) => {
      if (btn) btn.style.display = isLoggedIn ? "none" : "inline-flex";
    });
  }

  if (authButtons.length > 0) {
    authButtons.forEach((btn) => {
      if (btn) btn.style.display = isLoggedIn ? "inline-flex" : "none";
    });
  }
}


// Update cart badge (simple version for login.js)
function updateCartBadge() {
  try {
    const raw = localStorage.getItem("cart");
    const cart = raw ? JSON.parse(raw) : [];
    const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const navCartBadge = document.getElementById("nav-cart-badge");

    if (navCartBadge) {
      navCartBadge.textContent = totalQty;
      navCartBadge.style.display = totalQty > 0 ? "flex" : "none";
    }
  } catch (e) {
    console.error("Error updating cart badge in login.js:", e);
  }
}
// ==================== LOGIN FREQUENCY TRACKING ====================
// Name: Jordyn-Rhys Davis (2405407)
// Record a login event for a userId (string). Stores timestamps in localStorage
function recordLogin(userId) {
  if (!userId) return;
  try {
    const key = `loginHistory_${userId}`;
    const raw = localStorage.getItem(key);
    const history = raw ? JSON.parse(raw) : [];
    history.push(new Date().toISOString());
    if (history.length > 200) history.splice(0, history.length - 200);
    localStorage.setItem(key, JSON.stringify(history));
    return history.length;
  } catch (e) {
    console.error("recordLogin failed:", e);
    return 0;
  }
}

// ShowUserFrequency: reads the login history for `userId`, updates an element with id
// `user-frequency` if present, logs to console, and returns the frequency number.
function ShowUserFrequency(userId) {
  if (!userId) return 0;
  try {
    const key = `loginHistory_${userId}`;
    const history = JSON.parse(localStorage.getItem(key)) || [];
    const frequency = history.length;
    console.log(`User ${userId} has logged in ${frequency} times.`);
    const freqEl = document.getElementById("user-frequency");
    if (freqEl) {
      freqEl.textContent = `Login Frequency: ${frequency}`;
    }
    return frequency;
  } catch (e) {
    console.error("ShowUserFrequency failed:", e);
    return 0;
  }
}

// Expose to the window so it can be called from other scripts or the console
window.ShowUserFrequency = ShowUserFrequency;
window.recordLogin = recordLogin;