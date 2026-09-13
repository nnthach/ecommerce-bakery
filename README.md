# Petit Bakery

An e-commerce project that lets customers **order cakes available on the same day by area (city, district/ward)** from bakery stores. The system has 3 main roles: **Customer**, **Staff**, and **Admin**, plus an **AI Chatbot** that answers customers using **RAG + Vector Database**.

## 🖥️ Live Demo

🔗 **Deploy:** [https://ecommerce-bakery-one.vercel.app/](https://ecommerce-bakery-one.vercel.app/)

| Panel | Page |
|-------|------|
| Customer | `/` (home), `/menu`, `/order` |
| Staff | `/staff/dashboard` |
| Admin | `/admin/dashboard` |

## ✨ Features

### 👤 User (Customer)
- Register / sign in (email & password, **Google Login** supported).
- Browse the daily menu and see **remaining quantity per-day per-store** for each area (city + district).
- **Login / create a new account is required** before adding items to the cart and placing an order.
- Place orders online and pick the store that delivers to your area.
- Online payment:
  - **PayOS QR** (scan QR code to pay)
- Track order status and order history.
- Submit product reviews.

### 👨‍🍳 Staff
- **Update the daily cake quantities** (planned quantity / remaining quantity) for the exact store they work at.
- Manage and confirm orders for their store (`/staff/orders`).
- View customer reviews for their store (`/staff/reviews`).

### 🛡️ Admin
- **Dashboard** with stats: revenue, orders, top-selling products.
- Manage the whole system:
  - **Stores**: list, enable/disable, organized by area.
  - **Staffs**: create staff accounts, assign stores, enable/disable.
  - **Customer accounts**: view, ban, manage status.
  - **Products**, **categories**, **ingredients**.
  - **Orders** across the entire system.
  - **Store inventories**: view daily cakes sold for each store.
  - **Preorder schedules**.
- Manage **knowledge documents** used by the AI Chatbot.

### 🤖 AI Chatbot – RAG + Vector Database
- Built with **RAG (Retrieval-Augmented Generation)** using the **Cohere AI API**.
- Documents (`.txt`, `.md`) are **chunked** and **embedded** into vectors using the `embed-v4.0` model, stored in **Supabase pgvector**.
- Customer questions are embedded → vector similarity search → reranked → answer generated.
- **Language detection (EN/VI)** and **intent detection**: product questions, store questions, general info.
- **Rate limiting** to prevent spam.

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix UI) |
| Backend | Node.js (Next.js API Routes), Server Actions |
| Database | Supabase (PostgreSQL + **pgvector**) |
| AI | **Cohere AI API** (embed-v4.0, rerank, generate), RAG |
| Vector DB | Supabase pgvector |
| Payment | **PayOS** (QR code) + **Stripe** (VISA) |
| Cache / Rate limit | Aiven, ioredis |
| Image upload | Cloudinary |
| Auth | Supabase Auth (email/password, Google OAuth) |
| Forms & Validation | React Hook Form, Zod |
| Cron | Supabase Cron|

## 📄 AI Knowledge Base

Default knowledge file: `bakery_store_knowledge.md` (admins can upload new `.txt`/`.md` documents; the system automatically chunks → embeds → stores vectors).