//CITS3200 project group 16 2025
//Dashboard page that has buttons to other pages

import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Profile_Navigator, View_Navigator, Settings_Navigator, Home_Navigator } from './screens';
import COLORS from '../constants/colors';
import FONTS from '../constants/fonts';
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient';
import { SettingsOutline, Home, StatsChart, PersonOutline, ShieldOutline, HelpCircleOutline, LogOutOutline } from 'react-ionicons'
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getDemographicsSubmitted } from '../services/StorageHandler';

const Dashboard = ({ navigation }) => {
  useEffect(() => {
    (async () => {
      const isSubmitted = await getDemographicsSubmitted();
      if (!isSubmitted) {
        navigation.navigate('Profile_Navigator', { screen: 'Survey_Demographics' });
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Welcome');
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  const insets = useSafeAreaInsets();

  const content = (
    <>
      <Text style={styles.dashboardTitle}>Dashboard</Text>

      <View style={styles.button_container}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('Home_Navigator')}
          >
            <Home color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('View_Navigator')}
          >
            <StatsChart color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.neutralButton]}
            onPress={() => navigation.navigate('Profile_Navigator')}
          >
            <PersonOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.neutralButton]}
            onPress={() => navigation.navigate('Settings_Navigator')}
          >
            <SettingsOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.neutralButton]}
            onPress={() => navigation.navigate('Admin_Navigator')}
          >
            <ShieldOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.neutralButton]}
            onPress={() => navigation.navigate('About')}
          >
            <HelpCircleOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>About</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.neutralButton]}
            onPress={handleLogout}
          >
            <LogOutOutline color="black" height="60px" width="60px" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Extra spacing at bottom */}
        <View style={{ height: 100 }} />
      </View>
    </>
  );

  // Use native div with overflow for web, ScrollView for mobile
  if (Platform.OS === 'web') {
    return (
      <div style={{
        height: '100dvh',
        width: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: COLORS.white,
      }}>
        <div style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 12,
          paddingBottom: 100,
        }}>
          {content}
        </div>
      </div>
    );
  }

  // Native mobile app uses ScrollView
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        alwaysBounceVertical={true}
      >
        {content}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 100,
  },
  dashboardTitle: {
    color: COLORS.black,
    fontSize: 30,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 32,
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
  primaryButton: { backgroundColor: COLORS.light_blue4 },
  neutralButton: { backgroundColor: COLORS.grey },
  buttonText: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: FONTS.main_font,
    marginTop: 6,
  },
});

export default Dashboard;