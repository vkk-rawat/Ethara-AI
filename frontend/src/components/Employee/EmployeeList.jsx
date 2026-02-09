import { useState, useEffect, useCallback } from "react";
import { employeeAPI, attendanceAPI } from "../../api/apiService";
import EmployeeCard from "./EmployeeCard";
import EmployeeForm from "./EmployeeForm";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import "./EmployeeList.css";

const EmployeeList = ({ onViewAttendance, showToast }) => {
  const [employees, setEmployees] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [empResponse, attResponse] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getAll(),
      ]);

      setEmployees(empResponse.data || []);

      // Calculate attendance stats per employee
      const stats = {};
      (attResponse.data || []).forEach((record) => {
        const empId = record.employeeId?._id;
        if (empId) {
          if (!stats[empId]) {
            stats[empId] = { present: 0, absent: 0, total: 0 };
          }
          stats[empId].total++;
          if (record.status === "Present") {
            stats[empId].present++;
          } else {
            stats[empId].absent++;
          }
        }
      });
      setAttendanceStats(stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee._id, formData);
        showToast("Employee updated successfully", "success");
      } else {
        await employeeAPI.create(formData);
        showToast("Employee added successfully", "success");
      }
      setShowForm(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await employeeAPI.delete(deleteConfirm._id);
      showToast("Employee deleted successfully", "success");
      setDeleteConfirm(null);
      fetchEmployees();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.fullName.toLowerCase().includes(searchLower) ||
      employee.employeeId.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.department.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <LoadingSpinner message="Loading employees..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchEmployees} />;
  }

  return (
    <div className="employee-list">
      <div className="employee-list-header">
        <div className="header-left">
          <h2>Employees</h2>
          <span className="employee-count">{employees.length} total</span>
        </div>
        <button className="btn-add" onClick={handleAddEmployee}>
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
          Add Employee
        </button>
      </div>

      {employees.length > 0 && (
        <div className="search-bar">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, ID, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm("")}>
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
          )}
        </div>
      )}

      {employees.length === 0 ? (
        <EmptyState
          icon={
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
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="No employees yet"
          description="Get started by adding your first employee to the system."
          action={handleAddEmployee}
          actionLabel="Add Employee"
        />
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="No results found"
          description={`No employees match "${searchTerm}". Try a different search term.`}
        />
      ) : (
        <div className="employee-grid">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              attendanceStats={attendanceStats[employee._id]}
              onDelete={setDeleteConfirm}
              onViewAttendance={onViewAttendance}
            />
          ))}
        </div>
      )}

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingEmployee(null);
          }}
          isLoading={formLoading}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="delete-modal-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
                <path
                  d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.55 19C1.55 19.35 1.64 19.7 1.82 20C2.00 20.3 2.26 20.55 2.56 20.73C2.86 20.91 3.21 21 3.56 21H20.44C20.79 21 21.14 20.91 21.44 20.73C21.74 20.55 22.00 20.3 22.18 20C22.36 19.7 22.45 19.35 22.45 19C22.45 18.65 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.32 12.96 3.14C12.65 2.96 12.31 2.87 11.95 2.87C11.59 2.87 11.25 2.96 10.94 3.14C10.63 3.32 10.37 3.56 10.29 3.86Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Delete Employee?</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteConfirm.fullName}</strong>? This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
