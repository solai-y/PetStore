import pytest
from unittest.mock import patch, MagicMock
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def auth_header(user_id="test-user-id", role="owner"):
    return {"Authorization": f"Bearer {user_id}:{role}"}


@patch("app.supabase")
def test_get_profile_success(mock_supabase, client):
    mock_result = MagicMock()
    mock_result.data = [{"id": "test-user-id", "role": "owner"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result

    response = client.get("/users/test-user-id", headers=auth_header("test-user-id"))

    assert response.status_code == 200
    assert response.get_json()["role"] == "owner"


@patch("app.supabase")
def test_get_profile_unauthorized(mock_supabase, client):
    response = client.get("/users/test-user-id", headers=auth_header("different-user-id"))

    assert response.status_code == 403


@patch("app.supabase")
def test_update_profile_success(mock_supabase, client):
    mock_result = MagicMock()
    mock_result.data = [{"id": "test-user-id", "bio": "New bio"}]
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_result

    response = client.put(
        "/users/test-user-id",
        json={"bio": "New bio"},
        headers=auth_header("test-user-id"),
    )

    assert response.status_code == 200


@patch("app.supabase")
def test_get_caretakers(mock_supabase, client):
    mock_result = MagicMock()
    mock_result.data = [{"id": "caretaker-id", "role": "caretaker", "bio": "I love pets"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result

    response = client.get("/users/caretakers")

    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
