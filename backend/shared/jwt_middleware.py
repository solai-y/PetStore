import os
import httpx
from functools import wraps
from flask import request, g


def verify_jwt(token: str) -> dict:
    supabase_url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_ANON_KEY")
    if not supabase_url or not anon_key:
        raise ValueError("SUPABASE_URL or SUPABASE_ANON_KEY not configured")
    response = httpx.get(
        f"{supabase_url}/auth/v1/user",
        headers={"Authorization": f"Bearer {token}", "apikey": anon_key},
        verify=False,
    )
    if response.status_code != 200:
        raise ValueError(response.json().get("message", "Invalid token"))
    return response.json()


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return {"error": "Missing or invalid Authorization header"}, 401
        token = header.split(" ", 1)[1]
        try:
            user_data = verify_jwt(token)
            g.user_id = user_data["id"]
            g.role = (user_data.get("user_metadata") or {}).get("role")
        except Exception as e:
            return {"error": str(e)}, 401
        return f(*args, **kwargs)
    return decorated


def role_required(required_role: str):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if getattr(g, "role", None) != required_role:
                return {"error": "Insufficient permissions"}, 403
            return f(*args, **kwargs)
        return decorated
    return decorator
