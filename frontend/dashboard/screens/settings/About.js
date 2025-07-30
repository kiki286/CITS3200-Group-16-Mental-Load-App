//CITS3200 project group 23 2024 2024
//Displays information about the project and the client

import { View, Text, StyleSheet } from 'react-native'
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
      <View style={styles.body_container}>
        <View style={styles.container}>
          <Text style={styles.text}>Mental Labour App developed 2024</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.text}>CITS3200 Group 23 project at University of Western Australia</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.text}>App idea by Emma Stephenson</Text>
        </View>
        <View style={styles.container}>
          <Button
            title="Back"
            onPress={()=>navigation.navigate("Dashboard")}
          />
        </View>
      </View>
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
  container: {
    flex: 0.2,
    paddingHorizontal: 26,
  },
  text: {
    fontSize: 25,
    fontFamily: FONTS.main_font,
    textAlign: 'center',
    color: COLORS.white,
  },
});

export default About