//CITS3200 project group 23 2024 2024
//Repeated survey which is displayed on the home tab

import React from "react";
import { ScrollView, View } from "react-native";
import { SurveyProvider } from "../../../context/SurveyContext";
import QuestionComponent from "../../../components/QuestionComponent";
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from "../../../constants/colors";

const SurveyRepeated = ({ route, navigation }) => {
  
  const handleBackNavigate = () => {
    console.log("survey submitted");
    navigation.navigate("Home");
  };

  return (
    <SurveyProvider>
      <QuestionComponent backNavigate={handleBackNavigate} />
    </SurveyProvider>
  );
};

export default SurveyRepeated;
