import os
import requests


def send_email(to_email: str, subject: str, body: str):
    api_key = os.getenv("MAILGUN_API_KEY")
    domain = os.getenv("MAILGUN_DOMAIN")
    sender = os.getenv("MAILGUN_SENDER_EMAIL")

    if not all([api_key, domain, sender]):
        raise ValueError("Mailgun configuration missing")

    response = requests.post(
        f"https://api.mailgun.net/v3/{domain}/messages",
        auth=("api", api_key),
        data={
            "from": sender,
            "to": to_email,
            "subject": subject,
            "text": body,
        },
    )
    response.raise_for_status()


def send_applicant_confirmed_email(caretaker_email: str, booking_details: dict):
    subject = "Congratulations! You've been selected for a pet care job"
    body = f"""Dear Caretaker,

Congratulations! You've been selected for the following pet care job:

Pet: {booking_details['pet_name']}
Dates: {booking_details['start_date']} to {booking_details['end_date']}
Description: {booking_details['description']}

Please contact the pet owner to arrange details.

Best regards,
CarePets Team
"""
    send_email(caretaker_email, subject, body)


def send_applicant_rejected_email(caretaker_email: str, booking_details: dict):
    subject = "Update on your application for a pet care job"
    body = f"""Dear Caretaker,

Thank you for your interest in the following pet care job:

Pet: {booking_details['pet_name']}
Dates: {booking_details['start_date']} to {booking_details['end_date']}

Unfortunately, another caretaker was selected. We appreciate your application and hope to work with you on future opportunities.

Best regards,
CarePets Team
"""
    send_email(caretaker_email, subject, body)
