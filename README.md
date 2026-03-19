🚍 NaijaBus – Online Bus Ticket Booking Platform

NaijaBus is an open-source web platform designed to modernize inter-state bus transportation in Nigeria.

The system enables passengers to search and book trips online while allowing transport companies to manage routes, buses, schedules, and bookings through a centralized management dashboard.

The project aims to help transport operators transition from manual ticketing systems to scalable digital booking infrastructure.



✨ Key Features

Passenger Portal

Search trips by origin, destination, and date

View available buses and schedules

Select seats and book tickets

Secure online payment processing

Receive electronic ticket confirmation

Access booking history


Transport Company Dashboard

Register and manage transport companies

Manage buses and seating capacity

Create and update routes

Schedule trips

Monitor bookings and revenue


Platform Administration

Manage users and roles

Verify registered companies

Monitor platform activity

View system analytics and reports




🎯 Project Goals

NaijaBus aims to:

Digitize traditional bus ticketing systems

Reduce booking conflicts and manual errors

Enable secure and transparent booking processes

Support multiple transport companies within a single platform

Provide a scalable infrastructure for transportation technology in developing regions



🏗 System Architecture

The platform follows a layered architecture:

Client Layer
User interface and passenger interaction

Backend Layer
Application logic and REST API services

Database Layer
Persistent storage of operational data

External Services
Payment gateways and notification services

System design includes:

Use Case Diagrams

Data Flow Diagrams (DFD Level 0 & Level 1)

Database Schema Modeling




🗄 Database Entities

Core system entities include:

Users

Companies

Buses

Routes

Trips

Bookings

Passengers

Cities


These entities support route scheduling, passenger booking, and transport company management.




🛠 Technology Stack

Frontend

React.js

Tailwind CSS

JavaScript


Backend

Django / Node.js

REST API architecture


Database

PostgreSQL

MySQL

SQLite


External Integrations

Payment Gateway API

Email Notification Service (Brevo SMTP recommended)





⚙ Installation

1. Clone Repository

git clone https://github.com/saeedfatima/go-bus-ng.git
cd go-bus-ng

2. Install Dependencies

Frontend

npm install
npm run dev

Backend

pip install -r requirements.txt
python manage.py runserver




🔑 Environment Configuration

Create a .env file and configure the following variables:

DATABASE_URL=
SECRET_KEY=
PAYMENT_API_KEY=
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
DEFAULT_FROM_EMAIL=




📊 Future Improvements

Planned improvements include:

Mobile application integration

Real-time seat locking mechanism

QR-based ticket validation

Automated refund processing

AI-based demand forecasting for trip planning

Multi-transport company network support





🤝 Contributing

Contributions are welcome.

To contribute:

1. Fork the repository


2. Create a new feature branch


3. Commit your changes


4. Submit a pull request



Bug reports, feature requests, and documentation improvements are encouraged.




📄 License

This project is open-source and available under the MIT License.



👨‍💻 Maintainer

Saidu Usman Abdullahi

Developer focused on building open digital infrastructure for transportation, logistics, and enterprise systems in emerging markets.
