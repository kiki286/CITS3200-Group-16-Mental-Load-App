//CITS3200 project group 23 2024
//App entry point using stack navigator to handle navigations

import React, { useEffect, useState } from "react";
import { SafeAreaView, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Dashboard_Navigator from "./dashboard/Dashboard_Navigator";
import Welcome from "./screens/Welcome";
import Demographics from "./screens/Demographics";
import TermsConditions from "./screens/TermsConditions";
import { useFonts } from 'expo-font';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import COLORS from "./constants/colors";

const welcome_stack = createStackNavigator();
console.disableYellowBox = true;

export default function App() {
  
  const [fontsLoaded] = useFonts({
    'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'), //Loads the font from assets/font
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
  });
  
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (initializing) setInitializing(false);
    })
    return () => unsubscribe();
  }, [initializing]);

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
    </SafeAreaView>
  );
};