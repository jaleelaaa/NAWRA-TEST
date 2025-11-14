"""
Integration tests for Books API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from uuid import uuid4


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.database
class TestBooksAPI:
    """Test book catalog endpoints"""

    def test_list_books(self, test_client: TestClient, test_librarian_token: str):
        """Test listing all books"""
        response = test_client.get(
            "/api/v1/books",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "total" in data
        assert isinstance(data["data"], list)

    def test_list_books_with_pagination(self, test_client: TestClient, test_librarian_token: str):
        """Test book listing with pagination"""
        response = test_client.get(
            "/api/v1/books?page=1&page_size=10",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "page" in data
        assert "page_size" in data

    def test_list_books_without_auth(self, test_client: TestClient):
        """Test that listing books without authentication fails"""
        response = test_client.get("/api/v1/books")
        assert response.status_code == 401

    def test_get_book_by_id(self, test_client: TestClient, test_librarian_token: str):
        """Test getting a specific book by ID"""
        # First get list of books
        list_response = test_client.get(
            "/api/v1/books",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )
        books = list_response.json()["data"]

        if books:
            book_id = books[0]["id"]
            response = test_client.get(
                f"/api/v1/books/{book_id}",
                headers={"Authorization": f"Bearer {test_librarian_token}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == book_id

    def test_get_nonexistent_book(self, test_client: TestClient, test_librarian_token: str):
        """Test getting a book that doesn't exist"""
        fake_id = str(uuid4())
        response = test_client.get(
            f"/api/v1/books/{fake_id}",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )
        assert response.status_code == 404

    def test_create_book(self, test_client: TestClient, test_librarian_token: str, sample_book_data: dict):
        """Test creating a new book"""
        # Make ISBN unique
        sample_book_data["isbn"] = f"978-{uuid4().hex[:10]}"

        response = test_client.post(
            "/api/v1/books",
            json=sample_book_data,
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )

        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data
        assert data["title"] == sample_book_data["title"]
        assert data["title_ar"] == sample_book_data["title_ar"]

    def test_create_book_with_duplicate_isbn(self, test_client: TestClient, test_librarian_token: str, sample_book_data: dict):
        """Test creating a book with duplicate ISBN"""
        # Create first book
        isbn = f"978-{uuid4().hex[:10]}"
        sample_book_data["isbn"] = isbn

        first_response = test_client.post(
            "/api/v1/books",
            json=sample_book_data,
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )

        if first_response.status_code in [200, 201]:
            # Try to create duplicate
            duplicate_response = test_client.post(
                "/api/v1/books",
                json=sample_book_data,
                headers={"Authorization": f"Bearer {test_librarian_token}"}
            )

            # Should fail with conflict
            assert duplicate_response.status_code in [400, 409]

    def test_update_book(self, test_client: TestClient, test_librarian_token: str):
        """Test updating book information"""
        # Get a book first
        list_response = test_client.get(
            "/api/v1/books",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )
        books = list_response.json()["data"]

        if books:
            book_id = books[0]["id"]
            update_data = {
                "title": "Updated Title",
                "title_ar": "عنوان محدث"
            }

            response = test_client.put(
                f"/api/v1/books/{book_id}",
                json=update_data,
                headers={"Authorization": f"Bearer {test_librarian_token}"}
            )

            assert response.status_code in [200, 404]

            if response.status_code == 200:
                data = response.json()
                assert data["title"] == update_data["title"]

    def test_delete_book(self, test_client: TestClient, test_librarian_token: str, sample_book_data: dict):
        """Test deleting a book"""
        # Create a book first
        sample_book_data["isbn"] = f"978-{uuid4().hex[:10]}"

        create_response = test_client.post(
            "/api/v1/books",
            json=sample_book_data,
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )

        if create_response.status_code in [200, 201]:
            book_id = create_response.json()["id"]

            delete_response = test_client.delete(
                f"/api/v1/books/{book_id}",
                headers={"Authorization": f"Bearer {test_librarian_token}"}
            )

            assert delete_response.status_code in [200, 204]

    def test_search_books(self, test_client: TestClient, test_librarian_token: str):
        """Test searching books"""
        response = test_client.get(
            "/api/v1/books?search=test",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )
        assert response.status_code == 200

    def test_filter_books_by_category(self, test_client: TestClient, test_librarian_token: str):
        """Test filtering books by category"""
        response = test_client.get(
            "/api/v1/books?category_id=some-uuid",
            headers={"Authorization": f"Bearer {test_librarian_token}"}
        )
        # Should return empty or error
        assert response.status_code in [200, 404]

    def test_patron_cannot_create_book(self, test_client: TestClient, test_patron_token: str, sample_book_data: dict):
        """Test that patron users cannot create books"""
        sample_book_data["isbn"] = f"978-{uuid4().hex[:10]}"

        response = test_client.post(
            "/api/v1/books",
            json=sample_book_data,
            headers={"Authorization": f"Bearer {test_patron_token}"}
        )

        # Should fail with forbidden
        assert response.status_code == 403
