//CITS3200 project group 16 2025
//Displays information about the project and the client

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native'
import React from 'react'
import Button from '../../../components/Buttons/Button'
import FONTS from '../../../constants/fonts';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../../constants/colors'
import { ChevronBackOutline } from 'react-ionicons';

const About = ({ navigation }) => {
  const content = (
    <>
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>About</Text>

      {/* Sections */}
      <View style={styles.section}>
        <Text style={styles.h2}>Aim of the Study</Text>
        <Text style={styles.p}>
          This study aims to investigate employee experiences at home and work that
          influence wellbeing and other work-related outcomes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>What is Mental Load?</Text>
        <Text style={styles.p}>
          The mental load (or mental labour) refers to thinking work performed to achieve
          goals that benefit others (e.g., planning meetings or deciding what to cook for
          dinner). Research has consistently shown that in the home, the mental load is
          disproportionately shouldered by women, and our research suggests this same
          trend also happens at work. Although the popular press suggests the mental load
          is a bad thing, emerging research suggests it has both positive and negative
          outcomes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.p}>Mental Labour App developed in 2024</Text>
        <Text style={styles.p}>
          Initially developed by CITS3200 Group 23 project at University of Western
          Australia in 2024
        </Text>
        <Text style={styles.p}>
          Continued development by CITS3200 Group 16 project at University of Western
          Australia in 2025
        </Text>
        <Text style={styles.p}>App idea by Emma Stephenson (UWA Business School)</Text>
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
          paddingBottom: 80,
          minHeight: '100dvh',
        }}>
          {content}
        </div>
      </div>
    );
  }

  // Native: ScrollView
  return (
    <View style={styles.scroll}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
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
  scroll: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 80,
  },
  backButton: { alignSelf: 'flex-start', marginBottom: 8 },
  title: {
    fontSize: 40,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    marginBottom: 12,
  },
  section: { marginBottom: 16 },
  h2: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: FONTS.main_font_bold,
    marginBottom: 6,
  },
  p: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 22,
    fontFamily: FONTS.main_font,
  },
});

export default About
