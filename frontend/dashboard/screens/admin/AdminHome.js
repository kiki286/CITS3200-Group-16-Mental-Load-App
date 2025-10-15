//CITS3200 project group 16 2025
//Simple Admin landing screen

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native'
import COLORS from '../../../constants/colors'
import FONTS from '../../../constants/fonts'
import { ChevronBackOutline } from 'react-ionicons';
import PillButton from '../../../components/Buttons/PillButton';

const AdminHome = ({ navigation }) => {
  const content = (
    <>
      {/* Back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation?.getParent()?.goBack()}>
        <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Admin Dashboard</Text>

      {/* Actions */}
      <View style={styles.buttons}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send notifications to users</Text>
          <PillButton
            title="Create Campaign"
            onPress={() => navigation.navigate('Campaign_Create')}
            variant='neutral'
            style={styles.pillSpacing}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change survey links</Text>
          <PillButton
            title="Survey Settings"
            onPress={() => navigation.navigate('Survey_Settings')}
            variant='neutral'
            style={styles.pillSpacing}
          />
        </View>
      </View>
    </>
  );

  // Web: use native div with overflow scrolling
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
}

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
  title: {
    fontSize: 30,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  buttons: {
    width: '100%',
    marginBottom: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    marginBottom: 4,
  },
  pillSpacing: {
    marginBottom: 8,
  },
});

export default AdminHome
