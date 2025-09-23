//CITS3200 project group 23 2024
//Simple Admin landing screen

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import COLORS from '../../../constants/colors'
import FONTS from '../../../constants/fonts'

const AdminHome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Board</Text>
      <Text style={styles.subtitle}>Hi!</Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Campaign_Create')}
      >
        <Text style={styles.primaryButtonText}>Create Campaign</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Survey_Settings')}
      >
        <Text style={styles.primaryButtonText}>Survey Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation?.getParent()?.navigate('Dashboard')}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    color: COLORS.almost_white,
    fontFamily: FONTS.survey_font_bold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.almost_white,
    fontFamily: FONTS.main_font,
  },
  backButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.black,
    fontFamily: FONTS.main_font,
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: COLORS.black,
    fontFamily: FONTS.main_font,
    fontSize: 16,
  }
})

export default AdminHome


