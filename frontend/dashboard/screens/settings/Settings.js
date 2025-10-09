//CITS3200 project group 23 2024 2024
//Settings tab part of the dashboard tabs

import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Button from '../../../components/Buttons/Button'
import COLORS from '../../../constants/colors'
import FONTS from '../../../constants/fonts'
import { LinearGradient } from 'expo-linear-gradient';
import { clearResponsesFile } from '../../../services/StorageHandler'
import { signOut } from 'firebase/auth'
import { auth } from '../../../firebase/config'
import { ChevronBackOutline, LogOutOutline } from 'react-ionicons';
import PillButton from '../../../components/Buttons/PillButton';

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
    <View style={styles.page}>
      {/* Back Chevron */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Settings</Text>

      {/* Buttons */}
      <View style={styles.buttons}>
        <PillButton
          title="Clear Mental Load History"
          onPress={handleClearResponses}
          variant="neutral"
          style={styles.pillSpacing}
        />

        <PillButton
          title="Log Out"
          onPress={handleLogout}
          variant="neutral"
          leftIcon={<LogOutOutline color={COLORS.black} height="22px" width="22px" />}
          style={styles.pillSpacing}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Aim of the Study</Text>
        <Text style={styles.footerLine}>This study aims to investigate employee experiences at home and work that influence wellbeing and other work-related outcomes.</Text>
        
        <Text style={[styles.footerTitle, { marginTop: 12 }]}>What is Mental Load?</Text>
        <Text style={styles.footerLine}>The mental load (or mental labour) refers to thinking work performed to achieve goals that benefit others (e.g., planning meetings or deciding what to cook for dinner). Research has consistently shown that in the home, the mental load is disproportionately shouldered by women, and our research suggests this same trend also happens at work. Although the popular press suggests the mental load is a bad thing, emerging research suggests it has both positive and negative outcomes.</Text>
        
        <Text style={[styles.footerLine, { marginTop: 12 }]}>Mental Labour App developed in 2024</Text>
        <Text style={styles.footerLine}>Initially developed by CITS3200 Group 23 project at University of Western Australia in 2024</Text>
        <Text style={styles.footerLine}>Continued development by CITS3200 Group 16 project at University of Western Australia in 2025</Text>
        <Text style={styles.footerLine}>App idea by Emma Stephenson (UWA Business School)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    marginBottom: 16,
  },
  buttons: {
    width: '100%',
  },
  pillSpacing: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 12,
  },
  footerTitle: {
    fontFamily: FONTS.main_font_bold,
    color: COLORS.black,
    fontSize: 14,
    marginBottom: 6,
  },
  footerLine: {
    fontFamily: FONTS.main_font,
    color: COLORS.black,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default Settings