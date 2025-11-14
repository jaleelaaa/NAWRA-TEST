"""
Integration tests for Authentication API endpoints
"""
import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
@pytest.mark.auth
class TestAuthenticationAPI:
    """Test authentication endpoints"""

    def test_login_with_valid_credentials(self, test_client: TestClient):
        """Test successful login with valid credentials"""
        response = test_client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@nawra.om",
                "password": "Admin@123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data

    def test_login_with_invalid_email(self, test_client: TestClient):
        """Test login with non-existent email"""
        response = test_client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "SomePassword@123"
            }
        )
        assert response.status_code in [401, 404]

    def test_login_with_invalid_password(self, test_client: TestClient):
        """Test login with incorrect password"""
        response = test_client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@nawra.om",
                "password": "WrongPassword@123"
            }
        )
        assert response.status_code == 401

    def test_login_with_missing_fields(self, test_client: TestClient):
        """Test login with missing required fields"""
        response = test_client.post(
            "/api/v1/auth/login",
            json={"email": "admin@nawra.om"}
        )
        assert response.status_code == 422

    def test_get_current_user(self, test_client: TestClient, test_admin_token: str):
        """Test getting current authenticated user"""
        response = test_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert data["email"] == "admin@nawra.om"

    def test_get_current_user_without_token(self, test_client: TestClient):
        """Test getting current user without authentication"""
        response = test_client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_get_current_user_with_invalid_token(self, test_client: TestClient):
        """Test getting current user with invalid token"""
        response = test_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        assert response.status_code == 401

    @pytest.mark.parametrize("user_credentials", [
        {"email": "librarian@ministry.om", "password": "Librarian@123"},
        {"email": "cataloger@ministry.om", "password": "Cataloger@123"},
        {"email": "circulation@ministry.om", "password": "Circ@123"},
        {"email": "patron@student.om", "password": "Patron@123"},
    ])
    def test_login_all_user_roles(self, test_client: TestClient, user_credentials: dict):
        """Test login for all user roles"""
        response = test_client.post(
            "/api/v1/auth/login",
            json=user_credentials
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data

    def test_logout(self, test_client: TestClient, test_admin_token: str):
        """Test logout functionality"""
        response = test_client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )
        # Should succeed or return 200/204
        assert response.status_code in [200, 204]
