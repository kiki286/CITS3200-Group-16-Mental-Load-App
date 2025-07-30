//CITS3200 project group 23 2024 2024
//Settings tab part of the dashboard tabs

import { View, Text, Alert, StyleSheet } from 'react-native'
import React from 'react'
import Button from '../../../components/Buttons/Button'
import COLORS from '../../../constants/colors'
import FONTS from '../../../constants/fonts'
import { LinearGradient } from 'expo-linear-gradient';
import { clearResponsesFile } from '../../../services/StorageHandler'
import { signOut } from 'firebase/auth'
import { auth } from '../../../firebase/Config'

const Settings = ({ navigation }) => {
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      navigation.navigate("Welcome");
    } catch {
      console.error("Error signout out:", error);
    }
  }

  const handleClearResponses = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to wipe your mental load history? This action is IRREVERSIBLE.",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel clear responses"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            clearResponsesFile();
          },
          style: 'destructive'
        },
      ],
      { cancelable: true }
    )
  }


  return (
    <View style={styles.main_container}>
      <View style={styles.title_container}>
        <Text style={styles.title_text}>
          Settings
        </Text>
      </View>
      <View style={styles.body_container}>
        <View style={styles.container}>
          <Button 
            title="Clear History" 
            onPress={handleClearResponses} 
          />
        </View>
        <View style={styles.container}>
          <Button
            title="Logout"
            onPress={()=>navigation.navigate("Welcome")}
          />
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
    flex: 0.1,
    paddingHorizontal: 26,
  },
});

export default Settings