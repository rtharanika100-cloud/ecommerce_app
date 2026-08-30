# 🛒 AURA.in — Indian E-Commerce Platform (Flipkart + Myntra + Amazon India Style)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)
![NodeJS](https://img.shields.io/badge/Node.js-REST--API-green.svg)
![Currency](https://img.shields.io/badge/Currency-INR%20%E2%82%B9-orange.svg)

**AURA.in** is a full-stack e-commerce web application specifically built for Indian customers. The platform combines visual elements, promotional features, and checkout experiences inspired by **Flipkart**, **Myntra**, and **Amazon India**.

---

## 🌟 Highlights & Indian E-Commerce Features

- **🔤 Indian Rupee (₹) Pricing**: Prices formatted with the Indian Numbering System (`₹1,999`, `₹10,500`, `₹1,29,999`).
- **🪔 Festive Sale Campaigns**: Interactive banner slider featuring **Diwali Dhamaka 🪔**, **Big Billion Deals**, **The Great Indian Festival**, and **Lucknowi Chikankari Ethnic Wear**.
- **📍 Indian Address & Pincode Validation**: Address form enforcing 6-digit Indian Pincodes (`560038`, `400051`) with Indian state dropdown selection.
- **🚚 Delivery Rules**: **Free Express Delivery** on orders ₹499 and above, or ₹50 delivery charge for orders under ₹499.
- **📲 Indian Payment Simulation**:
  - **UPI Instant**: Google Pay, PhonePe, Paytm, and BHIM UPI with Virtual Payment Address (VPA) ID validation (`user@okaxis`).
  - **Cash on Delivery (COD)**: Doorstep collection option.
  - **Debit / Credit Card**: RuPay, Visa, and Mastercard simulation.
  - **Net Banking**: HDFC, ICICI, SBI, Axis Bank support.
- **📄 GST Tax Invoices & Order Tracking**: Visual progress bar (*Placed* → *Processing* → *Shipped* → *Delivered*) with estimated delivery dates, tracking AWB codes, and printable **GST Tax Invoice PDFs** with GSTIN (`29AABCA1234F1Z9`).
- **⚡ System Admin Control Panel**: Real-time sales revenue KPI widgets in ₹, product catalog management (Add/Edit/Delete), and customer order status manager.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 SPA, Glassmorphic Tailwind CSS, Lucide Icons
- **Bundler**: Custom single-bundle compiler (`scripts/build.js` -> `public/app.jsx`)
- **Backend**: Node.js REST API Server (`server/index.js`)
- **Database**: JSON File Storage (`server/data/seed.json`)
- **Authentication**: JWT Bearer Tokens with Role-Based Access Control (`user` vs `admin`)

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v16 or higher) installed on your system.

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/rtharanika100-cloud/ecommerce_app.git
   cd ecommerce_app
   ```

2. **Build Client Bundle**
   ```bash
   node scripts/build.js
   ```

3. **Start Node REST API Server**
   ```bash
   node server/index.js
   ```

4. **Open Application**
   Navigate to `http://localhost:5000` in your web browser.

---

## 🔑 Pre-Configured Demo Accounts

For testing, use the built-in quick demo login buttons or credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer Demo** | `user@example.com` | `password123` |
| **System Admin** | `admin@example.com` | `admin123` |

---

## 📜 9-Phase Git Commit History

```bash
ad2aa77 Final UI polish and performance improvements
5ef6afc Admin panel for product and order management
067fa15 Order management system implemented
0f0784c Checkout system with Indian payment options
c8af4c1 Shopping cart with INR calculation
affa3ed Product listing and details with INR pricing
6ac3423 Homepage UI with navbar, banners, and product cards
e60c91b feat(phase-1): Indian e-commerce setup with INR currency pricing and Diwali festival banners
bad44d9 feat(phase-3): complete authentication system with JWT bearer tokens and password visibility toggles
5f9f2c2 feat(phase-2): enhance product listing layout switcher and details page features
```

---

## 🔗 Repository Links

- **GitHub Profile**: [https://github.com/rtharanika100-cloud](https://github.com/rtharanika100-cloud)
- **GitHub Repository**: [https://github.com/rtharanika100-cloud/ecommerce_app](https://github.com/rtharanika100-cloud/ecommerce_app)
