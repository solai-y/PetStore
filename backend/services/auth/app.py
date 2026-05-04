import os
from flask import Flask, request, jsonify, g
from flask_restful import Api, Resource
from supabase import create_client
from dotenv import load_dotenv
import sys
import os

# Add shared to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../shared'))
from jwt_middleware import jwt_required

load_dotenv()

app = Flask(__name__)
api = Api(app)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

class Signup(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')  # 'owner' or 'caretaker'

        if not all([email, password, role]):
            return {"error": "Email, password, and role required"}, 400

        if role not in ['owner', 'caretaker']:
            return {"error": "Role must be 'owner' or 'caretaker'"}, 400

        try:
            # Create user in Supabase Auth
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {"data": {"role": role}},
            })

            if auth_response.user:
                user_id = auth_response.user.id

                # Insert profile
                profile_data = {
                    "id": user_id,
                    "role": role
                }
                if role == 'caretaker':
                    profile_data.update({
                        "bio": data.get('bio', ''),
                        "hourly_rate": data.get('hourly_rate'),
                        "accepted_pet_types": data.get('accepted_pet_types', [])
                    })

                supabase.table('profiles').insert(profile_data).execute()

                return {"message": "User created successfully", "user_id": user_id}, 201
            else:
                return {"error": "Failed to create user"}, 400
        except Exception as e:
            return {"error": str(e)}, 400

class Login(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return {"error": "Email and password required"}, 400

        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            if auth_response.user and auth_response.session:
                # Get profile to include role in response
                profile = supabase.table('profiles').select('*').eq('id', auth_response.user.id).execute()
                if profile.data:
                    role = profile.data[0]['role']
                else:
                    role = None

                return {
                    "access_token": auth_response.session.access_token,
                    "refresh_token": auth_response.session.refresh_token,
                    "user": {
                        "id": auth_response.user.id,
                        "email": auth_response.user.email,
                        "role": role
                    }
                }, 200
            else:
                return {"error": "Invalid credentials"}, 401
        except Exception as e:
            return {"error": str(e)}, 400

class Logout(Resource):
    @jwt_required
    def post(self):
        try:
            supabase.auth.sign_out()
            return {"message": "Logged out successfully"}, 200
        except Exception as e:
            return {"error": str(e)}, 400

class Me(Resource):
    @jwt_required
    def get(self):
        try:
            profile = supabase.table('profiles').select('*').eq('id', g.user_id).execute()
            if profile.data:
                return profile.data[0], 200
            else:
                return {"error": "Profile not found"}, 404
        except Exception as e:
            return {"error": str(e)}, 400

api.add_resource(Signup, '/auth/signup')
api.add_resource(Login, '/auth/login')
api.add_resource(Logout, '/auth/logout')
api.add_resource(Me, '/auth/me')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)