//CITS3200 project group 23 2024 2024
//Displays information about the project and the client

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import Button from '../../../components/Buttons/Button'
import FONTS from '../../../constants/fonts';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../../constants/colors'
import { ChevronBackOutline } from 'react-ionicons';


const About = ({ navigation }) => {
  return (
    <View style={styles.main_container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
      </TouchableOpacity>
          <Text
          style={{
            fontSize: 20,
            margin: 18,
            color: COLORS.black,
          }}
        >
      <Text style={{color:"black", fontWeight:"bold", fontSize: 40, alignSelf:'center', marginBottom:20}}>
          About
          </Text>
      <ScrollView style={styles.body_container} contentContainerStyle={styles.scroll_content}>
          <Text style={{color:"black", fontWeight:"bold"}}>Aim of the Study</Text>
            This study aims to investigate employee experiences at home and work that influence wellbeing and other work-related outcomes.
          <Text style={{color:"black", fontWeight:"bold"}}>What is Mental Load?</Text>
            The mental load (or mental labour) refers to thinking work performed to achieve goals that benefit others (e.g., planning meetings or deciding what to cook for dinner). Research has consistently shown that in the home, the mental load is disproportionately shouldered by women, and our research suggests that this same trend also happens at work. Although the popular press suggests the mental load is a bad thing, emerging research suggests it has both positive and negative outcomes.
          Mental Labour App developed in 2024
          Initially developed by CITS3200 Group 23 project at University of Western Australia in 2024
          Continued development by CITS3200 Group 16 project at University of Western Australia in 2025
          App idea by Emma Stephenson, (UWA Business School)
      </ScrollView>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title_container: {
    position: 'absolute',
    top: 20,
    left: 0, // Ensure the view takes the full width
    right: 0, // Ensure the view takes the full width
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center',
  },
  title_text: {
    fontSize: 50,
    color: COLORS.almost_white,
    fontFamily: FONTS.main_font_bold,
  },
  body_container: {
    flex: 1,
    marginTop: 100,
  },
  scroll_content: {
    paddingBottom: 20,
  },
  section_container: {
    paddingHorizontal: 26,
    marginBottom: 20,
  },
  info_container: {
    paddingHorizontal: 26,
    marginBottom: 20,
  },
  button_container: {
    paddingHorizontal: 26,
    marginTop: 20,
  },
  text: {
    fontSize: 25,
    fontFamily: FONTS.main_font,
    textAlign: 'center',
    color: COLORS.black,
  },
});

export default About