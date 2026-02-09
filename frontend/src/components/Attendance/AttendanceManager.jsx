import { useState, useEffect, useCallback } from "react";
import { attendanceAPI, employeeAPI } from "../../api/apiService";
import AttendanceForm from "./AttendanceForm";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import "./AttendanceManager.css";

const AttendanceManager = ({ selectedEmployee, onBack, showToast }) => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(selectedEmployee);
  const [filterDate, setFilterDate] = useState("");

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (currentEmployee) {
        response = await attendanceAPI.getByEmployee(currentEmployee._id);
      } else {
        const params = filterDate ? { date: filterDate } : {};
        response = await attendanceAPI.getAll(params);
      }

      setAttendance(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentEmployee, filterDate]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleMarkAttendance = () => {
    setShowForm(true);
  };

  const handleSubmitAttendance = async (data) => {
    setFormLoading(true);
    try {
      await attendanceAPI.create(data);
      showToast("Attendance marked successfully", "success");
      setShowForm(false);
      fetchAttendance();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (record, newStatus) => {
    try {
      await attendanceAPI.update(record._id, { status: newStatus });
      showToast("Attendance updated successfully", "success");
      fetchAttendance();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteAttendance = async (record) => {
    try {
      await attendanceAPI.delete(record._id);
      showToast("Attendance record deleted", "success");
      fetchAttendance();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const isPresent = status === "Present";
    return (
      <span className={`status-badge ${isPresent ? "present" : "absent"}`}>
        {isPresent ? (
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
        ) : (
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
        )}
        {status}
      </span>
    );
  };

  if (loading && attendance.length === 0) {
    return <LoadingSpinner message="Loading attendance records..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAttendance} />;
  }

  return (
    <div className="attendance-manager">
      <div className="attendance-header">
        <div className="header-left">
          {currentEmployee && onBack && (
            <button className="btn-back" onClick={onBack}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19L5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <div>
            <h2>
              {currentEmployee
                ? `${currentEmployee.fullName}'s Attendance`
                : "Attendance Records"}
            </h2>
            {currentEmployee && (
              <span className="employee-subtitle">
                {currentEmployee.employeeId} • {currentEmployee.department}
              </span>
            )}
          </div>
        </div>
        <button className="btn-add" onClick={handleMarkAttendance}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Mark Attendance
        </button>
      </div>

      <div className="attendance-filters">
        {!currentEmployee && (
          <div className="filter-group">
            <label>Filter by Employee</label>
            <select
              value={currentEmployee?._id || ""}
              onChange={(e) => {
                const emp = employees.find((emp) => emp._id === e.target.value);
                setCurrentEmployee(emp || null);
              }}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="filter-group">
          <label>Filter by Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button className="filter-clear" onClick={() => setFilterDate("")}>
              Clear
            </button>
          )}
        </div>
      </div>

      {attendance.length === 0 ? (
        <EmptyState
          icon={
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
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 2V6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 2V6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 10H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="No attendance records"
          description={
            currentEmployee
              ? `No attendance records found for ${currentEmployee.fullName}.`
              : "No attendance records found. Start tracking attendance today!"
          }
          action={handleMarkAttendance}
          actionLabel="Mark Attendance"
        />
      ) : (
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                {!currentEmployee && <th>Employee</th>}
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  {!currentEmployee && (
                    <td className="employee-cell">
                      <div className="employee-info-cell">
                        <span className="emp-name">
                          {record.employeeId?.fullName || "Unknown"}
                        </span>
                        <span className="emp-id">
                          {record.employeeId?.employeeId || "N/A"}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="date-cell">{formatDate(record.date)}</td>
                  <td className="status-cell">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className={`btn-status ${record.status === "Present" ? "active" : ""}`}
                        onClick={() => handleUpdateStatus(record, "Present")}
                        title="Mark Present"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        className={`btn-status ${record.status === "Absent" ? "active absent" : ""}`}
                        onClick={() => handleUpdateStatus(record, "Absent")}
                        title="Mark Absent"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                      <button
                        className="btn-delete-sm"
                        onClick={() => handleDeleteAttendance(record)}
                        title="Delete Record"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 6H5H21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <AttendanceForm
          employees={employees}
          selectedEmployee={currentEmployee}
          onSubmit={handleSubmitAttendance}
          onCancel={() => setShowForm(false)}
          isLoading={formLoading}
        />
      )}
    </div>
  );
};

export default AttendanceManager;
