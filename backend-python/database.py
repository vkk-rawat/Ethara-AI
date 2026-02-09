from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

settings = get_settings()


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def connect_to_mongo():
    """Connect to MongoDB."""
    print(f"Connecting to MongoDB at {settings.mongodb_uri}...")
    db.client = AsyncIOMotorClient(settings.mongodb_uri)
    # Verify connection
    await db.client.admin.command('ping')
    print("MongoDB connected successfully!")


# Alias for main.py
connect_db = connect_to_mongo


async def close_mongo_connection():
    """Close MongoDB connection."""
    if db.client:
        db.client.close()
        print("MongoDB connection closed.")


# Alias for main.py
close_db = close_mongo_connection


def get_database():
    """Get database instance."""
    return db.client[settings.database_name]


def get_employees_collection():
    """Get employees collection."""
    return get_database()["employees"]


def get_attendance_collection():
    """Get attendance collection."""
    return get_database()["attendances"]
