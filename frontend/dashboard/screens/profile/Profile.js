//CITS3200 project group 23 2024 2024
//Profile tab part of the dashboard tabs

import { View, Text, TextInput, Alert, Switch, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import COLORS from '../../../constants/colors';
import FONTS from '../../../constants/fonts';
import Button from '../../../components/Buttons/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
    // State management
    const [displayName, setDisplayName] = useState('');
    const [newDisplayName, setNewDisplayName] = useState('');
    const [notificationTime, setNotificationTime] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const logCurrentTime = () => {
        const currentTime = new Date();
        console.log(`Current Time: ${currentTime.toLocaleTimeString()}`);
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
            await scheduleNotification(notificationTime);
        } else {
            await cancelNotification();
        }

        await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newValue));
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
            const notificationsStatus = await AsyncStorage.getItem('notificationsEnabled');
            if (notificationsStatus !== null) {
                setNotificationsEnabled(JSON.parse(notificationsStatus));
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
        <View style={styles.main_container}>
            <View style={styles.title_container}>
                <Text style={styles.title_text}>
                    Profile
                </Text>
            </View>
            <View style={styles.body_container}>
                <View style={styles.container}>
                    <Text style={styles.display_text}>
                        Hi {displayName || 'User'}. What would you like to update?
                    </Text>
                </View>

                <View style={styles.container}>
                    <TextInput
                        placeholder='Enter new display name'
                        placeholderTextColor={COLORS.light_grey}
                        value={newDisplayName}
                        onChangeText={setNewDisplayName}
                        style={styles.text_input}
                    />
                </View>
                <View style={styles.container}>
                    <Button
                        title="Update Name"
                        onPress={handleUpdateDisplayName}
                    />
                </View>
                <View style={styles.container}>
                    <Button
                        title="Set Notification Time"
                        onPress={() => setShowPicker(true)}
                    />
                </View>
                <View style={styles.notification_container}>
                    <Text style={styles.notification}>Notifications: </Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={toggleNotifications}
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
                    />
                </View>

                {showPicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={notificationTime}
                        mode="time"
                        is24Hour={true}
                        onChange={onTimeChange}
                    />
                )}
                <View style={styles.container}>
                    <Button
                        title="Update Demographics"
                        onPress={() => navigation.navigate("Survey_Demographics")}
                    />
                </View>
                <View style={styles.container}>
                    <Button
                        title="Back"
                        onPress={() => navigation.navigate("Dashboard")}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    title_container: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
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
    display_text: {
        fontSize: 24,
        color: COLORS.almost_white,
        fontFamily: FONTS.main_font,
    },
    container: {
        flex: 0.1,
        paddingHorizontal: 26,
    },
    text_input: {
        width: '100%',
        height: 40,
        borderColor: COLORS.almost_white,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        color: COLORS.almost_white,
        fontFamily: FONTS.main_font,
    },
    notification_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 26,
        flex: 0.1,
    },
    notification: {
        fontSize: 24,
        color: COLORS.almost_white,
        fontFamily: FONTS.main_font,
    }
});

export default Profile;
