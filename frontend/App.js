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
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth, requestNotificationPermission, listenForMessages} from "./firebase/config";
import { getMessaging, getToken, isSupported } from "firebase/messaging"; // For web push notifications
import COLORS from "./constants/colors";

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";
const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY; //public key from frontend\.env
const welcome_stack = createStackNavigator();
console.disableYellowBox = true;

export default function App() {
  
  const [fontsLoaded] = useFonts({
    // App fonts
    'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf')
  });
  
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false);

  // Check if notifications are already enabled (web only)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof Notification !== "undefined") {
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const { claims } = await getIdTokenResult(currentUser, true);
          setIsAdmin(!!claims.admin);
        } catch (err) {
        console.error("getIdTokenResult failed:", err);
        setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      if (initializing) setInitializing(false);
    });

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

      await fetch(`${API_BASE}/api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ token: newToken, platform: "web" }),
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
    await fetch(`${API_BASE}/api/push/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}` //verify ID token
      },
      body: JSON.stringify({ token, platform: "web" }),
    });
    //update UI
    setPushEnabled(true);
  }

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
      <NavigationContainer>
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
            options={{
              headerShown:false
            }}
          >
            {(navProps) => (
              <Dashboard_Navigator {...navProps} isAdmin={isAdmin} />
            )}
          </welcome_stack.Screen>

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
      {Platform.OS === "web" && !initializing && !!user && !pushEnabled && typeof Notification !== "undefined" && Notification.permission !== "granted" && !pushEnabled &&(
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