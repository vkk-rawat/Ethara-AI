from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import settings
from database import connect_db, close_db
from routes.employees import router as employees_router
from routes.attendance import router as attendance_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    print(f"🚀 Server running on http://localhost:{settings.port}")
    yield
    await close_db()
    print("Server shutdown complete")


app = FastAPI(
    title="HRMS Lite API",
    description="Human Resource Management System - Lite Edition",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees_router)
app.include_router(attendance_router)


@app.get("/")
async def root():
    return {
        "success": True,
        "message": "HRMS Lite API is running",
        "version": "1.0.0"
    }


@app.get("/api/health")
async def health_check():
    return {
        "success": True,
        "status": "healthy",
        "database": "connected"
    }


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", settings.port))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
