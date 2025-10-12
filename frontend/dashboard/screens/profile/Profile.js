//CITS3200 project group 16 2025
// //Profile tab part of the dashboard tabs

import { View, Text, TextInput, Alert, Switch, StyleSheet, Platform, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import COLORS from '../../../constants/colors';
import FONTS from '../../../constants/fonts';
import Button from '../../../components/Buttons/Button_Light_Blue';
import * as Notifications from 'expo-notifications';
import { ChevronBackOutline } from 'react-ionicons';
import PillButton from '../../../components/Buttons/PillButton';
import { requestNotificationPermission } from '../../../firebase/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_BASE, fetchWithAuth } from '../../../services/api'

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY;

const STORAGE_KEYS = {
    enabled: 'notificationsEnabled',
    time: 'notificationTime',
    fcmToken: 'fcmToken',
};

const Profile = ({ navigation }) => {
    // State management
    const [displayName, setDisplayName] = useState('');
    const [newDisplayName, setNewDisplayName] = useState('');
    const [notificationTime, setNotificationTime] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const saveItem = async (key, value) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            const AsyncStorage = require('@react-native-async-storage/async-storage');
            await AsyncStorage.setItem(key, value);
        }
    };

    const loadItem = async (key) => {
        if (Platform.OS === 'web') return localStorage.getItem(key);
            const AsyncStorage = require('@react-native-async-storage/async-storage');
            return await AsyncStorage.getItem(key);
    };

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const onTimeChange = async (event, selectedDate) => {
        const picked = selectedDate || notificationTime;
        setShowPicker(false);
        const when = new Date(picked);
        setNotificationTime(when);
        await saveItem(STORAGE_KEYS.time, when.toISOString());
        if (notificationsEnabled && Platform.OS !== 'web') {
            await scheduleNotification(when);
        } 
    };

    const toggleNotifications = async () => {
        const newValue = !notificationsEnabled;
        
        // Web push notifications
        if (Platform.OS === 'web') {
            console.log('[toggle] web->', newValue ? 'enable' : 'disable');
            if (newValue) {
                const ok = await enableWebPush();
                if (!ok) return;
            } else {
                await disableWebPush();
            }
            await saveItem(STORAGE_KEYS.enabled, JSON.stringify(newValue));
            setNotificationsEnabled(newValue);
            return;
        }

        // Local notifications for iOS/Android
        setNotificationsEnabled(newValue);
        if (newValue) await scheduleNotification(notificationTime);
        else await cancelNotification();
        await saveItem(STORAGE_KEYS.enabled, JSON.stringify(newValue));
    };

    const scheduleNotification = async (time) => {
        if (Platform.OS === 'web') return; // not supported on web
        await cancelNotification(); // Cancel existing notifications to avoid duplicates

        const t = new Date(time);
        t.setSeconds(0); // Trigger at the start of the minute

        console.log(`Scheduling notification for: ${t.toLocaleTimeString()}`); // Log scheduled time

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Your Mental Load Check is Ready!",
                body: "This is a reminder to Do your Mental Load Check.",
            },
            trigger: {
                hour: t.getHours(),
                minute: t.getMinutes(),
                repeats: true,
                channelId: Platform.OS === 'android' ? 'default' : undefined,
            },
        });
    };


    const cancelNotification = async () => {
        if (Platform.OS === 'web') return; // not supported on web
        const all = await Notifications.getAllScheduledNotificationsAsync();
        await Promise.all(
            all.map((n)=>
                Notifications.cancelScheduledNotificationAsync(n.identifier)
            )
        );
        console.log('All scheduled notifications cancelled');
    };

    const enableWebPush = async () => {
        const user = getAuth().currentUser;
        if (!user) {
            Alert.alert('Notifications', 'Please sign in first.');
            return false;
        }
        console.log('[webpush] requesting permission & token', { hasVapid: !!VAPID_PUBLIC_KEY, API_BASE });
        const { ok, token, reason } = await requestNotificationPermission(VAPID_PUBLIC_KEY);
        console.log('[webpush] permission result', { ok, token, reason });

        if (!ok || !token) {
            Alert.alert('Notifications', `Could not enable notifications: ${reason || 'permission denied'}`);
            return false;
        }

        await fetchWithAuth("/api/push/subscribe", {
            method: "POST",
            body: { token, platform: "web" },
        });
        await saveItem(STORAGE_KEYS.fcmToken, token);
        console.log('[webpush] subscribed & stored token');
        return true;
    };

    const disableWebPush = async () => {
        const user = getAuth().currentUser;
        const token = await loadItem(STORAGE_KEYS.fcmToken);
        if (!user || !token) return;
        const resp = await fetchWithAuth("/api/push/unsubscribe", {
            method: "POST",
            body: { token },
        });
        if (!resp || !resp.ok) {
            const text = await resp.text().catch(() => '');
            console.warn('[webpush] unsubscribe failed:', resp.status, text);
        }

        if (Platform.OS === 'web') localStorage.removeItem(STORAGE_KEYS.fcmToken);
        else{
            const AsyncStorage = require('@react-native-async-storage/async-storage');
            await AsyncStorage.removeItem(STORAGE_KEYS.fcmToken);
        }
        console.log('[webpush] unsubscribed & removed token');
        return true;
    };

    useEffect(() => {
        const init = async () => {
            const auth = getAuth();
            if (auth.currentUser?.displayName) setDisplayName(auth.currentUser.displayName);

            //Native permission + channel setup
            if (Platform.OS !== 'web') {
                const { status } = await Notifications.getPermissionsAsync();
                if (status !== 'granted') {
                    setNotificationsEnabled(false);
                    return
                }
                if (Platform.OS === 'android') {
                    await Notifications.setNotificationChannelAsync('default', {
                        name: 'Default',
                        importance: Notifications.AndroidImportance.DEFAULT,
                    });
                }
            }

            //restore settings
            const savedEnabled = await loadItem(STORAGE_KEYS.enabled);
            const savedTime = await loadItem(STORAGE_KEYS.time);

            if (savedEnabled !== null) setNotificationsEnabled(JSON.parse(savedEnabled));
            if (savedTime) {
                const t = new Date(savedTime);
                if (!isNaN(t.getTime())) setNotificationTime(t);
            }
        };
        init();
    }, []);  

    const handleUpdateDisplayName = () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user && newDisplayName.trim() !== '') {
            updateProfile(user, { displayName: newDisplayName })
                .then(() => {
                    Alert.alert('Success', `Your display name is now ${newDisplayName.trim()}`);
                    setDisplayName(newDisplayName);
                    setNewDisplayName('');
                })
                .catch(error => {
                    Alert.alert("Error", `We've encountered an error. Details: ${error.message}`);
                });
        } else {
            Alert.alert('Error', 'Please enter a valid display name.');
        }
    };

  const content = (
    <>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Dashboard")}
        accessibilityLabel="Back"
      >
        <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.headerText}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Hey {displayName || 'User'}, what would you like to change?
        </Text>
      </View>

      {/* Section: Change display name */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Change your display name:</Text>
        <View style={styles.inlineRow}>
          <TextInput
            placeholder='Enter new display name'
            placeholderTextColor={COLORS.light_grey}
            value={newDisplayName}
            onChangeText={setNewDisplayName}
            style={styles.input}
          />
          <PillButton
            title="Update"
            onPress={handleUpdateDisplayName}
            variant="primary"
            size="md"
            fullWidth={false}
          />
        </View>
      </View>

      {/* Section: Notification settings */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Set Notifications and time:</Text>

        <View style={styles.inlineRow}>
          <Text style={styles.inlineLabel}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: COLORS.light_grey, true: COLORS.light_blue2 }}
            thumbColor={notificationsEnabled ? COLORS.yellow : COLORS.almost_white}
          />
        </View>

        <View style={styles.inlineRow}>
          <TextInput
            editable={false}
            value={formatTime(notificationTime)}
            style={styles.timePill}
          />
          <PillButton
            title="Update"
            onPress={() => setShowPicker(true)}
            variant="primary"
            size="md"
            fullWidth={false}
          />
        </View>

        {showPicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={notificationTime}
            mode="time"
            is24Hour={true}
            onChange={onTimeChange}
          />
        )}
      </View>

      {/* Section: Update demographics */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Update your demographics survey:</Text>
        <Button
          title="Update Demographics"
          onPress={() => navigation.navigate("Survey_Demographics")}
        />
      </View>
    </>
  );

  // Web: native div with overflow scrolling
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
    ...(Platform.OS === 'web' ? { touchAction: 'pan-y' } : null),
    backgroundColor: COLORS.white,
  },
  pageContent: {
    minHeight: Platform.OS === 'web' ? '100dvh' : '100%',
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  headerText: {
  width: '100%',
  marginBottom: 16,    
  },
  title: {
    fontSize: 30,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    textAlign: 'left',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
    marginBottom: 16,
  },
  section: {
    marginBottom: 60,
  },
  sectionLabel: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: FONTS.main_font_bold,
    marginBottom: 8,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inlineLabel: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.light_grey,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
  },
  timePill: {
    flexGrow: 0,
    width: 120,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.light_grey,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    textAlignVertical: 'center',
    textAlign: 'center',
    color: COLORS.black,
    fontFamily: FONTS.main_font,
  },
});

export default Profile;
