from flask import Flask, request, jsonify
from flask_cors import CORS 
import requests
from datetime import datetime
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, auth, firestore, messaging
from functools import wraps
from pathlib import Path

# Pull envs from .env file (must be named exactly ".env") - from the raw repo, fill in and rename the file ".env_example"
load_dotenv()

# Qualtrics API credentials
QUALTRICS_API_TOKEN = os.getenv('QUALTRICS_API_TOKEN')
QUALTRICS_DATA_CENTER = os.getenv('QUALTRICS_DATA_CENTER')
CHECKIN_SURVEY = os.getenv('CHECKIN_SURVEY')
DEMOGRAPHICS_SURVEY = os.getenv('DEMOGRAPHICS_SURVEY')
get_headers = { #Used by GET requests
        'X-API-TOKEN': QUALTRICS_API_TOKEN,
        'Accept': 'application/json'
    }
post_headers = { #Used by POST requests
        'X-API-TOKEN': QUALTRICS_API_TOKEN,
        'Accept': "application/json",
        'Content-Type': 'application/json'
    }

app = Flask(__name__)
CORS(app)

""" I believe all this can be removed as is hard coded for linux environments
# List all files in the directory
secrets_dir = os.path.join(os.path.dirname(__file__), "secrets")
files = os.listdir(secrets_dir)

# Find the credentials file based on a pattern (e.g., the file contains 'firebase-adminsdk')
cred_file = next((f for f in files if 'firebase-adminsdk' in f), None)

if cred_file is None:
    raise FileNotFoundError("Credentials file not found in the secrets directory.")

# Combine the directory with the file name
cred_path = os.path.join(secrets_dir, cred_file)

# Load the credentials
cred = credentials.Certificate(cred_path)

firebase_admin.initialize_app(cred)
"""
cred_path = None
env_cred = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
if env_cred:
    cred_path = Path(env_cred)
    if not cred_path.is_absolute():
        cred_path = Path(__file__).parent / env_cred
        
if not cred_path or not cred_path.exists():
    raise FileNotFoundError(
        f"Firebase credentials file not found at {cred_path}"
        f"Set GOOGLE_APPLICATION_CREDENTIALS to the path of your Firebase credentials file."
    )
cred = credentials.Certificate(str(cred_path))
firebase_admin.initialize_app(cred)
db = firestore.client()  # Initialize Firestore client
print("FIRESTORE PROJECT (server):", db.project)

# Test Firestore read
try:
    db.collection("_health").document("write").set({"ts": firestore.SERVER_TIMESTAMP})
    print("FIRESTORE WRITE: OK")
except Exception as e:
    print("FIRESTORE WRITE: FAIL ->", repr(e))

