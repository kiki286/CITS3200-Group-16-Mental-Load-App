//CITS3200 project group 23 2024 2024
//Demographics survey which is displayed in the profile tab

import React from "react";
import { ScrollView } from "react-native";
import { SurveyProvider } from "../../../context/SurveyContext";
import DemographicsComponent from "../../../components/DemographicsComponent";
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from "../../../constants/colors";

const Survey_Demographics = ({ route, navigation}) => {

  const handleBackNavigate = () => {
    console.log("Demographics submitted");
    navigation.navigate("Profile");
  };

  return (
  <SurveyProvider>
    <DemographicsComponent backNavigate={handleBackNavigate}/>
  </SurveyProvider>
  );
};

export default Survey_Demographics;
