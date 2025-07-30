//CITS3200 project group 23 2024
//Component for demographics survey screen

import React from "react";
import { View, ScrollView, Button } from "react-native";
import { SurveyProvider } from "../context/SurveyContext";
import DemographicsComponent from "../components/DemographicsComponent";
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from "../constants/colors";

const Demographics = ({ route, navigation }) => {
  //const { displayName, uid } = route.params;

  const handleBackNavigate = () => {
    console.log("Demographics submitted");
    navigation.navigate("Dashboard_Navigator");
  };

  return (
  <ScrollView style={{ paddingBottom: 50, backgroundColor: COLORS.black, }}>
    <SurveyProvider>
      <DemographicsComponent backNavigate={handleBackNavigate} />
    </SurveyProvider>
  </ScrollView>
  );
};

export default Demographics;