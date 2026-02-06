import express from "express";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

const router = express.Router();

// Get all attendance records (with optional employee filter)
router.get("/", async (req, res) => {
  try {
    const { employeeId, date } = req.query;
    const filter = {};

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(filter)
      .populate("employeeId", "employeeId fullName department")
      .sort({ date: -1 });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
});

// Get attendance records for a specific employee
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const attendance = await Attendance.find({
      employeeId: req.params.employeeId,
    })
      .populate("employeeId", "employeeId fullName department")
      .sort({ date: -1 });

    // Calculate total present days
    const totalPresent = attendance.filter(
      (record) => record.status === "Present",
    ).length;

    res.json({
      success: true,
      data: attendance,
      totalPresent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
});

// Mark attendance
router.post("/", async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    // Validation
    if (!employeeId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: employeeId, date, status",
      });
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if attendance already exists for this date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this date",
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      employeeId,
      date: attendanceDate,
      status,
    });

    await attendance.save();

    const populatedAttendance = await Attendance.findById(
      attendance._id,
    ).populate("employeeId", "employeeId fullName department");

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: populatedAttendance,
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
      message: "Failed to mark attendance",
      error: error.message,
    });
  }
});

// Update attendance
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    ).populate("employeeId", "employeeId fullName department");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
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
      message: "Failed to update attendance",
      error: error.message,
    });
  }
});

// Delete attendance record
router.delete("/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete attendance record",
      error: error.message,
    });
  }
});

// Get attendance summary (bonus feature)
router.get("/summary/stats", async (req, res) => {
  try {
    const employees = await Employee.countDocuments();
    const totalAttendanceRecords = await Attendance.countDocuments();
    const totalPresent = await Attendance.countDocuments({ status: "Present" });
    const totalAbsent = await Attendance.countDocuments({ status: "Absent" });

    res.json({
      success: true,
      data: {
        totalEmployees: employees,
        totalAttendanceRecords,
        totalPresent,
        totalAbsent,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch summary",
      error: error.message,
    });
  }
});

export default router;
