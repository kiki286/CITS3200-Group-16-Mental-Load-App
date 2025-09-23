//CITS3200 project group 23 2024
//Login screen

import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff } from 'react-ionicons';
import Checkbox from "expo-checkbox";
import Button from "../components/Buttons/Button_Light_Blue";
import COLORS from "../constants/colors";
import { useSignIn } from "../hooks/useAuth";
import FONTS from "../constants/fonts";
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import TouchablePlatform from '../components/TouchablePlatform';

const SignInScreen = ({ navigation }) => {
  const { handleSignIn, email, password, errorMessage, setErrorMessage, setEmail, setPassword } =
    useSignIn();

  //state to store if password should be hidden
  const [hidePassword, setHidePassword] = useState(true);
  //state to store if remember me is checked
  const [rememberMe, setRememberMe] = useState(false);
  
  //on mount, loads email if rememberme is true
  useEffect(() => {
    const loadLoginData = async () => {
      try {
        let savedEmail = null;
        let savedRememberMe = null;
        if (Platform.OS === 'web') {
          savedEmail = localStorage.getItem('email');
          savedRememberMe = localStorage.getItem('rememberMe');
        } else {
          // require here to avoid bundling native-only module on web
          const AsyncStorage = require('@react-native-async-storage/async-storage');
          savedEmail = await AsyncStorage.getItem('email');
          savedRememberMe = await AsyncStorage.getItem('rememberMe');
        }

        if (savedRememberMe === 'true') {
          setEmail(savedEmail || '');
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Error loading login data', error);
      }
    }
    
    loadLoginData();
  }, []);
  
  //stores email and remember me states to device
  const storeLoginInfo = async () => {
    if (rememberMe) {
      if (Platform.OS === 'web') {
        localStorage.setItem('email', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem('email', email);
        await AsyncStorage.setItem('rememberMe', 'true');
      }
    } else {
      if (Platform.OS === 'web') {
        localStorage.removeItem('email');
        localStorage.setItem('rememberMe', 'false');
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        await AsyncStorage.removeItem('email');
        await AsyncStorage.setItem('rememberMe', 'false');
      }
    }
  }
  
  //if there is an error message, show it in a pop up then set the error to null
  useEffect(() => {
    if (errorMessage) {
      Alert.alert(errorMessage);
      setErrorMessage(null);
    }
  }, [errorMessage]);
  
  //stores the email and remember me states to storage
  useEffect(() => {
    storeLoginInfo();
  });

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, backgroundColor: COLORS.white, }}>
      <View style={{ flex: 1, marginHorizontal: 26 }}>
        <View style={{ marginVertical: 22 }}>
          <Text
            style={{
              fontSize: 30,
              fontFamily: FONTS.main_font,
              marginVertical: 10,
              marginTop: 40,
              color: COLORS.black,}}>
            Login</Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.black,
              fontFamily: FONTS.main_font,}}>
            Welcome back!</Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: 400,
              marginVertical: 8,
              marginTop: 10,
              color: COLORS.black,}}>
            Email</Text>
          <View
            style={{
              width: "100%",
              height: 48,
              borderColor: COLORS.black,
              borderWidth: 1,
              borderRadius: 8,
              alignItems: "center",
              flexDirection: "row",
              paddingLeft: 20,}}>
            <TextInput
              placeholder="Enter your email address"
              placeholderTextColor={COLORS.dark_grey}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={{ width: "80%", color: COLORS.black}}/>
          </View>

          <Text
            style={{
              fontSize: 17,
              marginVertical: 8,
              marginTop: 30,
              fontWeight: "400",
              color: COLORS.black,}}>
            Password</Text>
          
          <View style={{
              width: "100%",
              height: 48,
              borderColor: COLORS.black,
              borderWidth: 1,
              borderRadius: 8,
              alignItems: "center",
              flexDirection: "row",
              paddingLeft: 20,}}>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={COLORS.dark_grey}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              style={{ width: "80%", color: COLORS.black }}/>
            <TouchablePlatform
              onPress={() => setHidePassword(!hidePassword)}
              style={{ position: "absolute", right: 12 }}>
              {hidePassword ? (
                <EyeOff color={COLORS.black} height="24px" width="24px" />
              ) : (
                <Eye color={COLORS.black} height="24px" width="24px" />
              )}
            </TouchablePlatform>
          </View>
        </View>

        <View style={{ flexDirection: "row", marginVertical: 10, }}>
          <Checkbox
            style={{ marginRight: 8 }}
            value={rememberMe}
            onValueChange={setRememberMe}
            color={rememberMe ? COLORS.dark_grey : COLORS.light_grey}/>
          <Text style={{ color: COLORS.black, }}>Remember Me</Text>
        </View>

        <Button
          title="Login"
          style={{ marginTop: 28, marginBottom: 4 }}
          onPress={() => {
            handleSignIn(navigation);
          }}/>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 150 }}>
          <Text style={{
            fontSize: 14,
            color: COLORS.black,
            fontFamily: FONTS.main_font,}}>
          Don't have an account yet?{' '}</Text>
          <TouchablePlatform onPress={() => navigation.navigate("Signup")}>
            <Text style={{
              fontSize: 14,
              color: COLORS.light_blue3,
              fontFamily: FONTS.main_font,
              textDecorationLine: 'underline',}}>
            Sign up here!</Text>
          </TouchablePlatform>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignInScreen;
