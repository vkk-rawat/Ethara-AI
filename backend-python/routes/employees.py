from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import datetime
from typing import List

from database import get_employees_collection, get_attendance_collection
from models import EmployeeCreate, EmployeeUpdate

router = APIRouter(prefix="/api/employees", tags=["employees"])


def serialize_employee(employee: dict) -> dict:
    if employee:
        employee["_id"] = str(employee["_id"])
    return employee


@router.get("")
async def get_all_employees():
    try:
        collection = get_employees_collection()
        cursor = collection.find().sort("createdAt", -1)
        employees = await cursor.to_list(length=1000)
        return {
            "success": True,
            "data": [serialize_employee(emp) for emp in employees]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to fetch employees", "error": str(e)}
        )


@router.get("/{employee_id}")
async def get_employee(employee_id: str):
    try:
        if not ObjectId.is_valid(employee_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False,
                        "message": "Invalid employee ID format"}
            )

        collection = get_employees_collection()
        employee = await collection.find_one({"_id": ObjectId(employee_id)})

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False, "message": "Employee not found"}
            )

        return {
            "success": True,
            "data": serialize_employee(employee)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to fetch employee", "error": str(e)}
        )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    try:
        collection = get_employees_collection()

        existing = await collection.find_one({
            "$or": [
                {"employeeId": employee.employeeId},
                {"email": employee.email}
            ]
        })

        if existing:
            if existing.get("employeeId") == employee.employeeId:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"success": False,
                            "message": "Employee ID already exists"}
                )
            if existing.get("email") == employee.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"success": False,
                            "message": "Email already exists"}
                )

        now = datetime.utcnow()
        employee_doc = {
            **employee.model_dump(),
            "createdAt": now,
            "updatedAt": now
        }

        result = await collection.insert_one(employee_doc)
        employee_doc["_id"] = result.inserted_id

        return {
            "success": True,
            "message": "Employee created successfully",
            "data": serialize_employee(employee_doc)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to create employee", "error": str(e)}
        )


@router.put("/{employee_id}")
async def update_employee(employee_id: str, employee: EmployeeUpdate):
    try:
        if not ObjectId.is_valid(employee_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False,
                        "message": "Invalid employee ID format"}
            )

        collection = get_employees_collection()

        existing = await collection.find_one({"_id": ObjectId(employee_id)})
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False, "message": "Employee not found"}
            )

        update_data = {k: v for k, v in employee.model_dump().items()
                       if v is not None}

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "No fields to update"}
            )

        if "employeeId" in update_data or "email" in update_data:
            duplicate_query = {
                "_id": {"$ne": ObjectId(employee_id)}, "$or": []}

            if "employeeId" in update_data:
                duplicate_query["$or"].append(
                    {"employeeId": update_data["employeeId"]})
            if "email" in update_data:
                duplicate_query["$or"].append({"email": update_data["email"]})

            if duplicate_query["$or"]:
                duplicate = await collection.find_one(duplicate_query)
                if duplicate:
                    if duplicate.get("employeeId") == update_data.get("employeeId"):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail={"success": False,
                                    "message": "Employee ID already exists"}
                        )
                    if duplicate.get("email") == update_data.get("email"):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail={"success": False,
                                    "message": "Email already exists"}
                        )

        update_data["updatedAt"] = datetime.utcnow()
        await collection.update_one(
            {"_id": ObjectId(employee_id)},
            {"$set": update_data}
        )

        updated = await collection.find_one({"_id": ObjectId(employee_id)})

        return {
            "success": True,
            "message": "Employee updated successfully",
            "data": serialize_employee(updated)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to update employee", "error": str(e)}
        )


@router.delete("/{employee_id}")
async def delete_employee(employee_id: str):
    try:
        if not ObjectId.is_valid(employee_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False,
                        "message": "Invalid employee ID format"}
            )

        collection = get_employees_collection()
        result = await collection.delete_one({"_id": ObjectId(employee_id)})

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False, "message": "Employee not found"}
            )

        attendance_collection = get_attendance_collection()
        await attendance_collection.delete_many({"employeeId": ObjectId(employee_id)})

        return {
            "success": True,
            "message": "Employee deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False,
                    "message": "Failed to delete employee", "error": str(e)}
        )
