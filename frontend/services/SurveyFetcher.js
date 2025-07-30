//CITS3200 project group 23 2024
//Function fetches survey from flask server

// SurveyFetcher.js
import { getAuth } from "firebase/auth";

export const fetchSurveyData = async (surveyType) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      const idToken = await user.getIdToken();
      //use http://10.0.2.2:5000 if using an emulator on the same device otherwise
      //use http://127.0.0.1:5000 or
      //use http://192.168.0.127:5000
      //Use https://jameb.pythonanywhere.com if not running flask
      const response = await fetch("https://jameb.pythonanywhere.com/get-survey", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
          "Survey-Type": surveyType,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Failed to fetch survey:", response.statusText);
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error("Error fetching survey:", error);
      throw error;
    }
  } else {
    console.error("No user is signed in.");
    throw new Error("No user is signed in");
  }
};
