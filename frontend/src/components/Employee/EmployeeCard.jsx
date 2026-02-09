import "./EmployeeCard.css";

const EmployeeCard = ({
  employee,
  attendanceStats,
  onDelete,
  onViewAttendance,
}) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      Engineering: "#3b82f6",
      Product: "#8b5cf6",
      Design: "#ec4899",
      Marketing: "#f97316",
      Sales: "#10b981",
      "Human Resources": "#06b6d4",
      Finance: "#eab308",
      Operations: "#6366f1",
      "Customer Support": "#14b8a6",
      Legal: "#64748b",
    };
    return colors[dept] || "#667eea";
  };

  return (
    <div className="employee-card">
      <div className="employee-card-header">
        <div
          className="employee-avatar"
          style={{ background: getDepartmentColor(employee.department) }}
        >
          {getInitials(employee.fullName)}
        </div>
        <div className="employee-info">
          <h3 className="employee-name">{employee.fullName}</h3>
          <span className="employee-id">{employee.employeeId}</span>
        </div>
      </div>

      <div className="employee-details">
        <div className="employee-detail">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 6L12 13L2 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{employee.email}</span>
        </div>
        <div className="employee-detail">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 21H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 7H10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 7H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 11H10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 11H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 15H10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 15H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="department-badge"
            style={{
              background: `${getDepartmentColor(employee.department)}15`,
              color: getDepartmentColor(employee.department),
            }}
          >
            {employee.department}
          </span>
        </div>
      </div>

      <div className="attendance-stats">
        <div className="stat-item present">
          <span className="stat-number">{attendanceStats?.present || 0}</span>
          <span className="stat-text">Present</span>
        </div>
        <div className="stat-item absent">
          <span className="stat-number">{attendanceStats?.absent || 0}</span>
          <span className="stat-text">Absent</span>
        </div>
        <div className="stat-item total">
          <span className="stat-number">{attendanceStats?.total || 0}</span>
          <span className="stat-text">Total</span>
        </div>
      </div>

      <div className="employee-actions">
        <button
          className="btn-action btn-view"
          onClick={() => onViewAttendance(employee)}
          title="View Attendance"
        >
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
          Attendance
        </button>
        <button
          className="btn-action btn-delete"
          onClick={() => onDelete(employee)}
          title="Delete Employee"
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
              d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;
