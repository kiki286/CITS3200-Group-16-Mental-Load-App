//CITS3200 project group 23 2024
//Dashboard page that has buttons to other pages

import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import React, {useEffect} from 'react';
import { Profile_Navigator, View_Navigator, Settings_Navigator, Home_Navigator } from './screens';
import COLORS from '../constants/colors';
import FONTS from '../constants/fonts';
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient';
import { SettingsOutline, Home, StatsChart, PersonOutline, ShieldOutline, HelpCircleOutline, LogOutOutline } from 'react-ionicons'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getDemographicsSubmitted } from '../services/StorageHandler';

const Dashboard = ({ navigation }) => {
  
  useEffect(() => {
    const checkDemographicsSubmission = async () => {
      const isDemographicsSubmitted = await getDemographicsSubmitted(); // Checking the flag
      if (!isDemographicsSubmitted) {
        navigation.navigate('Profile_Navigator', {
          screen: 'Survey_Demographics',
        }); // Navigate to demographics survey
      }
    };

    checkDemographicsSubmission();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      navigation.navigate("Welcome");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <Text style={styles.dashboardTitle}>Dashboard</Text>

      {/* 2-column grid */}
      <View style={styles.button_container}>
        {/* Row 1: primary (blue) */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('Home_Navigator')}
            accessibilityLabel="Check-in"
          >
            <Home color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('View_Navigator')}
            accessibilityLabel="Stats"
          >
            <StatsChart color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: neutral (grey) */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.neutralButton]}
            onPress={() => navigation.navigate('Profile_Navigator')}
            accessibilityLabel="Profile"
          >
            <PersonOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.neutralButton]}
            onPress={() => navigation.navigate('Settings_Navigator')}
            accessibilityLabel="Settings"
          >
            <SettingsOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Row 3: neutral (grey) */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.button, styles.neutralButton]}
            onPress={()=>navigation.navigate("Admin_Navigator")}
          >
            <ShieldOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Admin</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.button, styles.neutralButton]}
            onPress={()=>navigation.navigate("About")}
          >
            <HelpCircleOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>About</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.neutralButton]}
            onPress={handleLogout}
            accessibilityLabel="Logout"
          >
            <LogOutOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Match new design
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
    paddingHorizontal: 24,
  },

  dashboardTitle: {
    color: COLORS.black,
    fontSize: 30,                 
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontFamily: FONTS.survey_font_bold,
  },

  button_container: {
    width: '100%',
    maxWidth: 420,             
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },

  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },

  // Base tile
  button: {
    width: 140,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginHorizontal: 10,

    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },


  primaryButton: {
    backgroundColor: COLORS.light_blue4,   // blue tiles (top row)
  },
  neutralButton: {
    backgroundColor: COLORS.grey,          // grey tiles (lower rows)
  },

  buttonText: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: FONTS.main_font,
    marginTop: 6,
  },
  scroll: {
    flex: 1,
    ...(Platform.OS === 'web' ? { touchAction: 'pan-y' } : null),
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 80, 
  },
});

export default Dashboard;