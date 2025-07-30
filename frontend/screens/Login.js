//CITS3200 project group 23 2024
//Login screen

import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import Button from "../components/Buttons/Button";
import COLORS from "../constants/colors";
import { useSignIn } from "../hooks/useAuth";
import FONTS from "../constants/fonts";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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
        const savedEmail = await AsyncStorage.getItem('email');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');
        
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
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('rememberMe', 'true');
    } else {
      await AsyncStorage.removeItem('email');
      await AsyncStorage.setItem('rememberMe', 'false');
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
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, backgroundColor: COLORS.black, }}>
      <View style={{ flex: 1, marginHorizontal: 26 }}>
        <View style={{ marginVertical: 22 }}>
          <Text
            style={{
              fontSize: 30,
              fontFamily: FONTS.main_font,
              marginVertical: 10,
              color: COLORS.white,
            }}
          >
            Login
          </Text>
          <Text style={{ fontSize: 20, color: COLORS.white, fontFamily: FONTS.main_font, }}>
            REFLECT ON MENTAL LABOUR
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: 400,
              marginVertical: 8,
              marginTop: 10,
              color: COLORS.white,
            }}
          >Email</Text>
          <View
            style={{
              width: "100%",
              height: 48,
              borderColor: COLORS.white,
              borderWidth: 1,
              borderRadius: 8,
              alignItems: "center",
              flexDirection: "row",
              paddingLeft: 20,
            }}
          >
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={COLORS.white}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={{ width: "80%", color: COLORS.white }}
            />
          </View>
          <Text
            style={{
              fontSize: 17,
              marginVertical: 8,
              marginTop: 10,
              fontWeight: "400",
              color: COLORS.white,
            }}
          >Password</Text>
          <View
            style={{
              width: "100%",
              height: 48,
              borderColor: COLORS.white,
              borderWidth: 1,
              borderRadius: 8,
              alignItems: "center",
              flexDirection: "row",
              paddingLeft: 20,
            }}
          >
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={COLORS.white}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              style={{ width: "80%", color: COLORS.white }}
            />
            <TouchableOpacity
              onPress={() => setHidePassword(!hidePassword)}
              style={{ position: "absolute", right: 12 }}
            >
              <Ionicons
                name={hidePassword == true ? "eye-off" : "eye"}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: "row", marginVertical: 6, }}>
          <Checkbox
            style={{ marginRight: 8 }}
            value={rememberMe}
            onValueChange={setRememberMe}
            color={rememberMe ? COLORS.dark_grey : COLORS.almost_white}
          />
          <Text style={{ color: COLORS.white, }}>Remember Me</Text>
        </View>

        <Button
          title="Login"
          style={{ marginTop: 28, marginBottom: 4 }}
          onPress={() => {
            handleSignIn(navigation);
          }}
        />
        
        <Button
          title="Sign Up"
          style={{
            marginTop: 18,
            marginBottom: 4,
          }}
          onPress={()=>{
            navigation.navigate("Signup");
          }}
        />
      </View>
    </ScrollView>
  );
};

export default SignInScreen;
