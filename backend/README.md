# Ethara AI — Backend API

> **FastAPI + MongoDB** REST API powering the HRMS Lite application.  
> Manages employees and daily attendance with async I/O, Pydantic validation, and Motor (async MongoDB driver).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Health](#health)
  - [Employees](#employees)
  - [Attendance](#attendance)
- [Data Models](#data-models)
- [Request & Response Examples](#request--response-examples)
- [Error Handling](#error-handling)
- [Deployment](#deployment)

---

## Tech Stack

| Layer      | Technology                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------- |
| Framework  | [FastAPI](https://fastapi.tiangolo.com/) ≥ 0.109                                              |
| Server     | [Uvicorn](https://www.uvicorn.org/) (ASGI)                                                    |
| Database   | [MongoDB](https://www.mongodb.com/) via [Motor](https://motor.readthedocs.io/) (async driver) |
| Validation | [Pydantic v2](https://docs.pydantic.dev/) with email & settings support                       |
| Config     | `pydantic-settings` + `.env` file                                                             |

---

## Project Structure

```
backend/
├── main.py              # App entrypoint — FastAPI instance, lifespan, middleware
├── config.py            # Settings loaded from environment / .env
├── database.py          # Motor client — connect, close, collection helpers
├── models.py            # Pydantic schemas (create, update, response)
├── requirements.txt     # Python dependencies
└── routes/
    ├── __init__.py
    ├── employees.py     # /api/employees CRUD routes
    └── attendance.py    # /api/attendance CRUD + summary routes
```

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier works)

### Installation

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
MONGODB_URI=mongodb://localhost:27017       # or your Atlas connection string
DATABASE_NAME=hrms-lite
PORT=5000
```

> **Note:** For MongoDB Atlas connections, the driver automatically uses `certifi` for TLS certificate verification.

### Running the Server

```bash
# Option 1 — via uvicorn directly (auto-reload enabled)
uvicorn main:app --reload --port 5000

# Option 2 — via the entrypoint script
python main.py
```

The API will be available at **http://localhost:5000**.  
Interactive docs are auto-generated at:

| Docs       | URL                         |
| ---------- | --------------------------- |
| Swagger UI | http://localhost:5000/docs  |
| ReDoc      | http://localhost:5000/redoc |

---

## API Reference

All responses follow a consistent envelope:

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Health

| Method | Endpoint      | Description                                       |
| ------ | ------------- | ------------------------------------------------- |
| `GET`  | `/`           | API root — confirms the server is running         |
| `GET`  | `/api/health` | Health check — returns database connection status |

### Employees

| Method   | Endpoint              | Description                                             |
| -------- | --------------------- | ------------------------------------------------------- |
| `GET`    | `/api/employees`      | List all employees (sorted by newest first)             |
| `GET`    | `/api/employees/{id}` | Get a single employee by MongoDB ObjectId               |
| `POST`   | `/api/employees`      | Create a new employee                                   |
| `PUT`    | `/api/employees/{id}` | Update an existing employee                             |
| `DELETE` | `/api/employees/{id}` | Delete an employee **and** all their attendance records |

### Attendance

| Method   | Endpoint                        | Description                                        |
| -------- | ------------------------------- | -------------------------------------------------- |
| `GET`    | `/api/attendance`               | List attendance records (supports query filters)   |
| `GET`    | `/api/attendance/summary`       | Get aggregated attendance statistics               |
| `GET`    | `/api/attendance/employee/{id}` | Get all attendance records for a specific employee |
| `GET`    | `/api/attendance/{id}`          | Get a single attendance record by ID               |
| `POST`   | `/api/attendance`               | Mark attendance for an employee                    |
| `PUT`    | `/api/attendance/{id}`          | Update an attendance record's status               |
| `DELETE` | `/api/attendance/{id}`          | Delete an attendance record                        |

#### Query Filters — `GET /api/attendance`

| Param        | Type     | Example                    | Description                   |
| ------------ | -------- | -------------------------- | ----------------------------- |
| `date`       | `string` | `2024-01-15`               | Filter by date (`YYYY-MM-DD`) |
| `employeeId` | `string` | `507f1f77bcf86cd799439011` | Filter by employee ObjectId   |

---

## Data Models

### Employee

| Field        | Type             | Required | Constraints                          |
| ------------ | ---------------- | -------- | ------------------------------------ |
| `employeeId` | `string`         | Yes      | Unique, non-empty, auto-trimmed      |
| `fullName`   | `string`         | Yes      | Non-empty, auto-trimmed              |
| `email`      | `string (email)` | Yes      | Unique, valid email, auto-lowercased |
| `department` | `string`         | Yes      | Non-empty, auto-trimmed              |

> `createdAt` and `updatedAt` timestamps are managed automatically.

### Attendance

| Field        | Type     | Required | Constraints                                            |
| ------------ | -------- | -------- | ------------------------------------------------------ |
| `employeeId` | `string` | Yes      | Must be a valid employee ObjectId                      |
| `date`       | `string` | Yes      | Format: `YYYY-MM-DD` — one record per employee per day |
| `status`     | `string` | Yes      | `"Present"` or `"Absent"` only                         |

---

## Request & Response Examples

### Create Employee

**Request**

```http
POST /api/employees
Content-Type: application/json

{
  "employeeId": "EMP001",
  "fullName": "John Doe",
  "email": "john@example.com",
  "department": "Engineering"
}
```

**Response** — `201 Created`

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "employeeId": "EMP001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

### Mark Attendance

**Request**

```http
POST /api/attendance
Content-Type: application/json

{
  "employeeId": "507f1f77bcf86cd799439011",
  "date": "2024-01-15",
  "status": "Present"
}
```

**Response** — `201 Created`

```json
{
  "success": true,
  "message": "Attendance recorded successfully",
  "data": {
    "_id": "65a5b1c2e4b0f1a2b3c4d5e6",
    "employeeId": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "employeeId": "EMP001",
      "department": "Engineering"
    },
    "date": "2024-01-15",
    "status": "Present",
    "createdAt": "2024-01-15T10:35:00",
    "updatedAt": "2024-01-15T10:35:00"
  }
}
```

### Get Attendance Summary

**Response** — `200 OK`

```json
{
  "success": true,
  "data": {
    "totalEmployees": 25,
    "totalAttendanceRecords": 500,
    "totalPresent": 420,
    "totalAbsent": 80,
    "attendanceRate": 84.0
  }
}
```

---

## Error Handling

All errors return a consistent JSON structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": "Technical details (only in 500 errors)"
}
```

| Status Code | Scenario                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------- |
| `400`       | Invalid ID format, duplicate employee ID / email, missing fields, attendance already marked |
| `404`       | Employee or attendance record not found                                                     |
| `422`       | Pydantic validation failure (automatically handled by FastAPI)                              |
| `500`       | Unexpected server / database errors                                                         |

---

## Deployment

The backend is configured for deployment on **[Render](https://render.com/)** via `render.yaml`:

```yaml
services:
  - type: web
    name: ethara-ai-backend
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Required environment variables on Render:**

| Variable        | Value                                |
| --------------- | ------------------------------------ |
| `MONGODB_URI`   | Your MongoDB Atlas connection string |
| `DATABASE_NAME` | `hrms-lite` (or custom)              |
| `PORT`          | Assigned by Render (default `10000`) |

---

## License

This project is part of the **Ethara AI** suite.
