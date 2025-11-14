from fastapi import APIRouter
from .endpoints import auth, analytics, dashboard, users, circulation, reports, settings, books, health

api_router = APIRouter(prefix="/v1")

# Include routers for different modules
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(circulation.router, prefix="/circulation", tags=["Circulation"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(books.router, prefix="", tags=["Books", "Categories"])

# We'll add these as we build each feature
# api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
# api_router.include_router(acquisitions.router, prefix="/acquisitions", tags=["Acquisitions"])
