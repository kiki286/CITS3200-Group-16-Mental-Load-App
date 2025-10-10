//CITS3200 project group 23 2024
//Function that sends responses to Flask Server

import { getAuth } from "firebase/auth";
import { fetchWithAuth } from "./api";
//import { ResponseData } from #TBA#

//Placeholder data

export const ResponseSender = async (surveyResponseData, surveyType) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    try {
      const date = new Date().toISOString().split('.')[0] + 'Z'; // Remove milliseconds and keep the 'Z' for UTC;
      const values = {
        endDate: date,
        startDate: date,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        finished: 1,
      }
      surveyResponseData.values = values;
      //http://192.168.0.127 or use
      //http://10.0.2.2:5000 for emulators
      //Use https://jameb.pythonanywhere.com if not running flask
      
      //Get backend URL from .env instead of hardcoding
      //Makes it easier to switch between localhost, emulator, and production environment

      console.log("Submitting survey:", { surveyType });
      const data = await fetchWithAuth("/submit-survey", {
        method: "POST",
        headers: { "Survey-Type": surveyType },
        body: surveyResponseData,
      });
      // helper returns parsed JSON; add a success flag if you want
      return { ...data, success: true };
    } catch (error) {
      console.error("Error submitting survey responses:", error);
      throw error;
    }
  }
};
