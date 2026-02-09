# HRMS Lite Backend - FastAPI + MongoDB

## Setup

### Prerequisites

- Python 3.10+
- MongoDB running locally or MongoDB Atlas

### Installation

```bash
cd backend-python
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file:

```
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=hrms-lite
PORT=5000
```

### Run the Server

```bash
uvicorn main:app --reload --port 5000
```

Or:

```bash
python main.py
```

## API Endpoints

### Employees

- `GET /api/employees` - Get all employees
- `GET /api/employees/{id}` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee

### Attendance

- `GET /api/attendance` - Get all attendance records (optional filters: `?date=YYYY-MM-DD&employeeId=<id>`)
- `GET /api/attendance/summary` - Get attendance statistics
- `GET /api/attendance/employee/{id}` - Get attendance by employee
- `GET /api/attendance/{id}` - Get attendance by record ID
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/{id}` - Update attendance
- `DELETE /api/attendance/{id}` - Delete attendance

## Request/Response Examples

### Create Employee

```json
POST /api/employees
{
  "employeeId": "EMP001",
  "fullName": "John Doe",
  "email": "john@example.com",
  "department": "Engineering"
}
```

### Mark Attendance

```json
POST /api/attendance
{
  "employeeId": "<mongo-object-id>",
  "date": "2024-01-15",
  "status": "Present"
}
```
