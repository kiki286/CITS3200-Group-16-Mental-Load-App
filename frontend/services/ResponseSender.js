//CITS3200 project group 23 2024
//Function that sends responses to Flask Server

import { getAuth } from "firebase/auth";
//import { ResponseData } from #TBA#

//Placeholder data

export const ResponseSender = async (surveyResponseData, surveyType) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    try {
      const idToken = await user.getIdToken();
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
      const response = await fetch("https://mental-load-app.onrender.com//submit-survey", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
          "Survey-Type": surveyType,
        },
        body: JSON.stringify(surveyResponseData),
      });
      console.log("Pure sent: ", JSON.stringify(surveyResponseData));
      if (response.ok) {
        const data = await response.json();
        data["success"] = true;
        return data;
      } else {
        console.error(
          "Error",
          "Failed to submit survey responses. Status is: ",
          response.statusText 
        );
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error("Error submitting survey responses:", error);
      throw error;
    }
  }
};
