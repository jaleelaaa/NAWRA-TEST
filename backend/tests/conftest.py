"""
Pytest configuration and shared fixtures for NAWRA backend tests
"""
import os
import pytest
import asyncio
from typing import Generator, AsyncGenerator
from httpx import AsyncClient
from fastapi.testclient import TestClient
from supabase import Client, create_client

# Set test environment
os.environ["TESTING"] = "true"
os.environ["ENVIRONMENT"] = "test"

from app.main import app
from app.core.config import settings
from app.db.supabase_client import get_supabase


# Configure pytest-asyncio
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_settings():
    """Provide test settings"""
    return settings


@pytest.fixture(scope="module")
def supabase_client() -> Generator[Client, None, None]:
    """Create a Supabase client for testing"""
    client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY
    )
    yield client


@pytest.fixture(scope="module")
def test_client() -> Generator[TestClient, None, None]:
    """Create a test client for the FastAPI app"""
    with TestClient(app) as client:
        yield client


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP client for testing"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def auth_headers(test_admin_token: str) -> dict:
    """Return authentication headers with admin token"""
    return {
        "Authorization": f"Bearer {test_admin_token}",
        "Content-Type": "application/json"
    }


@pytest.fixture
def test_admin_token(test_client: TestClient) -> str:
    """Get authentication token for test admin user"""
    response = test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@nawra.om",
            "password": "Admin@123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    return data["access_token"]


@pytest.fixture
def test_librarian_token(test_client: TestClient) -> str:
    """Get authentication token for test librarian user"""
    response = test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "librarian@ministry.om",
            "password": "Librarian@123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    return data["access_token"]


@pytest.fixture
def test_patron_token(test_client: TestClient) -> str:
    """Get authentication token for test patron user"""
    response = test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "patron@student.om",
            "password": "Patron@123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    return data["access_token"]


@pytest.fixture(scope="function", autouse=True)
def reset_test_data():
    """Reset test data before each test if needed"""
    yield
    # Cleanup code here if needed


# Sample test data fixtures
@pytest.fixture
def sample_book_data() -> dict:
    """Provide sample book data for testing"""
    return {
        "isbn": "978-1234567890",
        "title": "Test Book Title",
        "title_ar": "عنوان الكتاب التجريبي",
        "author": "Test Author",
        "author_ar": "المؤلف التجريبي",
        "publisher": "Test Publisher",
        "publisher_ar": "الناشر التجريبي",
        "publication_year": 2024,
        "language": "en",
        "pages": 250,
        "category_id": None,
        "quantity": 5,
        "available_quantity": 5,
        "location": "Shelf A-1",
        "description": "A test book description",
        "description_ar": "وصف الكتاب التجريبي",
        "metadata": {}
    }


@pytest.fixture
def sample_user_data() -> dict:
    """Provide sample user data for testing"""
    return {
        "email": "testuser@example.com",
        "full_name": "Test User",
        "full_name_ar": "المستخدم التجريبي",
        "password": "TestPassword@123",
        "role_id": None,
        "department": "Testing Department",
        "department_ar": "قسم الاختبار",
        "phone": "+96812345678",
        "is_active": True
    }


@pytest.fixture
def sample_category_data() -> dict:
    """Provide sample category data for testing"""
    return {
        "name": "Test Category",
        "name_ar": "الفئة التجريبية",
        "description": "Test category description",
        "description_ar": "وصف الفئة التجريبية",
        "parent_id": None
    }


@pytest.fixture
def sample_circulation_data() -> dict:
    """Provide sample circulation data for testing"""
    from datetime import datetime, timedelta
    return {
        "user_id": None,  # To be filled by test
        "book_id": None,  # To be filled by test
        "issue_date": datetime.utcnow().isoformat(),
        "due_date": (datetime.utcnow() + timedelta(days=14)).isoformat(),
        "notes": "Test circulation record"
    }


# Markers for test categorization
def pytest_configure(config):
    """Configure custom pytest markers"""
    config.addinivalue_line(
        "markers", "unit: Unit tests for individual components"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests for API endpoints"
    )
    config.addinivalue_line(
        "markers", "slow: Slow-running tests"
    )
    config.addinivalue_line(
        "markers", "auth: Authentication tests"
    )
    config.addinivalue_line(
        "markers", "database: Database interaction tests"
    )
