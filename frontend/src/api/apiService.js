const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

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

export const employeeAPI = {
  getAll: () => apiRequest("/employees"),

  getById: (id) => apiRequest(`/employees/${id}`),

  create: (employeeData) =>
    apiRequest("/employees", {
      method: "POST",
      body: JSON.stringify(employeeData),
    }),

  update: (id, employeeData) =>
    apiRequest(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(employeeData),
    }),

  delete: (id) =>
    apiRequest(`/employees/${id}`, {
      method: "DELETE",
    }),
};

export const attendanceAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/attendance${queryString ? `?${queryString}` : ""}`);
  },

  getByEmployee: (employeeId) =>
    apiRequest(`/attendance/employee/${employeeId}`),

  create: (attendanceData) =>
    apiRequest("/attendance", {
      method: "POST",
      body: JSON.stringify(attendanceData),
    }),

  update: (id, attendanceData) =>
    apiRequest(`/attendance/${id}`, {
      method: "PUT",
      body: JSON.stringify(attendanceData),
    }),

  delete: (id) =>
    apiRequest(`/attendance/${id}`, {
      method: "DELETE",
    }),

  getSummary: () => apiRequest("/attendance/summary"),
};

export default { employeeAPI, attendanceAPI };
