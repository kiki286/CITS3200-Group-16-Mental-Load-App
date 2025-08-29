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
      
      const response = await fetch("https://mental-load-app.onrender.com/get-survey", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
          "Survey-Type": surveyType,
        },
      });

      console.log("Response received:");
      console.log("Status:", response.status);
      console.log("StatusText:", response.statusText);
      console.log("Headers:", JSON.stringify([...response.headers.entries()]));

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Detailed error:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      throw error;
    }
  } else {
    console.error("No user is signed in.");
    throw new Error("No user is signed in");
  }
};
