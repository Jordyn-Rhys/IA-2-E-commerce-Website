# 🌞 Solar Symphony

Solar Symphony is a **front‑end web project** showcasing a clean, responsive e‑commerce site for solar energy products.  
It includes a homepage, product store, shopping cart, and installation package sections — styled with modern CSS and interactive JavaScript.

---

## 👥 Group Members

- **Camaria Simpson**  
- **Nathan Wilson**  
- **Jordyn‑Rhys Davis**  
- **Xante Graham**

---

## 🛠️ Frameworks & Tools Used

- **HTML5** – semantic structure  
- **CSS3** – responsive layouts, grid/flexbox, hover effects  
- **JavaScript (ES6)** – cart logic, login/logout, navigation  
- **GitHub** – version control and collaboration  
- **Visual Studio Code (VS Code)** – development environment  

---

## 📂 Project Structure

SolarSymphony/
│
├── index.html               # Homepage with hero, features, about us
├── index.css                # Global styles for homepage and shared components
│
├── store.html               # Product listing and installation packages
├── store.css                # Styles for store layout and product cards
│
├── cart.html                # Shopping cart page with order summary
├── cart.css                 # Styles for cart items and checkout
│
├── checkout.html            # Checkout page with shipping & payment form
├── checkout.css             # Styles for checkout layout
│
├── invoice.html             # Generated invoice after purchase
├── invoice.css              # Styles for invoice page
│
├── invoice-history.html     # List of past invoices (requires login)
├── invoice-history.css      # Styles for invoice history page
│
├── login.html               # Login form
├── login.css                # Styles for login/register pages
│
├── main.js                  # Cart, store, checkout, invoice logic
├── login.js                 # Login/logout, navbar visibility, cart badge
│
---

## 🚀 How to Run the Project

1. 	Download or clone the repository.
2. 	Double‑click  to open it in your browser.
3. 	Use the header navigation to move between pages.

## 🔑 Login & Access Flow

- You **must be logged in** for purchasing and invoice features.  
- The navbar shows different buttons depending on your login state:  
  - **Logged out:** “Log‑in”, “Register”  
  - **Logged in:** “My Invoices”, cart icon, “Logout”  

---

## ⚠️ Warnings

- You **cannot purchase** unless you are logged in.  
- “Invoice History” and “My Invoices” buttons are hidden until you log in.  
- This project uses **localStorage only**; there is no real payment processing or backend.  
- Data (cart, users, invoices) is stored in your browser and may be cleared if you reset storage.  

---

## 🧪 Demo Credentials

For testing purposes, you can register any email/password via `register.html`.  
Or use this demo account:

- **Email:** `demo@example.com`  
- **Password:** `demoPass123`  

---

## 🧩 Technical Details

- **main.js**  
  - Handles cart CRUD via localStorage  
  - Discount logic via category and promo codes  
  - Shipping tiers and tax calculation  
  - Checkout → invoice generation and invoice history storage  

- **login.js**  
  - Updates navbar visibility based on `isLoggedIn` flag  
  - Registration stores user profile in localStorage and auto‑logs in  
  - Logout clears session and redirects to Home  
---
📜 License
© 2025 Solar Symphony. All rights reserved.
Built for educational/demo purposes by Camaria Simpson, Nathan Wilson, Jordyn‑Rhys Davis, and Xante Graham.
