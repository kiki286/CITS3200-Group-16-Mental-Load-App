//CITS3200 project group 23 2024
//Function fetches survey from flask server

// SurveyFetcher.js
import { getAuth } from "firebase/auth";
import { fetchWithAuth } from "./api";

export const fetchSurveyData = async (surveyType) => {
  const user = getAuth().currentUser;
  if (!user) throw new Error("No user is signed in");
  // Helper attaches the ID token and throws on non-2xx
  return await fetchWithAuth("/get-survey", {
    headers: { "Survey-Type": surveyType }, // no Content-Type on GET
  });
};
