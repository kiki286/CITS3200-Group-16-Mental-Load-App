//CITS3200 project group 23 2024
//Simple Admin landing screen

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import COLORS from '../../../constants/colors'
import FONTS from '../../../constants/fonts'
import { ChevronBackOutline } from 'react-ionicons';
import PillButton from '../../../components/Buttons/PillButton';

const AdminHome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation?.getParent()?.goBack()}>
        <ChevronBackOutline color={COLORS.black}  height="28px" width="28px"/>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Admin Board</Text>

      {/* Actions */}
      <View style={styles.buttons}>
        <PillButton
          title="Create Campaign"
          onPress={() => navigation.navigate('Campaign_Create')}
          variant='neutral'
          style={styles.pillSpacing}
        />
        <PillButton
          title="Survey Settings"
          onPress={() => navigation.navigate('Survey_Settings')}
          variant='neutral'
          style={styles.pillSpacing}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 20,
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
  pillSpacing: {
    marginBottom: 20,
  },
})

export default AdminHome


