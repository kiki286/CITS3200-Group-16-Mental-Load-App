//CITS3200 project group 23 2024
//App entry point using stack navigator to handle navigations

import React, { useEffect, useState } from "react";
import { SafeAreaView, ActivityIndicator, View, Platform, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Dashboard_Navigator from "./dashboard/Dashboard_Navigator";
import Welcome from "./screens/Welcome";
import Demographics from "./screens/Demographics";
import TermsConditions from "./screens/TermsConditions";
import { useFonts } from 'expo-font';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, requestNotificationPermission, listenForMessages} from "./firebase/config";
import { getMessaging, getToken, isSupported } from "firebase/messaging"; // For web push notifications
import COLORS from "./constants/colors";
import './dev-on-device';
import { API_BASE, fetchWithAuth } from './services/api'

if (typeof window !== 'undefined') console.log('[API_BASE]', API_BASE);

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY; //public key from frontend\.env
const welcome_stack = createStackNavigator();
console.disableYellowBox = true;

// Ensure body scrolling is enabled on web: some injected resets set overflow: hidden.
// Append a small style tag at runtime with !important to override that.
if (typeof window !== 'undefined' && Platform.OS === 'web') {
  try {
    const existing = document.getElementById('fix-expo-overflow');
    if (!existing) {
      const s = document.createElement('style');
      s.id = 'fix-expo-overflow';
      s.innerHTML = `html, body { height: 100%; } body { overflow: auto !important; } #root { display: flex; height: 100%; flex: 1; }`;
      document.head.appendChild(s);
    }
  } catch (e) {
    // ignore
  }
}

// Patch any Expo/react-native-web injected reset styles (they can be added
// or updated after the app loads). We watch the head and rewrite the
// expo-reset style content so body overflow is auto.
if (typeof window !== 'undefined' && Platform.OS === 'web') {
  try {
    const fixExpoResetOnce = () => {
      const s = document.getElementById('expo-reset');
      if (s && s.tagName === 'STYLE') {
        const txt = s.innerHTML || '';
        // replace body { overflow: hidden } with overflow: auto
        const replaced = txt.replace(/body\s*\{[^}]*overflow:\s*hidden;?[^}]*\}/i, 'body { overflow: auto !important; }');
        if (replaced !== txt) s.innerHTML = replaced;
      }
    };

    // Run once immediately in case expo already injected it
    fixExpoResetOnce();

    // Observe head for new style nodes (some tooling injects after load)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length) {
          for (const n of m.addedNodes) {
            try {
              if (n && n.id === 'expo-reset') {
                fixExpoResetOnce();
                return;
              }
            } catch (e) { /* ignore */ }
          }
        }
        if (m.type === 'attributes' && m.target && m.target.id === 'expo-reset') {
          fixExpoResetOnce();
        }
      }
    });
    mo.observe(document.head, { childList: true, subtree: true, attributes: true });
    // keep observer intentionally (no disconnect) so any future updates are patched
  } catch (e) {
    // ignore
  }
}

