# HRMS Lite

A lightweight Human Resource Management System (HRMS) for managing employee records and tracking daily attendance.

![HRMS Lite](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-green.svg)

## Features

### Employee Management

- Add new employees with Employee ID, Name, Email, and Department
- View all employees in a responsive card-based layout
- Search employees by name, ID, email, or department
- Delete employees from the system

### Attendance Management

- Mark daily attendance for employees (Present/Absent)
- View attendance records for all employees or filter by specific employee
- Filter attendance by date
- Update attendance status
- Delete attendance records

### UI/UX Features

- Clean, professional, production-ready interface
- Loading states during API calls
- Empty states with helpful guidance
- Error states with retry options
- Toast notifications for success/error feedback
- Fully responsive design for mobile and desktop

## Tech Stack

### Frontend

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with CSS variables and modern CSS features

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

## Project Structure

```
hrms-lite/
├── backend/
│   ├── models/
│   │   ├── Employee.js       # Employee schema
│   │   └── Attendance.js     # Attendance schema
│   ├── routes/
│   │   ├── employeeRoutes.js # Employee API endpoints
│   │   └── attendanceRoutes.js # Attendance API endpoints
│   ├── server.js             # Express server setup
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── apiService.js # API client
│   │   ├── components/
│   │   │   ├── Header/
│   │   │   ├── Employee/
│   │   │   ├── Attendance/
│   │   │   └── common/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## API Endpoints

### Employees

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/api/employees`     | Get all employees   |
| GET    | `/api/employees/:id` | Get employee by ID  |
| POST   | `/api/employees`     | Create new employee |
| PUT    | `/api/employees/:id` | Update employee     |
| DELETE | `/api/employees/:id` | Delete employee     |

### Attendance

| Method | Endpoint                        | Description                |
| ------ | ------------------------------- | -------------------------- |
| GET    | `/api/attendance`               | Get all attendance records |
| GET    | `/api/attendance/employee/:id`  | Get attendance by employee |
| GET    | `/api/attendance/summary/stats` | Get attendance statistics  |
| POST   | `/api/attendance`               | Mark attendance            |
| PUT    | `/api/attendance/:id`           | Update attendance          |
| DELETE | `/api/attendance/:id`           | Delete attendance record   |

## Prerequisites

Before running this project, make sure you have:

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (local installation or MongoDB Atlas account)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hrms-lite.git
cd hrms-lite
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/hrms-lite
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms-lite

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

## Environment Variables

### Backend (.env)

| Variable      | Description                          | Required |
| ------------- | ------------------------------------ | -------- |
| `PORT`        | Server port (default: 5000)          | No       |
| `MONGODB_URI` | MongoDB connection string            | Yes      |
| `NODE_ENV`    | Environment (development/production) | No       |

### Frontend (.env)

| Variable       | Description                      | Required |
| -------------- | -------------------------------- | -------- |
| `VITE_API_URL` | Backend API URL (for production) | No       |

## Validation Rules

### Employee

- **Employee ID**: Required, must be unique
- **Full Name**: Required
- **Email**: Required, must be valid email format, must be unique
- **Department**: Required

### Attendance

- **Employee**: Required, must be a valid employee
- **Date**: Required, cannot mark attendance for the same date twice
- **Status**: Required, must be "Present" or "Absent"

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description here",
  "error": "Detailed error (development only)"
}
```

HTTP Status Codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Assumptions & Limitations

1. **No Authentication**: This is a single-admin system without login functionality
2. **Simple Attendance**: Only Present/Absent status, no time tracking
3. **No Pagination**: Suitable for small to medium employee counts
4. **Date-based Attendance**: One attendance record per employee per day
5. **Cascading Deletes**: Deleting an employee does not automatically delete their attendance records

## Future Enhancements

- User authentication and role-based access
- Bulk attendance marking
- Attendance reports and analytics
- Employee profile photos
- Department management
- Export functionality (CSV, PDF)
- Pagination for large datasets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

---

Built with care for clean code and great user experience.
