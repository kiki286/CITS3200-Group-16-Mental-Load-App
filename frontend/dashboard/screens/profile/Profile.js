//CITS3200 project group 23 2024 2024
//Profile tab part of the dashboard tabs

import { View, Text, TextInput, Alert, Switch, StyleSheet, Platform, DateTimePicker } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import COLORS from '../../../constants/colors';
import FONTS from '../../../constants/fonts';
import Button from '../../../components/Buttons/Button';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermission } from '../../../firebase/config';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://127.0.0.1:5000';
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

    const logCurrentTime = () => {
        const currentTime = new Date();
        console.log(`Current Time: ${currentTime.toLocaleTimeString()}`);
    };

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
        const idToken = await user.getIdToken();
        await fetch(`${API_BASE}/api/push/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({ token, platform: 'web' }),
        });
        await saveItem(STORAGE_KEYS.fcmToken, token);
        console.log('[webpush] subscribed & stored token');
        return true;
    };

    const disableWebPush = async () => {
        const user = getAuth().currentUser;
        const token = await loadItem(STORAGE_KEYS.fcmToken);
        if (!user || !token) return;
        const idToken = await user.getIdToken();
        const resp = await fetch(`${API_BASE}/api/push/unsubscribe`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', Authorization: `Bearer ${idToken}`},
            body: JSON.stringify({ token }),
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
