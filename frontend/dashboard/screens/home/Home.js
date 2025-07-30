//CITS3200 project group 23 2024 2024
//Home tab part of the dashboard tabs

import { View, Text, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useState } from 'react';
import COLORS from '../../../constants/colors'
import FONTS from '../../../constants/fonts'
import Button from '../../../components/Buttons/Button'
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth';
import { getLastResponse } from '../../../services/StorageHandler';
import { useFocusEffect } from '@react-navigation/native';

const debug = false; // Set this to true to disable the check-in limit.

const Home = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [checkInMessage, setCheckInMessage] = useState('');
  const [canCheckIn, setCanCheckIn] = useState(true);
  
  useFocusEffect(
    React.useCallback(() => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        setDisplayName(user.displayName);
      }

      const fetchCheckinMessage = async () => {
        const message = await getTimeSinceLastResponse();
        setCheckInMessage(message);
      };

      fetchCheckinMessage();
    }, [])
  );

  const getTimeSinceLastResponse = async () => {
    const lastResponse = await getLastResponse();
    if (!lastResponse) {
      setCanCheckIn(true);
      return "Welcome to ML Tracker! Tap the button below to do your first check in!";
    }

    const latestResponseTimestamp = new Date(lastResponse.timestamp);
    const now = new Date();

    // Calculate time difference
    const timeDifference = now - latestResponseTimestamp;
    const hoursAgo = Math.floor(timeDifference / 1000 / 60 / 60);

    // Check if last check-in was today
    const isSameDay = now.toDateString() === latestResponseTimestamp.toDateString();
    if (isSameDay && !debug) {
      setCanCheckIn(false);
      return `You've already checked in today. Come back in ${24 - hoursAgo} hours!`;
    }

    setCanCheckIn(true);
    return hoursAgo >= 24 ? "Time for a check in!" : `You last checked in ${hoursAgo} hours ago.`;
  };

  const handleCheckIn = () => {
    if (canCheckIn || debug) {
      // Log the current check-in time
      navigation.navigate("Survey_Repeated");
    } else {
      Alert.alert("You've already checked in today. See you tomorrow!");
    }
  };

  return (
    <View style={styles.main_container}>
      <View style={styles.title_container}>
        <Text style={styles.title_text}>
          Check-in
        </Text>
      </View>
      <View style = {styles.body_container}>
        <View style={styles.hello_container}>
          <Text style={styles.hello_text}>
            Hi {displayName || 'User'}!
          </Text>
          <Text style={styles.checkin_text}>
            {checkInMessage}
          </Text>
        </View>
        <View style={styles.container}>
          <Button
            title="Check in"
            onPress={handleCheckIn}
            disabled={!canCheckIn && !debug} // Disable the button if they can't check in
            style={canCheckIn || debug ? styles.activeButton : styles.disabledButton} // Grey out if disabled
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
  hello_container: {
    flex: 0.2,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  hello_text: {
    fontSize: 24,
    color: COLORS.almost_white,
    fontFamily: FONTS.main_font,
  },
  checkin_text: {
    fontSize: 18,
    color: COLORS.almost_white,
    fontFamily: FONTS.main_font,
    marginTop: 10, // Add some spacing if needed
  },
  container: {
    flex: 0.1,
    paddingHorizontal: 26,
  },
  activeButton: {
    backgroundColor: COLORS.blue, // Active button color
  },
  disabledButton: {
    backgroundColor: COLORS.dark_grey, // Greyed out when disabled
  },
});

export default Home