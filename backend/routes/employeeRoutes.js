import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

// Get all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
});

// Get single employee
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
});

// Create new employee
router.post("/", async (req, res) => {
  try {
    const { employeeId, fullName, email, department } = req.body;

    // Validation
    if (!employeeId || !fullName || !email || !department) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: employeeId, fullName, email, department",
      });
    }

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ employeeId }, { email }],
    });

    if (existingEmployee) {
      if (existingEmployee.employeeId === employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists",
        });
      }
      if (existingEmployee.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    const employee = new Employee({
      employeeId,
      fullName,
      email,
      department,
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message,
    });
  }
});

// Update employee
router.put("/:id", async (req, res) => {
  try {
    const { employeeId, fullName, email, department } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check for duplicate employee ID or email (excluding current employee)
    if (employeeId || email) {
      const query = {
        _id: { $ne: req.params.id },
        $or: [],
      };

      if (employeeId) query.$or.push({ employeeId });
      if (email) query.$or.push({ email });

      const duplicate = await Employee.findOne(query);

      if (duplicate) {
        if (duplicate.employeeId === employeeId) {
          return res.status(400).json({
            success: false,
            message: "Employee ID already exists",
          });
        }
        if (duplicate.email === email) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
      }
    }

    // Update fields
    if (employeeId) employee.employeeId = employeeId;
    if (fullName) employee.fullName = fullName;
    if (email) employee.email = email;
    if (department) employee.department = department;

    await employee.save();

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
});

// Delete employee
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
});

export default router;
