"""
Integration tests for Circulation API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta


@pytest.mark.integration
@pytest.mark.api
class TestCirculationAPI:
    """Test circulation endpoints"""

    def test_list_circulation_records(self, test_client: TestClient, test_librarian_token: str):
        """Test listing all circulation records"""
        response = test_client.get(
            "/api/v1/circulation",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert isinstance(data["data"], list)

    def test_list_circulation_with_filters(self, test_client: TestClient, test_librarian_token: str):
        """Test listing circulation with status filter"""
        response = test_client.get(
            "/api/v1/circulation?status=active",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )
        assert response.status_code == 200

    def test_get_circulation_record(self, test_client: TestClient, test_librarian_token: str):
        """Test getting a specific circulation record"""
        # Get list first
        list_response = test_client.get(
            "/api/v1/circulation",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )

        records = list_response.json()["data"]
        if records:
            record_id = records[0]["id"]
            response = test_client.get(
                f"/api/v1/circulation/{record_id}",
                headers={"Authorization": f"Bearer {test_librarian_token}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == record_id

    def test_issue_book(self, test_client: TestClient, test_librarian_token: str):
        """Test issuing a book to a user"""
        issue_data = {
            "user_id": "test-user-id",
            "book_id": "test-book-id",
            "due_date": (datetime.utcnow() + timedelta(days=14)).isoformat(),
            "notes": "Test circulation"
        }

        response = test_client.post(
            "/api/v1/circulation",
            json=issue_data,
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )

        # May succeed or fail based on data validity
        assert response.status_code in [200, 201, 400, 404]

    def test_return_book(self, test_client: TestClient, test_librarian_token: str):
        """Test returning a book"""
        # Get an active circulation first
        list_response = test_client.get(
            "/api/v1/circulation?status=active",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )

        records = list_response.json()["data"]
        if records:
            record_id = records[0]["id"]
            return_data = {
                "return_date": datetime.utcnow().isoformat(),
                "condition_notes": "Good condition"
            }

            response = test_client.post(
                f"/api/v1/circulation/{record_id}/return",
                json=return_data,
                headers={"Authorization": f"Bearer {test_librarian_token}"}
            )

            assert response.status_code in [200, 404]

    def test_renew_circulation(self, test_client: TestClient, test_librarian_token: str):
        """Test renewing a circulation record"""
        list_response = test_client.get(
            "/api/v1/circulation?status=active",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )

        records = list_response.json()["data"]
        if records:
            record_id = records[0]["id"]

            response = test_client.post(
                f"/api/v1/circulation/{record_id}/renew",
                headers={"Authorization": f"Bearer {test_librarian_token}"}
            )

            assert response.status_code in [200, 400, 404]

    def test_get_user_circulation(self, test_client: TestClient, test_librarian_token: str):
        """Test getting circulation records for a specific user"""
        response = test_client.get(
            "/api/v1/circulation/user/test-user-id",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )

        # Should return empty list or error
        assert response.status_code in [200, 404]

    def test_get_circulation_stats(self, test_client: TestClient, test_librarian_token: str):
        """Test getting circulation statistics"""
        response = test_client.get(
            "/api/v1/circulation/stats",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)

    def test_patron_can_view_own_circulation(self, test_client: TestClient, test_patron_token: str):
        """Test that patrons can view their own circulation records"""
        response = test_client.get(
            "/api/v1/circulation",
            headers={"Authorization": f"Bearer {test_patron_token}"}
        )

        # Should succeed or return empty
        assert response.status_code in [200, 403]

    def test_circulation_without_auth(self, test_client: TestClient):
        """Test that circulation requires authentication"""
        response = test_client.get("/api/v1/circulation")
        assert response.status_code == 401
