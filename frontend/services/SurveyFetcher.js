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
      //Get backend URL from .env instead of hardcoding
      //Makes it easier to switch between localhost, emulator, and production environment
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
      if (!baseUrl) {
        throw new Error("Missing EXPO_PUBLIC_BACKEND_URL. Define it in frontend/.env and restart the app.");
      }
      const url = `${baseUrl}/get-survey`;
      console.log("Fetching survey from:", url, "type:", surveyType);

      const response = await fetch(url, {
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

      const contentType = response.headers.get("content-type") || "";

      if (response.ok) {
        if (!contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response body:", text.slice(0, 500));
          throw new Error(`Expected JSON but received '${contentType}'`);
        }
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
