import { useState, useEffect, useCallback } from "react";
import { employeeAPI, attendanceAPI } from "../../api/apiService";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorState from "../common/ErrorState";
import "./Dashboard.css";

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, employeesRes, attendanceRes] = await Promise.all([
        attendanceAPI.getSummary(),
        employeeAPI.getAll(),
        attendanceAPI.getAll(),
      ]);

      setStats(summaryRes.data);
      setEmployees(employeesRes.data || []);
      setRecentAttendance((attendanceRes.data || []).slice(0, 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAttendanceRate = () => {
    if (!stats || stats.totalAttendanceRecords === 0) return 0;
    return Math.round(
      (stats.totalPresent / stats.totalAttendanceRecords) * 100,
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="dashboard-subtitle">
          Overview of your HR management system
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card employees">
          <div className="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.5523C18.7122 5.2539 19.0078 6.1168 19.0078 7.005C19.0078 7.8932 18.7122 8.7561 18.1676 9.4577C17.623 10.1593 16.8604 10.6597 16 10.88"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalEmployees || 0}</span>
            <span className="stat-label">Total Employees</span>
          </div>
        </div>

        <div className="stat-card attendance">
          <div className="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16 2V6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8 2V6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {stats?.totalAttendanceRecords || 0}
            </span>
            <span className="stat-label">Attendance Records</span>
          </div>
        </div>

        <div className="stat-card present">
          <div className="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M8 12L11 15L16 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalPresent || 0}</span>
            <span className="stat-label">Days Present</span>
          </div>
        </div>

        <div className="stat-card absent">
          <div className="stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M15 9L9 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M9 9L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalAbsent || 0}</span>
            <span className="stat-label">Days Absent</span>
          </div>
        </div>
      </div>

      <div className="attendance-rate-card">
        <h3>Overall Attendance Rate</h3>
        <div className="rate-container">
          <div className="rate-bar">
            <div
              className="rate-fill"
              style={{ width: `${getAttendanceRate()}%` }}
            ></div>
          </div>
          <span className="rate-value">{getAttendanceRate()}%</span>
        </div>
        <p className="rate-description">
          {stats?.totalPresent || 0} present out of{" "}
          {stats?.totalAttendanceRecords || 0} total records
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Employees by Department</h3>
            <button
              className="view-all-btn"
              onClick={() => onNavigate("employees")}
            >
              View All
            </button>
          </div>
          <div className="department-list">
            {employees.length === 0 ? (
              <p className="no-data">No employees yet</p>
            ) : (
              Object.entries(
                employees.reduce((acc, emp) => {
                  acc[emp.department] = (acc[emp.department] || 0) + 1;
                  return acc;
                }, {}),
              ).map(([dept, count]) => (
                <div key={dept} className="department-item">
                  <span className="dept-name">{dept}</span>
                  <span className="dept-count">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Attendance</h3>
            <button
              className="view-all-btn"
              onClick={() => onNavigate("attendance")}
            >
              View All
            </button>
          </div>
          <div className="recent-attendance-list">
            {recentAttendance.length === 0 ? (
              <p className="no-data">No attendance records yet</p>
            ) : (
              recentAttendance.map((record) => (
                <div key={record._id} className="attendance-item">
                  <div className="attendance-info">
                    <span className="emp-name">
                      {record.employeeId?.fullName || "Unknown"}
                    </span>
                    <span className="att-date">{formatDate(record.date)}</span>
                  </div>
                  <span
                    className={`status-pill ${record.status.toLowerCase()}`}
                  >
                    {record.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
