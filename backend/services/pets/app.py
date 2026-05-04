import os
from flask import Flask, request, jsonify, g
from flask_restful import Api, Resource
from supabase import create_client
from dotenv import load_dotenv
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../shared'))
from jwt_middleware import jwt_required

load_dotenv()

app = Flask(__name__)
api = Api(app)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

class Pets(Resource):
    @jwt_required
    def get(self):
        try:
            pets = supabase.table('pets').select('*').eq('owner_id', g.user_id).execute()
            return pets.data, 200
        except Exception as e:
            return {"error": str(e)}, 400

    @jwt_required
    def post(self):
        data = request.get_json()
        name = data.get('name')
        species = data.get('species')

        if not name or not species:
            return {"error": "Name and species required"}, 400

        try:
            pet_data = {
                'owner_id': g.user_id,
                'name': name,
                'species': species,
                'breed': data.get('breed'),
                'age': data.get('age'),
                'notes': data.get('notes'),
                'photo_url': data.get('photo_url')
            }
            result = supabase.table('pets').insert(pet_data).execute()
            return result.data[0], 201
        except Exception as e:
            return {"error": str(e)}, 400

class Pet(Resource):
    @jwt_required
    def get(self, pet_id):
        try:
            pet = supabase.table('pets').select('*').eq('id', pet_id).eq('owner_id', g.user_id).execute()
            if pet.data:
                return pet.data[0], 200
            else:
                return {"error": "Pet not found"}, 404
        except Exception as e:
            return {"error": str(e)}, 400

    @jwt_required
    def put(self, pet_id):
        data = request.get_json()
        try:
            update_data = {}
            for field in ['name', 'species', 'breed', 'age', 'notes', 'photo_url']:
                if field in data:
                    update_data[field] = data[field]

            supabase.table('pets').update(update_data).eq('id', pet_id).eq('owner_id', g.user_id).execute()
            return {"message": "Pet updated successfully"}, 200
        except Exception as e:
            return {"error": str(e)}, 400

    @jwt_required
    def delete(self, pet_id):
        try:
            supabase.table('pets').delete().eq('id', pet_id).eq('owner_id', g.user_id).execute()
            return {"message": "Pet deleted successfully"}, 200
        except Exception as e:
            return {"error": str(e)}, 400

api.add_resource(Pets, '/pets')
api.add_resource(Pet, '/pets/<string:pet_id>')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)