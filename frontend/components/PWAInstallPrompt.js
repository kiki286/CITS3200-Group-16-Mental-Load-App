import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, Modal } from 'react-native';
import COLORS from '../constants/colors';

// Simple localStorage wrapper (works on web and falls back safely)
const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* noop */ }
  }
};

export default function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [platformType, setPlatformType] = useState('desktop'); // 'android' | 'ios' | 'desktop'
  const deferredPromptRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; // only run in browser
    // Don’t show if user opted out
    if (storage.get('pwa_prompt_dont_show') === '1') return;

    // Detect platform
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const isIOS = /iPhone|iPad|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);
    if (isIOS) setPlatformType('ios');
    else if (isAndroid) setPlatformType('android');
    else setPlatformType('desktop');

    // Only show when the browser fires beforeinstallprompt.
    const onBeforeInstall = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      try { e.preventDefault(); } catch (err) { }
      deferredPromptRef.current = e;
      setVisible(true);
    };

    if (window && window.addEventListener) {
      // register with a stable reference so cleanup can remove it
      window.addEventListener('beforeinstallprompt', onBeforeInstall);
    }

    // Do NOT auto-show on iOS/desktop and remove the Android fallback timer.
    return () => {
      if (window && window.removeEventListener) {
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      }
    };
  }, []);

  const handleInstall = async () => {
    const promptEvent = deferredPromptRef.current;
    if (promptEvent && promptEvent.prompt) {
      try {
        promptEvent.prompt();
        // wait for the user choice (optional)
        await promptEvent.userChoice;
      } catch (err) {
        // ignore prompt errors
      } finally {
        setVisible(false);
        deferredPromptRef.current = null;
      }
    } else {
      // No browser prompt available — show explicit manual instructions
      const msg = platformType === 'ios'
        ? 'To install: open Safari share menu and choose "Add to Home Screen".'
        : 'To install: open Chrome menu (⋮) and choose "Add to Home screen".';
      try { window.alert(msg); } catch (e) { /* noop */ }
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    // store preference to not nag
    storage.set('pwa_prompt_dont_show', '1');
  };

  if (!visible) return null;

  const body = (() => {
    if (platformType === 'android') {
      return {
        title: 'Install this app',
        subtitle: 'Install to your device for a better experience',
        instructions: 'Tap "Add to home screen" when prompted, or tap OK below.'
      };
    }
    if (platformType === 'ios') {
      return {
        title: 'Install on iOS',
        subtitle: 'Add to your home screen',
        instructions: 'Open the share menu in Safari and choose "Add to Home Screen".'
      };
    }
    return {
      title: 'Better on mobile',
      subtitle: 'Add to home screen to enable notifications',
      instructions: 'This experience is optimised for mobile devices. Try opening this website on your phone'
    };
  })();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{body.title}</Text>
          <Text style={styles.subtitle}>{body.subtitle}</Text>
          <Text style={styles.instructions}>{body.instructions}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.primary]} onPress={handleInstall}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.ghost]} onPress={handleDismiss}>
              <Text style={styles.ghostText}>Don't show again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8
  },
  instructions: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    marginBottom: 12
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center'
  },
  primary: {
    backgroundColor: COLORS.light_blue4
  },
  ghost: {
    backgroundColor: 'transparent'
  },
  buttonText: {
    color: 'white',
    fontWeight: '700'
  },
  ghostText: {
    color: '#333'
  }
});
