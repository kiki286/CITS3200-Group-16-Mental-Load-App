//CITS3200 project group 23 2024 2024
//Displays information about the project and the client

import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import Button from '../../../components/Buttons/Button'
import FONTS from '../../../constants/fonts';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../../constants/colors'

const About = ({ navigation }) => {
  return (
    <View style={styles.main_container}>
      <View style={styles.title_container}>
        <Text style={styles.title_text}>
          About
        </Text>
      </View>
      <ScrollView style={styles.body_container} contentContainerStyle={styles.scroll_content}>
        <View style={styles.section_container}>
          <Text style={styles.section_title}>Aim of the Study</Text>
          <Text style={styles.description_text}>
            This study aims to investigate employee experiences at home and work that influence wellbeing and other work-related outcomes.
          </Text>
        </View>
        <View style={styles.section_container}>
          <Text style={styles.section_title}>What is Mental Load?</Text>
          <Text style={styles.description_text}>
            The mental load (or mental labour) refers to thinking work performed to achieve goals that benefit others (e.g., planning meetings or deciding what to cook for dinner). Research has consistently shown that in the home, the mental load is disproportionately shouldered by women, and our research suggests that this same trend also happens at work. Although the popular press suggests the mental load is a bad thing, emerging research suggests it has both positive and negative outcomes.
          </Text>
        </View>
        <View style={styles.info_container}>
          <Text style={styles.text}>Mental Labour App developed in 2024</Text>
          <Text style={styles.text}>Initially developed by CITS3200 Group 23 project at University of Western Australia in 2024.</Text>
          <Text style={styles.text}>Continued development by CITS3200 Group 16 project at University of Western Australia in 2025.</Text>
          <Text style={styles.text}>App idea by Emma Stephenson, (UWA Business School)</Text>
        </View>
        <View style={styles.button_container}>
          <Button
            title="Back"
            onPress={()=>navigation.navigate("Dashboard")}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    backgroundColor: COLORS.black,
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
    color: COLORS.white,
  },
  section_title: {
    fontSize: 28,
    fontFamily: FONTS.main_font_bold,
    textAlign: 'center',
    color: COLORS.light_blue,
    marginBottom: 10,
  },
  description_text: {
    fontSize: 18,
    fontFamily: FONTS.main_font,
    textAlign: 'left',
    color: COLORS.white,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
});

export default About