export default function App() {
  
  const [fontsLoaded] = useFonts({
    // App fonts
    'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf')
  });
  
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('');

  // Track if user is currently taking a survey
  const isOnSurvey = currentRoute === 'Survey_Repeated';

  // Check if notifications are already enabled (web only)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof Notification !== "undefined") {
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (initializing) setInitializing(false);
    })
    return () => unsubscribe();
  }, [initializing]);

  // Auto-register SW and (if permission is already granted) sync token to backend on login
  useEffect(() => {
    if (Platform.OS !== "web" || !user) return;

    (async () => {
      const supported = await isSupported().catch(() => false);
      if (!supported) return;
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

      //  Ensure an ACTIVE service worker controls the page
      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const reg = await navigator.serviceWorker.ready;

      // silently get/refresh the token
      const messaging = getMessaging(); 
      const newToken = await getToken(messaging, {
        vapidKey: VAPID_PUBLIC_KEY,
        serviceWorkerRegistration: reg,
      }).catch(() => null);

      if (!newToken) return;

      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;

      await fetchWithAuth("/api/push/subscribe", {
        method: "POST",
        body: { token: newToken, platform: "web" },
      });

      setPushEnabled(true);
    })();
  }, [user]);
  
  //If on web page, messages dispalyed on page not push notifications
  useEffect(() => {
    if(Platform.OS !== "web") return;
    const unsubscribe = listenForMessages((payload)=>{
      const n = payload?.notification || {};
      console.log("Foreground notification:", n.title, n.body);

    });
    return () => { unsubscribe && unsubscribe(); };
  }, []);

  async function onEnableNotifications() {
    if (Platform.OS !== "web") return; //only on web
    //Permission for push notifications
    const { ok, token, reason } = await requestNotificationPermission(VAPID_PUBLIC_KEY);
    if (!ok) {console.warn("Push not enabled:", reason); return}
    //send token to backend to save against user
    const idToken = await auth.currentUser.getIdToken();
    await fetchWithAuth("/api/push/subscribe", {
      method: "POST",
      body: { token, platform: "web" },
    });
    //update UI
    setPushEnabled(true);
  }

  if (typeof window !== "undefined") {
  // 1) Log what API base your built app is actually using
  //    Set this to whatever you currently export/use for requests
  //    (If you don’t have one, just paste the line with your string)
  // Example if you have API_BASE:
  //   import { API_BASE } from "./lib/api";
  //   window.__API_BASE__ = API_BASE;
  window.__API_BASE__ = process.env.EXPO_PUBLIC_BACKEND_URL || "";

  // 2) Expose a function to get a fresh ID token from the current user
  window.__getIdToken__ = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      console.log("[auth] not signed in");
      return null;
    }
    const t = await user.getIdToken(true); // force refresh
    console.log("[auth] idToken length:", t.length);
    return t;
  };

  // 3) Log sign-in state changes
  onAuthStateChanged(getAuth(), (u) => {
    console.log("[auth] signed in:", !!u, u?.email || null);
  });
}

  // Fix for mobile browser chrome causing white gaps / viewport resize on web
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const body = document && document.body;
      if (body) {
        body.style.background = COLORS.black;
        body.style.minHeight = '100vh';
        body.style.margin = '0';
      }
      const html = document && document.documentElement;
      if (html) html.style.height = '100%';
    } catch (e) {
      // ignore in non-browser envs
    }
  }, []);

  if (!fontsLoaded) {
    // Display a loading spinner while fonts are being loaded
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (initializing) { // Checking auth state
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.black}}>
      <NavigationContainer 
        onStateChange={(state) => {
          // Track current route name for hiding notification button during surveys
          const getCurrentRoute = (navState) => {
            if (!navState || !navState.routes) return '';
            
            const route = navState.routes[navState.index];
            if (route.state) {
              return getCurrentRoute(route.state);
            }
            return route.name;
          };
          
          const routeName = getCurrentRoute(state);
          setCurrentRoute(routeName);
        }}
      >
        <welcome_stack.Navigator
          initialRouteName={user ? 'Dashboard_Navigator' : 'Welcome'} // Navigate based on user state
        >
          <welcome_stack.Screen
            name="Welcome"
            component={Welcome}
            options={{
              headerShown:false
            }}
          />
          <welcome_stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown:false
            }}
          />
          <welcome_stack.Screen
            name="Signup"
            component={Signup}
            options={{
              headerShown:false
            }}
          />
          <welcome_stack.Screen
            name="Dashboard_Navigator"
            component={Dashboard_Navigator}
            options={{
              headerShown:false
            }}
          />
          <welcome_stack.Screen
            name="Demographics"
            component={Demographics}
            options={{
              headerShown:false
            }}
          />
          <welcome_stack.Screen
            name="TermsConditions"
            component={TermsConditions}
            options={{
              headerShown:false
            }}
          />
        </welcome_stack.Navigator>
      </NavigationContainer>
      {Platform.OS === "web" && !initializing && !!user && !pushEnabled && !isOnSurvey && typeof Notification !== "undefined" && Notification.permission !== "granted" && !pushEnabled &&(
        <View style={{ position: "absolute", bottom: 10, left: 0, right: 0, alignItems: 'center' }}>
          <TouchableOpacity onPress={onEnableNotifications} 
            style={{ backgroundColor: COLORS.light_green, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Enable Notifications</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};