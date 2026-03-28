# 🛒 Modern E-Commerce App

Fullstack e-commerce application built with **React** (frontend) and **Spring Boot** (backend).
Includes authentication, product listing, shopping cart, and order management features.

---

## 🚀 Features

* 🔐 User Authentication (Register / Login with JWT)
* 🛍️ Product Listing (Dynamic from backend API)
* 🛒 Shopping Cart (Add, remove, update quantity)
* 💳 Checkout System (Create orders)
* 📦 Order History (User-specific orders)
* 🔒 Protected Routes (Frontend + Backend security)
* 📱 Responsive & Clean UI

---

## 🧱 Tech Stack

### Frontend

* React
* React Router
* Fetch API
* CSS (custom styling)

### Backend

* Spring Boot
* Spring Security (JWT)
* JPA / Hibernate
* Maven

### Database

* H2 / (or your DB here)

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/modern-ecommerce-app.git
cd modern-ecommerce-app
```

---

### 2. Backend setup

```bash
cd ecommerce-backend
mvn clean install
mvn spring-boot:run
```

Backend runs on:

```
http://localhost:8081
```

---

### 3. Frontend setup

```bash
cd ecommerce-frontend
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## 🔐 Authentication Flow

1. User registers
2. User logs in
3. Backend returns JWT token
4. Token stored in localStorage
5. Protected routes require token

---

## 📸 Screenshots

> You can add screenshots here later

---

## 📌 Future Improvements

* Product search & filtering
* Pagination (server-side)
* Admin panel
* Payment integration
* Better UI (animations / design system)

---

## 👨‍💻 Author

Murat

---

## 📄 License

This project is for educational and portfolio purposes.
