//CITS3200 project group 23 2024
//Stores Firebase public key

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"; // For web push notifications
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

export async function requestNotificationPermission(vapidPublicKey) {
  // To only try on supported browsers
  const supported = await isSupported().catch(() => false);
  if (!supported) return { ok: false, reason: "unsupported" };

  // Register (no-op if already registered), then wait until ACTIVE
  await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
  const reg = await navigator.serviceWorker.ready;

  //request user permission for notification
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: permission};

  //get the token (tie to service worker) and save token
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey: vapidPublicKey,
    serviceWorkerRegistration: reg});

  return token ? {ok: true, token} : { ok: false, reason: "no-token" };
}

export function listenForMessages(callback) {
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
}

export const auth = getAuth(app);
