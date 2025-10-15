//CITS3200 project group 23 2024
//Signup screen

import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff } from 'react-ionicons';
import Checkbox from "expo-checkbox";
import COLORS from "../constants/colors";
import Button_Light_Blue from "../components/Buttons/Button_Light_Blue";
import { useSignUp } from "../hooks/useAuth";
import TermsConditions from "./TermsConditions";
import FONTS from "../constants/fonts";
import TouchablePlatform from '../components/TouchablePlatform';

const SignUp = ({ navigation }) => {
  const {
    email,
    password,
    setEmail,
    setPassword,
    displayName,
    setDisplayName,
    errorMessage,
    setErrorMessage,
    handleSignUp,
  } = useSignUp();

  // states to store checkbox state, terms acceptance, and hide password state
  const [hidePassword, setHidePassword] = useState(true);
  const [TandC, setTandC] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleAgreePress = () => {
    setTermsAccepted(true);
    setTandC(true);
    navigation.goBack(); // Set the checkbox to true when user agrees
  };

  // if terms and conditions not checked, show an error pop up
  const handleSignUpPress = async () => {
    if (TandC) {
      await handleSignUp(navigation);
    } else {
      Alert.alert('Please accept Terms and Conditions');
    }
  };

  //checks if there is an error message and shows it as pop up then sets error to null
  useEffect(() => {
    if (errorMessage) {
      Alert.alert(errorMessage);
      setErrorMessage(null);
    }
  }, [errorMessage]);
  
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
            Create Account</Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.black,
              fontFamily: FONTS.main_font,}}>
            Welcome! Fill out your details to get started</Text>
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
              fontWeight: "400",
              marginVertical: 8,
              marginTop: 30,
              color: COLORS.black,}}>
            Display Name</Text>

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
              placeholder="Enter a display name"
              placeholderTextColor={COLORS.dark_grey}
              color={COLORS.white}
              value={displayName}
              onChangeText={setDisplayName}
              style={{ width: "80%", color: COLORS.black }}/>
          </View>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "400",
              marginVertical: 8,
              marginTop: 30,
              color: COLORS.black,}}>
            Password</Text>

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
              placeholder="Enter a password"
              placeholderTextColor={COLORS.dark_grey}
              color={COLORS.white}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              style={{ width: "80%", color: COLORS.black }}/>
            <TouchableOpacity
              onPress={() => setHidePassword(!hidePassword)}
              style={{ position: "absolute", right: 12 }}>
              {hidePassword ? (
                <EyeOff color={COLORS.black} height="24px" width="24px" />
              ) : (
                <Eye color={COLORS.black} height="24px" width="24px" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: "row", marginVertical: 6 }}>
          <Checkbox
            style={{ marginRight: 8 }}
            value={TandC}
            onValueChange={(newValue) => {
              if (!termsAccepted) {
                Alert.alert('Please read the Terms and Conditions first');
              } else {
                setTandC(newValue);
              }
            }}
            color={termsAccepted ? COLORS.dark_grey : COLORS.light_grey}
          />

          <Text style={{ color: COLORS.black }}>
            I agree to the
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate("TermsConditions", { onAgree: handleAgreePress })}>
            <Text style={{
              color: COLORS.black,
              fontWeight: "bold",
              textDecorationLine: 'underline',
              marginHorizontal: 4
            }}>
              Terms and Conditions
            </Text>
          </TouchableOpacity>
        </View>

        <Button_Light_Blue
          title="Sign Up"
          style={{ marginTop: 28, marginBottom: 4 }}
          onPress={handleSignUpPress}
        />
          
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 40 }}>
          <Text style={{
            fontSize: 14,
            color: COLORS.black,
            fontFamily: FONTS.main_font,
          }}>
            Already have an account?{' '}
          </Text>

          <TouchablePlatform onPress={() => navigation.navigate("Login")}>
            <Text style={{
              fontSize: 14,
              color: COLORS.light_blue3,
              fontFamily: FONTS.main_font,
              textDecorationLine: 'underline',
            }}>
              Login here!
            </Text>
          </TouchablePlatform>
        </View>

      </View>
    </ScrollView>
  );
};

export default SignUp;
