import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

settings = get_settings()


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def connect_to_mongo():
    """Connect to MongoDB with proper SSL certificate handling."""
    print(f"Connecting to MongoDB...")
    client_kwargs = {
        "serverSelectionTimeoutMS": 30000,
        "connectTimeoutMS": 30000,
    }
    # Only use certifi CA bundle for Atlas (SRV) connections
    if "mongodb+srv" in settings.mongodb_uri or "mongodb.net" in settings.mongodb_uri:
        client_kwargs["tlsCAFile"] = certifi.where()

    db.client = AsyncIOMotorClient(settings.mongodb_uri, **client_kwargs)
    # Verify connection
    await db.client.admin.command('ping')
    print("MongoDB connected successfully!")

    # Create indexes for faster queries
    await ensure_indexes()


connect_db = connect_to_mongo


async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("MongoDB connection closed.")


close_db = close_mongo_connection


def get_database():
    return db.client[settings.database_name]


def get_employees_collection():
    return get_database()["employees"]


def get_attendance_collection():
    return get_database()["attendances"]


async def ensure_indexes():
    """Create database indexes for faster query performance."""
    try:
        emp_col = get_employees_collection()
        att_col = get_attendance_collection()

        # Employee indexes
        await emp_col.create_index("employeeId", unique=True)
        await emp_col.create_index("email", unique=True)
        await emp_col.create_index("department")
        await emp_col.create_index("createdAt")

        # Attendance indexes
        await att_col.create_index("employeeId")
        await att_col.create_index("date")
        await att_col.create_index([("employeeId", 1), ("date", 1)])
        await att_col.create_index("status")

        print("Database indexes ensured.")
    except Exception as e:
        print(f"Index creation warning: {e}")
