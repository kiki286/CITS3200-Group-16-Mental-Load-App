//CITS3200 project group 16 2025
//Settings tab part of the dashboard tabs

import { View, Text, Alert, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native'
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
        { text: "No", onPress: () => console.log("Cancel clear responses"), style: "cancel" },
        { text: "Yes", onPress: () => { clearResponsesFile(); }, style: 'destructive' },
      ],
      { cancelable: true }
    )
  }

  const content = (
    <>
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
        <Text style={styles.footerTitle}>About the app </Text>
        <Text style={styles.footerLine}>Mental Labour App developed 2025</Text>
        <Text style={styles.footerLine}>CITS3200 group project at University of Western Australia</Text>
        <Text style={styles.footerLine}>App idea by Emma Stephenson</Text>
      </View>
    </>
  );

  // Web: native div with overflow
  if (Platform.OS === 'web') {
    return (
      <div style={{
        height: '100dvh',
        width: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: COLORS.white,
        touchAction: 'pan-y',
      }}>
        <div style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 12,
          paddingBottom: 120,
          minHeight: '100dvh',
        }}>
          {content}
        </div>
      </div>
    );
  }

  // Native: ScrollView
  return (
    <View style={styles.page}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        alwaysBounceVertical
      >
        {content}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  pageContent: {
    minHeight: '100%',
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
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
