import pytest
from unittest.mock import patch, MagicMock
from app import app

AUTH_HEADER = {"Authorization": "Bearer test-user-id:owner"}


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@patch("app.supabase")
def test_signup_success(mock_supabase, client):
    mock_user = MagicMock()
    mock_user.id = "test-user-id"
    mock_auth_response = MagicMock()
    mock_auth_response.user = mock_user
    mock_supabase.auth.sign_up.return_value = mock_auth_response
    mock_supabase.table.return_value.insert.return_value.execute.return_value = None

    response = client.post("/auth/signup", json={
        "email": "test@example.com",
        "password": "Password123!",
        "role": "owner",
    })

    assert response.status_code == 201
    assert "user_id" in response.get_json()


@patch("app.supabase")
def test_signup_missing_fields(mock_supabase, client):
    response = client.post("/auth/signup", json={"email": "test@example.com"})
    assert response.status_code == 400


@patch("app.supabase")
def test_signup_invalid_role(mock_supabase, client):
    response = client.post("/auth/signup", json={
        "email": "test@example.com",
        "password": "Password123!",
        "role": "admin",
    })
    assert response.status_code == 400


@patch("app.supabase")
def test_login_success(mock_supabase, client):
    mock_user = MagicMock()
    mock_user.id = "test-user-id"
    mock_user.email = "test@example.com"
    mock_session = MagicMock()
    mock_session.access_token = "access-token"
    mock_session.refresh_token = "refresh-token"
    mock_auth_response = MagicMock()
    mock_auth_response.user = mock_user
    mock_auth_response.session = mock_session
    mock_supabase.auth.sign_in_with_password.return_value = mock_auth_response
    mock_result = MagicMock()
    mock_result.data = [{"role": "owner"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result

    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "Password123!",
    })

    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data
    assert data["user"]["role"] == "owner"


@patch("app.supabase")
def test_login_invalid_credentials(mock_supabase, client):
    mock_supabase.auth.sign_in_with_password.side_effect = Exception("Invalid credentials")

    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "wrong",
    })

    assert response.status_code == 400


@patch("app.supabase")
def test_get_me(mock_supabase, client):
    mock_result = MagicMock()
    mock_result.data = [{"id": "test-user-id", "role": "owner"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result

    response = client.get("/auth/me", headers=AUTH_HEADER)

    assert response.status_code == 200
    assert response.get_json()["role"] == "owner"


@patch("app.supabase")
def test_logout(mock_supabase, client):
    mock_supabase.auth.sign_out.return_value = None

    response = client.post("/auth/logout", headers=AUTH_HEADER)

    assert response.status_code == 200