def verify_firebase_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = request.headers.get('Authorization')
        print("Request headers:", request.headers)

        if not id_token:
            print("No header found")
            return jsonify({"message": "Unauthorized"}), 401
        
        # Strip "Bearer " prefix if present
        if id_token.startswith("Bearer "):
            print("Bearer prefix found, stripping")
            id_token = id_token.split(" ")[1]

        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user = decoded_token
            print("Decoded Token:", decoded_token)
        except Exception as e:
            print("Error verifying token:", e)
            return jsonify({"message": "Forbidden"}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_survey_id():
    """Retrieve the survey ID based on the request header."""
    survey_type = request.headers.get('Survey-Type')
    if survey_type == 'checkin':
        return CHECKIN_SURVEY
    elif survey_type == 'demographics':
        return DEMOGRAPHICS_SURVEY
    else:
        return None

@app.route('/submit-survey', methods=['POST'])
@verify_firebase_token
def submit_survey():
    # Get survey responses from the request

    responses = request.json.get('responses')
    if not responses:
        return jsonify({'error': 'Missing survey responses'}), 400

    survey_id = get_survey_id()
    if not survey_id:
        return jsonify({'error': 'Invalid or missing survey type'}), 400

    # Submit the survey to Qualtrics
    try:
        response = submit_to_qualtrics(survey_id, responses)
        if response.status_code == 200:
            print(response.json, response.status_code)
            return jsonify({'message': 'Survey submitted successfully'}), 200
        else:
            print(response.json(), response.status_code)
            return jsonify({'error': 'Failed to submit survey to Qualtrics'}), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def submit_to_qualtrics(survey_id, responses):
    """Submit responses to the Qualtrics API."""
    data = {
        "values": {
            "endDate": datetime.now().isoformat() + 'Z',
            "startDate": datetime.now().isoformat() + 'Z',
            "finished": 1, # Indicates to qualtrics that it's a finished survey
            "userLanguage": "en",  # Assuming English, adjust as needed
                }
            }
    
    data["values"].update(responses)
    print(responses)
    url = f'{QUALTRICS_DATA_CENTER}/surveys/{survey_id}/responses'
    print(f"\tSent: {data}")
    return requests.post(url, headers=post_headers, json=data)

@app.route('/get-survey', methods=['GET'])
@verify_firebase_token
def get_survey():
    survey_id = get_survey_id()
    if not survey_id:
        return jsonify({'error': 'Invalid or missing survey type'}), 400
    
    url = f'{QUALTRICS_DATA_CENTER}/survey-definitions/{survey_id}'
    """Get survey details from Qualtrics and print to console."""
    try:
        response = requests.get(url, headers=get_headers)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/")
def hello():
  return "Hello World!"

# Push Notifications
@app.route("/api/push/subscribe", methods=["POST"])
@verify_firebase_token
def push_subscribe():
    data = request.get_json(force=True) or {}
    token = data.get("token")
    platform = data.get("platform", "web")
    uid = request.user.get("uid")
    if not token or not uid:
        return jsonify({"error": "Missing token or user ID"}), 400
    
    # Store under users/{uid}/webPushTokens/{token}
    db.collection("users").document(uid).collection("webPushTokens").document(token).set({
        "token": token,
        "platform": platform,
        "updatedAt": firestore.SERVER_TIMESTAMP
    })
    return jsonify({"ok": True})

# Disable notifications
@app.route("/api/push/unsubscribe", methods=["POST"])
@verify_firebase_token
def push_unsubscribe():
    data = request.get_json(force=True) or {}
    token = data.get("token")
    uid = request.user.get("uid")
    if not token or not uid:
        return jsonify({"error": "Missing token or user ID"}), 400

    # Remove the token from the user's document
    db.collection("users").document(uid).collection("webPushTokens").document(token).delete()
    return jsonify({"ok": True})

# Send notification to user (can add feature to call from admin tools)
@app.route("/api/notify", methods=["POST"])
@verify_firebase_token
def notify_user():
    """
    Body: {userId (optional), title, body, link}
    if userID not included then targets the caller (request.user['uid'])
    """
    data= request.get_json(force=True) or {}
    target_uid = data.get("userId") or request.user.get("uid")
    title = data.get("title", "Notification")
    body = data.get("body", "")
    link = data.get("link") #for Url to open on click
    
    tokens_ref = db.collection("users").document(target_uid).collection("webPushTokens")
    tokens = [doc.id for doc in tokens_ref.stream()]
    
    if not tokens:
        return jsonify({"ok": False, "message": "No tokens found for user"}), 200
    
    sent, errors = 0, []
    for t in tokens:
        try:
            # FCM data payload values must be strings.
            msg = messaging.Message(
                token=t,
                data={
                    "title": str(title),
                    "body": str(body),
                    **({"link": str(link)} if link else {}),
                },
                webpush=messaging.WebpushConfig(
                    headers={"Urgency": "high"}
                ),
            )
            messaging.send(msg)
            sent += 1
        except Exception as e:
            msg = str(e)
            errors.append(msg)
            if "registration token is not registered" in msg.lower():
                # Remove invalid token
                db.collection("users").document(target_uid).collection("webPushTokens").document(t).delete()

    return jsonify({"ok": sent > 0, "sent": sent, "errors": errors})

if __name__ == '__main__':
    app.run(debug=True)
