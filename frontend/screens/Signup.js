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
import Button_Green from "../components/Buttons/Button_Green";
import { useSignUp } from "../hooks/useAuth";
import TermsConditions from "./TermsConditions";
import FONTS from "../constants/fonts";

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

  //states to store checkbox state and hidepassword state
  const [hidePassword, setHidePassword] = useState(true);
  const [TandC, setTandC] = useState(false);
  const handleAgreePress = () => {
    setTandC(true);
    navigation.goBack(); // Set the checkbox to true when user agrees
  };
  
  //if terms and conditions not checked, show an error pop up
  const handleSignUpPress = async () => {
    if(TandC) {
      await handleSignUp(navigation)
    } else {
      Alert.alert('Please accept Terms and Conditions');
    }
  }
  
  //checks if there is an error message and shows it as pop up then sets error to null
  useEffect(() => {
    if (errorMessage) {
      Alert.alert(errorMessage);
      setErrorMessage(null);
    }
  }, [errorMessage]);
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, backgroundColor: COLORS.black, }}>
      <View style={{ flex: 1, marginHorizontal: 26 }}>
        <View style={{ marginVertical: 22 }}>
          <Text
            style={{
              fontSize: 30,
              marginVertical: 10,
              color: COLORS.white,
              fontFamily: FONTS.main_font,
            }}
          >
            Create Account
          </Text>

          <Text style={{ fontSize: 20, color: COLORS.white, fontFamily: FONTS.main_font, }}>
            Record your demographics
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "400",
              marginVertical: 8,
              color: COLORS.white,
            }}
          >
            Email
          </Text>

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
              color={COLORS.white}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={{ width: "80%" , color: COLORS.white}}
            />
          </View>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "400",
              marginVertical: 8,
              marginTop: 10,
              color: COLORS.white,
            }}
          >
            Display Name
          </Text>

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
              placeholder="Enter your display name"
              placeholderTextColor={COLORS.white}
              color={COLORS.white}
              value={displayName}
              onChangeText={setDisplayName}
              style={{ width: "80%", color: COLORS.white }}
            />
          </View>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "400",
              marginVertical: 8,
              marginTop: 10,
              color: COLORS.white,
            }}
          >
            Password
          </Text>

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
              color={COLORS.white}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              style={{ width: "80%", color: COLORS.white }}
            />
            <TouchableOpacity
              onPress={() => setHidePassword(!hidePassword)}
              style={{ position: "absolute", right: 12 }}
            >
              {hidePassword ? (
                <EyeOff color={COLORS.white} height="24px" width="24px" />
              ) : (
                <Eye color={COLORS.white} height="24px" width="24px" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: "row", marginVertical: 6 }}>
          <Checkbox
            style={{ marginRight: 8 }}
            value={TandC}
            onValueChange={setTandC}
            color={TandC ? COLORS.dark_grey : COLORS.almost_white}
          />
          <Text style={{ color: COLORS.white }}>
            I agree to the
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("TermsConditions", { onAgree: handleAgreePress })}>
            <Text style={{ color: COLORS.white, fontWeight: "bold", textDecorationLine: 'underline', marginHorizontal: 4 }}>
              Terms and Conditions
            </Text>
          </TouchableOpacity>
        </View>

        <Button_Green
          title="Sign Up"
          filled
          style={{ marginTop: 28, marginBottom: 4 }}
          onPress={() => handleSignUpPress()}
        />

        <Button_Green
          title="Login"
          filled
          style={{
            marginTop: 18,
            marginBottom: 4,
          }}
          onPress={()=>navigation.navigate("Login")}
        />
      </View>
    </ScrollView>
  );
};

export default SignUp;
