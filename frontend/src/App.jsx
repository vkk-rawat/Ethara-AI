import { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import Dashboard from "./components/Dashboard/Dashboard";
import EmployeeList from "./components/Employee/EmployeeList";
import AttendanceManager from "./components/Attendance/AttendanceManager";
import Toast from "./components/common/Toast";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleViewAttendance = (employee) => {
    setSelectedEmployee(employee);
    setActiveTab("attendance");
  };

  const handleBackFromAttendance = () => {
    setSelectedEmployee(null);
    setActiveTab("employees");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "employees" || tab === "dashboard") {
      setSelectedEmployee(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={handleTabChange} />;
      case "employees":
        return (
          <EmployeeList
            onViewAttendance={handleViewAttendance}
            showToast={showToast}
          />
        );
      case "attendance":
        return (
          <AttendanceManager
            selectedEmployee={selectedEmployee}
            onBack={selectedEmployee ? handleBackFromAttendance : null}
            showToast={showToast}
          />
        );
      default:
        return <Dashboard onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="app">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="main-content">{renderContent()}</main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
