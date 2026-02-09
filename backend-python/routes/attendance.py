from fastapi import APIRouter, HTTPException, Query, status
from bson import ObjectId
from datetime import datetime, date
from typing import Optional

from database import get_attendance_collection, get_employees_collection
from models import AttendanceCreate, AttendanceUpdate

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


def serialize_attendance(attendance: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict."""
    if attendance:
        attendance["_id"] = str(attendance["_id"])
        if "employeeId" in attendance and isinstance(attendance["employeeId"], ObjectId):
            attendance["employeeId"] = str(attendance["employeeId"])
        # Handle date serialization
        if "date" in attendance and isinstance(attendance["date"], datetime):
            attendance["date"] = attendance["date"].isoformat().split("T")[0]
    return attendance


@router.get("")
async def get_all_attendance(
    date_filter: Optional[str] = Query(None, alias="date"),
    employee_id: Optional[str] = Query(None, alias="employeeId")
):
    """Get all attendance records with optional filters."""
    try:
        collection = get_attendance_collection()

        # Build query
        query = {}
        if date_filter:
            # Parse date and create range for the entire day
            try:
                filter_date = datetime.fromisoformat(
                    date_filter.replace("Z", "+00:00"))
                start_of_day = datetime(
                    filter_date.year, filter_date.month, filter_date.day)
                end_of_day = datetime(
                    filter_date.year, filter_date.month, filter_date.day, 23, 59, 59)
                query["date"] = {"$gte": start_of_day, "$lte": end_of_day}
            except ValueError:
                pass

        if employee_id and ObjectId.is_valid(employee_id):
            query["employeeId"] = ObjectId(employee_id)

        cursor = collection.find(query).sort("date", -1)
        records = await cursor.to_list(length=10000)

        # Populate employee data (replace employeeId with employee object)
        employees_collection = get_employees_collection()
        for record in records:
            if "employeeId" in record:
                employee = await employees_collection.find_one({"_id": record["employeeId"]})
                if employee:
                    record["employeeId"] = {
                        "_id": str(employee["_id"]),
                        "fullName": employee.get("fullName", ""),
                        "employeeId": employee.get("employeeId", ""),
                        "department": employee.get("department", "")
                    }

        return {
            "success": True,
            "data": [serialize_attendance(rec) for rec in records]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to fetch attendance records", "error": str(e)}
        )


@router.get("/summary")
async def get_attendance_summary():
    """Get attendance summary statistics."""
    try:
        attendance_collection = get_attendance_collection()
        employees_collection = get_employees_collection()

        # Get counts
        total_employees = await employees_collection.count_documents({})
        total_records = await attendance_collection.count_documents({})
        present_count = await attendance_collection.count_documents({"status": "Present"})
        absent_count = await attendance_collection.count_documents({"status": "Absent"})

        return {
            "success": True,
            "data": {
                "totalEmployees": total_employees,
                "totalAttendanceRecords": total_records,
                "totalPresent": present_count,
                "totalAbsent": absent_count,
                "attendanceRate": round((present_count / total_records * 100), 1) if total_records > 0 else 0
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to fetch summary", "error": str(e)}
        )


@router.get("/employee/{employee_id}")
async def get_employee_attendance(employee_id: str):
    """Get attendance records for a specific employee."""
    try:
        if not ObjectId.is_valid(employee_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False,
                        "message": "Invalid employee ID format"}
            )

        collection = get_attendance_collection()
        employees_collection = get_employees_collection()

        # Verify employee exists
        employee = await employees_collection.find_one({"_id": ObjectId(employee_id)})
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False, "message": "Employee not found"}
            )

        cursor = collection.find(
            {"employeeId": ObjectId(employee_id)}).sort("date", -1)
        records = await cursor.to_list(length=10000)

        # Calculate total present days
        total_present = sum(1 for r in records if r.get("status") == "Present")

        # Add employee info to each record (replace employeeId with object)
        for record in records:
            record["employeeId"] = {
                "_id": str(employee["_id"]),
                "fullName": employee.get("fullName", ""),
                "employeeId": employee.get("employeeId", ""),
                "department": employee.get("department", "")
            }

        return {
            "success": True,
            "data": [serialize_attendance(rec) for rec in records],
            "totalPresent": total_present
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to fetch employee attendance", "error": str(e)}
        )


@router.get("/{attendance_id}")
async def get_attendance(attendance_id: str):
    """Get a single attendance record by ID."""
    try:
        if not ObjectId.is_valid(attendance_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False,
                        "message": "Invalid attendance ID format"}
            )

        collection = get_attendance_collection()
        record = await collection.find_one({"_id": ObjectId(attendance_id)})

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False,
                        "message": "Attendance record not found"}
            )

        # Populate employee
        if "employeeId" in record:
            employees_collection = get_employees_collection()
            employee = await employees_collection.find_one({"_id": record["employeeId"]})
            if employee:
                record["employeeId"] = {
                    "_id": str(employee["_id"]),
                    "fullName": employee.get("fullName", ""),
                    "employeeId": employee.get("employeeId", ""),
                    "department": employee.get("department", "")
                }

        return {
            "success": True,
            "data": serialize_attendance(record)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to fetch attendance record", "error": str(e)}
        )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_attendance(attendance: AttendanceCreate):
    """Create a new attendance record."""
    try:
        collection = get_attendance_collection()
        employees_collection = get_employees_collection()

        # Validate employee exists
        if not ObjectId.is_valid(attendance.employeeId):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False,
                        "message": "Invalid employee ID format"}
            )

        employee = await employees_collection.find_one({"_id": ObjectId(attendance.employeeId)})
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False, "message": "Employee not found"}
            )

        # Parse date
        try:
            attendance_date = datetime.fromisoformat(
                attendance.date.replace("Z", "+00:00"))
        except ValueError:
            attendance_date = datetime.strptime(attendance.date, "%Y-%m-%d")

        # Check for duplicate attendance on same day
        start_of_day = datetime(attendance_date.year,
                                attendance_date.month, attendance_date.day)
        end_of_day = datetime(
            attendance_date.year, attendance_date.month, attendance_date.day, 23, 59, 59)

        existing = await collection.find_one({
            "employeeId": ObjectId(attendance.employeeId),
            "date": {"$gte": start_of_day, "$lte": end_of_day}
        })

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False, "message": "Attendance already marked for this employee on this date"}
            )

        # Create attendance document
        now = datetime.utcnow()
        attendance_doc = {
            "employeeId": ObjectId(attendance.employeeId),
            "date": attendance_date,
            "status": attendance.status,
            "createdAt": now,
            "updatedAt": now
        }

        result = await collection.insert_one(attendance_doc)
        attendance_doc["_id"] = result.inserted_id

        # Add employee info to response (replace employeeId with object)
        attendance_doc["employeeId"] = {
            "_id": str(employee["_id"]),
            "fullName": employee.get("fullName", ""),
            "employeeId": employee.get("employeeId", ""),
            "department": employee.get("department", "")
        }

        return {
            "success": True,
            "message": "Attendance recorded successfully",
            "data": serialize_attendance(attendance_doc)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to create attendance record", "error": str(e)}
        )


@router.put("/{attendance_id}")
async def update_attendance(attendance_id: str, attendance: AttendanceUpdate):
    """Update an existing attendance record."""
    try:
        if not ObjectId.is_valid(attendance_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False,
                        "message": "Invalid attendance ID format"}
            )

        collection = get_attendance_collection()

        # Check if record exists
        existing = await collection.find_one({"_id": ObjectId(attendance_id)})
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False,
                        "message": "Attendance record not found"}
            )

        # Build update data
        update_data = {}

        if attendance.status is not None:
            update_data["status"] = attendance.status

        if attendance.date is not None:
            try:
                update_data["date"] = datetime.fromisoformat(
                    attendance.date.replace("Z", "+00:00"))
            except ValueError:
                update_data["date"] = datetime.strptime(
                    attendance.date, "%Y-%m-%d")

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "No fields to update"}
            )

        update_data["updatedAt"] = datetime.utcnow()

        await collection.update_one(
            {"_id": ObjectId(attendance_id)},
            {"$set": update_data}
        )

        # Fetch updated record with employee info
        updated = await collection.find_one({"_id": ObjectId(attendance_id)})

        if "employeeId" in updated:
            employees_collection = get_employees_collection()
            employee = await employees_collection.find_one({"_id": updated["employeeId"]})
            if employee:
                updated["employeeId"] = {
                    "_id": str(employee["_id"]),
                    "fullName": employee.get("fullName", ""),
                    "employeeId": employee.get("employeeId", ""),
                    "department": employee.get("department", "")
                }

        return {
            "success": True,
            "message": "Attendance updated successfully",
            "data": serialize_attendance(updated)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to update attendance record", "error": str(e)}
        )


@router.delete("/{attendance_id}")
async def delete_attendance(attendance_id: str):
    """Delete an attendance record."""
    try:
        if not ObjectId.is_valid(attendance_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False,
                        "message": "Invalid attendance ID format"}
            )

        collection = get_attendance_collection()
        result = await collection.delete_one({"_id": ObjectId(attendance_id)})

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False,
                        "message": "Attendance record not found"}
            )

        return {
            "success": True,
            "message": "Attendance record deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to delete attendance record", "error": str(e)}
        )
