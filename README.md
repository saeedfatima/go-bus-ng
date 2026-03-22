# 🚍 NaijaBus

A scalable bus booking and transport management platform built with Django and React.

![Status](https://img.shields.io/badge/status-active-success)
![Backend](https://img.shields.io/badge/backend-Django-green)
![Frontend](https://img.shields.io/badge/frontend-React-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)


/docs/images/

## 📸 Screenshots

### Passenger Booking Interface
![Booking UI](docs/images/booking.png)

### Admin Dashboard
![Dashboard](docs/images/dashboard.png)

## 🎥 Demo

Watch demo here: https://go-bus-ng-frontend.onrender.com

## ✨ Features

### 👤 Passenger
- Search trips by route and date
- Book seats with real-time availability
- Secure payment integration
- Booking history tracking

### 🏢 Transport Companies
- Manage buses and routes
- Schedule trips
- Track revenue and bookings

### ⚙️ Admin
- User management
- Company verification
- System analytics

  ## 🏗️ Architecture
docs/images/architecture.png

## 🧠 System Design

- Multi-tenant architecture (multiple transport companies)
- RESTful API design
- Modular Django app structure
- Booking lifecycle management

  ## 🗄️ Database Schema

Core Entities:
- Users
- Companies
- Buses
- Routes
- Trips
- Bookings

![Database](docs/images/db-schema.png)

## 🛠 Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS

**Backend**
- Django REST Framework

**Database**
- PostgreSQL

**Integrations**
- Payment Gateway API
- Resend Email API

## 🚀 Getting Started

### Clone repo
```bash
git clone https://github.com/yourusername/naijabus.git
cd naijabus

cd frontend
npm install
npm run dev


---

### 🔐 Environment Variables

```markdown
## 🔐 Environment Variables

Create a `.env` file:
DATABASE_URL=
SECRET_KEY=
RESEND_API_KEY=
PAYMENT_API_KEY=

## 📊 Project Status

| Feature | Status |
|--------|--------|
| Authentication | ✅ Done |
| Booking System | ✅ Done |
| Payment Integration | ✅ Done |
| Seat Locking | ✅ Done |

## 🧭 Roadmap

- [ ] Real-time seat locking
- [ ] Mobile app integration
- [ ] QR ticket validation
- [ ] AI-based trip demand prediction

## 👨‍💻 Author

Saidu Usman Abdullahi  
Backend & Fullstack Developer  
