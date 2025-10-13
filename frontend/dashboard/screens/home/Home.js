//CITS3200 project group 16 2025
// Home tab part of the dashboard tabs

import { View, Text, StyleSheet, Alert, TouchableOpacity, Platform, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import COLORS from "../../../constants/colors";
import FONTS from "../../../constants/fonts";
import Button from "../../../components/Buttons/Button_Light_Blue";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth } from "firebase/auth";
import { getLastResponse } from "../../../services/StorageHandler";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronBackOutline } from "react-ionicons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const debug = false; // Set this to true to disable the check-in limit.

const Home = ({ navigation }) => {
  const [displayName, setDisplayName] = useState("");
  const [checkInMessage, setCheckInMessage] = useState("");
  const [canCheckIn, setCanCheckIn] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) setDisplayName(user.displayName || "");

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
    const timeDifference = now - latestResponseTimestamp;
    const hoursAgo = Math.floor(timeDifference / 1000 / 60 / 60);

    const isSameDay = now.toDateString() === latestResponseTimestamp.toDateString();
    if (isSameDay && !debug) {
      setCanCheckIn(false);
      return `You've already checked in today. Come back in ${24 - hoursAgo} hours!`;
    }

    setCanCheckIn(true);
    return hoursAgo >= 24 ? "Time for a check in!" : `You last checked in ${hoursAgo} hours ago.`;
  };

  const handleCheckIn = () => {
    if (canCheckIn || debug) navigation.navigate("Survey_Repeated");
    else Alert.alert("You've already checked in today. See you tomorrow!");
  };

  const insets = useSafeAreaInsets();
  const content = (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Back"
      >
        <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
      </TouchableOpacity>

      <Text style={styles.title}>Check-in</Text>

      <View style={styles.body_container}>
        <View style={styles.hello_container}>
          <Text style={styles.hello_text}>Hi {displayName || "User"}!</Text>
          <Text style={styles.checkin_text}>{checkInMessage}</Text>
        </View>

        <View style={[styles.container, { marginTop: 40},]}>
          <Button
            title="Proceed to Check in"
            onPress={handleCheckIn}
            disabled={!canCheckIn && !debug}
            style={!canCheckIn && !debug ? styles.disabledButton : null}
          />
        </View>
        <View style={{ height: 40 }} />
      </View>
    </>
  );

  if (Platform.OS === "web") {
    return (
      <div
        style={{
          height: "100dvh",
          width: "100%",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          backgroundColor: COLORS.white,
        }}
      >
        <div
          style={{
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 12,
            paddingBottom: Math.max(120, (insets?.bottom ?? 0) + 24),
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  //Native: regular ScrollView
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={[
          styles.pageContent,
          { paddingBottom: Math.max(120, insets.bottom + 24) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        {content}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    ...(Platform.OS === "web" ? { touchAction: "pan-y" } : null),
    backgroundColor: COLORS.white,
  },
  pageContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 30,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    marginBottom: 16,
  },
  body_container: { flex: 1, marginTop: 24 },
  hello_container: { flex: 0.2, paddingHorizontal: 26, alignItems: "center" },
  hello_text: { fontSize: 24, color: COLORS.black, fontFamily: FONTS.main_font },
  checkin_text: { fontSize: 18, color: COLORS.black, fontFamily: FONTS.main_font, marginTop: 10 },
  container: { flex: 0.1, paddingHorizontal: 26 },
  disabledButton: { backgroundColor: COLORS.dark_grey, color: COLORS.white, opacity: 0.7 },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
});

export default Home;
