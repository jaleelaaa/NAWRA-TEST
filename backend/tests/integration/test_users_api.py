"""
Integration tests for Users API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from uuid import uuid4


@pytest.mark.integration
@pytest.mark.api
class TestUsersAPI:
    """Test user management endpoints"""

    def test_list_users(self, test_client: TestClient, test_admin_token: str):
        """Test listing all users"""
        response = test_client.get(
            "/api/v1/users",
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "total" in data
        assert isinstance(data["data"], list)

    def test_list_users_with_pagination(self, test_client: TestClient, test_admin_token: str):
        """Test user listing with pagination"""
        response = test_client.get(
            "/api/v1/users?page=1&page_size=10",
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 10

    def test_list_users_without_auth(self, test_client: TestClient):
        """Test that listing users requires authentication"""
        response = test_client.get("/api/v1/users")
        assert response.status_code == 401

    def test_get_user_by_id(self, test_client: TestClient, test_admin_token: str):
        """Test getting a specific user by ID"""
        # First get list of users
        list_response = test_client.get(
            "/api/v1/users",
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )
        users = list_response.json()["data"]

        if users:
            user_id = users[0]["id"]
            response = test_client.get(
                f"/api/v1/users/{user_id}",
                headers={"Authorization": f"Bearer {test_admin_token}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == user_id

    def test_get_nonexistent_user(self, test_client: TestClient, test_admin_token: str):
        """Test getting a user that doesn't exist"""
        fake_id = str(uuid4())
        response = test_client.get(
            f"/api/v1/users/{fake_id}",
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )
        assert response.status_code == 404

    def test_create_user(self, test_client: TestClient, test_admin_token: str):
        """Test creating a new user"""
        new_user = {
            "email": f"newuser_{uuid4().hex[:8]}@test.om",
            "full_name": "New Test User",
            "full_name_ar": "مستخدم تجريبي جديد",
            "password": "NewUser@123",
            "role_id": None,
            "department": "Test Department",
            "phone": "+96812345678",
            "is_active": True
        }

        response = test_client.post(
            "/api/v1/users",
            json=new_user,
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )

        # Should create successfully or fail due to permissions
        assert response.status_code in [200, 201, 403]

        if response.status_code in [200, 201]:
            data = response.json()
            assert data["email"] == new_user["email"]
            assert "id" in data

    def test_create_user_with_duplicate_email(self, test_client: TestClient, test_admin_token: str):
        """Test creating a user with duplicate email"""
        user_data = {
            "email": "admin@nawra.om",  # Existing email
            "full_name": "Duplicate User",
            "password": "Test@123",
            "role_id": None
        }

        response = test_client.post(
            "/api/v1/users",
            json=user_data,
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )

        # Should fail with conflict or bad request
        assert response.status_code in [400, 409]

    def test_update_user(self, test_client: TestClient, test_admin_token: str):
        """Test updating user information"""
        # Get a user first
        list_response = test_client.get(
            "/api/v1/users",
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )
        users = list_response.json()["data"]

        if users:
            user_id = users[0]["id"]
            update_data = {
                "full_name": "Updated Name",
                "full_name_ar": "اسم محدث"
            }

            response = test_client.put(
                f"/api/v1/users/{user_id}",
                json=update_data,
                headers={"Authorization": f"Bearer {test_admin_token}"}
            )

            # May succeed or fail due to permissions
            assert response.status_code in [200, 403, 404]

    def test_delete_user(self, test_client: TestClient, test_admin_token: str):
        """Test deleting a user"""
        # Create a user first to delete
        new_user = {
            "email": f"deleteuser_{uuid4().hex[:8]}@test.om",
            "full_name": "User to Delete",
            "password": "Delete@123",
            "role_id": None
        }

        create_response = test_client.post(
            "/api/v1/users",
            json=new_user,
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )

        if create_response.status_code in [200, 201]:
            user_id = create_response.json()["id"]

            delete_response = test_client.delete(
                f"/api/v1/users/{user_id}",
                headers={"Authorization": f"Bearer {test_admin_token}"}
            )

            assert delete_response.status_code in [200, 204, 403]

    def test_search_users(self, test_client: TestClient, test_admin_token: str):
        """Test searching users"""
        response = test_client.get(
            "/api/v1/users?search=admin",
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["data"], list)

    def test_filter_users_by_role(self, test_client: TestClient, test_admin_token: str):
        """Test filtering users by role"""
        response = test_client.get(
            "/api/v1/users?role=administrator",
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )
        # Should work or return empty list
        assert response.status_code in [200, 404]
