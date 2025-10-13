from flask import Flask, request, jsonify
from flask_cors import CORS 
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, auth, firestore, messaging
from functools import wraps
from pathlib import Path
import logging
import threading
import time
import hashlib
try:
    from zoneinfo import ZoneInfo
except ImportError:
    try:
        from backports.zoneinfo import ZoneInfo  # backport for Python < 3.9
    except ImportError:
        raise RuntimeError(
            "zoneinfo not available: upgrade to Python 3.9+ or install backports.zoneinfo "
            "(pip install backports.zoneinfo)"
        )
import re
from flask import Response, jsonify

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
logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))
logger = logging.getLogger('mental-load-backend')
logger.info("FIRESTORE PROJECT (server): %s", db.project)

# Test Firestore read
try:
    db.collection("_health").document("write").set({"ts": firestore.SERVER_TIMESTAMP})
    logger.info("FIRESTORE WRITE: OK")
except Exception as e:
    logger.exception("FIRESTORE WRITE: FAIL -> %s", repr(e))


def load_survey_settings():
    """Load survey IDs from Firestore (falls back to env vars)."""
    global CHECKIN_SURVEY, DEMOGRAPHICS_SURVEY
    try:
        doc = db.collection('settings').document('surveys').get()
        if doc.exists:
            data = doc.to_dict()
            if data.get('checkin_survey'):
                CHECKIN_SURVEY = data.get('checkin_survey')
            if data.get('demographics_survey'):
                DEMOGRAPHICS_SURVEY = data.get('demographics_survey')
            logger.info('Loaded survey settings from Firestore: %s', {'checkin': CHECKIN_SURVEY, 'demographics': DEMOGRAPHICS_SURVEY})
        else:
            logger.info('No survey settings document found in Firestore; using env values')
    except Exception as e:
        logger.exception('Failed to load survey settings from Firestore: %s', repr(e))


# Attempt to load survey settings from Firestore at startup
load_survey_settings()

