# 🌊 JalRakshak

A **MERN-based disaster response and flood relief coordination platform** with real-time updates, geolocation, live maps, and role-based workflows for victims, volunteers, NGOs, and administrators.

**Demo Use Case:** Assam Flood Relief
**Architecture:** Region-agnostic — can be adapted to other regions through seed data.

## ✨ Features

* 🚨 SOS emergency requests with live location
* 📍 Nearby volunteer matching using geospatial queries
* 💬 Real-time chat, notifications, and emergency updates with Socket.io
* 🗺️ Live shelter/relief-camp map with Leaflet
* 👥 Role-based dashboards for Victims, Volunteers, NGOs & Admins
* 🏕️ Shelter occupancy and resource management
* 🌦️ Automated weather-risk alerts
* 📊 Admin analytics and request tracking
* 🔐 JWT authentication with refresh tokens & RBAC
* 📷 Photo/video uploads via Cloudinary

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Redux Toolkit, Leaflet
**Backend:** Node.js, Express, MongoDB, Socket.io
**Other:** JWT, Cloudinary, Docker, GitHub Actions, Jest

## 📁 Structure

JalRakshak/
├── client/              # React frontend
├── server/              # Express backend
├── docker-compose.yml   # Docker setup
└── .github/workflows/   # CI


## 🚀 Run Locally

### Backend

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Docker

```bash
docker compose up --build
```
```text 
Docker is not required to run JalRakshak locally. You can run the frontend, backend, and MongoDB directly on your system by following the local setup instructions above. Docker Compose is provided as an optional alternative for anyone who wants to run the complete application in containers with minimal setup.
```

## 👤 Demo Accounts

Password: `password123`

```text
admin@jalrakshak.org
ngo@jalrakshak.org
volunteer@jalrakshak.org
victim@jalrakshak.org
```

## 📌 Note

This is a **demo-scale project** built to demonstrate real-time communication, geospatial services, role-based access, and disaster-relief coordination using the MERN stack.
