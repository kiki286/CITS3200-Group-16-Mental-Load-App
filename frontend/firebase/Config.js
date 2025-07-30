//CITS3200 project group 23 2024
//Stores Firebase public key

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTBUukjQBSWw8N76L3raREfprwSWRxSfY",
  authDomain: "cits3200-mental-load.firebaseapp.com",
  projectId: "cits3200-mental-load",
  storageBucket: "cits3200-mental-load.appspot.com",
  messagingSenderId: "988702175484",
  appId: "1:988702175484:web:846619cc9e2d12f3f02779",
  measurementId: "G-YK35PLYJCX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export default app;
