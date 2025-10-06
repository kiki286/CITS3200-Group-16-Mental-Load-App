// CITS3200 project group 23 2024
// Welcome screen (with Info modal + Download button)

import React, { useState } from 'react';
import { View, Text, Image, Modal, Linking, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../constants/colors';
import Button from '../components/Buttons/Button';
import FONTS from '../constants/fonts';

const APK_URL = 'https://lightslategrey-eland-655260.hostingersite.com/app/mentalLoad.apk';

const Welcome = ({ navigation }) => {
  const [showInfo, setShowInfo] = useState(false);

  const handleDownload = async () => {
    try {
      const supported = await Linking.canOpenURL(APK_URL);
      if (supported) {
        await Linking.openURL(APK_URL);
      } else {
        Alert.alert('Unable to open link', `Please open this URL manually:\n${APK_URL}`);
      }
    } catch (err) {
      Alert.alert('Download error', 'Something went wrong while opening the download link.');
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: 26,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: COLORS.black,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          color: COLORS.almost_white,
          fontFamily: FONTS.main_font,
          marginTop: -60,
        }}
      >
        TAKE A MOMENT TO
      </Text>
      <Text
        style={{
          fontSize: 30,
          color: COLORS.almost_white,
          fontFamily: FONTS.main_font,
        }}
      >
        REFLECT ON YOUR
      </Text>
      <Text
        style={{
          fontSize: 30,
          color: COLORS.light_green,
          fontFamily: FONTS.main_font,
        }}
      >
        MENTAL LABOUR
      </Text>

      <Image
        source={require('./../assets/mental_labour_venn.png')}
        style={{
          height: 400,
          width: 400,
          marginTop: -30,
        }}
        accessible
        accessibilityLabel="Mental Labour Venn Diagram"
      />

      <Text
        style={{
          fontSize: 35,
          color: COLORS.almost_white,
          fontFamily: FONTS.main_font,
          marginTop: -60,
        }}
      >
        MENTAL LOAD
      </Text>
      <Text
        style={{
          fontSize: 35,
          color: COLORS.almost_white,
          fontFamily: FONTS.main_font,
        }}
      >
        TRACKER
      </Text>

      {/* Existing actions */}
      <Button
        title="Login"
        onPress={() => navigation.navigate('Login')}
        style={{ width: '100%', marginTop: 10 }}
        accessibilityLabel="Go to Login"
      />
      <Button
        title="Sign Up"
        onPress={() => navigation.navigate('Signup')}
        style={{ marginTop: 16, width: '100%' }}
        accessibilityLabel="Go to Sign Up"
      />

      {/* New: Download button */}
      {/* <Button
        title="Download App"
        onPress={handleDownload}
        style={{ marginTop: 16, width: '100%' }}
        accessibilityLabel="Download application APK"
      /> */}

      {/* New: Info button that opens modal */}
      <Button
        title="Info"
        onPress={() => setShowInfo(true)}
        style={{ marginTop: 12, width: '100%' }}
        accessibilityLabel="Open download and install instructions"
      />

      {/* Info Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={showInfo}
        onRequestClose={() => setShowInfo(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)', // dim backdrop
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 520,
              borderRadius: 16,
              backgroundColor: COLORS.almost_black ?? '#111', // fallback if not defined
              borderWidth: 1,
              borderColor: '#333',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <View
              style={{
                paddingVertical: 14,
                paddingHorizontal: 18,
                backgroundColor: COLORS.light_green,
              }}
            >
              <Text
                style={{
                  color: COLORS.black,
                  fontFamily: FONTS.main_font,
                  fontSize: 18,
                }}
              >
                How to Download & Install (Android)
              </Text>
            </View>

            {/* Body */}
            <ScrollView
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ padding: 18, gap: 8 }}
            >
              <Text
                style={{
                  color: COLORS.almost_white,
                  fontFamily: FONTS.main_font,
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                Follow these steps to download and install the app on your phone:
              </Text>

              {/* Steps */}
              {[
                'Tap the "Download App" button below (or on the main screen).',
                `Your browser will open ${APK_URL}. If prompted, confirm the download of the APK file.`,
                'Once the download finishes, open the downloaded file (check your notifications or the Downloads app).',
                'If Android blocks the install, enable "Install unknown apps" for your browser when prompted, then go back and try again.',
                'Tap "Install" and wait until it completes.',
                'After installation, tap "Open" or find the app icon in your app drawer/home screen.',
                'If you see any warning, confirm you trust the source. You can disable "Install unknown apps" afterward for extra safety.',
              ].map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', gap: 8 }}>
                  <Text
                    style={{
                      color: COLORS.light_green,
                      fontFamily: FONTS.main_font,
                      width: 20,
                    }}
                  >
                    {idx + 1}.
                  </Text>
                  <Text
                    style={{
                      color: COLORS.almost_white,
                      fontFamily: FONTS.main_font,
                      flex: 1,
                      lineHeight: 22,
                    }}
                  >
                    {item}
                  </Text>
                </View>
              ))}

              <Text
                style={{
                  marginTop: 8,
                  color: COLORS.almost_white,
                  fontFamily: FONTS.main_font,
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                Note: On some devices, the path is Settings → Security → Install unknown apps
                (or Apps → [Your Browser] → Install unknown apps).
              </Text>
            </ScrollView>

            {/* Footer actions */}
            <View
              style={{
                padding: 16,
                gap: 12,
                borderTopWidth: 1,
                borderTopColor: '#2a2a2a',
              }}
            >
              <Button
                title="Download App"
                onPress={handleDownload}
                style={{ width: '100%' }}
                accessibilityLabel="Download application APK from modal"
              />
              <Button
                title="Close"
                onPress={() => setShowInfo(false)}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: COLORS.light_green,
                }}
                textStyle={{ color: COLORS.white }}
                accessibilityLabel="Close the info modal"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Welcome;