def verify_firebase_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = request.headers.get('Authorization')
        logger.debug("Request headers: %s", dict(request.headers))

        if not id_token:
            logger.warning('No Authorization header present')
            return jsonify({"message": "Unauthorized"}), 401
        
        # Strip "Bearer " prefix if present
        if id_token.startswith("Bearer "):
            logger.debug('Bearer prefix found, stripping')
            id_token = id_token.split(" ")[1]

        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user = decoded_token
            logger.debug('Decoded Token: %s', {k: request.user.get(k) for k in ['uid', 'email']})
        except Exception as e:
            logger.exception('Error verifying token: %s', e)
            return jsonify({"message": "Forbidden"}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = getattr(request, "user", None)

        if not user:
            return jsonify({"message": "Unauthorized"}), 401
        if not user.get("admin", False):
            return jsonify({"message": "Forbidden"}), 403
        return f(*args, **kwargs)
    
    return wrapper

def get_survey_id():
    """Retrieve the survey ID based on the request header."""
    survey_type = request.headers.get('Survey-Type')
    if survey_type == 'checkin':
        return CHECKIN_SURVEY
    elif survey_type == 'demographics':
        return DEMOGRAPHICS_SURVEY
    else:
        return None


def parse_iso_utc(s):
    """Parse an ISO timestamp (accepts trailing Z) and return an aware UTC datetime."""
    if not s:
        return None
    try:
        # Accept values ending with Z (Zulu) or with offset
        if s.endswith('Z'):
            s = s[:-1] + '+00:00'
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            # assume UTC
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        logger.exception('Failed to parse ISO timestamp: %s', s)
        return None

WEBPUSH_TTL = os.getenv('WEBPUSH_TTL', '4500')         # seconds, string
WEBPUSH_URGENCY = os.getenv('WEBPUSH_URGENCY', 'high') # "high" or "normal"

def _send_notifications_to_tokens(tokens, title, body, link=None, cleanup_uid=None):
    sent = 0
    errors = []
    logger.info('Attempting to send notifications to %d tokens', len(tokens))
    for t in tokens:
        try:
            token_snippet = (t[:40] + '...') if len(t) > 43 else t
            logger.debug('Sending to token (snippet): %s', token_snippet)
            webpush_cfg = messaging.WebpushConfig(
                headers={
                    "Urgency": WEBPUSH_URGENCY,
                    "TTL": WEBPUSH_TTL,
                },
                notification=messaging.WebpushNotification(
                    title=str(title),
                    body=str(body),
                )
            )
            # include Notification for cross-platform compatibility
            platform_notification = messaging.Notification(
                title=str(title),
                body=str(body)
            )
            msg = messaging.Message(
                token=t,
                notification=platform_notification,
                data={
                    "title": str(title),
                    "body": str(body),
                    **({"link": str(link)} if link else {}),
                },
                webpush=webpush_cfg,
            )
            response = messaging.send(msg)
            sent += 1
            logger.info('FCM send response for token %s: %s', token_snippet, response)
        except Exception as e:
            msg = str(e)
            errors.append(msg)
            # Auto-clean dead tokens under this user whether stored by doc-id or 'token' field
            if cleanup_uid and ('registration token is not registered' in msg.lower() or 'not registered' in msg.lower()):
                try:
                    col = db.collection("users").document(cleanup_uid).collection("webPushTokens")
                    col.document(t).delete()  # best case (token as doc id)
                    for d in col.where("token", "==", t).stream():  # fallback (auto-id docs)
                        d.reference.delete()
                    logger.info("Removed unregistered token for uid=%s", cleanup_uid)
                except Exception:
                    logger.exception("Failed to clean up unregistered token for uid=%s", cleanup_uid)
    return sent, errors


def gather_all_push_tokens():
    """Return a list of all stored web push tokens (strings)."""
    tokens = []
    try:
        users = list(db.collection('users').stream())
        logger.debug('gather_all_push_tokens: found %d user documents', len(users))
        for u in users:
            uid = u.id
            toks = list(db.collection('users').document(uid).collection('webPushTokens').stream())
            if toks:
                logger.debug('gather_all_push_tokens: user %s has %d tokens', uid, len(toks))
            for d in toks:
                data = d.to_dict() or {}
                tok = data.get('token')
                if tok:
                    tokens.append(tok)
    except Exception as e:
        logger.exception('Error gathering all tokens: %s', repr(e))
    return tokens


def gather_tokens_for_emails(emails):
    """Given a list of emails, return associated push tokens by resolving users via Auth if possible."""
    tokens = []
    for email in emails:
        try:
            user_record = auth.get_user_by_email(email)
            uid = user_record.uid
            toks = db.collection('users').document(uid).collection('webPushTokens').stream()
            for d in toks:
                data = d.to_dict() or {}
                tok = data.get('token')
                if tok:
                    tokens.append(tok)
        except Exception as e:
            logger.exception('Could not resolve tokens for email %s: %s', email, repr(e))
            continue
    return tokens

@app.route("/api/user/prefs", methods=["POST"])
@verify_firebase_token
def user_prefs_upsert():
    """
    Body: { notificationsEnabled: bool, reminderTime: "HH:MM", timezone: "Area/City" }
    Any field may be omitted (partial update).
    """
    body = request.get_json(force=True) or {}
    uid = request.user.get("uid")
    prefs_update = {}

    if "notificationsEnabled" in body:
        prefs_update["prefs.notificationsEnabled"] = bool(body["notificationsEnabled"])
    if "reminderTime" in body:
        # store canonical HH:MM
        hhmm = str(body["reminderTime"])[:5]
        prefs_update["prefs.reminderHHMM"] = hhmm
    if "timezone" in body:
        prefs_update["prefs.timezone"] = str(body["timezone"])

    if not prefs_update:
        return jsonify({"ok": False, "error": "No fields to update"}), 400

    db.collection("users").document(uid).set(prefs_update, merge=True)
    return jsonify({"ok": True})

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


# Admin endpoints to view/update survey IDs persisted in Firestore
@app.route('/admin/surveys', methods=['GET'])
@verify_firebase_token
@require_admin
def admin_get_surveys():
    """Return the currently-configured survey IDs."""
    try:
        doc = db.collection('settings').document('surveys').get()
        if doc.exists:
            data = doc.to_dict()
        else:
            data = {}
        # Fallback to env values if fields missing
        data.setdefault('checkin_survey', CHECKIN_SURVEY)
        data.setdefault('demographics_survey', DEMOGRAPHICS_SURVEY)
        return jsonify({'ok': True, 'surveys': data}), 200
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


@app.route('/admin/surveys', methods=['POST'])
@verify_firebase_token
@require_admin
def admin_set_surveys():
    """Update survey IDs in Firestore and refresh in-memory values."""
    body = request.get_json(force=True) or {}
    checkin = body.get('checkinSurveyId')
    demographics = body.get('demographicsSurveyId')
    if not checkin and not demographics:
        return jsonify({'ok': False, 'error': 'No survey fields provided'}), 400
    update_doc = {}
    if checkin:
        update_doc['checkinSurveyId'] = checkin
    if demographics:
        update_doc['demographicsSurveyId'] = demographics
    try:
        db.collection('settings').document('surveys').set(update_doc, merge=True)
        # Update in-memory globals so server uses new ids without restart
        if checkin:
            globals()['CHECKIN_SURVEY'] = checkin
        if demographics:
            globals()['DEMOGRAPHICS_SURVEY'] = demographics
        return jsonify({'ok': True, 'surveys': {'checkin_survey': globals().get('CHECKIN_SURVEY'), 'demographics_survey': globals().get('DEMOGRAPHICS_SURVEY')}}), 200
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500

def _send_daily_reminders_once():
    now_utc = datetime.now(timezone.utc)
    users = db.collection("users").stream()
    for u in users:
        data = u.to_dict() or {}
        prefs = data.get("prefs") or {}
        if not prefs.get("notificationsEnabled"):
            continue

        tzname = prefs.get("timezone") or "UTC"
        try:
            tz = ZoneInfo(tzname)
        except Exception:
            tz = timezone.utc

        hhmm = prefs.get("reminderHHMM")
        if not hhmm or len(hhmm) < 4:
            continue

        # Compare current local HH:MM and send at the exact minute, once per day
        local_now = now_utc.astimezone(tz)
        window = int(os.getenv('DAILY_REMINDER_WINDOW_SEC', '300'))
        target = local_now.replace(
            hour=int(hhmm[:2]), minute=int(hhmm[3:5]), second=0, microsecond=0
        )
        if abs((local_now - target).total_seconds()) > window:
            continue

        last_sent = (prefs.get("lastSentDate") or "")
        today_iso = local_now.date().isoformat()
        if last_sent == today_iso:
            continue  # already sent today

        # get this user's tokens
        toks = []
        try:
            ref = db.collection("users").document(u.id).collection("webPushTokens").stream()
            for d in ref:
                dd = d.to_dict() or {}
                tok = dd.get("token") or d.id  # be robust
                if tok:
                    toks.append(tok)
        except Exception:
            pass

        if not toks:
            continue

        title = "Your Mental Load Check is Ready!"
        body = "This is a reminder to do your Mental Load Check."

        sent, errors = _send_notifications_to_tokens(toks, title, body, link="/")
        try:
            db.collection("users").document(u.id).set(
                {"prefs": {"lastSentDate": today_iso}}, merge=True
            )
        except Exception:
            logger.exception("Failed to update lastSentDate for uid=%s", u.id)
            
@app.route('/admin/campaigns', methods=['POST'])
@verify_firebase_token
@require_admin
def admin_create_campaign():
    """Create a campaign. Body: { message, scheduledAtUtc, timezone, target }
    target: { type: 'all' } or { type: 'emails', emails: [...] }
    """
    body = request.get_json(force=True) or {}
    message = body.get('message')
    scheduled_at = body.get('scheduledAtUtc')
    tz_name = body.get('timezone')
    target = body.get('target') or {}

    if not message:
        return jsonify({'ok': False, 'error': 'Missing message'}), 400
    dt = parse_iso_utc(scheduled_at)
    if not dt:
        return jsonify({'ok': False, 'error': 'Invalid scheduledAtUtc'}), 400

    # Save campaign document
    doc = {
        'message': message,
        'scheduledAtUtc': dt.isoformat(),
        'timezone': tz_name,
        'target': target,
        'createdBy': request.user.get('uid'),
        'status': 'scheduled',
        'createdAt': firestore.SERVER_TIMESTAMP,
    }
    try:
        doc_ref = db.collection('admin').document('campaigns').collection('items').document()
        doc_ref.set(doc)
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500

    # If scheduled time is now or overdue (<= 60s), send immediately synchronously
    delta = (dt - datetime.now(timezone.utc)).total_seconds()
    if delta <= 60:
        try:
            if target.get('type') == 'all':
                tokens = gather_all_push_tokens()
            elif target.get('type') == 'emails':
                tokens = gather_tokens_for_emails(target.get('emails', []))
            else:
                tokens = []
            sent, errors = _send_notifications_to_tokens(tokens, 'Campaign', message, link=None)
            # update campaign status
            doc_ref.update({'status': 'sent', 'sentAt': firestore.SERVER_TIMESTAMP, 'sentCount': sent})
            return jsonify({'ok': True, 'sent': sent, 'errors': errors}), 200
        except Exception as e:
            print('Campaign send error:', repr(e))
            return jsonify({'ok': False, 'error': str(e)}), 500

    # Otherwise scheduled for later
    return jsonify({'ok': True, 'scheduled': True}), 200

# Push Notifications
@app.route("/api/push/subscribe", methods=["POST"])
@verify_firebase_token
def push_subscribe():
    data = request.get_json(force=True) or {}
    token = data.get("token")
    platform = data.get("platform", "web")
    uid = request.user.get("uid")
    logger.info('push_subscribe called for uid=%s token_snippet=%s platform=%s', uid, (token[:40] + '...') if token and len(token) > 43 else token, platform)
    if not token or not uid:
        logger.warning('push_subscribe missing token or uid - token=%s uid=%s', token, uid)
        return jsonify({"error": "Missing token or user ID"}), 400
    
    # Ensure the user document exists so listing `collection('users')` will return it
    try:
        db.collection('users').document(uid).set({'lastSeen': firestore.SERVER_TIMESTAMP}, merge=True)
    except Exception:
        logger.debug('Could not create/update parent user doc for uid=%s', uid)

    # Store under users/{uid}/webPushTokens/{token}
    try:
        db.collection("users").document(uid).collection("webPushTokens").document(token).set({
            "token": token,
            "platform": platform,
            "updatedAt": firestore.SERVER_TIMESTAMP
        })
    except Exception:
        # Fallback to add auto-id doc
        db.collection("users").document(uid).collection("webPushTokens").add({
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
    logger.info('push_unsubscribe called for uid=%s token_snippet=%s', uid, (token[:40] + '...') if token and len(token) > 43 else token)
    if not token or not uid:
        logger.warning('push_unsubscribe missing token or uid - token=%s uid=%s', token, uid)
        return jsonify({"error": "Missing token or user ID"}), 400

    # Remove the token from the user's document
    col = db.collection("users").document(uid).collection("webPushTokens")
    # best case: token used as doc id
    col.document(token).delete()
    # fallback: delete any auto-id docs with the same token field
    for d in col.where("token", "==", token).stream():
        d.reference.delete()
    return jsonify({"ok": True})

# Send notification to user (can add feature to call from admin tools)
@app.route("/api/notify", methods=["POST"])
@verify_firebase_token
@require_admin
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
    
    col = db.collection("users").document(target_uid).collection("webPushTokens").stream()
    tokens = []
    for d in col:
        data = d.to_dict() or {}
        tok = data.get("token") or d.id
        if tok:
            tokens.append(tok)
    tokens = list(set(tokens))  # dedupe
    
    if not tokens:
        return jsonify({"ok": False, "message": "No tokens found for user"}), 200

    sent, errors = _send_notifications_to_tokens(
        tokens, title, body, link, cleanup_uid=target_uid
    )
    return jsonify({"ok": sent > 0, "sent": sent, "errors": errors})


@app.route('/admin/debug/push-tokens', methods=['GET'])
@verify_firebase_token
@require_admin
def admin_debug_push_tokens():
    """Return a list of stored web push tokens with minimal metadata for debugging.
    This helps determine whether tokens are FCM registration tokens (short strings)
    or full PushSubscription objects (json)."""
    try:
        out = []
        users = db.collection('users').stream()
        for u in users:
            uid = u.id
            toks = db.collection('users').document(uid).collection('webPushTokens').stream()
            for d in toks:
                data = d.to_dict() or {}
                token_id = d.id
                out.append({
                    'uid': uid,
                    'token_id': token_id,
                    'platform': data.get('platform'),
                    'addedAt': data.get('updatedAt'),
                    'raw': data,
                })
        return jsonify({'ok': True, 'tokens': out}), 200
    except Exception as e:
        logger.exception('Failed to list push tokens: %s', repr(e))
        return jsonify({'ok': False, 'error': str(e)}), 500


QUALTRICS_DC_HOST = "yul1.qualtrics.com"  # keep the host you use

# Simple proxy for Qualtrics images. Accepts ?im=IM_xxx&rel=0|1
@app.route("/api/qualtrics-image")
def qualtrics_image_proxy():
    im = request.args.get("im", "")
    use_rel = request.args.get("rel", "0") == "1"

    # validate IM param to avoid open-proxy abuse
    if not re.match(r"^IM_[A-Za-z0-9_-]+$", im):
        return jsonify({"error": "invalid im parameter"}), 400

    base = "WRQualtricsControlPanel_rel" if use_rel else "WRQualtricsControlPanel"
    url = f"https://{QUALTRICS_DC_HOST}/{base}/Graphic.php?IM={im}"

    try:
        resp = requests.get(url, stream=True, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as e:
        return jsonify({"error": "failed to fetch image", "detail": str(e)}), 502

    content_type = resp.headers.get("Content-Type", "image/png")
    # return the image bytes and allow cross-origin from your web client
    headers = {
        "Content-Type": content_type,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*"
    }
    return Response(resp.content, headers=headers, status=resp.status_code)

# Internal scheduler: periodically scan for scheduled campaigns and send when due.
def process_due_campaigns_once():
    try:
        now = datetime.now(timezone.utc)
        coll = db.collection('admin').document('campaigns').collection('items')
        # Query for scheduled items. We'll filter client-side by scheduledAtUtc to avoid complex Firestore queries on timestamp formats.
        docs = coll.where('status', '==', 'scheduled').stream()
        processed = 0
        for d in docs:
            data = d.to_dict() or {}
            scheduled_iso = data.get('scheduledAtUtc')
            if not scheduled_iso:
                logger.warning('Campaign %s missing scheduledAtUtc', d.id)
                continue
            dt = parse_iso_utc(scheduled_iso)
            if not dt:
                logger.warning('Campaign %s has invalid scheduledAtUtc: %s', d.id, scheduled_iso)
                continue
            if dt <= now:
                processed += 1
                logger.info('Processing due campaign %s scheduled for %s', d.id, scheduled_iso)
                target = data.get('target', {})
                if target.get('type') == 'all':
                    tokens = gather_all_push_tokens()
                elif target.get('type') == 'emails':
                    tokens = gather_tokens_for_emails(target.get('emails', []))
                else:
                    tokens = []
                sent, errors = _send_notifications_to_tokens(tokens, 'Campaign', data.get('message', ''), link=data.get('link'))
                try:
                    d.reference.update({'status': 'sent', 'sentAt': firestore.SERVER_TIMESTAMP, 'sentCount': sent, 'errors': errors})
                except Exception:
                    logger.exception('Failed to update campaign doc %s after send', d.id)
        if processed:
            logger.info('Processed %d due campaigns', processed)
    except Exception as e:
        logger.exception('Error processing due campaigns: %s', repr(e))


def scheduler_loop(interval_seconds: int):
    logger.info('Starting campaign scheduler loop (interval=%ds)', interval_seconds)
    while True:
        process_due_campaigns_once()
        _send_daily_reminders_once() 
        time.sleep(interval_seconds)


# Start scheduler in background thread unless running in an environment that would spawn multiple processes.
def start_scheduler_if_needed():
    try:
        interval = int(os.getenv('CAMPAIGN_CHECK_INTERVAL_SECONDS', '300'))
    except Exception:
        interval = 300

    # When running Flask with the debugger/reloader, WERKZEUG_RUN_MAIN is set to 'true' in the reloader child.
    # Only start the scheduler in that child or when not in debug mode to avoid duplicate threads.
    werkzeug_run_main = os.environ.get('WERKZEUG_RUN_MAIN')
    if app.debug and werkzeug_run_main != 'true':
        logger.info('Skipping scheduler start in parent process (debug reloader).')
        return

    t = threading.Thread(target=scheduler_loop, args=(interval,), daemon=True)
    t.start()


# Kick off scheduler and run app when executed directly. The scheduler is
# started before app.run() so the Flask debug-reloader child process will
# actually start the background thread (the start function itself checks
# WERKZEUG_RUN_MAIN to avoid duplicate threads in the parent process).
if __name__ == '__main__':
    start_scheduler_if_needed()
    app.run(host='0.0.0.0', port=5000, debug=True)
