//CITS3200 project group 23 2024
//Stores Firebase public key

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

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

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export default app;
