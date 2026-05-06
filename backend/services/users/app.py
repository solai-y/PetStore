import os
import httpx
_orig_httpx_init = httpx.Client.__init__
def _httpx_no_ssl(self, *args, **kwargs):
    kwargs.setdefault('verify', False)
    _orig_httpx_init(self, *args, **kwargs)
httpx.Client.__init__ = _httpx_no_ssl

from flask import Flask, request, jsonify, g
from flask_restful import Api, Resource
from supabase import create_client
from dotenv import load_dotenv
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../shared'))
from jwt_middleware import jwt_required

load_dotenv()

app = Flask(__name__)
app.url_map.strict_slashes = False
api = Api(app)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

class UserProfile(Resource):
    @jwt_required
    def get(self, user_id):
        if g.user_id != user_id:
            return {"error": "Can only view own profile"}, 403

        try:
            profile = supabase.table('profiles').select('*').eq('id', user_id).execute()
            if profile.data:
                return profile.data[0], 200
            else:
                return {"error": "Profile not found"}, 404
        except Exception as e:
            return {"error": str(e)}, 400

    @jwt_required
    def put(self, user_id):
        if g.user_id != user_id:
            return {"error": "Can only update own profile"}, 403

        data = request.get_json()
        try:
            update_data = {}
            if 'bio' in data:
                update_data['bio'] = data['bio']
            if 'hourly_rate' in data:
                update_data['hourly_rate'] = data['hourly_rate']
            if 'accepted_pet_types' in data:
                update_data['accepted_pet_types'] = data['accepted_pet_types']

            supabase.table('profiles').update(update_data).eq('id', user_id).execute()
            return {"message": "Profile updated successfully"}, 200
        except Exception as e:
            return {"error": str(e)}, 400

class Caretakers(Resource):
    def get(self):
        try:
            caretakers = supabase.table('profiles').select('*').eq('role', 'caretaker').execute()
            return caretakers.data, 200
        except Exception as e:
            return {"error": str(e)}, 400

api.add_resource(UserProfile, '/users/<string:user_id>')
api.add_resource(Caretakers, '/users/caretakers')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)