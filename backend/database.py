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
