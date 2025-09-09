# CITS3200-Mental-Load-App  

An app to measure and view mental load  

## How to start using hosted server
The package.json file contains the packages used. 

1. Clone the repo and cd into the frontend directory  
2. Install libraries by running `npm install`  
3. Build and run the app by running `npx expo start`  

## How to set up firebase hosting for the first time
1. Cd into the frontend directory and install firebase with `npm install -g firebase-tools`
2. Login with your account using `firebase login`
3. When updating frontend, export build with `npx expo export --platform web`
4. Then redeploy with `firebase deploy --only hosting` 



## To run the webserver locally instead of globally:
Before doing anything, you need to set the .env_example file to contain your keys, and rename it to .env. **NEVER COMMIT THIS FILE ONCE YOU HAVE FILLED IT IN!**

To set up the flask server, you need to create a pyenv:

1. Run `python -m venv proxyserv`
2. Activate the pyenv (On Windows run `/proxyserv/Scripts/Activate`, on MacOS/Linux run `source proxyserv/bin/activate`)
3. Run `pip install -r requirements.txt` to install required packages for the webserver
4. Place your firebase credentials into the "secrets" folder
5. Run `flask run` to run the app. You should get a Hello World message on http://localhost:5000/
6. If you want to test on a phone (i.e. server can't be on localhost), run `flask run --host 0.0.0.0` to run it on your local network.

      To connect to the server from the app itself, you will need to set the URLs in frontend/services/ResponseSender.js and frontend/services/SurveyFetcher.js to align with your running flask server.

Setting up firebase:

1. Create a firebase account and a new project
2. Generate Json service app and download the credentials.json file (settings -> service accounts -> generate a new private key)
3. Change app.js to use your firebase admin credentials.json file
4. Change flask server address in frontend/services/SurveyFetcher to your local flask server address
5. Create a new web application and and set up authentication through email and password
6. Change config.js file in /frontend/firebase to your application configurations found in (Project Settings -> scroll to bottom)