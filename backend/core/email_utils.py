import os
import requests


def send_email_brevo(to_email, to_name, subject, html_content):
    """
    Brevo ka HTTP REST API use karke email bhejta hai (SMTP ki jagah).
    Ye Render jaisi platforms pe kaam karta hai jaha SMTP ports (587) block hote hain,
    kyunki ye HTTPS (port 443) pe chalta hai.

    Returns (success: bool, info: str)
    """
    api_key = os.getenv("BREVO_API_KEY")
    if not api_key:
        return False, "BREVO_API_KEY not set in environment"

    from_email = os.getenv("DEFAULT_FROM_EMAIL", "noreply@example.com")

    url = "https://api.brevo.com/v3/smtp/email"

    payload = {
        "sender": {"email": from_email, "name": "SOS Radar"},
        "to": [{"email": to_email, "name": to_name or to_email}],
        "subject": subject,
        "htmlContent": html_content,
    }

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        if response.status_code in (200, 201):
            return True, "Email sent"
        else:
            return False, f"Brevo error ({response.status_code}): {response.text}"
    except Exception as e:
        return False, f"Email request failed: {e}"
        