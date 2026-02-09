// API Base URL - switch between local and production
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Unable to connect to server. Please check if the server is running.",
      );
    }
    throw error;
  }
};

// Employee API calls
export const employeeAPI = {
  // Get all employees
  getAll: () => apiRequest("/employees"),

  // Get single employee
  getById: (id) => apiRequest(`/employees/${id}`),

  // Create new employee
  create: (employeeData) =>
    apiRequest("/employees", {
      method: "POST",
      body: JSON.stringify(employeeData),
    }),

  // Update employee
  update: (id, employeeData) =>
    apiRequest(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(employeeData),
    }),

  // Delete employee
  delete: (id) =>
    apiRequest(`/employees/${id}`, {
      method: "DELETE",
    }),
};

// Attendance API calls
export const attendanceAPI = {
  // Get all attendance records
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/attendance${queryString ? `?${queryString}` : ""}`);
  },

  // Get attendance for specific employee
  getByEmployee: (employeeId) =>
    apiRequest(`/attendance/employee/${employeeId}`),

  // Mark attendance
  create: (attendanceData) =>
    apiRequest("/attendance", {
      method: "POST",
      body: JSON.stringify(attendanceData),
    }),

  // Update attendance
  update: (id, attendanceData) =>
    apiRequest(`/attendance/${id}`, {
      method: "PUT",
      body: JSON.stringify(attendanceData),
    }),

  // Delete attendance
  delete: (id) =>
    apiRequest(`/attendance/${id}`, {
      method: "DELETE",
    }),

  // Get attendance summary
  getSummary: () => apiRequest("/attendance/summary"),
};

export default { employeeAPI, attendanceAPI };
