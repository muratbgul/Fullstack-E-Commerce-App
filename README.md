# E-Commerce Fullstack Application

## Overview
This is a modern, responsive, and fully-functional E-Commerce application. It demonstrates a complete flow including product listing, shopping cart management, secure checkout with payment integration (Iyzico Sandbox), order tracking, and refund requests. It also features a dedicated Admin Panel for inventory and order management.

## Technologies Used
**Frontend:**
- React (Create React App)
- Framer Motion (for animations)
- Vanilla CSS (Glassmorphism & modern UI/UX design)
- React Router DOM

**Backend:**
- Java 17
- Spring Boot (Web, Data JPA, Security)
- MySQL Database
- JWT (JSON Web Tokens) for authentication
- Iyzico Payment API Integration
- Fake SMTP for email notifications

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- Java 17
- MySQL Server

### 1. Database Setup
Create a MySQL database named `ecommerce`.
```sql
CREATE DATABASE ecommerce;
```

### 2. Environment Variables
Create a `.env` file in the root directory. You can copy the contents from `.env.example`.

**`.env` example:**
```env
DB_URL=jdbc:mysql://localhost:3306/ecommerce
DB_USERNAME=root
DB_PASSWORD=your_database_password

# IYZICO Sandbox Configuration
IYZICO_API_KEY=sandbox-CU1KlgqtwiBoEKkpUqhVu1jmBjRBFyT4
IYZICO_SECRET_KEY=sandbox-Wqpu7iH4TPNzcvHsoG8dTnlm1eMQ3wV4
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# JWT Secret
JWT_SECRET=your_super_secret_key_here_for_jwt_token_generation
```

### 3. Backend Setup
Navigate to the `ecommerce-backend` folder and run the Spring Boot application.
```bash
cd ecommerce-backend
./mvnw spring-boot:run
```
*(The application runs on `http://localhost:8081` by default)*

### 4. Frontend Setup
Navigate to the `ecommerce-frontend` folder, install dependencies, and start the development server.
```bash
cd ecommerce-frontend
npm install
npm start
```
*(The frontend runs on `http://localhost:3000` by default)*

## Features
- **User Authentication:** Registration and Login with JWT tokens. Role-based access control (USER / ADMIN).
- **Product Browsing:** Display products with dynamic stock status.
- **Cart & Checkout:** Add to cart, synchronous payment via Iyzico sandbox matching items.
- **Order Management (User):** Track orders, request full or partial refunds for delivered items.
- **Order Management (Admin):** Update order status (PENDING -> PROCESSING -> SHIPPED -> DELIVERED), approve refunds.
- **Product Management (Admin):** Add, Edit, Delete products and manage stock levels.

## License
MIT License
