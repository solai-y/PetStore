import os
import jwt
from functools import wraps
from flask import request, g, jsonify


def verify_jwt(token: str) -> dict:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise ValueError("JWT_SECRET not configured")
    payload = jwt.decode(
        token,
        secret,
        algorithms=["HS256"],
        options={"verify_aud": False},
    )
    return payload


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = header.split(" ", 1)[1]
        try:
            payload = verify_jwt(token)
            g.user_id = payload["sub"]
            g.role = (payload.get("user_metadata") or {}).get("role")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception as e:
            return jsonify({"error": str(e)}), 401
        return f(*args, **kwargs)
    return decorated


def role_required(required_role: str):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if getattr(g, "role", None) != required_role:
                return jsonify({"error": "Insufficient permissions"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
