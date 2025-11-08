document.addEventListener('DOMContentLoaded', function () {
  const $ = sel => document.querySelector(sel);

  function getReturnTo() {
    const params = new URLSearchParams(window.location.search);
    return params.get('returnTo') || 'store.html';
  }

  function validateEmail(email) {
    console.log("Validating email:", email);
    return String(email).includes('@') && email.includes('.');
  }

  function validatePassword(pw) {
    return pw && pw.length >= 6;
  }

  function showError(msg) {
    alert(`⚠️ ${msg}`);
  }

  function getUsers() {
    try {
      const raw = localStorage.getItem('users');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveUser(email, password) {
    const users = getUsers();
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
  }

  function findUser(email) {
    return getUsers().find(u => u.email === email);
  }

  function checkCredentials(email, password) {
    const user = findUser(email);
    return user && user.password === password;
  }

  // LOGIN
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



