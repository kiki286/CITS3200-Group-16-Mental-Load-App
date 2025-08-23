import os
from app import app

# Ensure the app uses the correct env path if necessary
# Optionally load dotenv here if needed:
# from dotenv import load_dotenv
# load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

if __name__ == '__main__':
    app.run()
