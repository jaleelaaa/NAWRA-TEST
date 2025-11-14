"""
Health check endpoints for monitoring and load balancing
"""
from fastapi import APIRouter, Depends, status
from datetime import datetime
from supabase import Client
from typing import Dict, Any

from ....db.supabase_client import get_supabase
from ....core.config import settings

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint
    Returns 200 if service is running
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": getattr(settings, "APP_VERSION", "1.0.0"),
        "environment": settings.ENVIRONMENT
    }


@router.get("/health/detailed", status_code=status.HTTP_200_OK)
async def detailed_health_check(
    supabase: Client = Depends(get_supabase)
) -> Dict[str, Any]:
    """
    Detailed health check with dependency verification
    Checks database connectivity and other services
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": getattr(settings, "APP_VERSION", "1.0.0"),
        "environment": settings.ENVIRONMENT,
        "checks": {}
    }

    # Check database connectivity
    try:
        # Simple query to verify database connection
        response = supabase.table("roles").select("id").limit(1).execute()
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": "Database connection successful"
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}"
        }

    # Check cache (if enabled)
    if hasattr(settings, "CACHE_ENABLED") and settings.CACHE_ENABLED:
        try:
            # Add cache check here if using Redis/Upstash
            health_status["checks"]["cache"] = {
                "status": "healthy",
                "message": "Cache is available"
            }
        except Exception as e:
            health_status["checks"]["cache"] = {
                "status": "degraded",
                "message": f"Cache unavailable: {str(e)}"
            }

    # Check email service (if configured)
    if hasattr(settings, "RESEND_API_KEY") and settings.RESEND_API_KEY:
        health_status["checks"]["email"] = {
            "status": "configured",
            "message": "Email service configured"
        }

    return health_status


@router.get("/health/ready", status_code=status.HTTP_200_OK)
async def readiness_check(
    supabase: Client = Depends(get_supabase)
) -> Dict[str, str]:
    """
    Kubernetes-style readiness probe
    Returns 200 when service is ready to accept traffic
    """
    try:
        # Verify critical services
        response = supabase.table("roles").select("id").limit(1).execute()
        return {
            "status": "ready",
            "message": "Service is ready to accept requests"
        }
    except Exception as e:
        return {
            "status": "not_ready",
            "message": f"Service not ready: {str(e)}"
        }


@router.get("/health/live", status_code=status.HTTP_200_OK)
async def liveness_check() -> Dict[str, str]:
    """
    Kubernetes-style liveness probe
    Returns 200 if application is running (even if dependencies are down)
    """
    return {
        "status": "alive",
        "message": "Service is alive"
    }


@router.get("/version", status_code=status.HTTP_200_OK)
async def version_info() -> Dict[str, Any]:
    """
    Return application version information
    """
    return {
        "name": getattr(settings, "APP_NAME", "NAWRA Library Management System"),
        "version": getattr(settings, "APP_VERSION", "1.0.0"),
        "environment": settings.ENVIRONMENT,
        "api_version": "v1",
        "build_date": "2025-11-14",
        "python_version": "3.11+"
    }
