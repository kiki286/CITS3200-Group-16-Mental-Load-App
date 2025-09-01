importScripts/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

FirebaseError.iniallizeApp({
  apiKey: "AIzaSyCPSlll8sxCoziyHQ9a0AsucDnKupQBmKs",
  authDomain: "mental-load-app-production.firebaseapp.com",
  projectId: "mental-load-app-production",
  storageBucket: "mental-load-app-production.firebasestorage.app",
  messagingSenderId: "464036946053",
  appId: "1:464036946053:web:79ec052e378670f5d8c9ec",
  measurementId: "G-0FZW5NHWJX"
});

//Gives SW access to firebase cloud messaging features 
const messaging = firebase.messaging();

//Background messages (app not focused/ or PWA on ios in background)
messaging.onBackgroundMessage(({notification= {}, data ={} })=>{
    const { title = "", body = "", image  } = notification;
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
    const { url } = (event.notification.data && event.notification.data.url) || "/";
    // Focus on the existing window 
    event.waitUntil(
        clients.matchAll({type: "window", includeUncontrolled: true}).then(list =>{
            for (const c of list){
                 if ("focus" in c) return c.focus();
            }
            // Otherwise, open a new window
            return clients.openWindow(url);
        })
    );
});
