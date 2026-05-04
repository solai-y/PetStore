import pytest
from unittest.mock import patch, MagicMock
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def auth_header(user_id="user-id", role="owner"):
    return {"Authorization": f"Bearer {user_id}:{role}"}


@patch("app.supabase")
def test_get_pets(mock_supabase, client):
    mock_result = MagicMock()
    mock_result.data = [{"id": "pet-id", "name": "Buddy"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result

    response = client.get("/pets", headers=auth_header())

    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)


@patch("app.supabase")
def test_create_pet(mock_supabase, client):
    mock_result = MagicMock()
    mock_result.data = [{"id": "new-pet-id", "name": "Max"}]
    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_result

    response = client.post(
        "/pets",
        json={"name": "Max", "species": "dog"},
        headers=auth_header(),
    )

    assert response.status_code == 201


@patch("app.supabase")
def test_create_pet_missing_fields(mock_supabase, client):
    response = client.post(
        "/pets",
        json={"name": "Max"},
        headers=auth_header(),
    )

    assert response.status_code == 400


@patch("app.supabase")
def test_update_pet(mock_supabase, client):
    mock_result = MagicMock()
    mock_result.data = [{"id": "pet-id", "name": "Buddy Jr."}]
    mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_result

    response = client.put(
        "/pets/pet-id",
        json={"name": "Buddy Jr."},
        headers=auth_header(),
    )

    assert response.status_code == 200


@patch("app.supabase")
def test_delete_pet(mock_supabase, client):
    mock_result = MagicMock()
    mock_result.data = None
    mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_result

    response = client.delete("/pets/pet-id", headers=auth_header())

    assert response.status_code == 200
