//CITS3200 project group 23 2024
//Functions to handle sign in, sign up

import React, { useState } from "react";
import { auth } from "../firebase/config";
import { getDemographicsSubmitted } from '../services/StorageHandler';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

// Function to format firebase errors nicer
const formatError = (errorCode) => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Invalid email format. Please enter a valid email.";
    case "auth/email-already-in-use":
      return "This email is already in use. Please use a different email or log in.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/user-not-found":
      return "No account found with this email. Please sign up.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many login attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "The login process was interrupted. Please try again.";
    default:
      return "An unknown error occurred. Please try again.";
  }
};

// function that handles signin
export const useSignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = (navigation) => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Successfully signed in
        const user = userCredential.user;
        console.log("User signed in:", user.email);
        //Check if demographics has been submitted. Return them to the demographics survey if false.
        const demographicsSubmitted = await getDemographicsSubmitted();
        if (!demographicsSubmitted) {
          navigation.navigate("Demographics");
        } else {
        navigation.navigate("Dashboard_Navigator", {
          displayName: user.displayName,
          uid: user.uid,
        });
      }})
      .catch((error) => {
        console.error("SignIn error:", error.code, error.message, error?.customData?.serverResponse);
        setErrorMessage(formatError(error.code));
      });
  };
  return { handleSignIn, email, password, errorMessage, setErrorMessage, setEmail, setPassword };
};

// function that handles signup
export const useSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = (navigation) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return updateProfile(user, { displayName }).then(() => {
          console.log("Account created & profile updated");
          navigation.navigate("Demographics", {
            displayName: user.displayName,
            uid: user.uid,
          });
        });
      })
      .catch((error) => {
        console.error("SignUp error:", error.code, error.message, error?.customData?.serverResponse);
        setErrorMessage(formatError(error.code));
      });
  };
  return {
    email,
    password,
    setEmail,
    setPassword,
    displayName,
    setDisplayName,
    errorMessage,
    setErrorMessage,
    handleSignUp,
  };
};
