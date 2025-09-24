self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evt) => evt.waitUntil(self.clients.claim()));

/* firebase-messaging-sw.js (frontend/public) */
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCPSlll8sxCoziyHQ9a0AsucDnKupQBmKs",
  authDomain: "mental-load-app-production.firebaseapp.com",
  projectId: "mental-load-app-production",
  storageBucket: "mental-load-app-production.firebasestorage.app",
  messagingSenderId: "464036946053",
  appId: "1:464036946053:web:79ec052e378670f5d8c9ec",
});

//Gives SW access to firebase cloud messaging features 
const messaging = firebase.messaging();

//Background messages (app not focused/ or PWA on ios in background)
messaging.onBackgroundMessage(({notification= {}, data ={} })=>{
    const title  = notification.title ||  data.title || "Notification";
    const body = notification.body || data.body || "";
    const image = notification.image || data.image;
    const url = data.link || "/"; //link for notification click
    //Shows as system notification (same UI as OS notifications)
    self.registration.showNotification(title, {
        body,
        icon: image,
        data: { url }
    });
});

// Handles notification click events (open/focus on app)
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url  = (event.notification.data && event.notification.data.url) || "/";
    // Focus on the existing window 
    event.waitUntil(
        clients.matchAll({type: "window", includeUncontrolled: true}).then(list =>{
            for (const c of list){
                 if ("focus" in c) {
                     if ("navigate" in c && url) c.navigate(url);
                     return c.focus();
                 }
            }
            // Otherwise, open a new window
            return clients.openWindow(url);
        })
    );
});
