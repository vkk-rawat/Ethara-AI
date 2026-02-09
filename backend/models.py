from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal, Union, List, Dict, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info=None):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")


class EmployeeCreate(BaseModel):
    employeeId: str = Field(..., min_length=1,
                            description="Unique employee ID")
    fullName: str = Field(..., min_length=1,
                          description="Full name of employee")
    email: EmailStr = Field(..., description="Email address")
    department: str = Field(..., min_length=1, description="Department name")

    @field_validator('employeeId', 'fullName', 'department')
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()

    @field_validator('email')
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower().strip()


class EmployeeUpdate(BaseModel):
    employeeId: Optional[str] = None
    fullName: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None

    @field_validator('employeeId', 'fullName', 'department')
    @classmethod
    def strip_whitespace(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else v

    @field_validator('email')
    @classmethod
    def lowercase_email(cls, v: Optional[str]) -> Optional[str]:
        return v.lower().strip() if v else v


class EmployeeResponse(BaseModel):
    id: str = Field(..., alias="_id")
    employeeId: str
    fullName: str
    email: str
    department: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True
        from_attributes = True


class AttendanceCreate(BaseModel):
    employeeId: str = Field(..., description="Employee MongoDB ID")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    status: Literal["Present",
                    "Absent"] = Field(..., description="Attendance status")

    @field_validator('date')
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")


class AttendanceUpdate(BaseModel):
    status: Literal["Present",
                    "Absent"] = Field(..., description="Attendance status")


class EmployeeInfo(BaseModel):
    id: str = Field(..., alias="_id")
    employeeId: str
    fullName: str
    department: str

    class Config:
        populate_by_name = True


class AttendanceResponse(BaseModel):
    id: str = Field(..., alias="_id")
    employeeId: Optional[EmployeeInfo] = None
    date: datetime
    status: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True
        from_attributes = True


class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Union[Dict[str, Any], List[Any]]] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error: Optional[str] = None


class SummaryStats(BaseModel):
    totalEmployees: int
    totalAttendanceRecords: int
    totalPresent: int
    totalAbsent: int
