//CITS3200 project group 23 2024
//Dashboard page that has buttons to other pages

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, {useEffect} from 'react';
import { Profile_Navigator, View_Navigator, Settings_Navigator, Home_Navigator } from './screens';
import COLORS from '../constants/colors';
import FONTS from '../constants/fonts';
import { SettingsOutline, Home, StatsChart, PersonOutline, HelpCircleOutline, LogOutOutline } from 'react-ionicons'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getDemographicsSubmitted } from '../services/StorageHandler';

const Dashboard = ({ navigation }) => {
  
  useEffect(() => {
    const checkDemographicsSubmission = async () => {
      const isDemographicsSubmitted = await getDemographicsSubmitted(); // Checking the flag
      if (!isDemographicsSubmitted) {
        navigation.navigate('./screens/profile/Survey_demographics'); // Navigate to demographics survey
      }
    };

    checkDemographicsSubmission();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      navigation.navigate("Welcome");
    } catch {
      console.error("Error signout out:", error);
    }
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.roundedSquare}>
      </View>
        <Text style={styles.dashboardTitle}>
          Dashboard
        </Text>
      <View style={styles.button_container}>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.button}
            onPress={()=>navigation.navigate("Home_Navigator")}
          >
            <Home color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={()=>navigation.navigate("View_Navigator")}
          >
            <StatsChart color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.button}
            onPress={()=>navigation.navigate("Profile_Navigator")}
          >
            <PersonOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={()=>navigation.navigate("Settings_Navigator")}
          >
            <SettingsOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.button}
            onPress={()=>navigation.navigate("Admin_Navigator")}
          >
            <Feather name="shield" size={60} color="black" />
            <Text style={styles.buttonText}>Admin</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.button}
            onPress={()=>navigation.navigate("About")}
          >
            <HelpCircleOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleLogout}
          >
            <LogOutOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  roundedSquare: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%', // Set width for the square
    height: 300,
    backgroundColor: COLORS.light_blue5, // Background color
    borderRadius: 100, // Set the radius for rounded corners
    marginTop: -50,
    position: 'absolute',
    top: -50, // Position the square at the top
    left: 0, // Align to the left
    right: 0, // Align to the right
    zIndex: -1, // Ensure it is on top of other elements
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  button_container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 70,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  button: {
    width: 140, // Set the width for square buttons
    height: 180, // Set the height to be the same as the width for square buttons
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginHorizontal: 10,
  },
  buttonText: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: FONTS.main_font,
  },
  dashboardTitle: {
    position: 'absolute',
    color: COLORS.white,
    fontSize: 50,
    top: 35,
    fontFamily: FONTS.survey_font_bold,
  }
});

export default Dashboard