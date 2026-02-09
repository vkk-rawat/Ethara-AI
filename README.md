# HRMS Lite — Human Resource Management System

A lightweight, full-stack Human Resource Management System that enables admins to manage employee records and track daily attendance through a clean, professional web interface.

---

## 🔗 Live Links

| Resource | URL |
|----------|-----|
| **Frontend (Vercel)** | [https://ethara-ai.vercel.app](https://ethara-ai.vercel.app) |
| **Backend API (Render)** | [https://ethara-ai-backend.onrender.com](https://ethara-ai-backend.onrender.com) |
| **GitHub Repository** | [https://github.com/vkk-rawat/Ethara-AI](https://github.com/vkk-rawat/Ethara-AI) |

> **Note:** The Render free tier spins down after inactivity. The first request may take ~30 seconds to cold-start.

---

## 📋 Project Overview

HRMS Lite is a web-based internal HR tool that allows a single admin user to:

- **Employee Management** — Add, view, and delete employee records (Employee ID, Full Name, Email, Department)
- **Attendance Tracking** — Mark daily attendance (Present / Absent), view per-employee records
- **Dashboard** — Real-time summary with total employees, attendance rate, present/absent counts, and recent activity

The application is built with a **React** frontend and a **Python FastAPI** backend, persisting data in **MongoDB Atlas**.

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| Vite 5 | Build tool & dev server |
| CSS3 | Custom styling with glassmorphism, animations & gradients |

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.13 | Runtime |
| FastAPI | Web framework & REST API |
| Motor | Async MongoDB driver |
| Pydantic v2 | Request validation & settings |
| Uvicorn | ASGI server |
| Certifi | SSL certificate bundle for MongoDB Atlas |

### Database
| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Cloud-hosted NoSQL database |

### Deployment
| Platform | Purpose |
|----------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |

---

## 🏗 Project Structure

```
Ethara-AI/
├── README.md
├── render.yaml                  # Render deployment blueprint
├── .gitignore
│
├── backend-python/              # FastAPI backend
│   ├── main.py                  # App entry point, lifespan, CORS, routers
│   ├── config.py                # Pydantic settings (env vars)
│   ├── database.py              # MongoDB connection (motor + certifi)
│   ├── models.py                # Pydantic request/response models
│   ├── requirements.txt         # Python dependencies
│   └── routes/
│       ├── employees.py         # CRUD endpoints for employees
│       └── attendance.py        # CRUD + summary endpoints for attendance
│
└── frontend/                    # React + Vite frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── vercel.json              # Vercel deployment config
    └── src/
        ├── App.jsx              # Root component with tab navigation
        ├── App.css
        ├── index.css            # Global styles & CSS variables
        ├── main.jsx             # React entry point
        ├── api/
        │   └── apiService.js    # API client (employeeAPI, attendanceAPI)
        └── components/
            ├── Header/          # Navigation header
            ├── Dashboard/       # Summary stats & recent activity
            ├── Employee/        # EmployeeList, EmployeeCard, EmployeeForm
            ├── Attendance/      # AttendanceManager, AttendanceForm
            └── common/          # Toast, LoadingSpinner, EmptyState, ErrorState
```

---

## 🚀 API Endpoints

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/employees` | List all employees |
| `GET` | `/api/employees/:id` | Get employee by ID |
| `POST` | `/api/employees` | Create new employee |
| `PUT` | `/api/employees/:id` | Update employee |
| `DELETE` | `/api/employees/:id` | Delete employee |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/attendance` | List all attendance (supports `?date=` and `?employeeId=` filters) |
| `GET` | `/api/attendance/summary` | Dashboard summary stats |
| `GET` | `/api/attendance/employee/:id` | Attendance records for a specific employee |
| `POST` | `/api/attendance` | Mark attendance |
| `PUT` | `/api/attendance/:id` | Update attendance record |
| `DELETE` | `/api/attendance/:id` | Delete attendance record |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info |
| `GET` | `/api/health` | Health check |

---

## ✅ Validations & Error Handling

### Server-side Validations
- **Required fields** — Employee ID, Full Name, Email, Department are mandatory
- **Email format** — Validated via Pydantic `EmailStr`; auto-lowercased
- **Duplicate handling** — Unique constraints on Employee ID and Email
- **Date format** — Attendance date validated as `YYYY-MM-DD`
- **Attendance status** — Restricted to `"Present"` or `"Absent"` (Literal type)
- **Duplicate attendance** — Prevents marking same employee twice on the same date

### Error Responses
- Proper HTTP status codes (`400`, `404`, `500`)
- Consistent JSON structure: `{ "success": false, "message": "..." }`
- Graceful MongoDB error handling with user-friendly messages

### Client-side UI States
- **Loading states** — Animated spinner during data fetch
- **Empty states** — Illustrated placeholder when no data exists
- **Error states** — Retry button with error message display
- **Toast notifications** — Success/error feedback on all actions

---

## 💎 Bonus Features Implemented

- ✅ **Filter attendance records by date** — Date picker filter on the attendance view
- ✅ **Total present days per employee** — Displayed in employee attendance detail view
- ✅ **Dashboard summary** — Total employees, attendance rate, present/absent counts, recent records table

---

## 🖥 Running Locally

### Prerequisites
- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### 1. Clone the repository

```bash
git clone https://github.com/vkk-rawat/Ethara-AI.git
cd Ethara-AI
```

### 2. Backend Setup

```bash
cd backend-python

# (Optional) Create a virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in `backend-python/`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
DATABASE_NAME=hrms-lite
PORT=5000
```

Start the backend:

```bash
python main.py
```

The API will be available at **http://localhost:5000**. Interactive API docs at **http://localhost:5000/docs**.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**.  
The Vite dev server automatically proxies `/api` requests to `http://localhost:5000`.

---

## 🌐 Deployment Guide

### Backend → Render

The repository includes a `render.yaml` blueprint for one-click setup:

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect the GitHub repository
3. Set **Root Directory** → `backend-python`
4. Set **Build Command** → `pip install -r requirements.txt`
5. Set **Start Command** → `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add **Environment Variables**:
   - `MONGODB_URI` — Your MongoDB Atlas connection string
   - `DATABASE_NAME` — `hrms-lite`

> ⚠️ **MongoDB Atlas Network Access:** Add `0.0.0.0/0` to the IP Access List to allow connections from Render's dynamic IPs.

### Frontend → Vercel

1. Import the GitHub repository on [Vercel](https://vercel.com)
2. Set **Root Directory** → `frontend`
3. Set **Framework Preset** → `Vite`
4. Add **Environment Variable**:
   - `VITE_API_URL` → `https://<your-render-service>.onrender.com/api`
5. Deploy

---

## ⚠️ Assumptions & Limitations

| Assumption | Detail |
|------------|--------|
| Single admin user | No authentication or authorization required |
| No pagination | Full lists loaded at once (suitable for small-to-medium datasets) |
| Render cold starts | Free-tier backend may take ~30s on first request after inactivity |
| Scope exclusions | Leave management, payroll, and advanced HR features are out of scope |
| Browser support | Modern browsers required (CSS `backdrop-filter` for glassmorphism effects) |

---

## 📄 License

This project was built as a full-stack coding assignment submission for **Ethara AI**.
