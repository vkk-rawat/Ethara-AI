"""
HRMS Lite - FastAPI Backend
Main application entry point
"""
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
    """Application lifespan events."""
    # Startup
    await connect_db()
    print(f"🚀 Server running on http://localhost:{settings.port}")
    yield
    # Shutdown
    await close_db()
    print("Server shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="HRMS Lite API",
    description="Human Resource Management System - Lite Edition",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(employees_router)
app.include_router(attendance_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "success": True,
        "message": "HRMS Lite API is running",
        "version": "1.0.0"
    }


@app.get("/api/health")
async def health_check():
    """API health check."""
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
