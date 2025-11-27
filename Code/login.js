// File: login.js - Handles login and registration interactions (client-side)
document.addEventListener('DOMContentLoaded', function () {
  // Short query helper
  const $ = sel => document.querySelector(sel);

  // getReturnTo: reads returnTo param so we can navigate back after auth
  function getReturnTo() {
    const params = new URLSearchParams(window.location.search);
    return params.get('returnTo') || 'store.html';
  }

  // Basic email validation (very small check)
  function validateEmail(email) {
    console.log("Validating email:", email);
    return String(email).includes('@') && email.includes('.');
  }

  // Ensure a minimal password length
  function validatePassword(pw) {
    return pw && pw.length >= 6;
  }

  // Simple error UI (alert) for demo purposes
  function showError(msg) {
    alert(`⚠️ ${msg}`);
  }

  // Helpers to read/write a simple users array in localStorage (demo only)
  function getUsers() {
    try {
      const raw = localStorage.getItem('users');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // Save a new user to localStorage
  function saveUser(email, password) {
    const users = getUsers();
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Find user by email
  function findUser(email) {
    return getUsers().find(u => u.email === email);
  }

  // Check user credentials (plain-text demo check)
  function checkCredentials(email, password) {
    const user = findUser(email);
    return user && user.password === password;
  }

  // LOGIN: handle login form submission
  const loginForm = $('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = $('#email')?.value.trim();
      const password = $('#password')?.value;

      if (!validateEmail(email)) return showError('Invalid email address');
      if (!validatePassword(password)) return showError('Password must be at least 6 characters');

      if (!checkCredentials(email, password)) {
        return showError('Incorrect email or password, or account not registered.');
      }

      localStorage.setItem('authToken', 'demo-token');
      localStorage.setItem('authEmail', email);
      alert('✅ Login successful!');
      window.location.href = getReturnTo();
    });
  }

  // REGISTER
  const registerForm = $('#register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = $('#register-email')?.value.trim();
      const password = $('#register-password')?.value;
      const confirm = $('#register-confirm')?.value;

      if (!validateEmail(email)) return showError('Invalid email address');
      if (!validatePassword(password)) return showError('Password must be at least 6 characters');
      if (findUser(email)) return showError('An account with this email already exists');

      saveUser(email, password);
      localStorage.setItem('authToken', 'demo-token');
      localStorage.setItem('authEmail', email);
      alert('✅ Registration successful!');
      window.location.href = getReturnTo();
    });
  }
});



