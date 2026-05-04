import os
from flask import Flask, request, jsonify, g
from flask_restful import Api, Resource
from supabase import create_client
from dotenv import load_dotenv
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../shared'))
from jwt_middleware import jwt_required, role_required
from email_service import send_applicant_confirmed_email, send_applicant_rejected_email

load_dotenv()

app = Flask(__name__)
api = Api(app)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

class Bookings(Resource):
    @jwt_required
    @role_required('owner')
    def post(self):
        data = request.get_json()
        pet_id = data.get('pet_id')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        description = data.get('description')
        budget = data.get('budget')

        if not all([pet_id, start_date, end_date, description]):
            return {"error": "pet_id, start_date, end_date, description required"}, 400

        # Verify pet belongs to owner
        pet = supabase.table('pets').select('id').eq('id', pet_id).eq('owner_id', g.user_id).execute()
        if not pet.data:
            return {"error": "Pet not found or not owned by you"}, 404

        try:
            booking_data = {
                'owner_id': g.user_id,
                'pet_id': pet_id,
                'start_date': start_date,
                'end_date': end_date,
                'description': description,
                'budget': budget
            }
            result = supabase.table('bookings').insert(booking_data).execute()
            return result.data[0], 201
        except Exception as e:
            return {"error": str(e)}, 400

    @jwt_required
    def get(self):
        try:
            if g.role == 'owner':
                bookings = supabase.table('bookings').select('*, pets(name, species)').eq('owner_id', g.user_id).execute()
            else:  # caretaker
                bookings = supabase.table('bookings').select('*, pets(name, species), profiles!owner_id(email)').eq('status', 'open').execute()
            return bookings.data, 200
        except Exception as e:
            return {"error": str(e)}, 400

class Booking(Resource):
    @jwt_required
    def get(self, booking_id):
        try:
            booking = supabase.table('bookings').select('*, pets(*), applications(*, profiles!caretaker_id(email))').eq('id', booking_id).execute()
            if not booking.data:
                return {"error": "Booking not found"}, 404

            # Check permissions
            booking_data = booking.data[0]
            if g.role == 'owner' and booking_data['owner_id'] != g.user_id:
                return {"error": "Not authorized"}, 403

            return booking_data, 200
        except Exception as e:
            return {"error": str(e)}, 400

    @jwt_required
    @role_required('owner')
    def delete(self, booking_id):
        try:
            # Verify ownership
            booking = supabase.table('bookings').select('owner_id').eq('id', booking_id).execute()
            if not booking.data or booking.data[0]['owner_id'] != g.user_id:
                return {"error": "Booking not found or not owned by you"}, 404

            supabase.table('bookings').delete().eq('id', booking_id).execute()
            return {"message": "Booking cancelled successfully"}, 200
        except Exception as e:
            return {"error": str(e)}, 400

class Apply(Resource):
    @jwt_required
    @role_required('caretaker')
    def post(self, booking_id):
        data = request.get_json()
        message = data.get('message')
        proposed_rate = data.get('proposed_rate')

        try:
            # Check if booking is open
            booking = supabase.table('bookings').select('status').eq('id', booking_id).execute()
            if not booking.data or booking.data[0]['status'] != 'open':
                return {"error": "Booking not available for applications"}, 400

            application_data = {
                'booking_id': booking_id,
                'caretaker_id': g.user_id,
                'message': message,
                'proposed_rate': proposed_rate
            }
            result = supabase.table('applications').insert(application_data).execute()
            return result.data[0], 201
        except Exception as e:
            return {"error": str(e)}, 400

class Confirm(Resource):
    @jwt_required
    @role_required('owner')
    def post(self, booking_id):
        data = request.get_json()
        application_id = data.get('application_id')

        if not application_id:
            return {"error": "application_id required"}, 400

        try:
            # Verify booking ownership
            booking = supabase.table('bookings').select('*, pets(name)').eq('id', booking_id).eq('owner_id', g.user_id).execute()
            if not booking.data:
                return {"error": "Booking not found or not owned by you"}, 404

            booking_data = booking.data[0]

            # Update booking status
            supabase.table('bookings').update({'status': 'confirmed'}).eq('id', booking_id).execute()

            # Update applications
            supabase.table('applications').update({'status': 'accepted'}).eq('id', application_id).execute()
            supabase.table('applications').update({'status': 'rejected'}).eq('booking_id', booking_id).neq('id', application_id).execute()

            # Send emails
            applications = supabase.table('applications').select('*, profiles!caretaker_id(email)').eq('booking_id', booking_id).execute()
            for app in applications.data:
                if app['id'] == application_id:
                    send_applicant_confirmed_email(app['profiles']['email'], {
                        'pet_name': booking_data['pets']['name'],
                        'start_date': booking_data['start_date'],
                        'end_date': booking_data['end_date'],
                        'description': booking_data['description']
                    })
                else:
                    send_applicant_rejected_email(app['profiles']['email'], {
                        'pet_name': booking_data['pets']['name'],
                        'start_date': booking_data['start_date'],
                        'end_date': booking_data['end_date']
                    })

            return {"message": "Applicant confirmed successfully"}, 200
        except Exception as e:
            return {"error": str(e)}, 400

api.add_resource(Bookings, '/bookings')
api.add_resource(Booking, '/bookings/<string:booking_id>')
api.add_resource(Apply, '/bookings/<string:booking_id>/apply')
api.add_resource(Confirm, '/bookings/<string:booking_id>/confirm')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004, debug=True)