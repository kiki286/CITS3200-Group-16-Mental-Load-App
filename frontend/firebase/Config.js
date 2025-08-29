//CITS3200 project group 23 2024
//Stores Firebase public key

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Use getAuth for web

const firebaseConfig = {
  apiKey: "AIzaSyCPSlll8sxCoziyHQ9a0AsucDnKupQBmKs",
  authDomain: "mental-load-app-production.firebaseapp.com",
  projectId: "mental-load-app-production",
  storageBucket: "mental-load-app-production.firebasestorage.app",
  messagingSenderId: "464036946053",
  appId: "1:464036946053:web:79ec052e378670f5d8c9ec",
  measurementId: "G-0FZW5NHWJX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
