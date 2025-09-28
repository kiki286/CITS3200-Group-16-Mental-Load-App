//CITS3200 project group 23 2024 2024
//Profile tab part of the dashboard tabs

import { View, Text, TextInput, Alert, Switch, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import COLORS from '../../../constants/colors';
import FONTS from '../../../constants/fonts';
import Button from '../../../components/Buttons/Button';
import * as Notifications from 'expo-notifications';
import { ColorFill } from 'react-ionicons';
import { ChevronBackOutline } from 'react-ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const InlineButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.inlineButton} onPress={onPress}>
    <Text style={styles.inlineButtonText}>{title}</Text>
  </TouchableOpacity>
);
const Profile = ({ navigation }) => {
    // State management
    const [displayName, setDisplayName] = useState('');
    const [newDisplayName, setNewDisplayName] = useState('');
    const [notificationTime, setNotificationTime] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const formatTime = (d) =>
    d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const logCurrentTime = () => {
    const currentTime = new Date();
    console.log(`Current Time: ${formatTime(currentTime)}`);
  };

    const onTimeChange = async (event, selectedDate) => {
        const currentDate = selectedDate || notificationTime;
        setShowPicker(false);
        setNotificationTime(currentDate);
        logCurrentTime();

        // Schedule notification immediately after picking a time
        await scheduleNotification(currentDate);
    };

    const toggleNotifications = async () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        logCurrentTime();

        // If notifications are being enabled, schedule them
        if (newValue) {
            if (Platform.OS !== 'web') {
                await scheduleNotification(notificationTime);
            } else {
                console.warn('Notifications scheduling is not available in web builds.');
            }
        } else {
            await cancelNotification();
        }

        // Persist the setting: localStorage on web, AsyncStorage on native
        if (Platform.OS === 'web') {
            localStorage.setItem('notificationsEnabled', JSON.stringify(newValue));
        } else {
            const AsyncStorage = require('@react-native-async-storage/async-storage');
            await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newValue));
        }
    };

    const scheduleNotification = async (time) => {
        const trigger = new Date(time);
        trigger.setSeconds(0); // Trigger at the start of the minute

        console.log(`Scheduling notification for: ${trigger.toLocaleTimeString()}`); // Log scheduled time

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Your Mental Load Check is Ready!",
                body: "This is a reminder to Do your Mental Load Check.",
            },
            trigger: {
                hour: trigger.getHours(),
                minute: trigger.getMinutes(),
                repeats: true,
            },
        });
    };


    const cancelNotification = async () => {
        const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of allScheduled) {
            if (notification.id) {
                await Notifications.cancelScheduledNotificationAsync(notification.id);
            }
        }
    };

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            setDisplayName(user.displayName);
        }

        const loadNotificationSettings = async () => {
            try {
                let notificationsStatus = null;
                if (Platform.OS === 'web') {
                    notificationsStatus = localStorage.getItem('notificationsEnabled');
                } else {
                    const AsyncStorage = require('@react-native-async-storage/async-storage');
                    notificationsStatus = await AsyncStorage.getItem('notificationsEnabled');
                }
                if (notificationsStatus !== null) {
                    setNotificationsEnabled(JSON.parse(notificationsStatus));
                }
            } catch (e) {
                console.warn('Failed to load notification settings', e);
            }
        };

        loadNotificationSettings();
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

    return (
        <View style={styles.page}>
            {/* Back button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate("Dashboard")}
                accessibilityLabel="Back"
            >
                <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>Profile</Text>

            {/* Subheader */}
            <Text style={styles.subtitle}>
                Hi {displayName || 'User'}.
                <Text style={styles.subtitleSecondary}> What would you like to update? </Text>
            </Text>

            {/* Section: Change display name */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Change your display name:</Text>
                <View style={styles.inlineRow}>
                    <TextInput
                        placeholder='Enter new display name'
                        placeholderTextColor={COLORS.light_grey}
                        value={newDisplayName}
                        onChangeText={setNewDisplayName}
                        style={styles.textInput}
                    />
                    <InlineButton title="Update" onPress={handleUpdateDisplayName} />
                </View>
            </View>

            {/*Section: Notification settings */}
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
                        styles={styles.timePill}
                    />
                    <InlineButton title="Update" onPress={() => setShowPicker(true)} />
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
        </View>
    );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
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
  subtitleSecondary: {
    fontStyle: 'italic',
    color: COLORS.black,
  },

  section: {
    marginBottom: 20,
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

  inlineButton: {
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.light_blue4, // same accent as Login/primary
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light_blue4,
  },
  inlineButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.main_font_bold,
  },
});

export default Profile;
